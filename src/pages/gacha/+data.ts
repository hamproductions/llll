// Environment: server

import { and, desc, eq, inArray, like } from 'drizzle-orm';
import { bundle, cardDatas, characters, gachaCampaigns, gachaSeries } from '../../../drizzle/schema';
import { getDrizzleDb } from '~/utils/database';
import { filterReleasedContent } from '~/utils/release';
import { getCharacterDisplayName } from '~/utils/game';

export { data };

function extractSeason(name: string | null | undefined): string {
  if (!name) return 'OTHER';
  const m = name.match(/(SPRING|SUMMER|AUTUMN|WINTER|GRADUATION|BIRTHDAY|PARTY|HALLOWEEN|ANNIVERSARY)/i);
  return m ? m[1].toUpperCase() : 'OTHER';
}

async function data() {
  const db = getDrizzleDb();

  const [gachaRows, campaignRows, cardInfoRows] = await Promise.all([
    filterReleasedContent(
      await db
        .select({
          id: gachaSeries.id,
          name: gachaSeries.gachaSeriesName,
          description: gachaSeries.description,
          gachaType: gachaSeries.gachaType,
          bgType: gachaSeries.bgType,
          orderId: gachaSeries.orderId,
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
        .orderBy(desc(gachaSeries.orderId)),
      undefined,
      (gacha) => gacha.startTime
    ),
    filterReleasedContent(
      await db
        .select({
          id: gachaCampaigns.id,
          campaignName: gachaCampaigns.campaignName,
          gachaSeriesId1: gachaCampaigns.gachaSeriesId1,
          gachaSeriesId2: gachaCampaigns.gachaSeriesId2,
          gachaSeriesId3: gachaCampaigns.gachaSeriesId3,
          gachaSeriesId4: gachaCampaigns.gachaSeriesId4,
          gachaSeriesId5: gachaCampaigns.gachaSeriesId5,
          startTime: gachaCampaigns.startTime
        })
        .from(gachaCampaigns)
        .orderBy(desc(gachaCampaigns.id)),
      undefined,
      (campaign) => campaign.startTime
    ),
    db
      .select({
        label: bundle.label
      })
      .from(bundle)
      .where(like(bundle.label, 'image_gacha_cardinfo_%'))
  ]);

  const pickupSeriesIds = Array.from(
    new Set(
      gachaRows
        .flatMap((gacha) => [
          gacha.pickUpCardSeriesId1,
          gacha.pickUpCardSeriesId2,
          gacha.pickUpCardSeriesId3,
          gacha.pickUpCardSeriesId4,
          gacha.pickUpCardSeriesId5,
          gacha.pickUpCardSeriesId6
        ])
        .filter((value): value is number => Boolean(value))
    )
  );

  const pickupCards = pickupSeriesIds.length
    ? await db
        .select({
          id: cardDatas.id,
          cardSeriesId: cardDatas.cardSeriesId,
          name: cardDatas.name,
          rarity: cardDatas.rarity,
          style: cardDatas.style,
          evolveTimes: cardDatas.evolveTimes,
          characterId: characters.id,
          characterNameFirst: characters.nameFirst,
          characterNameLast: characters.nameLast,
          characterDisplayName: characters.fa43Ca79C
        })
        .from(cardDatas)
        .leftJoin(characters, eq(cardDatas.charactersId, characters.id))
        .where(and(inArray(cardDatas.cardSeriesId, pickupSeriesIds), eq(cardDatas.evolveTimes, 0)))
    : [];

  const pickupCardMap = new Map(
    pickupCards.filter((card) => card.characterId).map((card) => [
        card.cardSeriesId,
        {
          ...card,
          characterName: getCharacterDisplayName({
            displayName: card.characterDisplayName,
            nameFirst: card.characterNameFirst,
            nameLast: card.characterNameLast
          })
        }
      ])
  );

  const campaignMap = new Map<number, string[]>();

  for (const campaign of campaignRows) {
    for (const gachaId of [
      campaign.gachaSeriesId1,
      campaign.gachaSeriesId2,
      campaign.gachaSeriesId3,
      campaign.gachaSeriesId4,
      campaign.gachaSeriesId5
    ]) {
      if (!gachaId) {
        continue;
      }

      const group = campaignMap.get(gachaId) ?? [];
      group.push(campaign.campaignName ?? `Campaign ${campaign.id}`);
      campaignMap.set(gachaId, group);
    }
  }

  const cardInfoMap = new Map<number, number[]>();

  for (const row of cardInfoRows) {
    if (!row.label) {
      continue;
    }

    const match = row.label.match(/^image_gacha_cardinfo_(\d+)_(\d+)$/);

    if (!match) {
      continue;
    }

    const characterId = Number(match[1]);
    const variantId = Number(match[2]);
    const group = cardInfoMap.get(characterId) ?? [];
    group.push(variantId);
    cardInfoMap.set(characterId, Array.from(new Set(group)).sort((a, b) => a - b));
  }

  const seasonCounts: Record<string, number> = {};

  const gachas = gachaRows.map((gacha) => {
    const season = extractSeason(gacha.name);
    seasonCounts[season] = (seasonCounts[season] || 0) + 1;

    const pickupCards = [
      gacha.pickUpCardSeriesId1,
      gacha.pickUpCardSeriesId2,
      gacha.pickUpCardSeriesId3,
      gacha.pickUpCardSeriesId4,
      gacha.pickUpCardSeriesId5,
      gacha.pickUpCardSeriesId6
    ]
      .filter((value): value is number => Boolean(value))
      .map((cardSeriesId) => pickupCardMap.get(cardSeriesId))
      .filter(Boolean);

    const characterPromos = Array.from(
      new Map(
        pickupCards
          .filter((card) => card?.characterId)
          .map((card) => {
            const variants = cardInfoMap.get(card!.characterId!) ?? [];
            return [
              card!.characterId!,
              {
                characterId: card!.characterId!,
                characterName: card!.characterName,
                variantId: variants.includes(5) ? 5 : variants[0] ?? null
              }
            ];
          })
      ).values()
    );

    return {
      ...gacha,
      season,
      pickupCards,
      characterPromos,
      campaigns: campaignMap.get(gacha.id) ?? []
    };
  });

  return { gachas, seasonCounts };
}

export type PageData = Awaited<ReturnType<typeof data>>;
