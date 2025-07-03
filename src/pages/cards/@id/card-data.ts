import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import { eq, inArray, aliasedTable, sql } from 'drizzle-orm';
import type { InferSelectModel } from 'drizzle-orm';
import * as schema from '../../../../drizzle/schema';

export type SkillEffectDetailWithRecursion = InferSelectModel<
  typeof schema.cardSkillEffectDetails
> & {
  subEffect?: SkillEffectWithDetails;
  subSeries?: SkillSeriesDetails;
  subParamsEffects?: SkillEffectWithDetails[];
};

export type SkillEffectWithDetails = InferSelectModel<typeof schema.cardSkillEffects> & {
  details: SkillEffectDetailWithRecursion[];
};

export type SkillWithEffects = InferSelectModel<typeof schema.cardSkills> & {
  effects: SkillEffectWithDetails[];
};

export type SkillSeriesDetails = {
  series: InferSelectModel<typeof schema.cardSkillSeries>;
  skills: SkillWithEffects[];
  skillIcon?: number | null;
};

type PrefetchState = {
  allFetchedEffects: Map<number, InferSelectModel<typeof schema.cardSkillEffects>>;
  allFetchedDetails: Map<string, InferSelectModel<typeof schema.cardSkillEffectDetails>[]>; // Keyed by effectId string
  allFetchedSeries: Map<number, InferSelectModel<typeof schema.cardSkillSeries>>;
  allFetchedSkillsForSeries: Map<number, InferSelectModel<typeof schema.cardSkills>[]>; // Keyed by seriesId
  allFetchedParamsTsv: Map<
    number,
    InferSelectModel<typeof schema.cardskilleffectdetailparamsTsv>[]
  >; // Keyed by f24958Ec9
  db: BunSQLiteDatabase<typeof schema>;
  maxDepth: number;
};

export type SchoolIdolStageSkills = {
  normalSkillInfo?: SkillSeriesDetails;
  specialAppealInfo?: SkillSeriesDetails;
  attributeSkillInfo?: SkillSeriesDetails;
};

export type SchoolIdolShowSkillsGroup = {
  centerSkillInfo?: SchoolIdolShowSkills[];
  rhythmGameSkillInfo?: SchoolIdolShowSkills[];
  centerAttributeSkillInfo?: SchoolIdolShowSkills;
};

export type CardDataListItem = InferSelectModel<typeof schema.cardDatas> & {
  schoolIdolStageSkills?: SchoolIdolStageSkills;
  schoolIdolShowSkills?: SchoolIdolShowSkillsGroup;
};

export type SkillLevelUpMaterial = InferSelectModel<typeof schema.cardSkillLevelUpMaterials> & {
  itemName1: string | null;
  itemName2: string | null;
  itemName3: string | null;
};

export type LimitBreakMaterial = {
  cardSeriesId: number | null;
  costItemsId: number | null;
  costNum: number | null;
  limitBreakTimes: number | null;
  itemName: string | null;
};

export type StyleMovie = InferSelectModel<typeof schema.styleMovies>;
export type StyleVoice = InferSelectModel<typeof schema.styleVoices>;
export type LimitBreakMaterialRate = InferSelectModel<typeof schema.limitBreakMaterialRate>;

export type SchoolIdolShowSkills = {
  card_id: number;
  skill_type: 'center_skill' | 'rhythm_game_skill' | 'center_attribute';
  // skill_id: number | null;
  skill_level?: number | null;
  skill_series_id?: number | null;
  name: string | null;
  description: string | null;
  skill_cost?: number | null;
};

