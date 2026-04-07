// Environment: server

import { asc, eq, sql } from 'drizzle-orm';
import { cardDatas, characters, generations, musics, stickers } from '../../../drizzle/schema';
import { getDrizzleDb } from '~/utils/database';
import { filterReleasedContent } from '~/utils/release';
import { getCharacterDisplayName } from '~/utils/game';

export { data };

async function data() {
  const db = getDrizzleDb();

  const [characterRows, releasedSongs, cardCounts, stickerCounts, representativeCards] = await Promise.all([
    db
      .select({
        id: characters.id,
        nameFirst: characters.nameFirst,
        nameLast: characters.nameLast,
        displayName: characters.fa43Ca79C,
        themeColor: characters.themeColor,
        introduction: characters.introduction,
        iconOrderId: characters.iconOrderId,
        generationName: generations.name,
        generationsId: characters.generationsId
      })
      .from(characters)
      .leftJoin(generations, eq(characters.generationsId, generations.id))
      .orderBy(asc(characters.iconOrderId), asc(characters.id)),
    db
      .select({
        id: musics.id,
        centerCharacterId: musics.centerCharacterId,
        startTime: musics.startTime
      })
      .from(musics),
    db
      .select({
        charactersId: cardDatas.charactersId,
        count: sql<number>`count(distinct ${cardDatas.cardSeriesId})`.as('count')
      })
      .from(cardDatas)
      .where(sql`${cardDatas.cardSeriesId} NOT IN (1010400, 1010500)`)
      .groupBy(cardDatas.charactersId)
    ,
    db
      .select({
        charactersId: stickers.charactersId,
        count: sql<number>`count(*)`.as('count')
      })
      .from(stickers)
      .groupBy(stickers.charactersId),
    db
      .select({
        charactersId: cardDatas.charactersId,
        cardSeriesId: cardDatas.cardSeriesId,
        rarity: cardDatas.rarity
      })
      .from(cardDatas)
      .where(sql`${cardDatas.cardSeriesId} NOT IN (1010400, 1010500)`)
  ]);

  const releasedSongRows = filterReleasedContent(releasedSongs, undefined, (song) => song.startTime);
  const songCountMap = new Map<number, number>();
  for (const song of releasedSongRows) {
    if (!song.centerCharacterId) continue;
    songCountMap.set(song.centerCharacterId, (songCountMap.get(song.centerCharacterId) ?? 0) + 1);
  }

  const cardCountMap = new Map<number, number>();
  for (const row of cardCounts) {
    if (!row.charactersId) continue;
    cardCountMap.set(row.charactersId, row.count);
  }

  const stickerCountMap = new Map<number, number>();
  for (const row of stickerCounts) {
    if (!row.charactersId) continue;
    stickerCountMap.set(row.charactersId, row.count);
  }

  const representativeCardMap = new Map<number, { cardSeriesId: number; rarity: number }>();
  for (const row of representativeCards) {
    if (!row.charactersId || !row.cardSeriesId) continue;
    const existing = representativeCardMap.get(row.charactersId);
    const rarity = row.rarity ?? 0;
    if (!existing || rarity > existing.rarity || (rarity === existing.rarity && row.cardSeriesId > existing.cardSeriesId)) {
      representativeCardMap.set(row.charactersId, { cardSeriesId: row.cardSeriesId, rarity });
    }
  }

  return {
    characters: characterRows.map((character) => ({
      ...character,
      displayLabel: getCharacterDisplayName(character),
      cardCount: cardCountMap.get(character.id) ?? 0,
      songCount: songCountMap.get(character.id) ?? 0,
      stickerCount: stickerCountMap.get(character.id) ?? 0,
      representativeCardSeriesId: representativeCardMap.get(character.id)?.cardSeriesId ?? null
    }))
  };
}

export type PageData = Awaited<ReturnType<typeof data>>;
