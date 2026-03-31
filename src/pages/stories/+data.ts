// Environment: server

import { desc } from 'drizzle-orm';
import { advSeries } from '../../../drizzle/schema';
import { getDrizzleDb } from '~/utils/database';
import { filterReleasedContent } from '~/utils/release';

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
    series: filterReleasedContent(series, undefined, (item) => item.startTime)
  };
}

export type PageData = Awaited<ReturnType<typeof data>>;