async function prefetchAllSkillData(initialSeriesToProcess: Set<number>, state: PrefetchState) {
  const seriesIdsToProcess = new Set<number>(initialSeriesToProcess);
  const effectIdsToProcess = new Set<number>();
  const paramLinkIdsToProcess = new Set<number>();

  for (const seriesId of initialSeriesToProcess) {
    if (state.allFetchedSeries.has(seriesId)) seriesIdsToProcess.delete(seriesId);
  }

  for (
    let depth = 0;
    depth < state.maxDepth &&
    (seriesIdsToProcess.size > 0 || effectIdsToProcess.size > 0 || paramLinkIdsToProcess.size > 0);
    depth++
  ) {
    const currentSeriesIds = Array.from(seriesIdsToProcess);
    seriesIdsToProcess.clear();

    if (currentSeriesIds.length > 0) {
      const seriesData = await state.db.query.cardSkillSeries.findMany({
        where: inArray(schema.cardSkillSeries.id, currentSeriesIds)
      });
      seriesData.forEach((s) => state.allFetchedSeries.set(s.id, s));

      if (seriesData.length > 0) {
        const skillsForSeries = await state.db.query.cardSkills.findMany({
          where: inArray(schema.cardSkills.cardSkillSeriesId, currentSeriesIds)
        });
        skillsForSeries.forEach((skill) => {
          if (!state.allFetchedSkillsForSeries.has(skill.cardSkillSeriesId!)) {
            state.allFetchedSkillsForSeries.set(skill.cardSkillSeriesId!, []);
          }
          state.allFetchedSkillsForSeries.get(skill.cardSkillSeriesId!)!.push(skill);

          if (skill.cardSkillEffectId && skill.cardSkillEffectId.trim() !== '') {
            skill.cardSkillEffectId
              .split(',')
              .map((s) => parseInt(s.trim(), 10))
              .filter((n) => !isNaN(n))
              .forEach((id) => {
                if (!state.allFetchedEffects.has(id)) effectIdsToProcess.add(id);
              });
          }
        });
      }
    }

    const currentEffectIds = Array.from(effectIdsToProcess);
    effectIdsToProcess.clear();

    if (currentEffectIds.length > 0) {
      const effectsData = await state.db.query.cardSkillEffects.findMany({
        where: inArray(schema.cardSkillEffects.id, currentEffectIds)
      });
      effectsData.forEach((e) => state.allFetchedEffects.set(e.id, e));

      if (effectsData.length > 0) {
        const likeConditions = effectsData.map(
          (effect) => sql`${schema.cardSkillEffectDetails.id} LIKE ${String(effect.id)} || '%'`
        );
        if (likeConditions.length > 0) {
          const detailsData = await state.db
            .select()
            .from(schema.cardSkillEffectDetails)
            .where(sql.join(likeConditions, sql` OR `));

          const detailsByParentEffectId = new Map<
            number,
            InferSelectModel<typeof schema.cardSkillEffectDetails>[]
          >();
          detailsData.forEach((detail) => {
            const detailIdStr = String(detail.id);
            let parentEffectId: number | undefined;
            for (const effData of effectsData) {
              if (detailIdStr.startsWith(String(effData.id))) {
                parentEffectId = effData.id;
                break;
              }
            }

            if (parentEffectId !== undefined) {
              if (!detailsByParentEffectId.has(parentEffectId)) {
                detailsByParentEffectId.set(parentEffectId, []);
              }
              detailsByParentEffectId.get(parentEffectId)!.push(detail);
            }
          });

          detailsByParentEffectId.forEach((detailsList, parentId) => {
            const existingDetails = state.allFetchedDetails.get(String(parentId)) || [];
            state.allFetchedDetails.set(String(parentId), [...existingDetails, ...detailsList]);

            detailsList.forEach((detail) => {
              const detailType = detail.skillEffectDetailType;
              const recursiveId = detail.effectValue;
              if (detailType && recursiveId !== null) {
                if (detailType.includes('SERIES_ID') && !state.allFetchedSeries.has(recursiveId))
                  seriesIdsToProcess.add(recursiveId);
                else if (
                  detailType.includes('EFFECT_ID') &&
                  !state.allFetchedEffects.has(recursiveId)
                )
                  effectIdsToProcess.add(recursiveId);
                else if (
                  detailType.includes('PARAMS') &&
                  !state.allFetchedParamsTsv.has(recursiveId)
                )
                  paramLinkIdsToProcess.add(recursiveId);
              }
            });
          });
        }
      }
    }

    const currentParamLinkIds = Array.from(paramLinkIdsToProcess);
    paramLinkIdsToProcess.clear();

    if (currentParamLinkIds.length > 0) {
      const paramsTsvData = await state.db.query.cardskilleffectdetailparamsTsv.findMany({
        where: inArray(schema.cardskilleffectdetailparamsTsv.f24958Ec9, currentParamLinkIds)
      });
      paramsTsvData.forEach((param) => {
        if (param.f24958Ec9 !== null) {
          if (!state.allFetchedParamsTsv.has(param.f24958Ec9)) {
            state.allFetchedParamsTsv.set(param.f24958Ec9, []);
          }
          state.allFetchedParamsTsv.get(param.f24958Ec9)!.push(param);

          if (param.f4A3393C3?.includes('EFFECT_PARAMS_ID') && param.f5D6Ebe96) {
            param.f5D6Ebe96
              .split(',')
              .map((s) => parseInt(s.trim(), 10))
              .filter((n) => !isNaN(n))
              .forEach((id) => {
                if (!state.allFetchedEffects.has(id)) effectIdsToProcess.add(id);
              });
          }
        }
      });
    }
  }
}

