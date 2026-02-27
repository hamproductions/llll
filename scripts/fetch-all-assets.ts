// /asset-explorer/src/scripts/fetch-all-assets.ts

import fs from 'fs/promises';
import path from 'path';
import * as schema from '../drizzle/schema';
import { fetchAssets, processGenericImageAssets, runCommand } from './fetch-assets';
import { getDrizzleDb, closeDb } from '~/utils/database';

async function fetchAllAssets() {
  const db = getDrizzleDb();
  try {
    const allCards = await db.select({ id: schema.cardSeries.id }).from(schema.cardSeries);
    const allCardIds = allCards.map((card) => card.id);

    console.log(`Found ${allCardIds.length} cards to process.`);

    for (const cardId of allCardIds) {
      if (cardId === null) continue;

      try {
        await fetchAssets(cardId, true);
      } catch (error) {
        console.error(`Failed to fetch assets for card ${cardId}:`, error);
        // Decide if you want to continue with the next card or stop.
        // For now, we'll log the error and continue.
      }
    }

    console.log('All assets for all cards have been processed.');

    const projectRoot = process.cwd();
    const dataRoot = path.join(projectRoot, 'data');
    const tmpBaseDir = path.join(dataRoot, 'tmp_assets_processing');
    const dbSqlitePath = path.join(projectRoot, '../', 'data', 'db.sqlite3');

    async function fetchAndProcessSpecificAssets(
      assetType: string,
      assetPatternToFetch: string,
      logPrefix: string
    ) {
      const destDir = path.join(dataRoot, 'assets', assetType);
      await fs.mkdir(destDir, { recursive: true });

      // Check what files already exist in the destination
      const existingFiles = new Set();
      try {
        const destFiles = await fs.readdir(destDir);
        destFiles.forEach((file) => {
          const baseName = path.basename(file, path.extname(file));
          existingFiles.add(baseName);
        });
      } catch (e) {
        // Directory might not exist yet, that's OK
      }

      const fetchedAssetsDir = path.join(tmpBaseDir, `fetched_raw_assets_${assetType}`);
      await fs.mkdir(fetchedAssetsDir, { recursive: true });

      console.log(
        `Fetching assets matching pattern: ${assetPatternToFetch} to ${fetchedAssetsDir}...`
      );
      await runCommand(
        'python3',
        [
          '-m',
          'silverwind.tool.get_assets',
          '-p',
          'android',
          dbSqlitePath,
          fetchedAssetsDir,
          assetPatternToFetch
        ],
        path.join(projectRoot, '../hasu_tools'),
        logPrefix
      );
      console.log(`All ${assetType} assets fetched to: ${fetchedAssetsDir}`);

      const fetchedFiles = await fs.readdir(fetchedAssetsDir);
      if (fetchedFiles.length > 0) {
        let skipped = 0;
        let processed = 0;

        for (const assetFilename of fetchedFiles) {
          // Check if this asset already exists (without extension)
          const baseAssetName = assetFilename.replace(/\.[^.]+$/, ''); // Remove extension

          if (existingFiles.has(baseAssetName)) {
            console.log(
              `Skipping ${assetType}/${assetFilename} - already exists as ${baseAssetName}.webp`
            );
            skipped++;
            continue;
          }

          await processGenericImageAssets(
            assetFilename,
            fetchedAssetsDir,
            destDir,
            tmpBaseDir,
            projectRoot,
            `${assetType}-${assetFilename}`
          );
          processed++;
        }

        console.log(
          `${assetType} assets summary: ${processed} processed, ${skipped} skipped (already existed)`
        );
      } else {
        console.log(`No ${assetType} assets found for the specified pattern.`);
      }
      await fs.rm(fetchedAssetsDir, { recursive: true, force: true });
    }

    // Fetch and process skill icons
    await fetchAndProcessSpecificAssets('skillicon', 'icon_skill_%', `[GetAssets-SkillIcon]`);

    // Fetch and process tokens
    await fetchAndProcessSpecificAssets(
      'token',
      '%image_card_middle_vertical_8%%',
      `[GetAssets-Token]`
    );

    // Fetch and process story voice files
    async function fetchAndProcessStoryVoices() {
      const voiceDestDir = path.join(dataRoot, 'story', 'voice');
      await fs.mkdir(voiceDestDir, { recursive: true });

      // Check what voice files already exist
      const existingVoiceFiles = new Set<string>();
      try {
        const destFiles = await fs.readdir(voiceDestDir);
        destFiles.forEach((file) => {
          const baseName = path.basename(file, path.extname(file));
          existingVoiceFiles.add(baseName);
        });
      } catch {
        // Directory might not exist yet, that's OK
      }

      const fetchedAssetsDir = path.join(tmpBaseDir, 'fetched_raw_assets_story_voices');
      await fs.mkdir(fetchedAssetsDir, { recursive: true });

      console.log('Fetching story voice assets (vo_adv_%)...');
      await runCommand(
        'python3',
        [
          '-m',
          'silverwind.tool.get_assets',
          '-p',
          'android',
          dbSqlitePath,
          fetchedAssetsDir,
          'vo_adv_%'
        ],
        path.join(projectRoot, '../hasu_tools'),
        '[GetAssets-StoryVoices]'
      );
      console.log(`All story voice assets fetched to: ${fetchedAssetsDir}`);

      const fetchedFiles = await fs.readdir(fetchedAssetsDir);
      if (fetchedFiles.length > 0) {
        let skipped = 0;
        let processed = 0;

        for (const voiceAssetFilename of fetchedFiles) {
          const baseAssetName = voiceAssetFilename.replace(/\.[^.]+$/, ''); // Remove extension

          // Check if ANY voice files from this ACB already exist
          // ACB files extract to multiple voice files, so check if any exist with this pattern
          const hasAnyVoiceFiles = Array.from(existingVoiceFiles).some((filename) =>
            filename.startsWith(baseAssetName)
          );

          if (hasAnyVoiceFiles) {
            console.log(
              `Skipping ${voiceAssetFilename} - voice files already exist (will skip individual conversions)`
            );
            skipped++;
            continue;
          }

          // Process the voice ACB file
          const voiceAssetSourcePath = path.join(fetchedAssetsDir, voiceAssetFilename);
          const tmpVoiceProcessingDir = path.join(tmpBaseDir, `processing_voice_${baseAssetName}`);

          try {
            await fs.mkdir(tmpVoiceProcessingDir, { recursive: true });
            await fs.copyFile(
              voiceAssetSourcePath,
              path.join(tmpVoiceProcessingDir, voiceAssetFilename)
            );

            // Decrypt ACB file
            await runCommand(
              'python3',
              ['-m', 'silverwind.tool.acb', tmpVoiceProcessingDir],
              path.join(projectRoot, '../hasu_tools'),
              `[ACBDecrypt-${baseAssetName}]`
            );

            const voiceOutDir = path.join(tmpVoiceProcessingDir, 'out');
            const voiceFiles = await fs.readdir(voiceOutDir);

            // Batch check: get all existing webm files in destination
            const existingWebmFiles = new Set<string>();
            try {
              const existingFiles = await fs.readdir(voiceDestDir);
              existingFiles.forEach((file) => {
                if (file.endsWith('.webm')) {
                  existingWebmFiles.add(path.basename(file, '.webm'));
                }
              });
            } catch (e) {
              // Directory might not exist yet, that's OK
            }

            let voiceFilesSkipped = 0;
            let voiceFilesConverted = 0;

            for (const file of voiceFiles) {
              const sourceFileBaseNameWithoutExt = path.basename(file, path.extname(file));
              const destFileName = `${sourceFileBaseNameWithoutExt}.webm`;
              const destFilePath = path.join(voiceDestDir, destFileName);

              // Check if this specific voice file already exists
              if (existingWebmFiles.has(sourceFileBaseNameWithoutExt)) {
                console.log(`Skipping ${destFileName} - already exists`);
                voiceFilesSkipped++;
                continue;
              }

              // Convert to webm using ffmpeg
              await runCommand('ffmpeg', [
                '-i',
                path.join(voiceOutDir, file),
                '-c:a',
                'libopus',
                '-b:a',
                '96k',
                destFilePath
              ]);

              console.log(`Processed voice file: ${destFileName}`);
              voiceFilesConverted++;
            }

            console.log(
              `Voice files from ${baseAssetName}: ${voiceFilesConverted} converted, ${voiceFilesSkipped} skipped`
            );

            processed++;
            await fs.rm(tmpVoiceProcessingDir, { recursive: true, force: true });
          } catch (e) {
            console.warn(
              `Failed to process voice asset ${voiceAssetFilename}: ${(e as Error).message}`
            );
          }
        }

        console.log(
          `Story voice assets summary: ${processed} processed, ${skipped} skipped (already existed)`
        );
      } else {
        console.log('No story voice assets found for the specified pattern.');
      }

      await fs.rm(fetchedAssetsDir, { recursive: true, force: true });
    }

    await fetchAndProcessStoryVoices();

    await fs.rmdir(tmpBaseDir, { recursive: true });
  } catch (error) {
    console.error('An error occurred during the fetch-all-assets script:', error);
  } finally {
    closeDb();
    console.log('Database connection closed.');
  }
}

await fetchAllAssets();
