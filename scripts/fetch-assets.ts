// /asset-explorer/src/scripts/fetch-assets.ts

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { readableStreamToArrayBuffer } from 'bun';

// Helper function to run shell commands
async function runCommand(command: string, args: string[], cwd?: string, logPrefix?: string) {
  const commandDisplay = `${command} ${args.join(' ')}`;
  console.log(`${logPrefix || '[CMD]'} Running: ${commandDisplay} ${cwd ? `(in ${cwd})` : ''}`);
  const proc = Bun.spawn([command, ...args], {
    cwd: cwd || process.cwd(),
    stdout: 'pipe',
    stderr: 'pipe',
    env: { ...process.env, PYTHONUNBUFFERED: '1' } // Useful for python scripts
  });

  const stdoutBuffer = await readableStreamToArrayBuffer(proc.stdout);
  const stderrBuffer = await readableStreamToArrayBuffer(proc.stderr);
  const stdout = new TextDecoder().decode(stdoutBuffer);
  const stderr = new TextDecoder().decode(stderrBuffer);

  const exitCode = proc.exitCode;

  if (stdout.trim()) {
    console.log(`${logPrefix || '[CMD]'} STDOUT:\n${stdout.trim()}`);
  }
  if (stderr.trim()) {
    console.error(`${logPrefix || '[CMD]'} STDERR:\n${stderr.trim()}`);
  }

  return { stdout, stderr };
}

// Helper function to check if destination directory contains a file
// whose name (without extension) starts with the given prefix.
async function destinationContainsFileStartingWith(
  destDir: string,
  namePrefixWithoutExt: string
): Promise<boolean> {
  try {
    const filesInDest = await fs.readdir(destDir);
    for (const destFile of filesInDest) {
      const destFileBaseName = path.basename(destFile, path.extname(destFile));
      if (destFileBaseName.startsWith(namePrefixWithoutExt)) {
        return true;
      }
    }
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') {
      return false;
    }
    throw e;
  }
  return false;
}

async function processVoiceAssets(
  cardSeriesId: number,
  fetchedAssetsDir: string,
  voiceDestDir: string,
  cardTmpRoot: string,
  projectRoot: string,
  voiceAssetFilename: string
) {
  const voiceAssetSourcePath = path.join(fetchedAssetsDir, voiceAssetFilename);
  try {
    await fs.access(voiceAssetSourcePath);
    const tmpVoiceProcessingDir = path.join(cardTmpRoot, 'processing_voice');
    await fs.mkdir(tmpVoiceProcessingDir, { recursive: true });
    await fs.copyFile(voiceAssetSourcePath, path.join(tmpVoiceProcessingDir, voiceAssetFilename));

    await runCommand(
      'python3',
      ['-m', 'silverwind.tool.acb', tmpVoiceProcessingDir],
      path.join(projectRoot, '../hasu_tools'),
      `[ACBDecrypt-${cardSeriesId}]`
    );

    const voiceOutDir = path.join(tmpVoiceProcessingDir, 'out');
    const voiceFiles = await fs.readdir(voiceOutDir);
    for (const file of voiceFiles) {
      const sourceFileBaseNameWithoutExt = path.basename(file, path.extname(file));
      const destFileName = `${sourceFileBaseNameWithoutExt}.webm`;
      const destFilePath = path.join(voiceDestDir, destFileName);

      if (
        await fs
          .access(destFilePath)
          .then(() => true)
          .catch(() => false)
      ) {
        console.log(`Skipping voice asset ${file} as it already exists as ${destFileName}`);
        continue;
      }

      await runCommand('ffmpeg', [
        '-i',
        path.join(voiceOutDir, file),
        '-c:a',
        'libopus',
        '-b:a',
        '96k',
        destFilePath
      ]);
    }
    console.log(`Processed voice assets moved to: ${voiceDestDir}`);
    await fs.rm(tmpVoiceProcessingDir, { recursive: true, force: true });
  } catch (e) {
    console.warn(
      `Voice asset ${voiceAssetFilename} not found or processing failed: ${(e as Error).message}`
    );
  }
}

