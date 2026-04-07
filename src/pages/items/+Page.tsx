import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useData } from 'vike-react/useData';
import { Box, Grid, HStack, Stack, styled } from 'styled-system/jsx';
import { Metadata } from '~/components/layout/Metadata';
import { Input } from '~/components/ui/input';
import { Text } from '~/components/ui/text';
import { getItemIconUrl } from '~/utils/assets';
import type { PageData } from './+data';

const RARITY_COLORS: Record<number, string> = {
  1: '#9ca3af',
  2: '#34d399',
  3: '#60a5fa',
  4: '#c084fc',
  5: '#fb923c'
};

type CategoryPreset = {
  label: string;
  filter: (item: { itemCategory: number | null; itemType: number | null }) => boolean;
};

const CATEGORY_PRESETS: Record<string, CategoryPreset> = {
  featured: {
    label: 'items_category_featured',
    filter: (item) => !(item.itemCategory === 0 && (item.itemType === 4 || item.itemType === 8))
  },
  gifts: {
    label: 'items_category_gifts',
    filter: (item) => item.itemCategory === 2
  },
  materials: {
    label: 'items_category_materials',
    filter: (item) => item.itemCategory === 1
  },
  tickets: {
    label: 'items_category_tickets',
    filter: (item) => item.itemCategory === 3
  },
  rankings: {
    label: 'items_category_rankings',
    filter: (item) => item.itemCategory === 0 && item.itemType === 10
  },
  all: {
    label: 'items_category_all',
    filter: () => true
  }
};

function ItemIcon({ id, name, rarity }: { id: number; name: string | null; rarity: number | null }) {
  const [loaded, setLoaded] = useState(false);
  const borderColor = rarity != null ? RARITY_COLORS[rarity] ?? '#9ca3af' : '#9ca3af';

  return (
    <Box
      position="relative"
      w="full"
      aspectRatio="1"
      bg="bg.subtle"
      borderRadius="lg"
      overflow="hidden"
      style={{ borderLeft: `3px solid ${borderColor}` }}
    >
      {!loaded && (
        <Box
          position="absolute"
          inset="0"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Text color="fg.muted" fontSize="xs" textAlign="center" px="1" lineClamp="2">
            {name ?? 'Item'}
          </Text>
        </Box>
      )}
      <styled.img
        src={getItemIconUrl(id)}
        alt={name ?? `Item ${id}`}
        position="absolute"
        inset="0"
        w="full"
        h="full"
        objectFit="contain"
        opacity={loaded ? 1 : 0}
        onLoad={() => setLoaded(true)}
        onError={() => {}}
      />
    </Box>
  );
}

export function Page() {
  const { t } = useTranslation();
  const { items } = useData<PageData>();
  const [query, setQuery] = useState('');
  const [activePreset, setActivePreset] = useState('featured');
  const [page, setPage] = useState(1);
  const pageSize = 60;

  const presetCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const [key, preset] of Object.entries(CATEGORY_PRESETS)) {
      counts[key] = items.filter(preset.filter).length;
    }
    return counts;
  }, [items]);

  const filteredItems = useMemo(() => {
    const preset = CATEGORY_PRESETS[activePreset] ?? CATEGORY_PRESETS.featured;
    const normalizedQuery = query.trim().toLowerCase();

    return items.filter((item) => {
      if (!preset.filter(item)) return false;
      if (normalizedQuery === '') return true;
      return [item.name, item.description]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalizedQuery));
    });
  }, [items, query, activePreset]);

  const totalPages = Math.ceil(filteredItems.length / pageSize);
  const pageItems = filteredItems.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [query, activePreset]);

  return (
    <>
      <Metadata title="Items" />
      <Stack gap="6" alignItems="center" w="full" py="8">
        <Stack gap="2" alignItems="center" w="full" maxW="6xl" px={{ base: '4', md: '0' }}>
          <Text textAlign="center" fontSize="4xl" fontWeight="bold">
            {t('items_header', 'Items')}
          </Text>
          <Text color="fg.muted" textAlign="center" maxW="3xl">
            {t('items_description', 'In-game items, materials, and collectibles')}
          </Text>
        </Stack>

        <Stack gap="3" w="full" maxW="6xl" px={{ base: '4', md: '0' }}>
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('filter_items', 'Search items...')}
          />
          <HStack gap="2" flexWrap="wrap">
            {Object.entries(CATEGORY_PRESETS).map(([key, preset]) => (
              <Box
                key={key}
                as="button"
                px="3"
                py="1"
                borderRadius="full"
                borderWidth="1px"
                fontSize="sm"
                cursor="pointer"
                bg={activePreset === key ? 'bg.subtle' : 'transparent'}
                fontWeight={activePreset === key ? 'bold' : 'normal'}
                onClick={() => setActivePreset(key)}
              >
                {t(preset.label)} ({presetCounts[key]})
              </Box>
            ))}
          </HStack>
        </Stack>

        <Text color="fg.muted" fontSize="sm">
          {filteredItems.length} {t('items_count', 'items')}
        </Text>

        <Grid
          gridTemplateColumns={{
            base: 'repeat(3, minmax(0, 1fr))',
            sm: 'repeat(4, minmax(0, 1fr))',
            md: 'repeat(5, minmax(0, 1fr))',
            lg: 'repeat(6, minmax(0, 1fr))',
            xl: 'repeat(8, minmax(0, 1fr))'
          }}
          gap="3"
          w="full"
          maxW="6xl"
          px={{ base: '4', md: '0' }}
        >
          {pageItems.map((item) => (
            <Stack key={item.id} gap="1" alignItems="center">
              <ItemIcon id={item.id} name={item.name} rarity={item.rarity} />
              <Text fontSize="xs" lineClamp="2" textAlign="center" w="full">
                {item.name}
              </Text>
            </Stack>
          ))}
        </Grid>

        {filteredItems.length === 0 && (
          <Text color="fg.muted" py="12">
            {t('no_items_found', 'No items found')}
          </Text>
        )}

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
