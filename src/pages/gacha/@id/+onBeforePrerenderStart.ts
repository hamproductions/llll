import { desc } from 'drizzle-orm';
import { gachaSeries } from '../../../../drizzle/schema';
import { getDrizzleDb } from '~/utils/database';
import { filterReleasedContent } from '~/utils/release';

export async function onBeforePrerenderStart() {
  const db = getDrizzleDb();

  const rows = await db
    .select({ id: gachaSeries.id, startTime: gachaSeries.startTime })
    .from(gachaSeries)
    .orderBy(desc(gachaSeries.id));

  return filterReleasedContent(rows, undefined, (r) => r.startTime)
    .map((r) => `/gacha/${r.id}`);
}
