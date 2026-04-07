import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useData } from 'vike-react/useData';
import { Box, Grid, HStack, Stack, styled } from 'styled-system/jsx';
import { Metadata } from '~/components/layout/Metadata';
import { Card } from '~/components/ui/card';
import { Dialog } from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Link } from '~/components/ui/link';
import { createListCollection, Select } from '~/components/ui/select';
import { Text } from '~/components/ui/text';
import { getPicUrl, getStickerImageUrl } from '~/utils/assets';
import type { PageData } from './+data';

function StickerArtwork({ id, name }: { id: number; name: string | null }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <Stack gap="2" alignItems="center">
        <Text fontWeight="bold">#{id}</Text>
        <Text color="fg.muted" textAlign="center">
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
  const { stickers } = useData<PageData>();
  const [query, setQuery] = useState('');
  const [characterFilter, setCharacterFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'recommended' | 'all' | 'unlock' | 'campaign' | 'milestone' | 'legacy'>('recommended');
  const [page, setPage] = useState(1);
  const [selectedStickerId, setSelectedStickerId] = useState<number | null>(null);
  const pageSize = 48;

  const characterOptions = useMemo(
    () =>
      createListCollection({
        items: Array.from(
          new Set(stickers.map((sticker) => sticker.characterName).filter(Boolean))
        )
          .sort((a, b) => String(a).localeCompare(String(b)))
          .map((characterName) => ({
            label: characterName!,
            value: characterName!
          }))
      }),
    [stickers]
  );

  const filteredStickers = useMemo(() => {
    const normalizedQuery = query.toLowerCase();

    return stickers.filter((sticker) => {
      const name = sticker.name ?? '';
      const text = sticker.text ?? '';
      const matchesQuery =
        normalizedQuery === '' ||
        name.toLowerCase().includes(normalizedQuery) ||
        text.toLowerCase().includes(normalizedQuery) ||
        (sticker.requirementText ?? '').toLowerCase().includes(normalizedQuery) ||
        sticker.assetLabel.toLowerCase().includes(normalizedQuery);

      const matchesCharacter = characterFilter === '' || sticker.characterName === characterFilter;
      const matchesCategory =
        categoryFilter === 'all' ||
        (categoryFilter === 'recommended' && sticker.categoryName !== 4) ||
        (categoryFilter === 'unlock' && sticker.categoryName === 2) ||
        (categoryFilter === 'campaign' && sticker.categoryName === 3) ||
        (categoryFilter === 'milestone' && sticker.categoryName === 1) ||
        (categoryFilter === 'legacy' && sticker.categoryName === 4);

      return matchesQuery && matchesCharacter && matchesCategory;
    });
  }, [categoryFilter, characterFilter, query, stickers]);
  const pageCount = Math.max(1, Math.ceil(filteredStickers.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleStickers = filteredStickers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const selectedSticker =
    stickers.find((sticker) => sticker.id === selectedStickerId) ?? null;

  return (
    <>
      <Metadata title="Stickers" />
      <Stack gap="6" alignItems="center" w="full" py="8" _print={{ display: 'none' }}>
        <Stack gap="2" alignItems="center" w="full" maxW="6xl" px={{ base: '4', md: '0' }}>
          <Text textAlign="center" fontSize={{ base: '3xl', md: '4xl' }} fontWeight="black">
            {t('stickers', 'Stickers')}
          </Text>
          <Text color="fg.muted" textAlign="center" maxW="2xl">
            {t(
              'sticker_page_description',
              'A compact sticker wall. Click a sticker to open the details.'
            )}
          </Text>
        </Stack>

        <HStack
          gap="3"
          alignItems="flex-end"
          w="full"
          maxW="6xl"
          px={{ base: '4', md: '0' }}
          flexWrap="wrap"
        >
          <Input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder={t('filter_stickers', 'Search stickers...')}
            flex="1"
            minW={{ base: 'full', md: '320px' }}
          />
          <Select.Root
            collection={characterOptions}
            value={[characterFilter]}
            onValueChange={(details) => {
              setCharacterFilter(details.value[0] ?? '');
              setPage(1);
            }}
            positioning={{ sameWidth: true }}
            width={{ base: 'full', md: '280px' }}
          >
            <Select.Label>{t('filter_by_character')}</Select.Label>
            <Select.Control>
              <Select.Trigger>
                <Select.ValueText placeholder={t('all_characters', 'All characters')} />
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
        </HStack>

        <HStack w="full" maxW="6xl" px={{ base: '4', md: '0' }} gap="2" flexWrap="wrap">
          {[
            ['recommended', t('sticker_filter_recommended', 'Recommended')],
            ['unlock', t('sticker_filter_unlock', 'Card Unlock')],
            ['campaign', t('sticker_filter_campaign', 'Campaign')],
            ['milestone', t('sticker_filter_milestone', 'Milestone')],
            ['legacy', t('sticker_filter_legacy', 'Legacy')],
            ['all', t('sticker_filter_all', 'All')]
          ].map(([value, label]) => (
            <styled.button
              key={value}
              type="button"
              onClick={() => {
                setCategoryFilter(value as typeof categoryFilter);
                setPage(1);
              }}
              style={{
                borderRadius: '999px',
                padding: '0.45rem 0.8rem',
                border: '1px solid var(--colors-border-default)',
                background:
                  categoryFilter === value ? 'var(--colors-bg-subtle)' : 'transparent'
              }}
            >
              {label}
            </styled.button>
          ))}
        </HStack>

        <HStack w="full" maxW="6xl" px={{ base: '4', md: '0' }} justifyContent="space-between" flexWrap="wrap" gap="3">
          <Text color="fg.muted" fontSize="sm">
            {t('filtered_stickers_summary', 'Showing {{count}} of {{total}} stickers.', {
              count: filteredStickers.length,
              total: stickers.length
            })}
          </Text>
          <HStack gap="2">
            <Text color="fg.muted" fontSize="sm">
              {currentPage} / {pageCount}
            </Text>
            <styled.button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={currentPage === 1}
            >
              {t('previous', 'Previous')}
            </styled.button>
            <styled.button
              type="button"
              onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
              disabled={currentPage === pageCount}
            >
              {t('next', 'Next')}
            </styled.button>
          </HStack>
        </HStack>

        <Grid
          gridTemplateColumns={{ base: 'repeat(3, minmax(0, 1fr))', md: 'repeat(5, minmax(0, 1fr))', xl: 'repeat(7, minmax(0, 1fr))' }}
          gap="3"
          w="full"
          maxW="6xl"
          px={{ base: '4', md: '0' }}
        >
          {visibleStickers.map((sticker) => (
            <Card.Root
              key={sticker.id}
              overflow="hidden"
              borderRadius="xl"
              cursor="pointer"
              onClick={() => setSelectedStickerId(sticker.id)}
            >
              <Box
                aspectRatio="1 / 1"
                bg="bg.subtle"
                display="flex"
                alignItems="center"
                justifyContent="center"
                p="4"
              >
                <StickerArtwork id={sticker.id} name={sticker.name} />
              </Box>

              <Card.Body p="3">
                <Stack gap="1">
                  <Text fontSize="sm" fontWeight="bold" lineClamp="2">
                    {sticker.name}
                  </Text>
                  {sticker.characterName ? (
                    <Text color="fg.muted" fontSize="xs" lineClamp="1">
                      {sticker.characterName}
                    </Text>
                  ) : (
                    <Text color="fg.muted" fontSize="xs" lineClamp="1">
                      {sticker.categoryLabel}
                    </Text>
                  )}
                </Stack>
              </Card.Body>
            </Card.Root>
          ))}
        </Grid>

        <Dialog.Root
          open={Boolean(selectedSticker)}
          onOpenChange={(details) => {
            if (!details.open) {
              setSelectedStickerId(null);
            }
          }}
        >
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              {selectedSticker ? (
                <Stack gap="4" p="6">
                  <Box aspectRatio="1 / 1" bg="bg.subtle" borderRadius="xl" display="flex" alignItems="center" justifyContent="center" p="6">
                    <StickerArtwork id={selectedSticker.id} name={selectedSticker.name} />
                  </Box>
                  <Stack gap="2">
                    <Dialog.Title>{selectedSticker.name}</Dialog.Title>
                    {selectedSticker.characterName ? (
                      <HStack gap="2">
                        <styled.img
                          src={getPicUrl(String(selectedSticker.charactersId), 'charaSymbol')}
                          alt={selectedSticker.characterName}
                          w="24px"
                          h="24px"
                        />
                        <Link href={`/characters/${selectedSticker.charactersId}`}>
                          <Text fontWeight="medium">{selectedSticker.characterName}</Text>
                        </Link>
                      </HStack>
                    ) : null}
                    {selectedSticker.text ? <Text>{selectedSticker.text}</Text> : null}
                    {selectedSticker.requirementText ? (
                      <Box p="3" borderRadius="lg" bg="bg.subtle">
                        <Text fontSize="sm">{selectedSticker.requirementText}</Text>
                      </Box>
                    ) : null}
                  </Stack>
                </Stack>
              ) : null}
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>
      </Stack>
    </>
  );
}
