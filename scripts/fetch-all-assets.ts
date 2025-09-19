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

      // Commented out to enable aggressive skipping in fetchAssets
      // console.log(`--- Processing card with ID: ${cardId} ---`);
      try {
        await fetchAssets(cardId, true);
        console.log(`--- Finished processing card with ID: ${cardId} ---`);
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
        destFiles.forEach(file => {
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
            console.log(`Skipping ${assetType}/${assetFilename} - already exists as ${baseAssetName}.webp`);
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

        console.log(`${assetType} assets summary: ${processed} processed, ${skipped} skipped (already existed)`);
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

    await fs.rmdir(tmpBaseDir, { recursive: true });
  } catch (error) {
    console.error('An error occurred during the fetch-all-assets script:', error);
  } finally {
    closeDb();
    console.log('Database connection closed.');
  }
}

await fetchAllAssets();
