import { useTranslation } from 'react-i18next';
import { useData } from 'vike-react/useData';
import { Box, Grid, Stack, styled } from 'styled-system/jsx';
import { Metadata } from '~/components/layout/Metadata';
import { Card } from '~/components/ui/card';
import { Link } from '~/components/ui/link';
import { Text } from '~/components/ui/text';
import {
  getGachaBannerImageUrl,
  getGachaPackFullImageUrl,
  getGachaCardInfoImageUrl,
  getCardImageUrl
} from '~/utils/assets';
import type { PageData } from './+data';

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const d = new Date(dateStr.replace(' ', 'T'));
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function Page() {
  const { t } = useTranslation();
  const { gacha } = useData<PageData>();

  if (!gacha) {
    return (
      <Stack gap="6" alignItems="center" w="full" py="16">
        <Text fontSize="2xl" fontWeight="bold">{t('gacha_not_found', 'Gacha not found')}</Text>
        <Link href="/gacha">{t('back_to_gacha', 'Back to Gacha')}</Link>
      </Stack>
    );
  }

  const dateRange = [formatDate(gacha.startTime), formatDate(gacha.endTime)].filter(Boolean).join(' — ');

  return (
    <>
      <Metadata title={gacha.name ?? `Gacha #${gacha.id}`} />
      <Stack gap="8" alignItems="center" w="full" py="4" _print={{ display: 'none' }}>
        <Box w="full" maxW="6xl">
          <Link href="/gacha" display="inline-flex" alignItems="center" gap="1" color="fg.muted" fontSize="sm" mb="2">
            ← {t('back_to_gacha', 'Back to Gacha')}
          </Link>
        </Box>

        <Box w="full" maxW="6xl" overflow="hidden" borderRadius="2xl">
          <styled.img
            src={getGachaBannerImageUrl(gacha.id)}
            alt={gacha.name ?? ''}
            w="full"
            display="block"
          />
        </Box>

        <Stack gap="2" alignItems="center" w="full" maxW="6xl" px={{ base: '4', md: '0' }}>
          <Text textAlign="center" fontSize="3xl" fontWeight="black">
            {gacha.name}
          </Text>
          {dateRange && (
            <Text color="fg.muted" fontSize="sm">{dateRange}</Text>
          )}
          {gacha.description && (
            <Text color="fg.muted" textAlign="center" maxW="3xl" mt="1">
              {gacha.description}
            </Text>
          )}
        </Stack>

        <Grid
          w="full"
          maxW="6xl"
          px={{ base: '4', md: '0' }}
          gridTemplateColumns={{ base: '1fr', md: '1fr 1fr' }}
          gap="4"
        >
          <Box overflow="hidden" borderRadius="xl" bg="bg.subtle">
            <styled.img
              src={getGachaBannerImageUrl(gacha.id)}
              alt="Banner"
              w="full"
              objectFit="contain"
            />
          </Box>
          <Box overflow="hidden" borderRadius="xl" bg="bg.subtle">
            <styled.img
              src={getGachaPackFullImageUrl(gacha.id)}
              alt="Pack"
              w="full"
              objectFit="contain"
            />
          </Box>
        </Grid>

        {gacha.pickupCards.length > 0 && (
          <Stack gap="4" w="full" maxW="6xl" px={{ base: '4', md: '0' }}>
            <Text fontSize="xl" fontWeight="bold">
              {t('pickup_cards_heading', 'Pickup Cards')}
            </Text>
            <Grid gridTemplateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap="4">
              {gacha.pickupCards.map((card) => (
                <Link key={card.id} href={`/cards/${card.cardSeriesId}`}>
                  <Card.Root overflow="hidden" borderRadius="xl" h="full">
                    <Box overflow="hidden" bg="bg.subtle">
                      <styled.img
                        src={getCardImageUrl(card.cardSeriesId!, 1)}
                        alt={card.name ?? ''}
                        w="full"
                        display="block"
                      />
                    </Box>
                    <Card.Body p="3">
                      <Stack gap="1">
                        <Text fontWeight="bold" lineClamp="2" fontSize="sm">
                          {card.name}
                        </Text>
                        {card.characterName && (
                          <Text color="fg.muted" fontSize="xs">{card.characterName}</Text>
                        )}
                        {card.rarityName && (
                          <Text fontSize="xs" color="fg.muted">{card.rarityName}</Text>
                        )}
                      </Stack>
                    </Card.Body>
                  </Card.Root>
                </Link>
              ))}
            </Grid>
          </Stack>
        )}

        {gacha.pickupCards.some((c) => c.promoVariantId != null && c.characterId != null) && (
          <Stack gap="4" w="full" maxW="6xl" px={{ base: '4', md: '0' }}>
            <Text fontSize="xl" fontWeight="bold">
              {t('character_promos_heading', 'Character Promos')}
            </Text>
            <Grid gridTemplateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap="4">
              {gacha.pickupCards
                .filter((c) => c.promoVariantId != null && c.characterId != null)
                .map((card) => (
                  <Box key={card.characterId} overflow="hidden" borderRadius="xl" bg="bg.subtle">
                    <styled.img
                      src={getGachaCardInfoImageUrl(card.characterId!, card.promoVariantId!)}
                      alt={card.characterName ?? ''}
                      w="full"
                      objectFit="contain"
                    />
                    {card.characterName && (
                      <Box p="3">
                        <Text fontSize="sm" fontWeight="medium">{card.characterName}</Text>
                      </Box>
                    )}
                  </Box>
                ))}
            </Grid>
          </Stack>
        )}

        {gacha.campaigns.length > 0 && (
          <Stack gap="3" w="full" maxW="6xl" px={{ base: '4', md: '0' }}>
            <Text fontSize="xl" fontWeight="bold">
              {t('campaigns_heading', 'Campaigns')}
            </Text>
            <Stack gap="2">
              {gacha.campaigns.map((campaign, i) => (
                <Box key={i} p="3" borderRadius="lg" borderWidth="1px" bg="bg.subtle">
                  <Text fontSize="sm">{campaign}</Text>
                </Box>
              ))}
            </Stack>
          </Stack>
        )}
      </Stack>
    </>
  );
}
