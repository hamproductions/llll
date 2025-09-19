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
import { getCardPageData } from './card-data';
import { getDrizzleDb } from '~/utils/database';

async function data(pageContext: PageContext) {
  const { id: cardSeriesIdString } = pageContext.routeParams;
  const cardSeriesId = parseInt(cardSeriesIdString, 10);

  // You might want to call fetchAssets here if it's part of the data-loading
  // for a page, or call it separately in a build script.
  // For example, if these assets are needed for the page to render correctly
  // and are not pre-built:

  const db = getDrizzleDb();
  // Use pruning to reduce data size while keeping full depth
  const cardPageData = await getCardPageData(db, cardSeriesId, {
    pruneEmptyEffects: true
  });
  return { ...cardPageData };
}

export type PageData = Awaited<ReturnType<typeof data>>;
