import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useData } from 'vike-react/useData';
import { Box, Grid, HStack, Stack, styled } from 'styled-system/jsx';
import { Metadata } from '~/components/layout/Metadata';
import { Card } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Link } from '~/components/ui/link';
import { createListCollection, Select } from '~/components/ui/select';
import { Text } from '~/components/ui/text';
import { getCardImageUrl } from '~/utils/assets';
import type { PageData } from './+data';

export function Page() {
  const { t } = useTranslation();
  const { cards, rarities, characters }: PageData = useData();
  const [selectedRarity, setSelectedRarity] = useState('');
  const [selectedCharacterIds, setSelectedCharacterIds] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('releaseDate');
  const [awakened, setAwakened] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 30;

  const rarityMap = useMemo(() => {
    const map = new Map<number, string>();
    for (const rarity of rarities) {
      map.set(rarity.id, rarity.rarityName ?? String(rarity.id));
    }
    return map;
  }, [rarities]);

  const characterMap = useMemo(() => {
    const map = new Map<number, string>();
    for (const character of characters) {
      const fullName =
        character.displayName?.trim() ||
        `${character.nameLast ?? ''} ${character.nameFirst ?? ''}`.trim() ||
        String(character.id);
      map.set(character.id, fullName);
    }
    return map;
  }, [characters]);

  const rarityOptions = useMemo(
    () =>
      createListCollection({
        items: Array.from(new Set(cards.map((card) => card.rarity).filter((rarity) => rarity != null)))
          .map((rarity) => ({
            value: String(rarity),
            label: rarityMap.get(rarity!) ?? String(rarity)
          }))
          .sort((a, b) => a.label.localeCompare(b.label))
      }),
    [cards, rarityMap]
  );

  const characterOptions = useMemo(
    () =>
      createListCollection({
        items: Array.from(new Set(cards.map((card) => card.charactersId).filter((id) => id != null)))
          .map((id) => ({
            value: String(id),
            label: characterMap.get(id!) ?? String(id)
          }))
          .sort((a, b) => a.label.localeCompare(b.label))
      }),
    [cards, characterMap]
  );

  const filteredCards = useMemo(() => {
    const normalizedQuery = query.toLowerCase();
    const filtered = cards.filter((card) => {
      const matchesQuery =
        normalizedQuery === '' ||
        (card.name ?? '').toLowerCase().includes(normalizedQuery) ||
        (card.description ?? '').toLowerCase().includes(normalizedQuery) ||
        (card.characterName ?? '').toLowerCase().includes(normalizedQuery);

      const matchesRarity =
        selectedRarity === '' || (card.rarity != null && String(card.rarity) === selectedRarity);

      const matchesCharacter =
        selectedCharacterIds.length === 0 ||
        (card.charactersId != null && selectedCharacterIds.includes(String(card.charactersId)));

      return matchesQuery && matchesRarity && matchesCharacter;
    });

    return [...filtered].sort((left, right) => {
      if (sortBy === 'name') {
        return (left.name ?? '').localeCompare(right.name ?? '');
      }

      if (sortBy === 'rarity') {
        return (right.rarity ?? 0) - (left.rarity ?? 0) || right.id - left.id;
      }

      return String(right.releaseDate ?? '').localeCompare(String(left.releaseDate ?? '')) || right.id - left.id;
    });
  }, [cards, query, selectedCharacterIds, selectedRarity, sortBy]);

  const totalPages = Math.ceil(filteredCards.length / pageSize);
  const pageCards = filteredCards.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [query, selectedRarity, selectedCharacterIds, sortBy]);

  const sortOptions = createListCollection({
    items: [
      { value: 'releaseDate', label: t('sort_by_newest', 'Newest') },
      { value: 'rarity', label: t('sort_by_rarity', 'Rarity') },
      { value: 'name', label: t('sort_by_name', 'Name') }
    ]
  });

  return (
    <>
      <Metadata />
      <Stack gap="6" alignItems="center" w="full" py="8" _print={{ display: 'none' }}>
        <Stack gap="2" alignItems="center" w="full" maxW="6xl" px={{ base: '4', md: '0' }}>
          <Text textAlign="center" fontSize={{ base: '3xl', md: '4xl' }} fontWeight="black">
            {t('card_list_header')}
          </Text>
          <Text color="fg.muted" textAlign="center" maxW="2xl">
            {t('card_list_description', 'Browse and filter the full card collection.')}
          </Text>
        </Stack>

        <HStack
          gap="3"
          alignItems="flex-end"
          w="full"
          maxW="6xl"
          mx="auto"
          px={{ base: '4', md: '0' }}
          flexWrap="wrap"
        >
          <Input
            placeholder={t('filter_by_name')}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            flex="1"
            minW={{ base: 'full', lg: '240px' }}
          />

          <Select.Root
            collection={rarityOptions}
            value={[selectedRarity]}
            onValueChange={(details) => setSelectedRarity(details.value[0] ?? '')}
            positioning={{ sameWidth: true }}
            width={{ base: 'full', md: '180px' }}
          >
            <Select.Label>{t('filter_by_rarity')}</Select.Label>
            <Select.Control>
              <Select.Trigger>
                <Select.ValueText placeholder={t('all_rarities')} />
              </Select.Trigger>
            </Select.Control>
            <Select.Positioner>
              <Select.Content>
                {rarityOptions.items.map((option) => (
                  <Select.Item key={option.value} item={option}>
                    <Select.ItemText>{option.label}</Select.ItemText>
                    <Select.ItemIndicator>✓</Select.ItemIndicator>
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Select.Root>

          <Select.Root
            collection={characterOptions}
            value={selectedCharacterIds}
            onValueChange={(details) => setSelectedCharacterIds(details.value)}
            positioning={{ sameWidth: true }}
            width={{ base: 'full', md: '220px' }}
            multiple
          >
            <Select.Label>{t('filter_by_character')}</Select.Label>
            <Select.Control>
              <Select.Trigger>
                <Select.ValueText placeholder={t('select_character')} />
              </Select.Trigger>
            </Select.Control>
            <Select.Positioner>
              <Select.Content>
                {characterOptions.items.map((option) => (
                  <Select.Item key={option.value} item={option}>
                    <Select.ItemText>{option.label}</Select.ItemText>
                    <Select.ItemIndicator>✓</Select.ItemIndicator>
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Select.Root>

          <Select.Root
            collection={sortOptions}
            value={[sortBy]}
            onValueChange={(details) => setSortBy(details.value[0] ?? 'releaseDate')}
            positioning={{ sameWidth: true }}
            width={{ base: 'full', md: '160px' }}
          >
            <Select.Label>{t('sort_by', 'Sort By')}</Select.Label>
            <Select.Control>
              <Select.Trigger>
                <Select.ValueText />
              </Select.Trigger>
            </Select.Control>
            <Select.Positioner>
              <Select.Content>
                {sortOptions.items.map((option) => (
                  <Select.Item key={option.value} item={option}>
                    <Select.ItemText>{option.label}</Select.ItemText>
                    <Select.ItemIndicator>✓</Select.ItemIndicator>
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Select.Root>
        </HStack>

        <HStack w="full" maxW="6xl" px={{ base: '4', md: '0' }} justifyContent="space-between" alignItems="center">
          <HStack gap="1">
            <Box
              as="button"
              px="3"
              py="1"
              borderRadius="full"
              fontSize="sm"
              cursor="pointer"
              fontWeight={!awakened ? 'bold' : 'normal'}
              bg={!awakened ? 'bg.emphasized' : 'transparent'}
              borderWidth="1px"
              borderColor="border.default"
              onClick={() => setAwakened(false)}
            >
              {t('card_unawakened', 'Normal')}
            </Box>
            <Box
              as="button"
              px="3"
              py="1"
              borderRadius="full"
              fontSize="sm"
              cursor="pointer"
              fontWeight={awakened ? 'bold' : 'normal'}
              bg={awakened ? 'bg.emphasized' : 'transparent'}
              borderWidth="1px"
              borderColor="border.default"
              onClick={() => setAwakened(true)}
            >
              {t('card_awakened', 'Awakened')}
            </Box>
          </HStack>
          <Text color="fg.muted" fontSize="sm">
            {t('filtered_cards_match_summary', 'Showing {{count}} of {{total}} cards matching your criteria.', {
              count: filteredCards.length,
              total: cards.length
            })}
          </Text>
        </HStack>

        <Grid
          gridTemplateColumns={{ base: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))', xl: 'repeat(5, minmax(0, 1fr))' }}
          gap="4"
          w="full"
          maxW="6xl"
          px={{ base: '4', md: '0' }}
        >
          {pageCards.map((card) => (
            <Link key={card.id} href={card.cardSeriesId ? `/cards/${card.cardSeriesId}` : undefined} style={{ textDecoration: 'none', color: 'inherit' }}>
              <Card.Root overflow="hidden" borderRadius="2xl" h="full" cursor="pointer" _hover={{ shadow: 'md' }} transition="shadow 0.2s">
                {card.cardSeriesId ? (
                  <styled.img
                    src={getCardImageUrl(card.cardSeriesId, awakened ? 1 : 0)}
                    alt={card.name ?? `Card ${card.cardSeriesId}`}
                    w="full"
                    display="block"
                    onError={(e) => {
                      const img = e.currentTarget;
                      if (!img.dataset.fallback) {
                        img.dataset.fallback = '1';
                        img.src = getCardImageUrl(card.cardSeriesId!, awakened ? 0 : 1);
                      }
                    }}
                  />
                ) : null}
                <Card.Body p="2.5">
                  <Stack gap="1">
                    <Text fontWeight="bold" fontSize="sm" lineClamp="2">
                      {card.name}
                    </Text>
                    <Text fontSize="xs" color="fg.muted" lineClamp="1">
                      {[card.characterName, card.rarity != null ? rarityMap.get(card.rarity) : null]
                        .filter(Boolean)
                        .join(' · ')}
                    </Text>
                  </Stack>
                </Card.Body>
              </Card.Root>
            </Link>
          ))}
        </Grid>

        {totalPages > 1 && (
          <HStack gap="2" flexWrap="wrap" justifyContent="center">
            {page > 1 && (
              <Box
                as="button"
                px="3"
                py="1"
                borderRadius="md"
                borderWidth="1px"
                fontSize="sm"
                cursor="pointer"
                onClick={() => setPage(page - 1)}
              >
                ←
              </Box>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Box
                key={p}
                as="button"
                px="3"
                py="1"
                borderRadius="md"
                borderWidth="1px"
                fontSize="sm"
                cursor="pointer"
                bg={p === page ? 'bg.subtle' : 'transparent'}
                fontWeight={p === page ? 'bold' : 'normal'}
                onClick={() => setPage(p)}
              >
                {p}
              </Box>
            ))}
            {page < totalPages && (
              <Box
                as="button"
                px="3"
                py="1"
                borderRadius="md"
                borderWidth="1px"
                fontSize="sm"
                cursor="pointer"
                onClick={() => setPage(page + 1)}
              >
                →
              </Box>
            )}
          </HStack>
        )}
      </Stack>
    </>
  );
}
