#!/usr/bin/env node

import { readdir, stat } from 'fs/promises';
import { join, relative } from 'path';
import { createReadStream } from 'fs';
import { Storage } from '@google-cloud/storage';
import dotenv from 'dotenv';
import { uploadTargets } from './pipeline-manifest.js';

dotenv.config();

const BUCKET_NAME = process.env.GCS_BUCKET_NAME;
const PROJECT_ID = process.env.GCS_PROJECT_ID;
const KEY_FILE = process.env.GCS_KEY_FILE;

if (!BUCKET_NAME || !PROJECT_ID) {
  console.error('Missing GCS configuration. Please set GCS_BUCKET_NAME and GCS_PROJECT_ID in .env');
  process.exit(1);
}

const storage = KEY_FILE
  ? new Storage({ projectId: PROJECT_ID, keyFilename: KEY_FILE })
  : new Storage({ projectId: PROJECT_ID });

const bucket = storage.bucket(BUCKET_NAME);

async function* walkDir(dir) {
  const dirents = await readdir(dir, { withFileTypes: true });
  for (const dirent of dirents) {
    const path = join(dir, dirent.name);
    if (dirent.isDirectory()) {
      yield* walkDir(path);
    } else {
      yield path;
    }
  }
}

async function getExistingFiles(prefix = '') {
  const existingFiles = new Set();
  const options = prefix ? { prefix } : {};

  try {
    const [files] = await bucket.getFiles(options);
    for (const file of files) {
      existingFiles.add(file.name);
    }
  } catch (error) {
    console.error(`Error listing existing files: ${error.message}`);
  }

  return existingFiles;
}

async function uploadFile(filePath, destination) {
  return new Promise((resolve, reject) => {
    const file = bucket.file(destination);
    const stream = createReadStream(filePath);

    stream
      .pipe(
        file.createWriteStream({
          metadata: {
            contentType: getContentType(filePath),
            cacheControl: 'public, max-age=31536000'
          },
          resumable: false
        })
      )
      .on('error', reject)
      .on('finish', resolve);
  });
}

function getContentType(filePath) {
  const ext = filePath.split('.').pop()?.toLowerCase();
  const contentTypes = {
    webp: 'image/webp',
    webm: 'video/webm',
    mp4: 'video/mp4',
    wav: 'audio/wav',
    mp3: 'audio/mpeg',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    json: 'application/json',
    glb: 'model/gltf-binary',
    gltf: 'model/gltf+json'
  };
  return contentTypes[ext] || 'application/octet-stream';
}

async function uploadBatch(batch, startIndex, totalFiles) {
  const results = await Promise.allSettled(
    batch.map(({ filePath, destination }) =>
      uploadFile(filePath, destination).then(() => ({ filePath, destination, success: true }))
    )
  );

  const successes = [];
  const failures = [];

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      successes.push(result.value);
    } else {
      const { filePath, destination } = batch[index];
      failures.push({
        file: filePath,
        destination,
        error: result.reason?.message || 'Unknown error'
      });
    }
  });

  return { successes, failures };
}

async function deleteBatch(batch) {
  const results = await Promise.allSettled(
    batch.map((fileName) =>
      bucket
        .file(fileName)
        .delete()
        .then(() => ({ fileName, success: true }))
    )
  );

  const successes = [];
  const failures = [];

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      successes.push(result.value);
    } else {
      failures.push({
        file: batch[index],
        error: result.reason?.message || 'Unknown error'
      });
    }
  });

  return { successes, failures };
}

