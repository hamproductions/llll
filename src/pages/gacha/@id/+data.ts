// Environment: server

import type { PageContext } from 'vike/types';
import { and, eq, inArray, like } from 'drizzle-orm';
import { bundle, cardDatas, cardRarities, characters, gachaCampaigns, gachaSeries } from '../../../../drizzle/schema';
import { getDrizzleDb } from '~/utils/database';
import { getCharacterDisplayName } from '~/utils/game';

export { data };

async function data(pageContext: PageContext) {
  const gachaId = Number(pageContext.routeParams.id);
  const db = getDrizzleDb();

  const [gachaRow] = await db
    .select({
      id: gachaSeries.id,
      name: gachaSeries.gachaSeriesName,
      description: gachaSeries.description,
      gachaType: gachaSeries.gachaType,
      bgType: gachaSeries.bgType,
      startTime: gachaSeries.startTime,
      endTime: gachaSeries.endTime,
      pickUpCardSeriesId1: gachaSeries.pickUpCardSeriesId1,
      pickUpCardSeriesId2: gachaSeries.pickUpCardSeriesId2,
      pickUpCardSeriesId3: gachaSeries.pickUpCardSeriesId3,
      pickUpCardSeriesId4: gachaSeries.pickUpCardSeriesId4,
      pickUpCardSeriesId5: gachaSeries.pickUpCardSeriesId5,
      pickUpCardSeriesId6: gachaSeries.pickUpCardSeriesId6
    })
    .from(gachaSeries)
    .where(eq(gachaSeries.id, gachaId))
    .limit(1);

  if (!gachaRow) {
    return { gacha: null };
  }

  const pickupSeriesIds = [
    gachaRow.pickUpCardSeriesId1,
    gachaRow.pickUpCardSeriesId2,
    gachaRow.pickUpCardSeriesId3,
    gachaRow.pickUpCardSeriesId4,
    gachaRow.pickUpCardSeriesId5,
    gachaRow.pickUpCardSeriesId6
  ].filter((value): value is number => Boolean(value));

  const [campaignRows, pickupCards, cardInfoRows, rarityRows] = await Promise.all([
    db
      .select({
        campaignName: gachaCampaigns.campaignName
      })
      .from(gachaCampaigns)
      .where(
        and(
          eq(gachaCampaigns.gachaSeriesId1, gachaId)
        )
      ),
    pickupSeriesIds.length
      ? db
          .select({
            id: cardDatas.id,
            cardSeriesId: cardDatas.cardSeriesId,
            name: cardDatas.name,
            style: cardDatas.style,
            rarity: cardDatas.rarity,
            characterId: characters.id,
            characterNameFirst: characters.nameFirst,
            characterNameLast: characters.nameLast,
            characterDisplayName: characters.fa43Ca79C
          })
          .from(cardDatas)
          .leftJoin(characters, eq(cardDatas.charactersId, characters.id))
          .where(and(inArray(cardDatas.cardSeriesId, pickupSeriesIds), eq(cardDatas.evolveTimes, 0)))
      : [],
    db
      .select({
        label: bundle.label
      })
      .from(bundle)
      .where(like(bundle.label, 'image_gacha_cardinfo_%')),
    db.select({ id: cardRarities.id, rarityName: cardRarities.rarityName }).from(cardRarities)
  ]);

  const rarityMap = new Map(rarityRows.map((r) => [r.id, r.rarityName ?? String(r.id)]));

  const cardInfoMap = new Map<number, number[]>();

  for (const row of cardInfoRows) {
    const match = row.label?.match(/^image_gacha_cardinfo_(\d+)_(\d+)$/);

    if (!match) {
      continue;
    }

    const characterId = Number(match[1]);
    const variantId = Number(match[2]);
    const group = cardInfoMap.get(characterId) ?? [];
    group.push(variantId);
    cardInfoMap.set(characterId, Array.from(new Set(group)).sort((a, b) => a - b));
  }

  const cards = pickupCards.map((card) => ({
    ...card,
    characterName: card.characterId
      ? getCharacterDisplayName({
          displayName: card.characterDisplayName,
          nameFirst: card.characterNameFirst,
          nameLast: card.characterNameLast
        })
      : '',
    rarityName: card.rarity != null ? rarityMap.get(card.rarity) ?? null : null,
    promoVariantId: card.characterId ? (cardInfoMap.get(card.characterId)?.includes(5) ? 5 : cardInfoMap.get(card.characterId)?.[0] ?? null) : null
  }));

  return {
    gacha: {
      ...gachaRow,
      campaigns: campaignRows.map((row) => row.campaignName).filter(Boolean),
      pickupCards: cards
    }
  };
}

export type PageData = Awaited<ReturnType<typeof data>>;
