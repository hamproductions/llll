export { onBeforePrerenderStart };

import { sql } from 'drizzle-orm';
import * as schema from '../../../../drizzle/schema';
import { getDrizzleDb } from '~/utils/database';
import { filterReleasedContent } from '~/utils/release';

function onBeforePrerenderStart() {
  const drizzleDb = getDrizzleDb();

  const cardSeriesItems = drizzleDb
    .selectDistinct({
      cardSeriesId: schema.cardDatas.cardSeriesId,
      releaseDate: sql<string | null>`(
        SELECT MIN(p.startTime)
        FROM (
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
        ) as p
        WHERE p.cardSeriesId = ${schema.cardDatas.cardSeriesId}
      )`.as('releaseDate')
    })
    .from(schema.cardDatas)
    .all();

  const urls = filterReleasedContent(cardSeriesItems, undefined, (item) => item.releaseDate)
    .map((item) => {
      return item.cardSeriesId !== null && item.cardSeriesId !== undefined
        ? '/cards/' + item.cardSeriesId
        : null;
    })
    .filter(Boolean) as string[];

  return urls;
}
