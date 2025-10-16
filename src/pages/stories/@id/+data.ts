// Environment: server

import type { PageContext } from 'vike/types';
import { getDrizzleDb } from '~/utils/database';
import { advSeries, advDatas } from '../../../../drizzle/schema';
import { eq, asc } from 'drizzle-orm';

export { data };

async function data(pageContext: PageContext) {
  const { id: seriesIdString } = pageContext.routeParams;
  const seriesId = parseInt(seriesIdString, 10);

  const db = getDrizzleDb();

  // Fetch series information
  const seriesResult = await db
    .select()
    .from(advSeries)
    .where(eq(advSeries.id, seriesId))
    .limit(1);

  const series = seriesResult[0] ?? null;

  // Fetch all chapters for this series
  const chapters = await db
    .select({
      id: advDatas.id,
      advSeriesId: advDatas.advSeriesId,
      name: advDatas.name,
      description: advDatas.description,
      scriptId: advDatas.scriptId,
      orderId: advDatas.orderId,
      subTitleName: advDatas.subTitleName,
      startTime: advDatas.startTime,
      endTime: advDatas.endTime
    })
    .from(advDatas)
    .where(eq(advDatas.advSeriesId, seriesId))
    .orderBy(asc(advDatas.orderId));

  return {
    series,
    chapters,
    seriesId
  };
}

export type PageData = Awaited<ReturnType<typeof data>>;