function buildSkillSeriesFromPrefetched(
  skillSeriesId: number | null,
  state: PrefetchState,
  currentDepth: number = 0,
  // filterToSkillLevel is used when building a sub-series,
  // to ensure it only contains skills relevant to the parent skill's level.
  filterToSkillLevel?: number | null
): SkillSeriesDetails | undefined {
  if (!skillSeriesId || currentDepth > state.maxDepth) {
    return undefined;
  }

  const skillSeriesData = state.allFetchedSeries.get(skillSeriesId);
  if (!skillSeriesData) {
    return undefined;
  }

  const skillsRawOriginal = state.allFetchedSkillsForSeries.get(skillSeriesData.id) || [];
  let skillsToProcess = skillsRawOriginal;

  if (filterToSkillLevel !== undefined && filterToSkillLevel !== null) {
    skillsToProcess = skillsRawOriginal.filter((skill) => skill.skillLevel === filterToSkillLevel);
    if (skillsToProcess.length === 0) {
      return undefined; // This sub-series doesn't have skills for the specified level.
    }
  }

  const skillsWithEffects: SkillWithEffects[] = skillsToProcess.map((skillRaw) => {
    const skillEffectBaseIdsForCurrentSkill =
      skillRaw.cardSkillEffectId && skillRaw.cardSkillEffectId.trim() !== ''
        ? skillRaw.cardSkillEffectId
            .split(',')
            .map((s) => parseInt(s.trim(), 10))
            .filter((n) => !isNaN(n))
        : [];

    const effectsForThisSkill: SkillEffectWithDetails[] = skillEffectBaseIdsForCurrentSkill
      .map((effectBaseId) => {
        const effectBase = state.allFetchedEffects.get(effectBaseId);
        if (!effectBase) return undefined;
        // Pass the current skill's level as context for building its effect details.
        // This ensures any nested sub-series are filtered by this skill's level.
        const detailsForThisEffect = buildEffectDetailsRecursive(
          effectBase.id,
          state,
          currentDepth + 1,
          skillRaw.skillLevel
        );
        return { ...effectBase, details: detailsForThisEffect };
      })
      .filter((effect): effect is SkillEffectWithDetails => !!effect)
      .sort((a, b) => (a.orderId ?? Infinity) - (b.orderId ?? Infinity));

    return { ...skillRaw, effects: effectsForThisSkill };
  });

  return { series: skillSeriesData, skills: skillsWithEffects, skillIcon: skillSeriesData.skillIcon };
}

