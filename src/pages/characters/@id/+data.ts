// Environment: server

import type { PageContext } from 'vike/types';
import { asc, desc, eq, inArray, like, sql } from 'drizzle-orm';
import {
  bundle,
  cardDatas,
  characters,
  generations,
  musics,
  seasons,
  stickers,
  units
} from '../../../../drizzle/schema';
import { getDrizzleDb } from '~/utils/database';
import { filterReleasedContent } from '~/utils/release';
import { getCharacterDisplayName } from '~/utils/game';

export { data };

async function data(pageContext: PageContext) {
  const { id } = pageContext.routeParams;
  const characterId = Number(id);
  const db = getDrizzleDb();

  const characterResult = await db
    .select({
      id: characters.id,
      nameFirst: characters.nameFirst,
      nameLast: characters.nameLast,
      displayName: characters.fa43Ca79C,
      themeColor: characters.themeColor,
      introduction: characters.introduction,
      generationName: generations.name
    })
    .from(characters)
    .leftJoin(generations, eq(characters.generationsId, generations.id))
    .where(eq(characters.id, characterId))
    .limit(1);

  const character = characterResult[0]
    ? {
        ...characterResult[0],
        displayLabel: getCharacterDisplayName(characterResult[0])
      }
    : null;

  if (!character) {
    return {
      character: null,
      songs: [],
      cards: [],
      stickers: [],
      seasonProfiles: [],
      customProfiles: []
    };
  }

  const [songs, cards, stickerRows, seasonLabelRows, customCardRows] = await Promise.all([
    filterReleasedContent(
      await db
        .select({
          id: musics.id,
          title: musics.title,
          description: musics.description,
          soundId: musics.soundId,
          songTime: musics.songTime,
          startTime: musics.startTime,
          unitName: units.unitName
        })
        .from(musics)
        .leftJoin(units, eq(musics.unitId, units.id))
        .where(eq(musics.centerCharacterId, characterId))
        .orderBy(asc(musics.orderId)),
      undefined,
      (song) => song.startTime
    ),
    filterReleasedContent(
      await db
        .select({
          id: cardDatas.id,
          cardSeriesId: cardDatas.cardSeriesId,
          name: cardDatas.name,
          description: cardDatas.description,
          rarity: cardDatas.rarity,
          style: cardDatas.style,
          maxSmile: cardDatas.maxSmile,
          maxPure: cardDatas.maxPure,
          maxCool: cardDatas.maxCool,
          maxMental: cardDatas.maxMental,
          evolveTimes: cardDatas.evolveTimes,
          releaseDate: sql<string>`COALESCE((
            SELECT MIN(p.startTime)
            FROM (
              SELECT PickUpCardSeriesId_1 as cardSeriesId, StartTime as startTime FROM GachaSeries WHERE PickUpCardSeriesId_1 != 0
              UNION ALL
              SELECT PickUpCardSeriesId_2 as cardSeriesId, StartTime as startTime FROM GachaSeries WHERE PickUpCardSeriesId_2 != 0
              UNION ALL
              SELECT PickUpCardSeriesId_3 as cardSeriesId, StartTime as startTime FROM GachaSeries WHERE PickUpCardSeriesId_3 != 0
              UNION ALL
              SELECT PickUpCardSeriesId_4 as cardSeriesId, StartTime as startTime FROM GachaSeries WHERE PickUpCardSeriesId_4 != 0
              UNION ALL
              SELECT PickUpCardSeriesId_5 as cardSeriesId, StartTime as startTime FROM GachaSeries WHERE PickUpCardSeriesId_5 != 0
              UNION ALL
              SELECT PickUpCardSeriesId_6 as cardSeriesId, StartTime as startTime FROM GachaSeries WHERE PickUpCardSeriesId_6 != 0
            ) p
            WHERE p.cardSeriesId = ${cardDatas.cardSeriesId}
          ), '0000-00-00 00:00:00')`.as('releaseDate')
        })
        .from(cardDatas)
        .where(sql`${cardDatas.charactersId} = ${characterId} AND ${cardDatas.evolveTimes} = 0`)
        .orderBy(desc(cardDatas.cardSeriesId)),
      undefined,
      (card) => card.releaseDate
    ),
    db
      .select({
        id: stickers.id,
        name: stickers.name,
        text: stickers.text,
        requirementText: stickers.requirementText
      })
      .from(stickers)
      .where(eq(stickers.charactersId, characterId))
      .orderBy(desc(stickers.id)),
    db
      .select({
        label: bundle.label
      })
      .from(bundle)
      .where(like(bundle.label, `image_prof_data_chara_season_${characterId}_%`)),
    db
      .select({
        id: cardDatas.id,
        cardSeriesId: cardDatas.cardSeriesId,
        name: cardDatas.name,
        rarity: cardDatas.rarity,
        style: cardDatas.style,
        evolveTimes: cardDatas.evolveTimes
      })
      .from(cardDatas)
      .where(eq(cardDatas.charactersId, characterId))
      .orderBy(desc(cardDatas.cardSeriesId), asc(cardDatas.evolveTimes))
  ]);

  const seasonIds = Array.from(
    new Set(
      seasonLabelRows
        .map((row) =>
          row.label?.match(new RegExp(`^image_prof_data_chara_season_${characterId}_(\\d+)$`))?.[1]
        )
        .filter(Boolean)
        .map((value) => Number(value))
    )
  );

  const seasonRows = seasonIds.length
    ? await db
        .select({
          id: seasons.id,
          name: seasons.name
        })
        .from(seasons)
        .where(inArray(seasons.id, seasonIds))
        .orderBy(desc(seasons.id))
    : [];

  const customLabels = customCardRows.length
    ? await db
        .select({
          label: bundle.label
        })
        .from(bundle)
        .where(
          inArray(
            bundle.label,
            customCardRows.map((card) => `image_prof_custom_${card.id}`)
          )
        )
    : [];

  const customLabelSet = new Set(customLabels.map((row) => row.label));
  const customProfiles = customCardRows.filter((card) =>
    customLabelSet.has(`image_prof_custom_${card.id}`)
  );

  return {
    character,
    songs,
    cards,
    stickers: stickerRows,
    seasonProfiles: seasonRows,
    customProfiles
  };
}

export type PageData = Awaited<ReturnType<typeof data>>;
