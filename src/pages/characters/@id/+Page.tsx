import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useData } from 'vike-react/useData';
import { Box, Grid, HStack, Stack, styled } from 'styled-system/jsx';
import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import { Link } from '~/components/ui/link';
import { Tabs } from '~/components/ui/tabs';
import { Text } from '~/components/ui/text';
import { Metadata } from '~/components/layout/Metadata';
import {
  getCardImageUrl,
  getCharacterCustomProfileImageUrl,
  getCharacterProfileImageUrl,
  getCharacterSeasonProfileImageUrl,
  getPicUrl,
  getStickerImageUrl
} from '~/utils/assets';
import type { PageData } from './+data';

function StickerArtwork({ id, name }: { id: number; name: string | null }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <Stack gap="1" alignItems="center">
        <Text fontSize="sm" fontWeight="bold">
          {name ?? `Sticker ${id}`}
        </Text>
      </Stack>
    );
  }

  return (
    <styled.img
      src={getStickerImageUrl(id)}
      alt={name ?? `Sticker ${id}`}
      maxW="100%"
      maxH="100%"
      objectFit="contain"
      onError={() => setFailed(true)}
    />
  );
}

export function Page() {
  const { t } = useTranslation();
  const { character, cards, stickers, seasonProfiles, customProfiles } = useData<PageData>();

  if (!character) {
    return (
      <>
        <Metadata />
        <Stack gap="6" alignItems="center" w="full" py="8">
          <Text fontSize="2xl">{t('character_not_found', 'Character not found.')}</Text>
          <Link href="/characters">
            <Button>{t('back_to_characters', 'Back to Characters')}</Button>
          </Link>
        </Stack>
      </>
    );
  }

  const heroCardSeriesId = cards[0]?.cardSeriesId ?? null;

  return (
    <>
      <Metadata title={character.displayLabel} />
      <Stack gap="6" w="full" py="6" _print={{ display: 'none' }}>
        <Stack gap="4" w="full" maxW="7xl" mx="auto" px={{ base: '4', md: '0' }}>
          <Link href="/characters">
            <Button variant="ghost" size="sm">
              ← {t('back_to_characters', 'Back to Characters')}
            </Button>
          </Link>

          <Card.Root overflow="hidden" borderRadius="2xl">
            <Grid gridTemplateColumns={{ base: '1fr', lg: '280px minmax(0, 1fr)' }}>
              <styled.img
                src={
                  heroCardSeriesId
                    ? getCardImageUrl(heroCardSeriesId, 1)
                    : getCharacterProfileImageUrl(character.id)
                }
                alt={character.displayLabel}
                w="full"
                display="block"
                bg="bg.subtle"
              />
              <Card.Body p={{ base: '5', md: '8' }}>
                <Stack gap="5" h="full" justifyContent="center">
                  <Stack gap="4">
                    <HStack gap="3" alignItems="center">
                      <styled.img
                        src={getPicUrl(String(character.id), 'charaSymbol')}
                        alt={character.displayLabel}
                        w="56px"
                        h="56px"
                      />
                      <Stack gap="1">
                        <Text fontSize={{ base: '3xl', md: '5xl' }} fontWeight="black">
                          {character.displayLabel}
                        </Text>
                        {character.generationName ? (
                          <Text color="fg.muted">{character.generationName}</Text>
                        ) : null}
                      </Stack>
                    </HStack>
                    <HStack gap="3" flexWrap="wrap">
                      <Box px="4" py="2" borderRadius="full" bg="bg.subtle">
                        <Text fontWeight="bold">{cards.length} {t('cards', 'Cards')}</Text>
                      </Box>
                      <Box px="4" py="2" borderRadius="full" bg="bg.subtle">
                        <Text fontWeight="bold">{seasonProfiles.length + 1} {t('profiles', 'Profiles')}</Text>
                      </Box>
                      <Box px="4" py="2" borderRadius="full" bg="bg.subtle">
                        <Text fontWeight="bold">{stickers.length} {t('stickers', 'Stickers')}</Text>
                      </Box>
                    </HStack>
                    {character.introduction ? (
                      <Text maxW="3xl" color="fg.muted">
                        {character.introduction}
                      </Text>
                    ) : null}
                  </Stack>
                </Stack>
              </Card.Body>
            </Grid>
          </Card.Root>
        </Stack>

        <Box w="full" maxW="7xl" mx="auto" px={{ base: '4', md: '0' }}>
          <Tabs.Root defaultValue="cards" width="full">
            <Tabs.List>
              <Tabs.Trigger value="cards">{t('cards', 'Cards')}</Tabs.Trigger>
              <Tabs.Trigger value="profiles">{t('profiles', 'Profiles')}</Tabs.Trigger>
              <Tabs.Trigger value="stickers">{t('stickers', 'Stickers')}</Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="cards">
              <Grid
                pt="4"
                gridTemplateColumns={{ base: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))', xl: 'repeat(4, minmax(0, 1fr))' }}
                gap="4"
              >
                {cards.map((card) => (
                  <Link key={card.cardSeriesId} href={`/cards/${card.cardSeriesId}`}>
                    <Card.Root overflow="hidden" borderRadius="2xl">
                      {card.cardSeriesId ? (
                        <styled.img
                          src={getCardImageUrl(card.cardSeriesId, 1)}
                          alt={card.name ?? 'Card'}
                          w="full"
                          display="block"
                          bg="bg.subtle"
                        />
                      ) : null}
                      <Card.Body p="3" minH="84px">
                        <Stack gap="1" h="full" justifyContent="space-between">
                          <Text fontWeight="bold" lineClamp="2">
                            {card.name}
                          </Text>
                          <Text color="fg.muted" fontSize="sm">
                            {[card.style, card.rarity ? `R${card.rarity}` : null].filter(Boolean).join(' • ')}
                          </Text>
                        </Stack>
                      </Card.Body>
                    </Card.Root>
                  </Link>
                ))}
              </Grid>
            </Tabs.Content>

            <Tabs.Content value="profiles">
              <Stack gap="6" pt="4">
                <Stack gap="3">
                  <Text fontSize="xl" fontWeight="bold">
                    {t('profile_pages', 'Profile Pages')}
                  </Text>
                  <Grid
                    gridTemplateColumns={{ base: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))', xl: 'repeat(5, minmax(0, 1fr))' }}
                    gap="4"
                  >
                    <Card.Root overflow="hidden" borderRadius="xl">
                      <styled.img
                        src={getCharacterProfileImageUrl(character.id)}
                        alt={character.displayLabel}
                        w="full"
                        display="block"
                        bg="bg.subtle"
                      />
                      <Card.Body p="3">
                        <Text fontWeight="bold">{t('profile_base', 'Fan Level')}</Text>
                      </Card.Body>
                    </Card.Root>
                    {seasonProfiles.map((season) => (
                      <Card.Root key={season.id} overflow="hidden" borderRadius="xl">
                        <styled.img
                          src={getCharacterSeasonProfileImageUrl(character.id, season.id)}
                          alt={`${character.displayLabel} ${season.name}`}
                          w="full"
                          display="block"
                          bg="bg.subtle"
                        />
                        <Card.Body p="3">
                          <Text fontWeight="bold" lineClamp="2">
                            {season.name}
                          </Text>
                        </Card.Body>
                      </Card.Root>
                    ))}
                  </Grid>
                </Stack>

                <Stack gap="3">
                  <Text fontSize="xl" fontWeight="bold">
                    {t('custom_profiles', 'Card Profiles')}
                  </Text>
                  <Grid
                    gridTemplateColumns={{ base: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))', xl: 'repeat(4, minmax(0, 1fr))' }}
                    gap="4"
                  >
                    {customProfiles.map((card) => (
                      <Link key={card.id} href={`/cards/${card.cardSeriesId}`}>
                        <Card.Root overflow="hidden" borderRadius="xl">
                          <styled.img
                            src={getCharacterCustomProfileImageUrl(card.id)}
                            alt={card.name ?? 'Card profile'}
                            w="full"
                            display="block"
                            bg="bg.subtle"
                          />
                          <Card.Body p="3">
                            <Text fontWeight="bold" lineClamp="2">
                              {card.name}
                            </Text>
                          </Card.Body>
                        </Card.Root>
                      </Link>
                    ))}
                  </Grid>
                </Stack>
              </Stack>
            </Tabs.Content>

            <Tabs.Content value="stickers">
              <Grid
                pt="4"
                gridTemplateColumns={{ base: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))', xl: 'repeat(6, minmax(0, 1fr))' }}
                gap="4"
              >
                {stickers.map((sticker) => (
                  <Card.Root key={sticker.id} overflow="hidden" borderRadius="xl">
                    <Box aspectRatio="1 / 1" bg="bg.subtle" display="flex" alignItems="center" justifyContent="center" p="4">
                      <StickerArtwork id={sticker.id} name={sticker.name} />
                    </Box>
                    <Card.Body p="3">
                      <Stack gap="1">
                        <Text fontWeight="bold" fontSize="sm" lineClamp="2">
                          {sticker.name}
                        </Text>
                        {sticker.text ? (
                          <Text color="fg.muted" fontSize="xs" lineClamp="2">
                            {sticker.text}
                          </Text>
                        ) : null}
                      </Stack>
                    </Card.Body>
                  </Card.Root>
                ))}
              </Grid>
            </Tabs.Content>
          </Tabs.Root>
        </Box>
      </Stack>
    </>
  );
}
