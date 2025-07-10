import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useData } from 'vike-react/useData';
import type { PageData } from './+data';
import { Text } from '~/components/ui/text';
import { Metadata } from '~/components/layout/Metadata';
import { Box, Stack, HStack, styled } from 'styled-system/jsx';
import { Link } from '~/components/ui/link';
import { Table } from '~/components/ui/table';
import { createListCollection, Select } from '~/components/ui/select';
import { Input } from '~/components/ui/input';
import { getCardUrl, getPicUrl } from '~/utils/assets';

export function Page() {
  const { t } = useTranslation();
  const { cards, rarities, characters }: PageData = useData();
  const [selectedRarity, setSelectedRarity] = useState<string>('');
  const [characterNameFilter, setCharacterNameFilter] = useState<string>('');
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>('');

  // Map for Rarity ID to Name
  const rarityMap = useMemo(() => {
    const map = new Map<number, string>();
    if (rarities) {
      for (const rarity of rarities) {
        map.set(rarity.id, rarity.rarityName ?? String(rarity.id));
      }
    }
    return map;
  }, [rarities]);

  // Map for Character ID to Full Name
  const characterMap = useMemo(() => {
    const map = new Map<number, string>();
    if (characters) {
      for (const character of characters) {
        const fullName =
          character.displayName ||
          `${character.nameLast ?? ''} ${character.nameFirst ?? ''}`.trim();
        map.set(character.id, fullName || String(character.id));
      }
    }
    return map;
  }, [characters]);

  const uniqueRarities = useMemo(() => {
    if (!cards)
      return createListCollection({
        items: []
      });
    const rarityIds = new Set<number>();
    cards.forEach((card) => {
      if (card.rarity != null) {
        rarityIds.add(card.rarity);
      }
    });
    return createListCollection({
      items: [
        ...Array.from(rarityIds)
          .map((id) => ({
            value: id.toString(),
            label: rarityMap.get(id) ?? String(id)
          }))
          .sort((b, a) => b.value.localeCompare(a.value))
      ]
    });
  }, [cards, rarityMap]);

  const uniqueCharacters = useMemo(() => {
    if (!cards || !characters) {
      return createListCollection({ items: [] });
    }
    const characterIds = new Set<number>();
    cards.forEach((card) => {
      if (card.charactersId != null) {
        characterIds.add(card.charactersId);
      }
    });
    return createListCollection({
      items: [
        ...Array.from(characterIds)
          .map((id) => ({
            value: id.toString(),
            label: characterMap.get(id) ?? String(id)
          }))
          .sort((b, a) => b.value.localeCompare(a.value))
      ]
    });
  }, [cards, characters, characterMap]);

  const filteredCards = useMemo(() => {
    if (!cards) return [];
    return cards.filter((card) => {
      const rarityMatch =
        selectedRarity === '' || (card.rarity != null && String(card.rarity) === selectedRarity);
      const nameMatch =
        characterNameFilter === '' ||
        card.name?.toLowerCase().includes(characterNameFilter.toLowerCase()) ||
        card.description?.toLowerCase().includes(characterNameFilter.toLowerCase());
      const characterMatch =
        selectedCharacterId === '' ||
        (card.charactersId != null && String(card.charactersId) === selectedCharacterId);
      return rarityMatch && nameMatch && characterMatch;
    });
  }, [cards, selectedRarity, characterNameFilter, selectedCharacterId]);

  const isAnyFilterActive = useMemo(() => {
    return selectedRarity !== '' || characterNameFilter !== '' || selectedCharacterId !== '';
  }, [selectedRarity, characterNameFilter, selectedCharacterId]);

  const resultSummaryText = useMemo(() => {
    if (!cards) {
      return '';
    }
    if (cards.length === 0) {
      return t('no_cards_available_summary', 'No cards available.');
    }

    if (isAnyFilterActive) {
      if (filteredCards.length > 0) {
        return t(
          'filtered_cards_match_summary',
          'Showing {{count}} of {{total}} cards matching your criteria.',
          {
            count: filteredCards.length,
            total: cards.length
          }
        );
      } else {
        return t('no_cards_match_filters_summary', 'No cards match your criteria.');
      }
    } else {
      // No filters active, cards.length > 0.
      // filteredCards.length will be equal to cards.length.
      return t('all_cards_shown_summary', 'Showing all {{count}} cards.', {
        count: cards.length
      });
    }
  }, [cards, filteredCards, isAnyFilterActive, t]);

  return (
    <>
      <Metadata />
      <Stack gap="6" alignItems="center" w="full" py="8" _print={{ display: 'none' }}>
        <Text textAlign="center" fontSize="4xl" fontWeight="bold">
          {t('card_list_header')}
        </Text>
        <HStack
          gap="4"
          alignItems="flex-end"
          w="full"
          maxW="5xl"
          mx="auto"
          px={{ base: '4', md: '0' }}
        >
          <Select.Root
            collection={uniqueRarities}
            value={[selectedRarity]}
            onValueChange={(details) => setSelectedRarity(details.value[0] ?? '')}
            positioning={{ sameWidth: true }}
            flex="1"
          >
            <Select.Label>{t('filter_by_rarity')}</Select.Label>
            <Select.Control>
              <Select.Trigger>
                <Select.ValueText placeholder={t('select_rarity')} />
              </Select.Trigger>
            </Select.Control>
            <Select.Positioner>
              <Select.Content>
                <Select.ItemGroup id="rarity">
                  <Select.Item item="">
                    <Select.ItemText>{t('all_rarities')}</Select.ItemText>
                  </Select.Item>
                  {uniqueRarities.items.map((r) => (
                    <Select.Item key={r.value} item={r}>
                      <Select.ItemText>{r.label}</Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.ItemGroup>
              </Select.Content>
            </Select.Positioner>
          </Select.Root>

          <Select.Root
            collection={uniqueCharacters}
            value={[selectedCharacterId]}
            onValueChange={(details) => setSelectedCharacterId(details.value[0] ?? '')}
            positioning={{ sameWidth: true }}
            flex="1"
          >
            <Select.Label>{t('filter_by_character')}</Select.Label>
            <Select.Control>
              <Select.Trigger>
                <HStack>
                  <styled.object
                    data={getPicUrl(selectedCharacterId ?? 'mob', 'charaIcon')}
                    type="image/webp"
                    objectFit="contain"
                    maxWidth="28px"
                    maxHeight="28px"
                  >
                    <styled.img
                      src={getPicUrl('mob', 'charaSymbol')}
                      alt={`Style`}
                      objectFit="contain"
                      maxHeight="28px"
                    />
                  </styled.object>
                  <Select.ValueText placeholder={t('select_character')} />
                </HStack>
              </Select.Trigger>
            </Select.Control>
            <Select.Positioner>
              <Select.Content>
                <Select.ItemGroup id="character">
                  <Select.Item item="">
                    <Select.ItemText>{t('all_characters')}</Select.ItemText>
                  </Select.Item>
                  {uniqueCharacters.items.map((char) => (
                    <Select.Item key={char.value} item={char}>
                      <Select.ItemText>
                        <HStack>
                          <styled.object
                            data={getPicUrl(char.value ?? 'mob', 'charaIcon')}
                            type="image/webp"
                            objectFit="contain"
                            maxWidth="28px"
                            maxHeight="28px"
                          >
                            <styled.img
                              src={getPicUrl('mob', 'charaSymbol')}
                              alt={`Style`}
                              objectFit="contain"
                              maxHeight="28px"
                            />
                          </styled.object>
                          <Text>{char.label}</Text>
                        </HStack>
                      </Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.ItemGroup>
              </Select.Content>
            </Select.Positioner>
          </Select.Root>

          <Input
            placeholder={t('filter_by_name')}
            value={characterNameFilter}
            onChange={(e) => setCharacterNameFilter(e.target.value)}
            flex="1.5"
          />
        </HStack>

        {resultSummaryText && (
          <Box
            w="full"
            maxW="5xl"
            px={{ base: '4', md: '0' }} // Consistent padding with filters and table container
          >
            <Text color="fg.muted" textAlign="right" fontSize="sm">
              {resultSummaryText}
            </Text>
          </Box>
        )}

        {filteredCards && filteredCards.length > 0 ? (
          <Box
            borderRadius="lg"
            borderWidth="1px"
            w="full"
            maxW="5xl"
            mx="auto"
            p="0"
            overflowX="auto"
          >
            <Table.Root variant="outline" size="md" w="full">
              <Table.Head>
                <Table.Row>
                  <Table.Header>{t('table_header_image')}</Table.Header>
                  <Table.Header textAlign="center">{t('table_header_rarity')}</Table.Header>
                  <Table.Header>{t('table_header_name')}</Table.Header>
                  <Table.Header>{t('table_header_character')}</Table.Header>
                  <Table.Header textAlign="center">{t('table_header_style')}</Table.Header>
                </Table.Row>
              </Table.Head>
              <Table.Body>
                {filteredCards.map((card) => (
                  <Table.Row key={card.id} _hover={{ bg: 'bg.subtle' }}>
                    <Table.Cell>
                      {card.cardSeriesId ? (
                        <styled.img
                          src={getCardUrl(card.cardSeriesId, `${card.cardSeriesId}1`)}
                          alt={``}
                          objectFit="cover"
                          height="50px"
                        />
                      ) : (
                        <></>
                      )}
                    </Table.Cell>
                    <Table.Cell textAlign="center">
                      <Text fontSize="sm">
                        {card.rarity != null ? (rarityMap.get(card.rarity) ?? card.rarity) : '-'}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Link
                        href={`/cards/${card.cardSeriesId}`}
                        _hover={{ textDecoration: 'underline' }}
                      >
                        {card.name}
                      </Link>
                    </Table.Cell>
                    <Table.Cell>
                      <HStack>
                        <styled.object
                          data={getPicUrl(card.charactersId?.toString() ?? 'mob', 'charaSymbol')}
                          type="image/webp"
                          objectFit="contain"
                          maxWidth="28px"
                          maxHeight="28px"
                        >
                          <styled.img
                            src={getPicUrl('mob', 'charaSymbol')}
                            alt={`Style`}
                            objectFit="contain"
                            maxHeight="28px"
                          />
                        </styled.object>
                        <Text>{card.description}</Text>
                      </HStack>
                    </Table.Cell>
                    <Table.Cell textAlign="center">
                      <styled.img
                        src={getPicUrl(card.style?.toString() ?? '0', 'styleIcon')}
                        alt={`Style`}
                        objectFit="contain"
                        maxHeight="28px"
                      />
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
        ) : (
          <Text>{t('no_cards_found')}</Text>
        )}
      </Stack>
    </>
  );
}