function buildEffectDetailsRecursive(
  parentEffectId: number,
  state: PrefetchState,
  depth: number,
  // contextSkillLevel is the skillLevel of the skill whose effect tree is being built.
  contextSkillLevel: number | null | undefined
): SkillEffectDetailWithRecursion[] {
  if (depth > state.maxDepth) {
    return [];
  }

  const detailsToProcess = (state.allFetchedDetails.get(String(parentEffectId)) || []).sort(
    (a, b) => String(a.id).localeCompare(String(b.id))
  );

  const finalProcessedDetails: SkillEffectDetailWithRecursion[] = [];
  for (const detail of detailsToProcess) {
    const detailType = detail.skillEffectDetailType;
    const recursiveId = detail.effectValue;
    const processedDetail: SkillEffectDetailWithRecursion = { ...detail };

    if (detailType && recursiveId !== null) {
      if (detailType.includes('SERIES_ID'))
        // When building a sub-series, filter it by the contextSkillLevel.
        processedDetail.subSeries = buildSkillSeriesFromPrefetched(
          recursiveId,
          state,
          depth + 1,
          contextSkillLevel
        );
      else if (detailType.includes('EFFECT_ID')) {
        const targetEffect = state.allFetchedEffects.get(recursiveId);
        if (targetEffect) {
          // Pass the contextSkillLevel down for nested effects.
          const subEffectProcessedDetails = buildEffectDetailsRecursive(
            targetEffect.id,
            state,
            depth + 1,
            contextSkillLevel
          );
          processedDetail.subEffect = { ...targetEffect, details: subEffectProcessedDetails };
        }
      } else if (detailType.includes('PARAMS')) {
        const paramsForDetail = state.allFetchedParamsTsv.get(recursiveId) || [];
        const subParamsEffectsList: SkillEffectWithDetails[] = [];
        for (const param of paramsForDetail) {
          if (param.f4A3393C3?.includes('EFFECT_PARAMS_ID') && param.f5D6Ebe96) {
            param.f5D6Ebe96
              .split(',')
              .map((s) => parseInt(s.trim(), 10))
              .filter((n) => !isNaN(n))
              .forEach((effectId) => {
                const subEffectBase = state.allFetchedEffects.get(effectId);
                if (subEffectBase) {
                  // Pass the contextSkillLevel down for nested param effects.
                  const subEffectDataDetails = buildEffectDetailsRecursive(
                    effectId,
                    state,
                    depth + 1,
                    contextSkillLevel
                  );
                  subParamsEffectsList.push({ ...subEffectBase, details: subEffectDataDetails });
                }
              });
          }
        }
        if (subParamsEffectsList.length > 0) {
          processedDetail.subParamsEffects = subParamsEffectsList.sort(
            (a, b) => (a.orderId ?? Infinity) - (b.orderId ?? Infinity)
          );
        }
      }
    }
    finalProcessedDetails.push(processedDetail);
  }
  return finalProcessedDetails;
}

