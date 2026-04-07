import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useData } from 'vike-react/useData';
import { Box, Grid, HStack, Stack, styled } from 'styled-system/jsx';
import { Metadata } from '~/components/layout/Metadata';
import { Input } from '~/components/ui/input';
import { Link } from '~/components/ui/link';
import { Text } from '~/components/ui/text';
import { getStoryMonthlyImageUrl, getStoryPartImageUrl } from '~/utils/assets';
import type { PageData } from './+data';


export function Page() {
  const { t } = useTranslation();
  const { series } = useData<PageData>();
  const [searchFilter, setSearchFilter] = useState('');

  const [page, setPage] = useState(1);
  const pageSize = 12;

  const filteredSeries = useMemo(() => {
    const normalizedFilter = searchFilter.trim().toLowerCase();

    return series.filter((story) => {
      if (normalizedFilter === '') {
        return true;
      }

      return [story.name, story.description, story.firstChapterName, String(story.id)]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalizedFilter));
    });
  }, [searchFilter, series]);

  const totalPages = Math.ceil(filteredSeries.length / pageSize);
  const pageStories = filteredSeries.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [searchFilter]);

  return (
    <>
      <Metadata />
      <Stack gap="6" alignItems="center" w="full" py="8" _print={{ display: 'none' }}>
        <Stack gap="2" alignItems="center" w="full" maxW="6xl" px={{ base: '4', md: '0' }}>
          <Text textAlign="center" fontSize="4xl" fontWeight="bold">
            {t('story_list_header', 'Stories')}
          </Text>
          <Text color="fg.muted" textAlign="center" maxW="3xl">
            {t(
              'story_list_description',
              'Browse story arcs and read every chapter from the beginning.'
            )}
          </Text>
        </Stack>

        <HStack gap="4" w="full" maxW="6xl" px={{ base: '4', md: '0' }}>
          <Input
            placeholder={t('filter_stories', 'Search stories...')}
            value={searchFilter}
            onChange={(event) => setSearchFilter(event.target.value)}
          />
        </HStack>

        <Box w="full" maxW="6xl" px={{ base: '4', md: '0' }}>
          <Text color="fg.muted" textAlign="right" fontSize="sm">
            {t('filtered_stories_summary', 'Showing {{count}} of {{total}} stories.', {
              count: filteredSeries.length,
              total: series.length
            })}
          </Text>
        </Box>

        <Grid
          gridTemplateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
          gap="4"
          w="full"
          maxW="6xl"
          px={{ base: '4', md: '0' }}
        >
          {pageStories.map((story) => {
            const heroScriptId = story.firstChapterScriptId ?? story.latestChapterScriptId;
            const coverUrl = getStoryMonthlyImageUrl(story.id);
            const fallbackUrl = heroScriptId ? getStoryPartImageUrl(heroScriptId) : undefined;

            return (
              <Link
                key={story.id}
                href={`/stories/${story.id}`}
                display="block"
                borderRadius="xl"
                overflow="hidden"
                transition="all 0.2s"
                _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
              >
                <Box overflow="hidden" borderRadius="xl" bg="bg.subtle">
                  <styled.img
                    src={coverUrl}
                    alt={story.name ?? ''}
                    w="full"
                    display="block"
                    onError={(e) => {
                      const img = e.currentTarget;
                      if (fallbackUrl && !img.dataset.triedFallback) {
                        img.dataset.triedFallback = '1';
                        img.src = fallbackUrl;
                      }
                    }}
                  />
                  <Box p="3">
                    <Stack gap="1">
                      <Text fontSize={{ base: 'sm', md: 'md' }} fontWeight="bold" lineClamp="2">
                        {story.name}
                      </Text>
                      <Text color="fg.muted" fontSize="xs">
                        {story.chapterCount} {t('parts', 'Parts')}
                      </Text>
                    </Stack>
                  </Box>
                </Box>
              </Link>
            );
          })}
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
