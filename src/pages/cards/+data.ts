// Environment: server

export { data };
import { join } from 'path'; // Using node:path for server-side
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { sql, eq } from 'drizzle-orm';
import { Database } from 'bun:sqlite'; // Assuming bun:sqlite is available
import { cardDatas, cardRarities, characters } from '~/../drizzle/schema';
import { filterReleasedContent } from '~/utils/release';

async function data() {
  const sqlite = new Database(join(import.meta.dirname, '../../../../data/db.sqlite3'));
  const db = drizzle(sqlite);

  try {
    // Subquery to get the earliest StartTime for each CardSeriesId from GachaSeries
    // Check all 6 pickup columns
    const seriesReleaseDates = db
      .select({
        series_id: sql<number>`p.cardSeriesId`.as('series_id'),
        startTime: sql`MIN(p.startTime)`.as('startTime')
      })
      .from(
        sql`(
        SELECT PickUpCardSeriesId_1 as cardSeriesId, StartTime FROM GachaSeries WHERE PickUpCardSeriesId_1 != 0
        UNION ALL
        SELECT PickUpCardSeriesId_2 as cardSeriesId, StartTime FROM GachaSeries WHERE PickUpCardSeriesId_2 != 0
        UNION ALL
        SELECT PickUpCardSeriesId_3 as cardSeriesId, StartTime FROM GachaSeries WHERE PickUpCardSeriesId_3 != 0
        UNION ALL
        SELECT PickUpCardSeriesId_4 as cardSeriesId, StartTime FROM GachaSeries WHERE PickUpCardSeriesId_4 != 0
        UNION ALL
        SELECT PickUpCardSeriesId_5 as cardSeriesId, StartTime FROM GachaSeries WHERE PickUpCardSeriesId_5 != 0
        UNION ALL
        SELECT PickUpCardSeriesId_6 as cardSeriesId, StartTime FROM GachaSeries WHERE PickUpCardSeriesId_6 != 0
      ) as p`
      )
      .groupBy(sql`p.cardSeriesId`)
      .as('series_release_dates');

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
          maxSmile: cardDatas.maxSmile,
          maxPure: cardDatas.maxPure,
          maxCool: cardDatas.maxCool,
          maxMental: cardDatas.maxMental,
          // Assign a row number based on EvolveTimes (and id for tie-breaking) within each CardSeriesId
          rn: sql<number>`row_number() OVER (PARTITION BY ${cardDatas.cardSeriesId} ORDER BY ${cardDatas.evolveTimes} ASC, ${cardDatas.id} ASC)`.as(
            'rn'
          )
        })
        .from(cardDatas)
        .where(sql`${cardDatas.cardSeriesId} NOT IN (1010400, 1010500)`)
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
        mood: rankedCards.mood,
        maxSmile: rankedCards.maxSmile,
        maxPure: rankedCards.maxPure,
        maxCool: rankedCards.maxCool,
        maxMental: rankedCards.maxMental,
        releaseDate: sql`COALESCE(${seriesReleaseDates.startTime}, '0000-00-00 00:00:00')`.as(
          'releaseDate'
        )
      })
      .from(rankedCards)
      .leftJoin(seriesReleaseDates, eq(rankedCards.cardSeriesId, seriesReleaseDates.series_id))
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
      cards: filterReleasedContent(cards, undefined, (card) => card.releaseDate as string | null),
      rarities,
      characters: charactersData
    };
  } finally {
    sqlite.close();
  }
}

export type PageData = Awaited<ReturnType<typeof data>>;
