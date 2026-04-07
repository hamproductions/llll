import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useData } from 'vike-react/useData';
import { Box, Grid, HStack, Stack, styled } from 'styled-system/jsx';
import { Metadata } from '~/components/layout/Metadata';
import { Input } from '~/components/ui/input';
import { Link } from '~/components/ui/link';
import { Text } from '~/components/ui/text';
import { getGachaBannerImageUrl } from '~/utils/assets';
import type { PageData } from './+data';


const SEASON_ORDER = ['SPRING', 'SUMMER', 'AUTUMN', 'WINTER', 'BIRTHDAY', 'GRADUATION', 'PARTY', 'ANNIVERSARY', 'HALLOWEEN', 'OTHER'] as const;
const SEASON_LABELS: Record<string, string> = {
  SPRING: 'Spring',
  SUMMER: 'Summer',
  AUTUMN: 'Autumn',
  WINTER: 'Winter',
  BIRTHDAY: 'Birthday',
  GRADUATION: 'Graduation',
  PARTY: 'Party',
  ANNIVERSARY: 'Anniversary',
  HALLOWEEN: 'Halloween',
  OTHER: 'Other',
};

export function Page() {
  const { t } = useTranslation();
  const { gachas, seasonCounts } = useData<PageData>();
  const [query, setQuery] = useState('');
  const [seasonFilter, setSeasonFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 24;

  const seasons = useMemo(
    () => SEASON_ORDER.filter((s) => (seasonCounts[s] ?? 0) > 0),
    [seasonCounts]
  );

  const filteredGachas = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return gachas.filter((gacha) => {
      if (seasonFilter && gacha.season !== seasonFilter) return false;

      if (normalizedQuery === '') return true;

      return [
        gacha.name,
        gacha.description,
        ...gacha.pickupCards.map((card) => card?.name),
        ...gacha.pickupCards.map((card) => card?.characterName),
        String(gacha.id)
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalizedQuery));
    });
  }, [gachas, query, seasonFilter]);

  useEffect(() => { setPage(1); }, [query, seasonFilter]);

  const totalPages = Math.ceil(filteredGachas.length / pageSize);
  const pageGachas = filteredGachas.slice((page - 1) * pageSize, page * pageSize);

  return (
    <>
      <Metadata title="Gacha" />
      <Stack gap="6" alignItems="center" w="full" py="8" _print={{ display: 'none' }}>
        <Stack gap="2" alignItems="center" w="full" maxW="6xl" px={{ base: '4', md: '0' }}>
          <Text textAlign="center" fontSize="4xl" fontWeight="bold">
            {t('gacha_list_header', 'Gacha')}
          </Text>
          <Text color="fg.muted" textAlign="center" maxW="3xl">
            {t('gacha_list_description', 'Browse all gacha banners and their featured cards.')}
          </Text>
        </Stack>

        <HStack gap="2" flexWrap="wrap" justifyContent="center" w="full" maxW="6xl" px={{ base: '4', md: '0' }}>
          <Box
            as="button"
            px="3"
            py="1.5"
            borderRadius="full"
            fontSize="sm"
            cursor="pointer"
            fontWeight={seasonFilter === '' ? 'bold' : 'normal'}
            bg={seasonFilter === '' ? 'bg.emphasized' : 'transparent'}
            borderWidth="1px"
            borderColor={seasonFilter === '' ? 'border.default' : 'border.default'}
            onClick={() => setSeasonFilter('')}
          >
            All ({gachas.length})
          </Box>
          {seasons.map((season) => (
            <Box
              key={season}
              as="button"
              px="3"
              py="1.5"
              borderRadius="full"
              fontSize="sm"
              cursor="pointer"
              fontWeight={seasonFilter === season ? 'bold' : 'normal'}
              bg={seasonFilter === season ? 'bg.emphasized' : 'transparent'}
              borderWidth="1px"
              borderColor="border.default"
              onClick={() => setSeasonFilter(seasonFilter === season ? '' : season)}
            >
              {SEASON_LABELS[season] ?? season} ({seasonCounts[season] ?? 0})
            </Box>
          ))}
        </HStack>

        <Stack w="full" maxW="6xl" px={{ base: '4', md: '0' }}>
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('filter_gacha', 'Search by name, card, or character…')}
          />
        </Stack>

        <Box w="full" maxW="6xl" px={{ base: '4', md: '0' }}>
          <Text color="fg.muted" textAlign="right" fontSize="sm">
            {filteredGachas.length} of {gachas.length}
          </Text>
        </Box>

        <Grid
          gridTemplateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' }}
          gap="3"
          w="full"
          maxW="6xl"
          px={{ base: '4', md: '0' }}
        >
          {pageGachas.map((gacha, index) => (
            <Link
              key={gacha.id}
              href={`/gacha/${gacha.id}`}
              display="block"
              borderRadius="xl"
              overflow="hidden"
              transition="all 0.2s"
              _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
            >
              <styled.img
                src={getGachaBannerImageUrl(gacha.id)}
                alt={gacha.name ?? ''}
                w="full"
                display="block"
              />
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