async function processImageAssets(
  cardSeriesId: number,
  fetchedAssetsDir: string,
  imagesDestDir: string,
  cardTmpRoot: string,
  projectRoot: string,
  imageVariants: string[]
) {
  for (const variant of imageVariants) {
    const imageAssetFilename = `image_card_full_${cardSeriesId}${variant}`;
    const imageAssetSourcePath = path.join(fetchedAssetsDir, imageAssetFilename);
    try {
      await fs.access(imageAssetSourcePath);
      const tmpImageProcessingDir = path.join(cardTmpRoot, `processing_image_${variant}`);
      await fs.mkdir(tmpImageProcessingDir, { recursive: true });
      const processingImagePath = path.join(tmpImageProcessingDir, imageAssetFilename);
      await fs.copyFile(imageAssetSourcePath, processingImagePath);

      await runCommand(
        'arch',
        [
          '-x86_64',
          '/usr/bin/python3',
          '-m',
          'vendor.assetbundle_dist.assetbundle',
          processingImagePath
        ],
        path.join(projectRoot, '../hasu_tools'),
        `[ImageDecrypt-${cardSeriesId}-${variant}]`
      );

      const imageOutDir = path.join(tmpImageProcessingDir, 'out');
      const outputFiles = await fs.readdir(imageOutDir);
      for (const file of outputFiles) {
        if (file.endsWith('.png') || file.endsWith('.jpg')) {
          const sourceFilePath = path.join(imageOutDir, file);
          const destFileName = `${path.basename(file, path.extname(file))}.webp`;
          const destFilePath = path.join(imagesDestDir, destFileName);

          const alreadyExists = await destinationContainsFileStartingWith(
            imagesDestDir,
            path.basename(destFileName, '.webp')
          );

          if (alreadyExists) {
            console.log(
              `Skipping image asset ${file} as a file starting with base name '${path.basename(destFileName, '.webp')}' already exists in ${imagesDestDir}`
            );
            continue;
          }

          await runCommand('ffmpeg', ['-i', sourceFilePath, '-q:v', '85', destFilePath]);
        }
      }
      console.log(`Processed image variant ${variant} moved to: ${imagesDestDir}`);
      await fs.rm(tmpImageProcessingDir, { recursive: true, force: true });
    } catch (e) {
      console.warn(
        `Image asset ${imageAssetFilename} not found or processing failed: ${(e as Error).message}`
      );
    }
  }
}

async function processSpecialAppealImages(
  cardSeriesId: number,
  fetchedAssetsDir: string,
  imagesDestDir: string,
  cardTmpRoot: string,
  projectRoot: string,
  imageVariants: string[]
) {
  for (const variant of imageVariants) {
    const specialAppealImageFilename = `image_card_specialappeal_${cardSeriesId}${variant}`;
    const specialAppealImageSourcePath = path.join(fetchedAssetsDir, specialAppealImageFilename);
    try {
      await fs.access(specialAppealImageSourcePath);
      const tmpSpecialAppealImageProcessingDir = path.join(
        cardTmpRoot,
        `processing_special_appeal_image_${variant}`
      );
      await fs.mkdir(tmpSpecialAppealImageProcessingDir, { recursive: true });
      const processingImagePath = path.join(
        tmpSpecialAppealImageProcessingDir,
        specialAppealImageFilename
      );
      await fs.copyFile(specialAppealImageSourcePath, processingImagePath);

      await runCommand(
        'arch',
        [
          '-x86_64',
          '/usr/bin/python3',
          '-m',
          'vendor.assetbundle_dist.assetbundle',
          processingImagePath
        ],
        path.join(projectRoot, '../hasu_tools'),
        `[ImageDecrypt-SpecialAppeal-${cardSeriesId}-${variant}]`
      );

      const imageOutDir = path.join(tmpSpecialAppealImageProcessingDir, 'out');
      const outputFiles = await fs.readdir(imageOutDir);
      for (const file of outputFiles) {
        if (file.endsWith('.png') || file.endsWith('.jpg')) {
          const sourceFilePath = path.join(imageOutDir, file);
          const destFileName = `${path.basename(file, path.extname(file))}.webp`;
          const destFilePath = path.join(imagesDestDir, destFileName);

          const alreadyExists = await destinationContainsFileStartingWith(
            imagesDestDir,
            path.basename(destFileName, '.webp')
          );

          if (alreadyExists) {
            console.log(
              `Skipping special appeal image asset ${file} as a file starting with base name '${path.basename(destFileName, '.webp')}' already exists in ${imagesDestDir}`
            );
            continue;
          }

          await runCommand('ffmpeg', ['-i', sourceFilePath, '-q:v', '85', destFilePath]);
        }
      }
      console.log(`Processed special appeal image variant ${variant} moved to: ${imagesDestDir}`);
      await fs.rm(tmpSpecialAppealImageProcessingDir, { recursive: true, force: true });
    } catch (e) {
      console.warn(
        `Special appeal image asset ${specialAppealImageFilename} not found or processing failed: ${(e as Error).message}`
      );
    }
  }
}

