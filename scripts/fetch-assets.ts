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
    //@ts-expect-error env
    env: { ...process.env, PYTHONUNBUFFERED: '1' } // Useful for python scripts as any
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

          const alreadyExists = await destinationContainsFileStartingWith(
            videosDestDir,
            path.basename(file, '.webm')
          );

          if (alreadyExists) {
            console.log(`Skipping video asset ${file} as it already exists in ${videosDestDir}`);
            continue;
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

// eslint-disable-next-line @typescript-eslint/no-misused-promises
process.on('SIGINT', async () => {
  console.log('\nSIGINT received. Attempting to clean up temporary directories...');
  await cleanupTempDirs();
  process.exit(0);
});

export async function fetchAssets(cardSeriesId: number): Promise<void> {
  const projectRoot = process.cwd();
  const publicRoot = path.join(projectRoot, 'public');
  const tmpBaseDir = path.join(publicRoot, 'tmp_assets_processing');
  const cardTmpRoot = path.join(tmpBaseDir, `card_${cardSeriesId}`);
  const fetchedAssetsDir = path.join(cardTmpRoot, 'fetched_raw_assets');

  // Store these for potential cleanup on SIGINT
  currentCardTmpRoot = cardTmpRoot;
  currentTmpBaseDir = tmpBaseDir;

  const cardPublicDestRoot = path.join(publicRoot, 'cards', String(cardSeriesId));

  const voiceDestDir = path.join(cardPublicDestRoot, 'voice');
  const imagesDestDir = path.join(cardPublicDestRoot, 'images');
  const videosDestDir = path.join(cardPublicDestRoot, 'videos');

  // Check if destination directories are empty for each media type
  const voiceDestDirEmpty = !(await fs
    .access(voiceDestDir)
    .then(() => fs.readdir(voiceDestDir).then((files) => files.length > 0))
    .catch(() => false));
  const imagesDestDirEmpty = !(await fs
    .access(imagesDestDir)
    .then(() => fs.readdir(imagesDestDir).then((files) => files.length > 0))
    .catch(() => false));
  const videosDestDirEmpty = !(await fs
    .access(videosDestDir)
    .then(() => fs.readdir(videosDestDir).then((files) => files.length > 0))
    .catch(() => false));

  if (!voiceDestDirEmpty && !imagesDestDirEmpty && !videosDestDirEmpty) {
    console.log(
      `Skipping cardSeriesId ${cardSeriesId} as all media types already exist in ${cardPublicDestRoot}.`
    );
    return;
  }

  await fs.mkdir(fetchedAssetsDir, { recursive: true });
  console.log(`Created temporary directory: ${fetchedAssetsDir}`);

  const assetsToFetch: string[] = [];
  const dbSqlitePath = path.join(projectRoot, '../', 'data', 'db.sqlite3');

  let voiceAssetFilename: string | undefined;
  let deckFrameCharaImageFilename: string | undefined;

  try {
    console.log(`Starting asset processing for cardSeriesId: ${cardSeriesId}`);

    if (voiceDestDirEmpty) {
      await fs.mkdir(voiceDestDir, { recursive: true });
      voiceAssetFilename = `vo_card_${cardSeriesId}.acb`;
      assetsToFetch.push(voiceAssetFilename);
      console.log(`Identified voice asset for fetching: ${voiceAssetFilename}`);
    } else {
      console.log(
        `Skipping voice asset fetching for cardSeriesId ${cardSeriesId} as voice directory is not empty.`
      );
    }

    const imageVariants = ['0', '1']; // Assuming '2' is also a valid variant for specialappeal
    if (imagesDestDirEmpty) {
      await fs.mkdir(imagesDestDir, { recursive: true });
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
      deckFrameCharaImageFilename = `image_deck_frame_chara_${cardSeriesId}`;
      assetsToFetch.push(deckFrameCharaImageFilename);
      console.log(
        `Identified deck frame chara image asset for fetching: ${deckFrameCharaImageFilename}`
      );
    } else {
      console.log(
        `Skipping image asset fetching for cardSeriesId ${cardSeriesId} as images directory is not empty.`
      );
    }

    const videoPatterns = [
      `picture_ur_training_${cardSeriesId}_in.usm`,
      `picture_ur_training_${cardSeriesId}_loop.usm`,
      `picture_ur_get_${cardSeriesId}_in.usm`,
      `picture_ur_get_${cardSeriesId}_loop.usm`
    ];
    for (const variant of imageVariants) {
      videoPatterns.push(`picture_ur_home_${cardSeriesId}${variant}.usm`);
    }
    if (videosDestDirEmpty) {
      await fs.mkdir(videosDestDir, { recursive: true });
      for (const videoFilename of videoPatterns) {
        assetsToFetch.push(videoFilename);
        console.log(`Identified video asset for fetching: ${videoFilename}`);
      }
    } else {
      console.log(
        `Skipping video asset fetching for cardSeriesId ${cardSeriesId} as videos directory is not empty.`
      );
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

      if (voiceDestDirEmpty && voiceAssetFilename) {
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
      if (imagesDestDirEmpty) {
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
      }
      if (videosDestDirEmpty) {
        processingPromises.push(
          processVideoAssets(
            cardSeriesId,
            fetchedAssetsDir,
            videosDestDir,
            cardTmpRoot,
            projectRoot
          )
        );
      }

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
  void main();
}
