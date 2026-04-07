// Environment: server

import { asc, eq } from 'drizzle-orm';
import { characters, generations, musics, units } from '../../../drizzle/schema';
import { getDrizzleDb } from '~/utils/database';
import { filterReleasedContent } from '~/utils/release';
import { getCharacterDisplayName } from '~/utils/game';

export { data };

async function data() {
  const db = getDrizzleDb();

  return {
    songs: filterReleasedContent(
      await db
        .select({
          id: musics.id,
          title: musics.title,
          description: musics.description,
          soundId: musics.soundId,
          songTime: musics.songTime,
          startTime: musics.startTime,
          unitName: units.unitName,
          generationName: generations.name,
          centerCharacterId: characters.id,
          centerNameFirst: characters.nameFirst,
          centerNameLast: characters.nameLast,
          centerDisplayName: characters.fa43Ca79C
        })
        .from(musics)
        .leftJoin(units, eq(musics.unitId, units.id))
        .leftJoin(generations, eq(musics.generationsId, generations.id))
        .leftJoin(characters, eq(musics.centerCharacterId, characters.id))
        .orderBy(asc(musics.orderId)),
      undefined,
      (song) => song.startTime
    ).map((song) => ({
      ...song,
      centerCharacterName: getCharacterDisplayName({
        displayName: song.centerDisplayName,
        nameFirst: song.centerNameFirst,
        nameLast: song.centerNameLast
      })
    }))
  };
}

export type PageData = Awaited<ReturnType<typeof data>>;