async function processDeckFrameCharaImage(
  cardSeriesId: number,
  fetchedAssetsDir: string,
  imagesDestDir: string,
  cardTmpRoot: string,
  projectRoot: string,
  deckFrameCharaImageFilename: string
) {
  const deckFrameCharaImageSourcePath = path.join(fetchedAssetsDir, deckFrameCharaImageFilename);
  try {
    await fs.access(deckFrameCharaImageSourcePath);
    const tmpDeckFrameCharaProcessingDir = path.join(cardTmpRoot, 'processing_deck_frame_chara');
    await fs.mkdir(tmpDeckFrameCharaProcessingDir, { recursive: true });
    const processingImagePath = path.join(
      tmpDeckFrameCharaProcessingDir,
      deckFrameCharaImageFilename
    );
    await fs.copyFile(deckFrameCharaImageSourcePath, processingImagePath);

    await runCommand(
      'arch',
      [
        '-x86_64',
        '/usr/bin/python3',
        '-m',
        'vendor.assetbundle_dist.assetbundle',
        processingImagePath
      ],
      path.join(projectRoot, '../hasu_tools'),
      `[ImageDecrypt-DeckFrameChara-${cardSeriesId}]`
    );

    const imageOutDir = path.join(tmpDeckFrameCharaProcessingDir, 'out');
    const outputFiles = await fs.readdir(imageOutDir);
    for (const file of outputFiles) {
      if (file.endsWith('.png') || file.endsWith('.jpg')) {
        const sourceFilePath = path.join(imageOutDir, file);
        const destFileName = `${path.basename(file, path.extname(file))}.webp`;
        const destFilePath = path.join(imagesDestDir, destFileName);

        const alreadyExists = await destinationContainsFileStartingWith(
          imagesDestDir,
          path.basename(destFileName, '.webp')
        );

        if (alreadyExists) {
          console.log(
            `Skipping deck frame chara image asset ${file} as a file starting with base name '${path.basename(destFileName, '.webp')}' already exists in ${imagesDestDir}`
          );
          continue;
        }

        await runCommand('ffmpeg', ['-i', sourceFilePath, '-q:v', '85', destFilePath]);
      }
    }
    console.log(`Processed deck frame chara image moved to: ${imagesDestDir}`);
    await fs.rm(tmpDeckFrameCharaProcessingDir, { recursive: true, force: true });
  } catch (e) {
    console.warn(
      `Deck frame chara image asset ${deckFrameCharaImageFilename} not found or processing failed: ${(e as Error).message}`
    );
  }
}

let currentCardTmpRoot: string | null = null;
let currentTmpBaseDir: string | null = null;

async function cleanupTempDirs() {
  if (currentCardTmpRoot) {
    try {
      console.log(`Cleaning up temporary directory: ${currentCardTmpRoot}`);
      await fs.rm(currentCardTmpRoot, { recursive: true, force: true });
    } catch (e) {
      console.warn(
        `Failed to cleanup temporary directory ${currentCardTmpRoot}: ${(e as Error).message}`
      );
    }
  }
  if (currentTmpBaseDir) {
    try {
      const filesInTmpBase = await fs.readdir(currentTmpBaseDir).catch(() => []);
      if (filesInTmpBase.length === 0) {
        console.log(`Cleaning up base temporary directory: ${currentTmpBaseDir}`);
        await fs.rmdir(currentTmpBaseDir);
      }
    } catch (e) {
      console.warn(`Could not remove base temp dir ${currentTmpBaseDir}: ${(e as Error).message}`);
    }
  }
}

process.on('SIGINT', async () => {
  console.log('\nSIGINT received. Attempting to clean up temporary directories...');
  await cleanupTempDirs();
  process.exit(0);
});

