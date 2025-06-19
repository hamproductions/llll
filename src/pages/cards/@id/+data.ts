// /pages/cards/@id/+data.ts
// Environment: server

export { data };
export type {
  CardDataListItem,
  LimitBreakMaterial,
  LimitBreakMaterialRate,
  SkillLevelUpMaterial,
  StyleMovie,
  StyleVoice
} from './card-data';

import type { PageContext } from 'vike/types';
import { getCardPageData } from './card-data';
import { getDrizzleDb } from '~/utils/database';

async function data(pageContext: PageContext) {
  const { id: cardSeriesIdString } = pageContext.routeParams;
  const cardSeriesId = parseInt(cardSeriesIdString, 10);

  const db = getDrizzleDb();
  const cardPageData = await getCardPageData(db, cardSeriesId);
  return { ...cardPageData };
}

export type PageData = Awaited<ReturnType<typeof data>>;

const fetchAssets = () => {
  /**
   * TODO: Run This command to get Assets (refer to ../../scripts/do_everything.sh)
   * 
   * python -m silverwind.tool.get_assets -p android ../data/db.sqlite3 <output_folder>
   * 
   * Every File will needs their specific processing
   * 
   * 
   * Processing for individual file types:
   * 1. Card Voice
   *   - Asset Filename vo_card_<id>.acb
   *   - Decrypt Command: python -m silverwind.tool.acb <directory>
   *   - several files will be in <directory>/out
   *   - put it in /public/cards/<card_id>/voice/...
   * 2. Card Images
   *   - image_card_full_<id><0/1/2>
   *   - Decrypt Command: arch -x86_64 /usr/bin/python3 -m vendor.assetbundle_dist.assetbundle <File Path>
   *   - Output: <directory>/out
   *   - put it in /public/cards/<card_id>/images/...
   * 3. Skill Icons
   *   - Filename: skill_icon_skill_<skillIcon from cardSkill table> data is in ../data/skillicons/
   *   - put it in /public/cards/<card_id>/skillicon/...
   * 
   */
}