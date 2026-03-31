import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { readableStreamToArrayBuffer } from 'bun';
import sharp from 'sharp';

// Helper function to run shell commands
export async function runCommand(
  command: string,
  args: string[],
  cwd?: string,
  logPrefix?: string
) {
  const commandDisplay = `${command} ${args.join(' ')}`;
  console.log(`${logPrefix || '[CMD]'} Running: ${commandDisplay} ${cwd ? `(in ${cwd})` : ''}`);
  const proc = Bun.spawn([command, ...args], {
    cwd: cwd || process.cwd(),
    stdout: 'pipe',
    stderr: 'pipe',
    env: process.env as Record<string, string>
  });

  const stdoutBuffer = await readableStreamToArrayBuffer(proc.stdout);
  const stderrBuffer = await readableStreamToArrayBuffer(proc.stderr);
  const stdout = new TextDecoder().decode(stdoutBuffer);
  const stderr = new TextDecoder().decode(stderrBuffer);

  // const exitCode = proc.exitCode;

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

      if (await destinationContainsFileStartingWith(voiceDestDir, sourceFileBaseNameWithoutExt)) {
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

export async function processGenericImageAssets(
  assetFilename: string,
  fetchedAssetsDir: string,
  imagesDestDir: string,
  tmpRoot: string,
  projectRoot: string,
  logPrefix: string
) {
  const imageAssetSourcePath = path.join(fetchedAssetsDir, assetFilename);

  // Check if destination already has this file (early exit optimization)
  const baseNameWithoutExt = assetFilename.replace(/\.[^.]+$/, ''); // Remove extension
  const destFileName = `${baseNameWithoutExt}.webp`;
  const destFilePath = path.join(imagesDestDir, destFileName);

  try {
    await fs.access(destFilePath);
    console.log(`Skipping ${logPrefix}: ${destFileName} already exists`);
    return;
  } catch (e) {
    // File doesn't exist, continue processing
  }

  try {
    await fs.access(imageAssetSourcePath);
    const tmpImageProcessingDir = path.join(
      tmpRoot,
      `processing_${assetFilename.replace(/[^a-zA-Z0-9]/g, '_')}`
    );
    await fs.mkdir(tmpImageProcessingDir, { recursive: true });
    const processingImagePath = path.join(tmpImageProcessingDir, assetFilename);
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
      `[ImageDecrypt-${logPrefix}]`
    );

    const imageOutDir = path.join(tmpImageProcessingDir, 'out');
    const outputFiles = await fs.readdir(imageOutDir);
    for (const file of outputFiles) {
      if (file.endsWith('.png') || file.endsWith('.jpg')) {
        const sourceFilePath = path.join(imageOutDir, file);
        const destFileName = `${path.basename(file, path.extname(file))}.webp`;
        const destFilePath = path.join(imagesDestDir, destFileName);

        if (
          await destinationContainsFileStartingWith(
            imagesDestDir,
            path.basename(destFileName, '.webp')
          )
        ) {
          console.log(
            `Skipping image asset ${file} as a file starting with base name '${path.basename(destFileName, '.webp')}' already exists in ${imagesDestDir}`
          );
          continue;
        }

        console.log(`Converting ${sourceFilePath} to ${destFilePath} using sharp`);
        await sharp(sourceFilePath).webp({ quality: 85 }).toFile(destFilePath);
      }
    }
    console.log(`Processed image ${assetFilename} moved to: ${imagesDestDir}`);
    await fs.rm(tmpImageProcessingDir, { recursive: true, force: true }); // Use force: true for safer removal
  } catch (e) {
    console.warn(
      `Image asset ${assetFilename} not found or processing failed: ${(e as Error).message}`
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
    await processGenericImageAssets(
      imageAssetFilename,
      fetchedAssetsDir,
      imagesDestDir,
      cardTmpRoot,
      projectRoot,
      `CardFull-${cardSeriesId}-${variant}`
    );
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
    await processGenericImageAssets(
      specialAppealImageFilename,
      fetchedAssetsDir,
      imagesDestDir,
      cardTmpRoot,
      projectRoot,
      `SpecialAppeal-${cardSeriesId}-${variant}`
    );
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
  await processGenericImageAssets(
    deckFrameCharaImageFilename,
    fetchedAssetsDir,
    imagesDestDir,
    cardTmpRoot,
    projectRoot,
    `DeckFrameChara-${cardSeriesId}`
  );
}

async function processVideoAssets(
  cardSeriesId: number,
  fetchedAssetsDir: string,
  videosDestDir: string,
  cardTmpRoot: string,
  projectRoot: string
) {
  const videoPatterns = [
    `picture_ur_training_${cardSeriesId}_in.usm`,
    `picture_ur_training_${cardSeriesId}_loop.usm`,
    `picture_ur_get_${cardSeriesId}_in.usm`,
    `picture_ur_get_${cardSeriesId}_loop.usm`
  ];
  for (const variant of ['0', '1']) {
    videoPatterns.push(`picture_ur_home_${cardSeriesId}${variant}.usm`);
  }

  for (const videoFilename of videoPatterns) {
    const videoSourcePath = path.join(fetchedAssetsDir, videoFilename);
    try {
      await fs.access(videoSourcePath);
      const tmpVideoProcessingDir = path.join(cardTmpRoot, `processing_video_${videoFilename}`);
      await fs.mkdir(tmpVideoProcessingDir, { recursive: true });

      // Run the PyCriUsm/main.py script to process the USM file directly to WebM
      await runCommand(
        'python3',
        [
          path.join(projectRoot, '../PyCriUsm/main.py'),
          videoSourcePath,
          '-o',
          tmpVideoProcessingDir,
          '-f',
          'webm'
        ],
        projectRoot,
        `[VideoDecrypt-${cardSeriesId}-${videoFilename}]`
      );

      const outputFiles = await fs.readdir(tmpVideoProcessingDir);
      for (const file of outputFiles) {
        if (file.endsWith('.webm')) {
          const sourceFilePath = path.join(tmpVideoProcessingDir, file);
          const destFilePath = path.join(videosDestDir, file);

          try {
            await fs.access(destFilePath);
            console.log(`Skipping video asset ${file} as it already exists in ${videosDestDir}`);
            continue;
          } catch (e) {
            // File does not exist, proceed with moving
          }

          await fs.rename(sourceFilePath, destFilePath);
          console.log(`Processed video ${file} moved to: ${videosDestDir}`);
        }
      }
      await fs.rm(tmpVideoProcessingDir, { recursive: true, force: true });
    } catch (e) {
      console.warn(
        `Video asset ${videoFilename} not found or processing failed: ${(e as Error).message}`
      );
    }
  }
}

let currentTmpBaseDir: string | null = null;
let currentCardTmpRoot: string | null = null;

async function cleanupTempDirs() {
  if (currentCardTmpRoot) {
    try {
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
        await fs.rmdir(currentTmpBaseDir);
      }
    } catch (e) {
      console.warn(`Could not remove base temp dir ${currentTmpBaseDir}: ${(e as Error).message}`);
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-misused-promises
process.on('SIGINT', async () => {
  console.log('\nSIGINT received. Attempting to clean up temporary directories...');
  await cleanupTempDirs();
  process.exit(0);
});

export async function fetchAssets(
  cardSeriesId: number,
  aggressiveSkip: boolean = false
): Promise<void> {
  const projectRoot = process.cwd();
  const dataRoot = path.join(projectRoot, 'data');
  const tmpBaseDir = path.join(dataRoot, 'tmp_assets_processing');
  const cardTmpRoot = path.join(tmpBaseDir, `card_${cardSeriesId}`);
  const fetchedAssetsDir = path.join(cardTmpRoot, 'fetched_raw_assets');

  // Store these for potential cleanup on SIGINT
  currentCardTmpRoot = cardTmpRoot;
  currentTmpBaseDir = tmpBaseDir;

  const cardDataDestRoot = path.join(dataRoot, 'cards', String(cardSeriesId));

  if (aggressiveSkip) {
    try {
      await fs.access(cardDataDestRoot);
      console.log(`Skipping card ${cardSeriesId} (directory already exists)`);
      return;
    } catch {
      // Directory doesn't exist, continue processing
    }
  }

  const voiceDestDir = path.join(cardDataDestRoot, 'voice');
  const imagesDestDir = path.join(cardDataDestRoot, 'images');
  const videosDestDir = path.join(cardDataDestRoot, 'videos');

  await fs.mkdir(fetchedAssetsDir, { recursive: true });

  const assetsToFetch: string[] = [];
  const dbSqlitePath = path.join(projectRoot, '../', 'data', 'db.sqlite3');

  let voiceAssetFilename: string | undefined;
  let deckFrameCharaImageFilename: string | undefined;

  try {
    // Voice Assets
    voiceAssetFilename = `vo_card_${cardSeriesId}.acb`;
    const voiceOutputPrefix = `vo_card_${cardSeriesId}`; // Output files start with this
    await fs.mkdir(voiceDestDir, { recursive: true });
    if (!(await destinationContainsFileStartingWith(voiceDestDir, voiceOutputPrefix))) {
      assetsToFetch.push(voiceAssetFilename);
      console.log(`Identified voice asset for fetching: ${voiceAssetFilename}`);
    } else {
      console.log(
        `Skipping voice asset fetching for cardSeriesId ${cardSeriesId} as processed output already exists.`
      );
    }

    const imageVariants = ['0', '1']; // Assuming '2' is also a valid variant for specialappeal
    await fs.mkdir(imagesDestDir, { recursive: true });
    for (const variant of imageVariants) {
      const imageAssetFilename = `image_card_full_${cardSeriesId}${variant}`;
      const imageOutputPrefix = `image_card_full_${cardSeriesId}${variant}`; // Output files start with this
      if (!(await destinationContainsFileStartingWith(imagesDestDir, imageOutputPrefix))) {
        assetsToFetch.push(imageAssetFilename);
        console.log(`Identified image asset for fetching: ${imageAssetFilename}`);
      } else {
        console.log(
          `Skipping image asset ${imageAssetFilename} as processed output already exists.`
        );
      }

      const specialAppealImageFilename = `image_card_specialappeal_${cardSeriesId}${variant}`;
      const specialAppealOutputPrefix = `image_card_specialappeal_${cardSeriesId}${variant}`;
      if (!(await destinationContainsFileStartingWith(imagesDestDir, specialAppealOutputPrefix))) {
        assetsToFetch.push(specialAppealImageFilename);
        console.log(
          `Identified special appeal image asset for fetching: ${specialAppealImageFilename}`
        );
      } else {
        console.log(
          `Skipping special appeal image ${specialAppealImageFilename} as processed output already exists.`
        );
      }
    }
    deckFrameCharaImageFilename = `image_deck_frame_chara_${cardSeriesId}`;
    const deckFrameCharaOutputPrefix = `image_deck_frame_chara_${cardSeriesId}`;
    if (!(await destinationContainsFileStartingWith(imagesDestDir, deckFrameCharaOutputPrefix))) {
      assetsToFetch.push(deckFrameCharaImageFilename);
      console.log(
        `Identified deck frame chara image asset for fetching: ${deckFrameCharaImageFilename}`
      );
    } else {
      console.log(
        `Skipping deck frame chara image ${deckFrameCharaImageFilename} as processed output already exists.`
      );
    }

    const videoPatterns = [
      `picture_ur_training_${cardSeriesId}_in.usm`,
      `picture_ur_training_${cardSeriesId}_loop.usm`,
      `picture_ur_get_${cardSeriesId}_in.usm`,
      `picture_ur_get_${cardSeriesId}_loop.usm`,
      `picture_ur_home_${cardSeriesId}0.usm`,
      `picture_ur_home_${cardSeriesId}1.usm`
    ];

    await fs.mkdir(videosDestDir, { recursive: true });
    for (const videoFilename of videoPatterns) {
      const videoOutputPrefix = path.basename(videoFilename, '.usm');
      if (!(await destinationContainsFileStartingWith(videosDestDir, videoOutputPrefix))) {
        assetsToFetch.push(videoFilename);
        console.log(`Identified video asset for fetching: ${videoFilename}`);
      } else {
        console.log(`Skipping video asset ${videoFilename} as processed output already exists.`);
      }
    }

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

      const processingPromises: Promise<void>[] = [];

      if (voiceAssetFilename) {
        processingPromises.push(
          processVoiceAssets(
            cardSeriesId,
            fetchedAssetsDir,
            voiceDestDir,
            cardTmpRoot,
            projectRoot,
            voiceAssetFilename
          )
        );
      }
      processingPromises.push(
        processImageAssets(
          cardSeriesId,
          fetchedAssetsDir,
          imagesDestDir,
          cardTmpRoot,
          projectRoot,
          imageVariants
        )
      );
      processingPromises.push(
        processSpecialAppealImages(
          cardSeriesId,
          fetchedAssetsDir,
          imagesDestDir,
          cardTmpRoot,
          projectRoot,
          imageVariants
        )
      );
      if (deckFrameCharaImageFilename) {
        processingPromises.push(
          processDeckFrameCharaImage(
            cardSeriesId,
            fetchedAssetsDir,
            imagesDestDir,
            cardTmpRoot,
            projectRoot,
            deckFrameCharaImageFilename
          )
        );
      }
      processingPromises.push(
        processVideoAssets(cardSeriesId, fetchedAssetsDir, videosDestDir, cardTmpRoot, projectRoot)
      );

      await Promise.all(processingPromises);
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
}

async function main() {
  const args = process.argv.slice(2); // Get arguments after 'node fetch-assets.ts' or 'bun fetch-assets.ts'

  if (args.length === 0) {
    console.error('Usage: bun fetch-assets.ts <cardSeriesId>');
    process.exit(1);
  }

  const cardSeriesId = parseInt(args[0], 10);

  if (isNaN(cardSeriesId)) {
    console.error('Error: cardSeriesId must be a number.');
    process.exit(1);
  }

  await fetchAssets(cardSeriesId);
}

if (require.main === module) {
  // Correct way to check if module is run directly
  void main();
}