export const fetchAssets = async (cardSeriesId: number): Promise<void> => {
  const projectRoot = process.cwd();
  const publicRoot = path.join(projectRoot, 'public');
  const tmpBaseDir = path.join(publicRoot, 'tmp_assets_processing');
  const cardTmpRoot = path.join(tmpBaseDir, `card_${cardSeriesId}`);
  const fetchedAssetsDir = path.join(cardTmpRoot, 'fetched_raw_assets');

  // Store these for potential cleanup on SIGINT
  currentCardTmpRoot = cardTmpRoot;
  currentTmpBaseDir = tmpBaseDir;

  const cardPublicDestRoot = path.join(publicRoot, 'cards', String(cardSeriesId));

  const cardPublicDestRootExists = await fs
    .access(cardPublicDestRoot)
    .then(() => true)
    .catch(() => false);

  if (cardPublicDestRootExists) {
    console.log(
      `Skipping cardSeriesId ${cardSeriesId} as destination directory ${cardPublicDestRoot} already exists.`
    );
    return;
  }
  const voiceDestDir = path.join(cardPublicDestRoot, 'voice');
  const imagesDestDir = path.join(cardPublicDestRoot, 'images');

  const assetsToFetch: string[] = [];
  const dbSqlitePath = path.join(projectRoot, '../', 'data', 'db.sqlite3');

  try {
    console.log(`Starting asset processing for cardSeriesId: ${cardSeriesId}`);

    await fs.mkdir(voiceDestDir, { recursive: true });
    await fs.mkdir(imagesDestDir, { recursive: true });
    await fs.mkdir(fetchedAssetsDir, { recursive: true });

    console.log(`Created temporary directory: ${fetchedAssetsDir}`);

    const voiceAssetFilename = `vo_card_${cardSeriesId}.acb`;
    assetsToFetch.push(voiceAssetFilename);
    console.log(`Identified voice asset for fetching: ${voiceAssetFilename}`);

    const imageVariants = ['0', '1']; // Assuming '2' is also a valid variant for specialappeal
    for (const variant of imageVariants) {
      const imageAssetFilename = `image_card_full_${cardSeriesId}${variant}`;
      assetsToFetch.push(imageAssetFilename);
      console.log(`Identified image asset for fetching: ${imageAssetFilename}`);

      const specialAppealImageFilename = `image_card_specialappeal_${cardSeriesId}${variant}`;
      assetsToFetch.push(specialAppealImageFilename);
      console.log(
        `Identified special appeal image asset for fetching: ${specialAppealImageFilename}`
      );
    }

    const deckFrameCharaImageFilename = `image_deck_frame_chara_${cardSeriesId}`;
    assetsToFetch.push(deckFrameCharaImageFilename);
    console.log(
      `Identified deck frame chara image asset for fetching: ${deckFrameCharaImageFilename}`
    );

    const uniqueAssetsToFetch = Array.from(new Set(assetsToFetch));
    if (uniqueAssetsToFetch.length > 0) {
      console.log(`Fetching ${uniqueAssetsToFetch.length} unique assets to ${fetchedAssetsDir}...`);
      await runCommand(
        'python3',
        [
          '-m',
          'silverwind.tool.get_assets',
          '-p',
          'android',
          dbSqlitePath,
          fetchedAssetsDir,
          ...uniqueAssetsToFetch
        ],
        path.join(projectRoot, '../hasu_tools'),
        `[GetAssets-${cardSeriesId}]`
      );
      console.log(`All assets fetched to: ${fetchedAssetsDir}`);

      await Promise.all([
        processVoiceAssets(
          cardSeriesId,
          fetchedAssetsDir,
          voiceDestDir,
          cardTmpRoot,
          projectRoot,
          voiceAssetFilename
        ),
        processImageAssets(
          cardSeriesId,
          fetchedAssetsDir,
          imagesDestDir,
          cardTmpRoot,
          projectRoot,
          imageVariants
        ),
        processSpecialAppealImages(
          cardSeriesId,
          fetchedAssetsDir,
          imagesDestDir,
          cardTmpRoot,
          projectRoot,
          imageVariants
        ),
        processDeckFrameCharaImage(
          cardSeriesId,
          fetchedAssetsDir,
          imagesDestDir,
          cardTmpRoot,
          projectRoot,
          deckFrameCharaImageFilename
        )
      ]);
    } else {
      console.log(`No assets identified to fetch for cardSeriesId: ${cardSeriesId}`);
    }

    console.log(`Asset processing successfully finished for cardSeriesId: ${cardSeriesId}`);
  } catch (error) {
    console.error(`Critical error during asset fetching for cardSeriesId ${cardSeriesId}:`, error);
  } finally {
    // Ensure cleanup happens even on normal completion
    await cleanupTempDirs();
  }
};
