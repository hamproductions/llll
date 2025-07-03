// /asset-explorer/src/scripts/fetch-all-assets.ts

import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import * as schema from '../drizzle/schema';
import { processGenericImageAssets, runCommand } from './fetch-assets';
import { getDrizzleDb, closeDb } from '~/utils/database';

async function fetchAllAssets() {
  const db = getDrizzleDb();
  try {
    const allCards = await db.select({ id: schema.cardSeries.id }).from(schema.cardSeries);
    const allCardIds = allCards.map((card) => card.id);

    console.log(`Found ${allCardIds.length} cards to process.`);

    // for (const cardId of allCardIds) {
    //   if (cardId === null) continue;
    //   console.log(`--- Processing card with ID: ${cardId} ---`);
    //   try {
    //     await fetchAssets(cardId);
    //     console.log(`--- Finished processing card with ID: ${cardId} ---`);
    //   } catch (error) {
    //     console.error(`Failed to fetch assets for card ${cardId}:`, error);
    //     // Decide if you want to continue with the next card or stop.
    //     // For now, we'll log the error and continue.
    //   }
    // }

    console.log('All assets for all cards have been processed.');

    // New logic for image_card_middle_vertical_8% assets
    const projectRoot = process.cwd();
    const publicRoot = path.join(projectRoot, 'public');
    const tokenDestDir = path.join(publicRoot, 'assets', 'card-frame');
    await fs.mkdir(tokenDestDir, { recursive: true });

    const tmpBaseDir = path.join(publicRoot, 'tmp_assets_processing');
    const fetchedAssetsDir = path.join(tmpBaseDir, 'fetched_raw_assets_token');
    await fs.mkdir(fetchedAssetsDir, { recursive: true });

    const assetPatternToFetch = '%card_limit_break_%';
    const dbSqlitePath = path.join(projectRoot, '../', 'data', 'db.sqlite3');

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
      `[GetAssets-Token]`
    );
    console.log(`All token assets fetched to: ${fetchedAssetsDir}`);

    const fetchedFiles = await fs.readdir(fetchedAssetsDir);
    if (fetchedFiles.length > 0) {
      for (const assetFilename of fetchedFiles) {
        await processGenericImageAssets(
          assetFilename,
          fetchedAssetsDir,
          tokenDestDir,
          tmpBaseDir,
          projectRoot,
          `Token-${assetFilename}`
        );
      }
    } else {
      console.log('No token assets found for the specified pattern.');
    }
    await fs.rm(fetchedAssetsDir, { recursive: true, force: true });
    await fs.rmdir(tmpBaseDir, { recursive: true, force: true });
  } catch (error) {
    console.error('An error occurred during the fetch-all-assets script:', error);
  } finally {
    closeDb();
    console.log('Database connection closed.');
  }
}

await fetchAllAssets();
