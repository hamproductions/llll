// Environment: server

import { getDrizzleDb } from '~/utils/database';
import { advSeries } from '../../../drizzle/schema';
import { desc } from 'drizzle-orm';

export { data };

async function data() {
  const db = getDrizzleDb();

  // Fetch all story series with their chapter counts
  const series = await db
    .select({
      id: advSeries.id,
      seasonsId: advSeries.seasonsId,
      name: advSeries.name,
      description: advSeries.description,
      startTime: advSeries.startTime,
      endTime: advSeries.endTime
    })
    .from(advSeries)
    .orderBy(desc(advSeries.id));

  return {
    series
  };
}

export type PageData = Awaited<ReturnType<typeof data>>;
