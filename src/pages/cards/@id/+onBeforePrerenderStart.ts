export { onBeforePrerenderStart };

import * as schema from '../../../../drizzle/schema';
import { getDrizzleDb } from '~/utils/database';

function onBeforePrerenderStart() {
  const drizzleDb = getDrizzleDb();

  const cardSeriesItems = drizzleDb
    .selectDistinct({ cardSeriesId: schema.cardDatas.cardSeriesId })
    .from(schema.cardDatas)
    .all();

  const urls = cardSeriesItems
    .map((item) => {
      return item.cardSeriesId !== null && item.cardSeriesId !== undefined
        ? '/cards/' + item.cardSeriesId
        : null;
    })
    .filter(Boolean) as string[];

  return urls;
}
