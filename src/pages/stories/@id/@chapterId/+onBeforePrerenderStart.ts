// Environment: server

import { getDrizzleDb } from '~/utils/database';
import { advDatas } from '../../../../../drizzle/schema';

export async function onBeforePrerenderStart() {
  const db = getDrizzleDb();

  const allChapters = await db
    .select({
      id: advDatas.id,
      advSeriesId: advDatas.advSeriesId
    })
    .from(advDatas);

  return allChapters.map((chapter) => `/stories/${chapter.advSeriesId}/${chapter.id}`);
}
