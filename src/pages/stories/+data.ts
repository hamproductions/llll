// Environment: server

import { asc, desc } from 'drizzle-orm';
import { advDatas, advSeries } from '../../../drizzle/schema';
import { getDrizzleDb } from '~/utils/database';
import { filterReleasedContent } from '~/utils/release';

export { data };

async function data() {
  const db = getDrizzleDb();

  const [seriesRows, chapterRows] = await Promise.all([
    db
      .select({
        id: advSeries.id,
        seasonsId: advSeries.seasonsId,
        name: advSeries.name,
        description: advSeries.description,
        startTime: advSeries.startTime,
        endTime: advSeries.endTime
      })
      .from(advSeries)
      .orderBy(desc(advSeries.id)),
    db
      .select({
        id: advDatas.id,
        advSeriesId: advDatas.advSeriesId,
        scriptId: advDatas.scriptId,
        name: advDatas.name,
        subTitleName: advDatas.subTitleName,
        orderId: advDatas.orderId,
        startTime: advDatas.startTime
      })
      .from(advDatas)
      .orderBy(asc(advDatas.orderId))
  ]);

  const releasedSeries = filterReleasedContent(seriesRows, undefined, (item) => item.startTime);
  const releasedChapters = filterReleasedContent(chapterRows, undefined, (item) => item.startTime);
  const chapterMap = new Map<number, typeof releasedChapters>();

  for (const chapter of releasedChapters) {
    if (chapter.advSeriesId === null) {
      continue;
    }

    const group = chapterMap.get(chapter.advSeriesId) ?? [];
    group.push(chapter);
    chapterMap.set(chapter.advSeriesId, group);
  }

  return {
    series: releasedSeries.map((story) => {
      const chapters = chapterMap.get(story.id) ?? [];
      const firstChapter = chapters[0] ?? null;
      const latestChapter = chapters[chapters.length - 1] ?? null;

      return {
        ...story,
        chapterCount: chapters.length,
        firstChapterName: firstChapter?.name ?? null,
        firstChapterScriptId: firstChapter?.scriptId ?? null,
        latestChapterScriptId: latestChapter?.scriptId ?? null
      };
    })
  };
}

export type PageData = Awaited<ReturnType<typeof data>>;