export async function getCardPageData(db: BunSQLiteDatabase<typeof schema>, cardSeriesId: number) {
  const seriesDetails = await db.query.cardSeries.findFirst({
    where: eq(schema.cardSeries.id, cardSeriesId)
  });

  if (!seriesDetails) {
    return { cardPageData: null };
  }

  const allCardDataRaw = await db.query.cardDatas.findMany({
    where: eq(schema.cardDatas.cardSeriesId, cardSeriesId)
  });

  const prefetchState: PrefetchState = {
    allFetchedEffects: new Map(),
    allFetchedDetails: new Map(),
    allFetchedSeries: new Map(),
    allFetchedSkillsForSeries: new Map(),
    allFetchedParamsTsv: new Map(),
    db,
    maxDepth: 10
  };

  const initialSeriesToPrefetch = new Set<number>();
  allCardDataRaw.forEach((cd) => {
    if (cd.skillSeriesId) initialSeriesToPrefetch.add(cd.skillSeriesId);
    if (cd.specialAppealSeriesId) initialSeriesToPrefetch.add(cd.specialAppealSeriesId);
    if (cd.attributeId !== null && cd.attributeId !== undefined) {
      initialSeriesToPrefetch.add(cd.attributeId);
    }
  });

  await prefetchAllSkillData(initialSeriesToPrefetch, prefetchState);

  const cardDataList = await Promise.all(
    allCardDataRaw.map(async (cd) => {
      // For top-level skill series, do not pass filterToSkillLevel.
      // This ensures they contain skills of all levels for SkillInfoDisplay to use.
      // The filtering of sub-series will happen based on the selected skill's level later.
      const normalSkillInfo = buildSkillSeriesFromPrefetched(
        cd.skillSeriesId,
        prefetchState,
        0,
        undefined
      );
      const specialAppealInfo = buildSkillSeriesFromPrefetched(
        cd.specialAppealSeriesId,
        prefetchState,
        0,
        undefined
      );
      const attributeSkillInfo =
        cd.attributeId !== null && cd.attributeId !== undefined
          ? buildSkillSeriesFromPrefetched(cd.attributeId, prefetchState, 0, undefined)
          : undefined;
      const showSkills = await getSchoolIdolShowSkills(db, cd.id);
      const centerSkillInfo = showSkills.filter((skill) => skill.skill_type === 'center_skill');
      const rhythmGameSkillInfo = showSkills.filter(
        (skill) => skill.skill_type === 'rhythm_game_skill'
      );
      const centerAttributeSkillInfo = showSkills.find(
        (skill) => skill.skill_type === 'center_attribute'
      );

      const schoolIdolStageSkills = {
        normalSkillInfo,
        specialAppealInfo,
        attributeSkillInfo
      };

      const schoolIdolShowSkills = {
        centerSkillInfo,
        rhythmGameSkillInfo,
        centerAttributeSkillInfo
      };

      return {
        ...cd,
        schoolIdolStageSkills,
        schoolIdolShowSkills
      };
    })
  );
  const items1 = aliasedTable(schema.items, 'items1');
  const items2 = aliasedTable(schema.items, 'items2');
  const items3 = aliasedTable(schema.items, 'items3');

  const skillLevelUpMaterials = await db
    .select({
      id: schema.cardSkillLevelUpMaterials.id,
      cardSeriesId: schema.cardSkillLevelUpMaterials.cardSeriesId,
      skillType: schema.cardSkillLevelUpMaterials.skillType,
      skillLevel: schema.cardSkillLevelUpMaterials.skillLevel,
      costItemsId1: schema.cardSkillLevelUpMaterials.costItemsId1,
      costNum1: schema.cardSkillLevelUpMaterials.costNum1,
      itemName1: items1.name,
      costItemsId2: schema.cardSkillLevelUpMaterials.costItemsId2,
      costNum2: schema.cardSkillLevelUpMaterials.costNum2,
      itemName2: items2.name,
      costItemsId3: schema.cardSkillLevelUpMaterials.costItemsId3,
      costNum3: schema.cardSkillLevelUpMaterials.costNum3,
      itemName3: items3.name,
      fa1Aadd43: schema.cardSkillLevelUpMaterials.fa1Aadd43,
      f233F7B92: schema.cardSkillLevelUpMaterials.f233F7B92
    })
    .from(schema.cardSkillLevelUpMaterials)
    .leftJoin(items1, eq(schema.cardSkillLevelUpMaterials.costItemsId1, items1.id))
    .leftJoin(items2, eq(schema.cardSkillLevelUpMaterials.costItemsId2, items2.id))
    .leftJoin(items3, eq(schema.cardSkillLevelUpMaterials.costItemsId3, items3.id))
    .where(eq(schema.cardSkillLevelUpMaterials.cardSeriesId, cardSeriesId));

  const limitBreakMaterialsRaw = await db
    .select({
      cardSeriesId: schema.cardLimitBreakMaterials.cardSeriesId,
      costItemsId: schema.cardLimitBreakMaterials.costItemsId,
      costNum: schema.cardLimitBreakMaterials.costNum,
      limitBreakTimes: schema.cardLimitBreakMaterials.limitBreakTimes,
      itemName: schema.items.name
    })
    .from(schema.cardLimitBreakMaterials)
    .leftJoin(schema.items, eq(schema.cardLimitBreakMaterials.costItemsId, schema.items.id))
    .where(eq(schema.cardLimitBreakMaterials.cardSeriesId, cardSeriesId));

  const styleMoviesData = await db.query.styleMovies.findMany({
    where: eq(schema.styleMovies.cardSeriesId, cardSeriesId)
  });

  const styleVoicesData = await db.query.styleVoices.findMany({
    where: eq(schema.styleVoices.cardSeriesId, cardSeriesId)
  });

  const limitBreakMaterialRates = await db.query.limitBreakMaterialRate.findMany({
    where: eq(schema.limitBreakMaterialRate.cardSeriesId, cardSeriesId)
  });

  return {
    seriesDetails,
    cardDataList,
    skillLevelUpMaterials,
    limitBreakMaterials: limitBreakMaterialsRaw,
    styleMovies: styleMoviesData,
    styleVoices: styleVoicesData,
    limitBreakMaterialRates
  } as const;
}

