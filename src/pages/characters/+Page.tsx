import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useData } from 'vike-react/useData';
import { Box, Grid, HStack, Stack, styled } from 'styled-system/jsx';
import { createListCollection, Select } from '~/components/ui/select';
import { Input } from '~/components/ui/input';
import { Link } from '~/components/ui/link';
import { Metadata } from '~/components/layout/Metadata';
import { Text } from '~/components/ui/text';
import { getCardImageUrl, getPicUrl } from '~/utils/assets';
import type { PageData } from './+data';

export function Page() {
  const { t } = useTranslation();
  const { characters } = useData<PageData>();
  const [query, setQuery] = useState('');
  const [generationFilter, setGenerationFilter] = useState('');

  const generationOptions = useMemo(
    () =>
      createListCollection({
        items: Array.from(
          new Set(characters.map((character) => character.generationName).filter(Boolean))
        )
          .sort((a, b) => String(a).localeCompare(String(b)))
          .map((generationName) => ({
            label: generationName!,
            value: generationName!
          }))
      }),
    [characters]
  );

  const filteredCharacters = useMemo(() => {
    const normalizedQuery = query.toLowerCase();

    return characters.filter((character) => {
      const queryMatch =
        normalizedQuery === '' ||
        character.displayLabel.toLowerCase().includes(normalizedQuery) ||
        (character.introduction ?? '').toLowerCase().includes(normalizedQuery);
      const generationMatch =
        generationFilter === '' || character.generationName === generationFilter;

      return queryMatch && generationMatch;
    });
  }, [characters, generationFilter, query]);

  return (
    <>
      <Metadata title="Characters" />
      <Stack gap="6" alignItems="center" w="full" py="8" _print={{ display: 'none' }}>
        <Text textAlign="center" fontSize="4xl" fontWeight="bold">
          {t('character_list_header', 'Characters')}
        </Text>
        <HStack
          gap="4"
          alignItems="flex-end"
          w="full"
          maxW="5xl"
          mx="auto"
          px={{ base: '4', md: '0' }}
          flexWrap="wrap"
        >
          <Input
            placeholder={t('filter_characters', 'Search characters...')}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            flex="1"
            minW={{ base: 'full', md: '320px' }}
          />
          <Select.Root
            collection={generationOptions}
            value={[generationFilter]}
            onValueChange={(details) => setGenerationFilter(details.value[0] ?? '')}
            positioning={{ sameWidth: true }}
            width={{ base: 'full', md: '240px' }}
          >
            <Select.Label>{t('filter_by_generation', 'Generation')}</Select.Label>
            <Select.Control>
              <Select.Trigger>
                <Select.ValueText placeholder={t('all_generations', 'All generations')} />
              </Select.Trigger>
            </Select.Control>
            <Select.Positioner>
              <Select.Content>
                {generationOptions.items.map((option) => (
                  <Select.Item key={option.value} item={option}>
                    <Select.ItemText>{option.label}</Select.ItemText>
                    <Select.ItemIndicator>✓</Select.ItemIndicator>
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Select.Root>
        </HStack>

        <Box w="full" maxW="5xl" px={{ base: '4', md: '0' }}>
          <Text color="fg.muted" textAlign="right" fontSize="sm">
            {t('filtered_characters_summary', 'Showing {{count}} of {{total}} characters.', {
              count: filteredCharacters.length,
              total: characters.length
            })}
          </Text>
        </Box>

        <Grid
          gridTemplateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', xl: 'repeat(4, 1fr)' }}
          gap="4"
          w="full"
          maxW="5xl"
          px={{ base: '4', md: '0' }}
        >
          {filteredCharacters.map((character) => (
            <Link key={character.id} href={`/characters/${character.id}`}>
              <Box
                overflow="hidden"
                borderRadius="2xl"
                borderWidth="1px"
                borderColor="border.default"
                transition="all 0.15s"
                cursor="pointer"
                _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
              >
                {character.representativeCardSeriesId ? (
                  <styled.img
                    src={getCardImageUrl(character.representativeCardSeriesId, 1)}
                    alt={character.displayLabel}
                    w="full"
                    display="block"
                    bg="bg.subtle"
                  />
                ) : (
                  <Box
                    w="full"
                    aspectRatio="16 / 9"
                    bg={character.themeColor ? `linear-gradient(135deg, ${character.themeColor}33, ${character.themeColor}11)` : 'bg.subtle'}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <styled.img
                      src={getPicUrl(String(character.id), 'charaSymbol')}
                      alt={character.displayLabel}
                      w="64px"
                      h="64px"
                      opacity="0.6"
                    />
                  </Box>
                )}
                <Stack gap="0" p="3">
                  <Text fontWeight="bold" lineClamp="1">
                    {character.displayLabel}
                  </Text>
                  <Text color="fg.muted" fontSize="sm">
                    {[`${character.cardCount} ${t('cards', 'Cards')}`, character.generationName].filter(Boolean).join(' · ')}
                  </Text>
                </Stack>
              </Box>
            </Link>
          ))}
        </Grid>
      </Stack>
    </>
  );
}
