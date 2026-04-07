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
import { getAlbumArtPublicPath, getMusicTrackUrl } from '~/utils/assets';
import { formatDuration } from '~/utils/assetFormat';
import type { PageData } from './+data';

export function Page() {
  const { t } = useTranslation();
  const { songs } = useData<PageData>();
  const [query, setQuery] = useState('');
  const [unitFilter, setUnitFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 24;

  const unitOptions = useMemo(
    () =>
      createListCollection({
        items: Array.from(new Set(songs.map((song) => song.unitName).filter(Boolean)))
          .sort((a, b) => String(a).localeCompare(String(b)))
          .map((unitName) => ({
            label: unitName!,
            value: unitName!
          }))
      }),
    [songs]
  );

  const filteredSongs = useMemo(() => {
    const normalizedQuery = query.toLowerCase();

    return songs.filter((song) => {
      const matchesQuery =
        normalizedQuery === '' ||
        (song.title ?? '').toLowerCase().includes(normalizedQuery) ||
        (song.description ?? '').toLowerCase().includes(normalizedQuery) ||
        (song.centerCharacterName ?? '').toLowerCase().includes(normalizedQuery) ||
        String(song.id).includes(normalizedQuery);

      return matchesQuery && (unitFilter === '' || song.unitName === unitFilter);
    });
  }, [query, songs, unitFilter]);

  const totalPages = Math.ceil(filteredSongs.length / pageSize);
  const pageSongs = filteredSongs.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [query, unitFilter]);

  return (
    <>
      <Metadata title="Songs" />
      <Stack gap="6" alignItems="center" w="full" py="8" _print={{ display: 'none' }}>
        <Stack gap="2" alignItems="center" w="full" maxW="6xl" px={{ base: '4', md: '0' }}>
          <Text textAlign="center" fontSize={{ base: '3xl', md: '4xl' }} fontWeight="black">
            {t('song_list_header', 'Songs')}
          </Text>
          <Text color="fg.muted" textAlign="center" maxW="2xl">
            {t(
              'song_list_description',
              'Browse the full song catalog with album art and audio previews.'
            )}
          </Text>
        </Stack>

        <HStack
          gap="4"
          alignItems="flex-end"
          w="full"
          maxW="6xl"
          mx="auto"
          px={{ base: '4', md: '0' }}
          flexWrap="wrap"
        >
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('filter_songs', 'Search songs...')}
            flex="1"
            minW={{ base: 'full', md: '320px' }}
          />
          <Select.Root
            collection={unitOptions}
            value={[unitFilter]}
            onValueChange={(details) => setUnitFilter(details.value[0] ?? '')}
            positioning={{ sameWidth: true }}
            width={{ base: 'full', md: '240px' }}
          >
            <Select.Label>{t('unit', 'Unit')}</Select.Label>
            <Select.Control>
              <Select.Trigger>
                <Select.ValueText placeholder={t('all_units', 'All units')} />
              </Select.Trigger>
            </Select.Control>
            <Select.Positioner>
              <Select.Content>
                {unitOptions.items.map((option) => (
                  <Select.Item key={option.value} item={option}>
                    <Select.ItemText>{option.label}</Select.ItemText>
                    <Select.ItemIndicator>✓</Select.ItemIndicator>
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Select.Root>
        </HStack>

        <Box w="full" maxW="6xl" px={{ base: '4', md: '0' }}>
          <Text color="fg.muted" textAlign="right" fontSize="sm">
            {t('filtered_songs_summary', 'Showing {{count}} of {{total}} songs.', {
              count: filteredSongs.length,
              total: songs.length
            })}
          </Text>
        </Box>

        <Grid
          gridTemplateColumns={{ base: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))', xl: 'repeat(4, minmax(0, 1fr))' }}
          gap="4"
          w="full"
          maxW="6xl"
          px={{ base: '4', md: '0' }}
        >
          {pageSongs.map((song) => (
            <Card.Root key={song.id} overflow="hidden" borderRadius="2xl">
              <styled.img
                src={getAlbumArtPublicPath(song.id)}
                alt={song.title ?? `Song ${song.id}`}
                w="full"
                aspectRatio="1 / 1"
                objectFit="cover"
              />
              <Card.Body p="4">
                <Stack gap="3">
                  <Stack gap="1">
                    <Text fontWeight="bold" fontSize="lg" lineClamp="2">
                      {song.title}
                    </Text>
                    <Text color="fg.muted" fontSize="sm">
                      {[song.unitName, formatDuration(song.songTime)].filter(Boolean).join(' • ')}
                    </Text>
                  </Stack>
                  {song.centerCharacterId && song.centerCharacterName ? (
                    <Link href={`/characters/${song.centerCharacterId}`}>
                      <Text fontWeight="medium">{song.centerCharacterName}</Text>
                    </Link>
                  ) : null}
                  <styled.audio
                    controls
                    loop
                    preload="none"
                    src={song.soundId ? getMusicTrackUrl(song.soundId) : undefined}
                    style={{ width: '100%' }}
                  />
                </Stack>
              </Card.Body>
            </Card.Root>
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