export async function getSchoolIdolShowSkills(
  db: BunSQLiteDatabase<typeof schema>,
  cardId: number
): Promise<SchoolIdolShowSkills[]> {
  const centerSkills = await db
    .selectDistinct({
      card_id: schema.cardDatas.id,
      skill_type: sql<'center_skill'>`'center_skill'`,
      // skill_id: schema.centerskillsTsv.centerSkillId,
      skill_level: schema.centerskillsTsv.skillLevel,
      skill_series_id: schema.centerskillsTsv.centerSkillSeriesId,
      name: schema.centerskillsTsv.name,
      description: schema.centerskillsTsv.description
    })
    .from(schema.cardDatas)
    .innerJoin(
      schema.centerskillsTsv,
      eq(schema.cardDatas.centerSkillSeriesId, schema.centerskillsTsv.centerSkillSeriesId)
    )
    .where(eq(schema.cardDatas.id, cardId));

  const rhythmGameSkills = await db
    .selectDistinct({
      card_id: schema.cardDatas.id,
      skill_type: sql<'rhythm_game_skill'>`'rhythm_game_skill'`,
      // skill_id: schema.rhythmgameskillsTsv.rhythmGameSkillsId,
      skill_level: schema.rhythmgameskillsTsv.skillLevel,
      skill_series_id: schema.rhythmgameskillsTsv.rhythmGameSkillsSeriesId,
      name: schema.rhythmgameskillsTsv.name,
      description: schema.rhythmgameskillsTsv.description,
      skill_cost: schema.rhythmgameskillsTsv.skillCost
    })
    .from(schema.cardDatas)
    .innerJoin(
      schema.rhythmgameskillsTsv,
      eq(
        schema.cardDatas.rhythmGameSkillsSeriesId,
        schema.rhythmgameskillsTsv.rhythmGameSkillsSeriesId
      )
    )
    .where(eq(schema.cardDatas.id, cardId));

  const centerAttributes = await db
    .selectDistinct({
      card_id: schema.cardDatas.id,
      skill_type: sql<'center_attribute'>`'center_attribute'`,
      // skill_id: schema.centerattributesTsv.centerAttributesId,
      name: schema.centerattributesTsv.name,
      description: schema.centerattributesTsv.description
    })
    .from(schema.cardDatas)
    .innerJoin(
      schema.centerattributesTsv,
      eq(schema.cardDatas.centerAttributesId, schema.centerattributesTsv.centerAttributesSeriesId)
    )
    .where(eq(schema.cardDatas.id, cardId));

  return [...centerSkills, ...rhythmGameSkills, ...centerAttributes];
}
