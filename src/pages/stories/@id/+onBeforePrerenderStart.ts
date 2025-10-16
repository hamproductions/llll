// Environment: server

import { getDrizzleDb } from '~/utils/database';
import { advSeries } from '../../../../drizzle/schema';

export async function onBeforePrerenderStart() {
  const db = getDrizzleDb();

  const allSeries = await db.select({ id: advSeries.id }).from(advSeries);

  return allSeries.map((series) => `/stories/${series.id}`);
}
