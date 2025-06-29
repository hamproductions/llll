// /asset-explorer/src/scripts/fetch-all-assets.ts

import * as schema from '../drizzle/schema';
import { fetchAssets } from './fetch-assets';
import { getDrizzleDb, closeDb } from '~/utils/database';

async function fetchAllAssets() {
  const db = getDrizzleDb();
  try {
    const allCards = await db.select({ id: schema.cardSeries.id }).from(schema.cardSeries);
    const allCardIds = allCards.map((card) => card.id);

    console.log(`Found ${allCardIds.length} cards to process.`);

    for (const cardId of allCardIds) {
      if (cardId === null) continue;
      console.log(`--- Processing card with ID: ${cardId} ---`);
      try {
        await fetchAssets(cardId);
        console.log(`--- Finished processing card with ID: ${cardId} ---`);
      } catch (error) {
        console.error(`Failed to fetch assets for card ${cardId}:`, error);
        // Decide if you want to continue with the next card or stop.
        // For now, we'll log the error and continue.
      }
    }

    console.log('All assets for all cards have been processed.');
  } catch (error) {
    console.error('An error occurred during the fetch-all-assets script:', error);
  } finally {
    closeDb();
    console.log('Database connection closed.');
  }
}

await fetchAllAssets();
