// Environment: server

export { data };
export type {
  CardDataListItem,
  LimitBreakMaterial,
  LimitBreakMaterialRate,
  SkillLevelUpMaterial,
  StyleMovie,
  StyleVoice,
  SchoolIdolShowSkills,
  SchoolIdolStageSkills,
  SchoolIdolShowSkillsGroup
} from './card-data';

import type { PageContext } from 'vike/types';
import { sql } from 'drizzle-orm';
import { getCardPageData } from './card-data';
import { getDrizzleDb } from '~/utils/database';
import { isReleasedContent } from '~/utils/release';

async function data(pageContext: PageContext) {
  const { id: cardSeriesIdString } = pageContext.routeParams;
  const cardSeriesId = parseInt(cardSeriesIdString, 10);

  // You might want to call fetchAssets here if it's part of the data-loading
  // for a page, or call it separately in a build script.
  // For example, if these assets are needed for the page to render correctly
  // and are not pre-built:

  const db = getDrizzleDb();

  const seriesReleaseDate = db
    .select({
      startTime: sql<string | null>`MIN(p.startTime)`.as('startTime')
    })
    .from(
      sql`(
        SELECT PickUpCardSeriesId_1 as cardSeriesId, StartTime FROM GachaSeries WHERE PickUpCardSeriesId_1 != 0
        UNION ALL
        SELECT PickUpCardSeriesId_2 as cardSeriesId, StartTime FROM GachaSeries WHERE PickUpCardSeriesId_2 != 0
        UNION ALL
        SELECT PickUpCardSeriesId_3 as cardSeriesId, StartTime FROM GachaSeries WHERE PickUpCardSeriesId_3 != 0
        UNION ALL
        SELECT PickUpCardSeriesId_4 as cardSeriesId, StartTime FROM GachaSeries WHERE PickUpCardSeriesId_4 != 0
        UNION ALL
        SELECT PickUpCardSeriesId_5 as cardSeriesId, StartTime FROM GachaSeries WHERE PickUpCardSeriesId_5 != 0
        UNION ALL
        SELECT PickUpCardSeriesId_6 as cardSeriesId, StartTime FROM GachaSeries WHERE PickUpCardSeriesId_6 != 0
      ) as p`
    )
    .where(sql`p.cardSeriesId = ${cardSeriesId}`)
    .all()[0]?.startTime;

  if (!isReleasedContent(seriesReleaseDate)) {
    return {
      seriesDetails: null,
      cardDataList: [],
      skillLevelUpMaterials: [],
      limitBreakMaterials: [],
      styleMovies: [],
      styleVoices: [],
      limitBreakMaterialRates: []
    };
  }

  const cardPageData = await getCardPageData(db, cardSeriesId, {
    pruneEmptyEffects: true
  });
  return { ...cardPageData };
}

export type PageData = Awaited<ReturnType<typeof data>>;
