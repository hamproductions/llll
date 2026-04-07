// Environment: server

import { desc, eq } from 'drizzle-orm';
import { characters, stickers } from '../../../drizzle/schema';
import { getDrizzleDb } from '~/utils/database';
import { getCharacterDisplayName } from '~/utils/game';

export { data };

async function data() {
  const db = getDrizzleDb();

  const stickerRows = await db
    .select({
      id: stickers.id,
      name: stickers.name,
      text: stickers.text,
      categoryName: stickers.categoryName,
      charactersId: stickers.charactersId,
      requirementType: stickers.requirementType,
      requirementText: stickers.requirementText,
      isVariant: stickers.isVariant,
      availableStartTime: stickers.availableStartTime,
      availableEndTime: stickers.availableEndTime,
      nameFirst: characters.nameFirst,
      nameLast: characters.nameLast,
      displayName: characters.fa43Ca79C
    })
    .from(stickers)
    .leftJoin(characters, eq(stickers.charactersId, characters.id))
    .orderBy(desc(stickers.priority), desc(stickers.id));

  return {
    stickers: stickerRows.map((sticker) => ({
      ...sticker,
      assetLabel: `image_sticker_${sticker.id}`,
      categoryLabel:
        sticker.categoryName === 2
          ? 'Card Unlock'
          : sticker.categoryName === 3
            ? 'Campaign'
            : sticker.categoryName === 1
              ? 'Milestone'
              : 'Legacy Title',
      characterName: sticker.charactersId
        ? getCharacterDisplayName(sticker)
        : ''
    }))
  };
}

export type PageData = Awaited<ReturnType<typeof data>>;
