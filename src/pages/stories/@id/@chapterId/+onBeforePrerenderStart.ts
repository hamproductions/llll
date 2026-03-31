// Environment: server

import { eq } from 'drizzle-orm';
import { advDatas, advSeries } from '../../../../../drizzle/schema';
import { getDrizzleDb } from '~/utils/database';
import { filterReleasedContent, isReleasedContent } from '~/utils/release';

export async function onBeforePrerenderStart() {
  const db = getDrizzleDb();

  const releasedChapters = filterReleasedContent(
    await db
      .select({
        id: advDatas.id,
        advSeriesId: advDatas.advSeriesId,
        startTime: advDatas.startTime,
        seriesStartTime: advSeries.startTime
      })
      .from(advDatas)
      .leftJoin(advSeries, eq(advDatas.advSeriesId, advSeries.id)),
    undefined,
    (chapter) => chapter.startTime
  );

  return releasedChapters
    .filter((chapter) => isReleasedContent(chapter.seriesStartTime))
    .map((chapter) => `/stories/${chapter.advSeriesId}/${chapter.id}`);
}
