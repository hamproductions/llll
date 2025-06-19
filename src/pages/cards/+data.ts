// Environment: server

export { data };
import { join } from 'path'; // Using node:path for server-side
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { sql, eq } from 'drizzle-orm';
import { Database } from 'bun:sqlite'; // Assuming bun:sqlite is available
import { cardDatas, cardRarities, characters } from '~/../drizzle/schema';

async function data() {
  const sqlite = new Database(join(import.meta.dirname, '../../../../data/db.sqlite3'));
  const db = drizzle(sqlite);

  try {
    // Use a common table expression (CTE) with a window function to rank cards within each series
    const rankedCards = db.$with('ranked_cards').as(
      db
        .select({
          id: cardDatas.id,
          cardSeriesId: cardDatas.cardSeriesId,
          name: cardDatas.name,
          description: cardDatas.description,
          charactersId: cardDatas.charactersId,
          rarity: cardDatas.rarity,
          evolveTimes: cardDatas.evolveTimes,
          style: cardDatas.style,
          mood: cardDatas.mood,
          // Assign a row number based on EvolveTimes (and id for tie-breaking) within each CardSeriesId
          rn: sql<number>`row_number() OVER (PARTITION BY ${cardDatas.cardSeriesId} ORDER BY ${cardDatas.evolveTimes} ASC, ${cardDatas.id} ASC)`.as(
            'rn'
          )
        })
        .from(cardDatas)
    );

    // Select only the rows where the rank is 1 (lowest EvolveTimes per series)
    const cards = await db
      .with(rankedCards)
      .select({
        id: rankedCards.id,
        cardSeriesId: rankedCards.cardSeriesId,
        name: rankedCards.name,
        description: rankedCards.description,
        charactersId: rankedCards.charactersId,
        rarity: rankedCards.rarity,
        evolveTimes: rankedCards.evolveTimes,
        style: rankedCards.style,
        mood: rankedCards.mood
      })
      .from(rankedCards)
      .where(eq(rankedCards.rn, 1));

    const rarities = await db
      .select({ id: cardRarities.id, rarityName: cardRarities.rarityName })
      .from(cardRarities);
    const charactersData = await db
      .select({
        id: characters.id,
        nameFirst: characters.nameFirst,
        nameLast: characters.nameLast,
        displayName: characters.fa43Ca79C,
        iconOrderId: characters.iconOrderId
      })
      .from(characters);

    return {
      cards,
      rarities,
      characters: charactersData
    };
  } finally {
    sqlite.close();
  }
}

export type PageData = Awaited<ReturnType<typeof data>>;
