// /asset-explorer/src/scripts/fetch-all-assets.ts

import fs from 'fs/promises';
import path from 'path';
import * as schema from '../drizzle/schema';
import { fetchAssets, processGenericImageAssets, runCommand } from './fetch-assets';
import { acbAssetPipelines, imageAssetPipelines } from './pipeline-manifest.js';
import { getDrizzleDb, closeDb } from '~/utils/database';

const HASU_PYTHON = process.env.HASU_PYTHON || 'python3.11';

async function fetchAllAssets() {
  const db = getDrizzleDb();
  try {
    const allCards = await db.select({ id: schema.cardSeries.id }).from(schema.cardSeries);
    const allCardIds = allCards.map((card) => card.id);

    console.log(`Found ${allCardIds.length} cards to process.`);

    for (const cardId of allCardIds) {
      if (cardId === null) continue;

      try {
        await fetchAssets(cardId, false);
      } catch (error) {
        console.error(`Failed to fetch assets for card ${cardId}:`, error);
        // Decide if you want to continue with the next card or stop.
        // For now, we'll log the error and continue.
      }
    }

    console.log('All assets for all cards have been processed.');

    const projectRoot = process.cwd();
    const appDataRoot = path.join(projectRoot, 'data');
    const tmpBaseDir = path.join(appDataRoot, 'tmp_assets_processing');
    const dbSqlitePath = path.join(projectRoot, '../', 'data', 'db.sqlite3');

    async function fetchAndProcessSpecificAssets(assetConfig: (typeof imageAssetPipelines)[number]) {
      const { key, pattern, logPrefix, localDir } = assetConfig;
      const destDir = path.join(projectRoot, localDir);
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

      const fetchedAssetsDir = path.join(tmpBaseDir, `fetched_raw_assets_${key}`);
      await fs.mkdir(fetchedAssetsDir, { recursive: true });

      console.log(`Fetching assets matching pattern: ${pattern} to ${fetchedAssetsDir}...`);
      await runCommand(
        HASU_PYTHON,
        [
          '-m',
          'silverwind.tool.get_assets',
          '-p',
          'android',
          dbSqlitePath,
          fetchedAssetsDir,
          pattern
        ],
        path.join(projectRoot, '../hasu_tools'),
        logPrefix
      );
      console.log(`All ${key} assets fetched to: ${fetchedAssetsDir}`);

      const fetchedFiles = await fs.readdir(fetchedAssetsDir);
      if (fetchedFiles.length > 0) {
        let skipped = 0;
        let processed = 0;

        for (const assetFilename of fetchedFiles) {
          // Check if this asset already exists (without extension)
          const baseAssetName = assetFilename.replace(/\.[^.]+$/, ''); // Remove extension

          if (existingFiles.has(baseAssetName)) {
            console.log(
              `Skipping ${key}/${assetFilename} - already exists as ${baseAssetName}.webp`
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
            `${key}-${assetFilename}`
          );
          processed++;
        }

        console.log(`${key} assets summary: ${processed} processed, ${skipped} skipped (already existed)`);
      } else {
        console.log(`No ${key} assets found for the specified pattern.`);
      }
      await fs.rm(fetchedAssetsDir, { recursive: true, force: true });
    }

    for (const assetConfig of imageAssetPipelines) {
      await fetchAndProcessSpecificAssets(assetConfig);
    }

    async function fetchAndProcessStoryVoices(assetConfig: (typeof acbAssetPipelines)[number]) {
      const voiceDestDir = path.join(projectRoot, assetConfig.localDir);
      await fs.mkdir(voiceDestDir, { recursive: true });

      const existingWebmBasenames = new Set<string>();
      const processedAcbPrefixes = new Set<string>();
      try {
        const destFiles = await fs.readdir(voiceDestDir);
        for (const file of destFiles) {
          if (!file.endsWith('.webm')) continue;
          const baseName = path.basename(file, '.webm');
          existingWebmBasenames.add(baseName);
          const acbPrefix = baseName.replace(/_\d{4}_.*$/, '');
          processedAcbPrefixes.add(acbPrefix);
        }
      } catch {
        // Directory might not exist yet
      }

      console.log(
        `Found ${existingWebmBasenames.size} existing voice files from ${processedAcbPrefixes.size} ACBs`
      );

      const fetchedAssetsDir = path.join(tmpBaseDir, 'fetched_raw_assets_story_voices');
      await fs.mkdir(fetchedAssetsDir, { recursive: true });

      console.log(`Fetching story voice assets (${assetConfig.pattern})...`);
      await runCommand(
        HASU_PYTHON,
        [
          '-m',
          'silverwind.tool.get_assets',
          '-p',
          'android',
          dbSqlitePath,
          fetchedAssetsDir,
          assetConfig.pattern
        ],
        path.join(projectRoot, '../hasu_tools'),
        assetConfig.logPrefix
      );

      const fetchedFiles = await fs.readdir(fetchedAssetsDir);
      if (fetchedFiles.length === 0) {
        console.log('No story voice assets found for the specified pattern.');
        await fs.rm(fetchedAssetsDir, { recursive: true, force: true });
        return;
      }

      const toProcess = fetchedFiles.filter((f) => {
        const baseAssetName = f.replace(/\.[^.]+$/, '');
        return !processedAcbPrefixes.has(baseAssetName);
      });

      console.log(
        `Story voice ACBs: ${fetchedFiles.length} total, ${fetchedFiles.length - toProcess.length} already done, ${toProcess.length} to process`
      );

      let processed = 0;

      for (const voiceAssetFilename of toProcess) {
        const baseAssetName = voiceAssetFilename.replace(/\.[^.]+$/, '');
        const voiceAssetSourcePath = path.join(fetchedAssetsDir, voiceAssetFilename);
        const tmpVoiceProcessingDir = path.join(tmpBaseDir, `processing_voice_${baseAssetName}`);

        try {
          await fs.mkdir(tmpVoiceProcessingDir, { recursive: true });
          await fs.copyFile(
            voiceAssetSourcePath,
            path.join(tmpVoiceProcessingDir, voiceAssetFilename)
          );

          await runCommand(
            HASU_PYTHON,
            ['-m', 'silverwind.tool.acb', tmpVoiceProcessingDir],
            path.join(projectRoot, '../hasu_tools'),
            `[ACBDecrypt-${baseAssetName}]`
          );

          const voiceOutDir = path.join(tmpVoiceProcessingDir, 'out');
          const voiceFiles = await fs.readdir(voiceOutDir);

          const allExist = (
            await Promise.all(
              voiceFiles.map(async (f) => {
                const dest = path.join(voiceDestDir, `${path.basename(f, path.extname(f))}.webm`);
                try { await fs.access(dest); return true; } catch { return false; }
              })
            )
          ).every(Boolean);

          if (allExist && voiceFiles.length > 0) {
            console.log(`${baseAssetName}: all ${voiceFiles.length} files already exist, skipping`);
            processed++;
            await fs.rm(tmpVoiceProcessingDir, { recursive: true, force: true });
            continue;
          }

          let voiceFilesSkipped = 0;
          let voiceFilesConverted = 0;

          for (const file of voiceFiles) {
            const sourceFileBaseNameWithoutExt = path.basename(file, path.extname(file));
            const destFileName = `${sourceFileBaseNameWithoutExt}.webm`;
            const destFilePath = path.join(voiceDestDir, destFileName);

            try {
              await fs.access(destFilePath);
              voiceFilesSkipped++;
              continue;
            } catch {}

            await runCommand('ffmpeg', [
              '-i',
              path.join(voiceOutDir, file),
              '-c:a',
              'libopus',
              '-b:a',
              '96k',
              '-n',
              destFilePath
            ]);

            existingWebmBasenames.add(sourceFileBaseNameWithoutExt);
            voiceFilesConverted++;
          }

          console.log(
            `${baseAssetName}: ${voiceFilesConverted} converted, ${voiceFilesSkipped} skipped`
          );

          processed++;
          await fs.rm(tmpVoiceProcessingDir, { recursive: true, force: true });
        } catch (e) {
          console.warn(
            `Failed to process voice asset ${voiceAssetFilename}: ${(e as Error).message}`
          );
        }
      }

      console.log(`Story voice assets: ${processed} processed, ${fetchedFiles.length - toProcess.length} skipped`);
      await fs.rm(fetchedAssetsDir, { recursive: true, force: true });
    }

    for (const assetConfig of acbAssetPipelines) {
      await fetchAndProcessStoryVoices(assetConfig);
    }

    // async function fetchAndProcessBGM() {
    //   const bgmDestDir = path.join(dataRoot, 'music');
    //   await fs.mkdir(bgmDestDir, { recursive: true });
    //
    //   const existingBgm = new Set<string>();
    //   try {
    //     const destFiles = await fs.readdir(bgmDestDir);
    //     for (const f of destFiles) {
    //       if (f.endsWith('.webm')) existingBgm.add(path.basename(f, '.webm'));
    //     }
    //   } catch {}
    //
    //   const fetchedAssetsDir = path.join(tmpBaseDir, 'fetched_raw_assets_bgm');
    //   await fs.mkdir(fetchedAssetsDir, { recursive: true });
    //
    //   console.log('Fetching BGM assets (bgm_%)...');
    //   await runCommand(
    //     'python3',
    //     ['-m', 'silverwind.tool.get_assets', '-p', 'android', dbSqlitePath, fetchedAssetsDir, 'bgm_%'],
    //     path.join(projectRoot, '../hasu_tools'),
    //     '[GetAssets-BGM]'
    //   );
    //
    //   const fetchedFiles = await fs.readdir(fetchedAssetsDir);
    //   const acbFiles = fetchedFiles.filter((f) => f.endsWith('.acb'));
    //   let processed = 0;
    //   let skipped = 0;
    //
    //   for (const acbFile of acbFiles) {
    //     const baseName = acbFile.replace(/\.acb$/, '');
    //     if (existingBgm.has(baseName)) {
    //       skipped++;
    //       continue;
    //     }
    //
    //     const tmpDir = path.join(tmpBaseDir, `processing_bgm_${baseName}`);
    //     try {
    //       await fs.mkdir(tmpDir, { recursive: true });
    //       await fs.copyFile(path.join(fetchedAssetsDir, acbFile), path.join(tmpDir, acbFile));
    //
    //       const awbFile = fetchedFiles.find((f) => f === `${baseName}.awb`);
    //       if (awbFile) {
    //         await fs.copyFile(path.join(fetchedAssetsDir, awbFile), path.join(tmpDir, awbFile));
    //       }
    //
    //       await runCommand(
    //         'python3',
    //         ['-m', 'silverwind.tool.acb', tmpDir],
    //         path.join(projectRoot, '../hasu_tools'),
    //         `[ACBDecrypt-BGM-${baseName}]`
    //       );
    //
    //       const outDir = path.join(tmpDir, 'out');
    //       const outFiles = await fs.readdir(outDir);
    //
    //       for (const file of outFiles) {
    //         const fileBase = path.basename(file, path.extname(file));
    //         const destPath = path.join(bgmDestDir, `${fileBase}.webm`);
    //
    //         try { await fs.access(destPath); continue; } catch {}
    //
    //         await runCommand('ffmpeg', [
    //           '-i', path.join(outDir, file),
    //           '-c:a', 'libopus', '-b:a', '128k', '-n', destPath
    //         ]);
    //       }
    //
    //       processed++;
    //       await fs.rm(tmpDir, { recursive: true, force: true });
    //     } catch (e) {
    //       console.warn(`Failed to process BGM ${acbFile}: ${(e as Error).message}`);
    //     }
    //   }
    //
    //   console.log(`BGM assets: ${processed} processed, ${skipped} skipped`);
    //   await fs.rm(fetchedAssetsDir, { recursive: true, force: true });
    // }
    //
    // await fetchAndProcessBGM();

    await fs.rmdir(tmpBaseDir, { recursive: true });
  } catch (error) {
    console.error('An error occurred during the fetch-all-assets script:', error);
  } finally {
    closeDb();
    console.log('Database connection closed.');
  }
}

await fetchAllAssets();
