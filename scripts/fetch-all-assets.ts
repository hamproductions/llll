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
    const publicRoot = path.join(projectRoot, 'public');
    const tmpBaseDir = path.join(publicRoot, 'tmp_assets_processing');
    const dbSqlitePath = path.join(projectRoot, '../', 'data', 'db.sqlite3');

    async function fetchAndProcessSpecificAssets(
      assetType: string,
      assetPatternToFetch: string,
      logPrefix: string
    ) {
      const destDir = path.join(publicRoot, 'assets', assetType);
      await fs.mkdir(destDir, { recursive: true });

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
        for (const assetFilename of fetchedFiles) {
          await processGenericImageAssets(
            assetFilename,
            fetchedAssetsDir,
            destDir,
            tmpBaseDir,
            projectRoot,
            `${assetType}-${assetFilename}`
          );
        }
      } else {
        console.log(`No ${assetType} assets found for the specified pattern.`);
      }
      await fs.rm(fetchedAssetsDir, { recursive: true, force: true });
    }

    // Fetch and process skill icons
    await fetchAndProcessSpecificAssets('skillicon', 'skill', `[GetAssets-SkillIcon]`);

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
