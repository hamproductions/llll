// Environment: server

import { advSeries } from '../../../../drizzle/schema';
import { getDrizzleDb } from '~/utils/database';
import { filterReleasedContent } from '~/utils/release';

export async function onBeforePrerenderStart() {
  const db = getDrizzleDb();

  const allSeries = filterReleasedContent(
    await db.select({ id: advSeries.id, startTime: advSeries.startTime }).from(advSeries),
    undefined,
    (series) => series.startTime
  );

  return allSeries.map((series) => `/stories/${series.id}`);
}