async function uploadDirectory(
  localDir,
  gcsPrefix = '',
  concurrency = 10,
  syncDelete = true,
  dryRun = false
) {
  const files = [];
  for await (const filePath of walkDir(localDir)) {
    files.push(filePath);
  }

  console.log(`Found ${files.length} files in ${localDir}`);

  // Get all existing files in the bucket with this prefix in one batch
  console.log(`Checking existing files in GCS (prefix: ${gcsPrefix || '/'})...`);
  const existingFiles = await getExistingFiles(gcsPrefix);
  console.log(`Found ${existingFiles.size} existing files in GCS`);

  // Create a set of local file destinations for quick lookup
  const localFileDestinations = new Set();
  const filesToUpload = [];
  let skipped = 0;

  for (const filePath of files) {
    const relativePath = relative(localDir, filePath);
    const destination = gcsPrefix ? join(gcsPrefix, relativePath) : relativePath;
    localFileDestinations.add(destination);

    if (existingFiles.has(destination)) {
      skipped++;
    } else {
      filesToUpload.push({ filePath, destination });
    }
  }

  // Find files to delete (exist in GCS but not locally)
  const filesToDelete = [];
  if (syncDelete) {
    for (const gcsFile of existingFiles) {
      if (!localFileDestinations.has(gcsFile)) {
        filesToDelete.push(gcsFile);
      }
    }
  }

  console.log(`Files to upload: ${filesToUpload.length}, Files to skip: ${skipped}`);
  if (syncDelete && filesToDelete.length > 0) {
    console.log(`Files to delete from GCS: ${filesToDelete.length} (not found locally)`);
  }
  console.log(`Using ${concurrency} concurrent operations`);

  let uploaded = 0;
  let deleted = 0;
  const errors = [];
  const deleteErrors = [];
  const startTime = Date.now();

  // In dry run mode, just show what would be done
  if (dryRun) {
    if (filesToDelete.length > 0) {
      console.log(`\n📝 Would delete ${filesToDelete.length} orphaned files from GCS:`);
      filesToDelete.slice(0, 10).forEach((file) => console.log(`  - ${file}`));
      if (filesToDelete.length > 10) {
        console.log(`  ... and ${filesToDelete.length - 10} more files`);
      }
    }

    if (filesToUpload.length > 0) {
      console.log(`\n📝 Would upload ${filesToUpload.length} new files:`);
      filesToUpload
        .slice(0, 10)
        .forEach(({ filePath, destination }) =>
          console.log(`  - ${relative(process.cwd(), filePath)} → ${destination}`)
        );
      if (filesToUpload.length > 10) {
        console.log(`  ... and ${filesToUpload.length - 10} more files`);
      }
    }

    return { uploaded: 0, deleted: 0, skipped, total: files.length, errors: [], deleteErrors: [] };
  }

  // Delete files that don't exist locally
  if (syncDelete && filesToDelete.length > 0) {
    console.log(`\nDeleting ${filesToDelete.length} orphaned files from GCS...`);
    for (let i = 0; i < filesToDelete.length; i += concurrency) {
      const batch = filesToDelete.slice(i, Math.min(i + concurrency, filesToDelete.length));
      const { successes, failures } = await deleteBatch(batch);

      deleted += successes.length;
      deleteErrors.push(...failures);

      const progress = Math.min(i + concurrency, filesToDelete.length);
      console.log(`Delete progress: ${progress}/${filesToDelete.length} (${deleted} deleted)`);
    }
  }

  // Upload files in batches with controlled concurrency
  if (filesToUpload.length > 0) {
    console.log(`\nUploading ${filesToUpload.length} new files...`);
    for (let i = 0; i < filesToUpload.length; i += concurrency) {
      const batch = filesToUpload.slice(i, Math.min(i + concurrency, filesToUpload.length));
      const { successes, failures } = await uploadBatch(batch, i, filesToUpload.length);

      uploaded += successes.length;
      errors.push(...failures);

      // Progress reporting
      const progress = Math.min(i + concurrency, filesToUpload.length);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      const rate = (uploaded / elapsed).toFixed(1);
      console.log(
        `Upload progress: ${progress}/${filesToUpload.length} (${uploaded} uploaded, ${rate} files/sec)`
      );
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log(`\nSync complete in ${totalTime} seconds!`);
  console.log(`  - Uploaded: ${uploaded} new files`);
  console.log(`  - Deleted: ${deleted} orphaned files`);
  console.log(`  - Skipped: ${skipped} unchanged files`);
  console.log(`  - Total local files: ${files.length}`);

  if (errors.length > 0) {
    console.error(`\nFailed uploads (${errors.length}):`);
    errors.slice(0, 10).forEach(({ file, error }) => {
      console.error(`  - ${file}: ${error}`);
    });
    if (errors.length > 10) {
      console.error(`  ... and ${errors.length - 10} more errors`);
    }
  }

  if (deleteErrors.length > 0) {
    console.error(`\nFailed deletions (${deleteErrors.length}):`);
    deleteErrors.slice(0, 10).forEach(({ file, error }) => {
      console.error(`  - ${file}: ${error}`);
    });
    if (deleteErrors.length > 10) {
      console.error(`  ... and ${deleteErrors.length - 10} more errors`);
    }
  }

  return { uploaded, deleted, skipped, total: files.length, errors, deleteErrors };
}

async function main() {
  const args = process.argv.slice(2);

  // Parse concurrency from environment or use default
  const concurrency = parseInt(process.env.UPLOAD_CONCURRENCY || '10');

  // Check for --help flag
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: node upload-to-gcs.js [localPath] [gcsPath] [options]

Options:
  --help, -h              Show this help message
  --concurrency, -c <n>   Number of concurrent operations (default: 10)
  --no-delete             Don't delete files from GCS that don't exist locally
  --dry-run               Show what would be uploaded/deleted without making changes

Environment Variables:
  UPLOAD_CONCURRENCY      Number of concurrent operations (default: 10)
  GCS_BUCKET_NAME         Target GCS bucket name (required)
  GCS_PROJECT_ID          GCP project ID (required)
  GCS_KEY_FILE            Path to service account key file (optional)

Examples:
  # Sync all default directories (upload new, skip existing, delete orphaned)
  node upload-to-gcs.js

  # Upload specific directory with sync
  node upload-to-gcs.js ./public/images images

  # Upload only, don't delete orphaned files
  node upload-to-gcs.js --no-delete

  # Upload with custom concurrency
  node upload-to-gcs.js --concurrency 20

  # Dry run to see what would change
  node upload-to-gcs.js --dry-run
    `);
    return;
  }

  // Parse flags
  let customConcurrency = concurrency;
  let syncDelete = true;
  let dryRun = false;

  const concurrencyFlagIndex = args.findIndex((arg) => arg === '--concurrency' || arg === '-c');
  if (concurrencyFlagIndex !== -1 && args[concurrencyFlagIndex + 1]) {
    customConcurrency = parseInt(args[concurrencyFlagIndex + 1]);
    args.splice(concurrencyFlagIndex, 2);
  }

  const noDeleteIndex = args.indexOf('--no-delete');
  if (noDeleteIndex !== -1) {
    syncDelete = false;
    args.splice(noDeleteIndex, 1);
  }

  const dryRunIndex = args.indexOf('--dry-run');
  if (dryRunIndex !== -1) {
    dryRun = true;
    args.splice(dryRunIndex, 1);
    console.log('🔍 DRY RUN MODE - No changes will be made\n');
  }

  if (args.length === 0) {
    console.log('Syncing all assets to Google Cloud Storage...\n');
    console.log(`Mode: ${syncDelete ? 'Full sync (upload + delete)' : 'Upload only'}`);
    console.log(`Concurrency: ${customConcurrency} parallel operations\n`);

    for (const { local, gcs } of uploadTargets) {
      try {
        const stats = await stat(local);
        if (stats.isDirectory()) {
          console.log(`\n${'='.repeat(50)}`);
          console.log(`Syncing ${local} to gs://${BUCKET_NAME}/${gcs}`);
          console.log(`${'='.repeat(50)}`);
          if (dryRun) {
            console.log('(Dry run - no actual changes will be made)');
          }
          await uploadDirectory(local, gcs, customConcurrency, syncDelete, dryRun);
        }
      } catch (error) {
        console.log(`Skipping ${local}: ${error.message}`);
      }
    }
  } else {
    const [localPath, gcsPath] = args;
    console.log(`Syncing ${localPath} to gs://${BUCKET_NAME}/${gcsPath || ''}`);
    console.log(`Mode: ${syncDelete ? 'Full sync (upload + delete)' : 'Upload only'}`);
    console.log(`Concurrency: ${customConcurrency} parallel operations\n`);
    if (dryRun) {
      console.log('(Dry run - no actual changes will be made)\n');
    }
    await uploadDirectory(localPath, gcsPath, customConcurrency, syncDelete, dryRun);
  }

  console.log(`\nAll files are now available at: https://storage.googleapis.com/${BUCKET_NAME}/`);
}

main().catch(console.error);
