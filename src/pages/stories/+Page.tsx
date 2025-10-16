import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useData } from 'vike-react/useData';
import type { PageData } from './+data';
import { Text } from '~/components/ui/text';
import { Metadata } from '~/components/layout/Metadata';
import { Box, Stack, HStack } from 'styled-system/jsx';
import { Link } from '~/components/ui/link';
import { Table } from '~/components/ui/table';
import { Input } from '~/components/ui/input';

export function Page() {
  const { t } = useTranslation();
  const { series }: PageData = useData();
  const [searchFilter, setSearchFilter] = useState<string>('');

  const filteredSeries = useMemo(() => {
    if (!series) return [];
    return series.filter((story) => {
      const nameMatch =
        searchFilter === '' ||
        story.name?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        story.description?.toLowerCase().includes(searchFilter.toLowerCase());
      return nameMatch;
    });
  }, [series, searchFilter]);

  const isFilterActive = useMemo(() => {
    return searchFilter !== '';
  }, [searchFilter]);

  const resultSummaryText = useMemo(() => {
    if (!series) {
      return '';
    }
    if (series.length === 0) {
      return t('no_stories_available', 'No stories available.');
    }

    if (isFilterActive) {
      if (filteredSeries.length > 0) {
        return t(
          'filtered_stories_summary',
          'Showing {{count}} of {{total}} stories matching your criteria.',
          {
            count: filteredSeries.length,
            total: series.length
          }
        );
      } else {
        return t('no_stories_match_filters', 'No stories match your criteria.');
      }
    } else {
      return t('all_stories_shown', 'Showing all {{count}} stories.', {
        count: series.length
      });
    }
  }, [series, filteredSeries, isFilterActive, t]);

  return (
    <>
      <Metadata />
      <Stack gap="6" alignItems="center" w="full" py="8" _print={{ display: 'none' }}>
        <Text textAlign="center" fontSize="4xl" fontWeight="bold">
          {t('story_list_header', 'Stories')}
        </Text>
        <HStack
          gap="4"
          alignItems="flex-end"
          w="full"
          maxW="5xl"
          mx="auto"
          px={{ base: '4', md: '0' }}
        >
          <Input
            placeholder={t('filter_by_name', 'Filter by name...')}
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            flex="1"
          />
        </HStack>

        {resultSummaryText && (
          <Box w="full" maxW="5xl" px={{ base: '4', md: '0' }}>
            <Text color="fg.muted" textAlign="right" fontSize="sm">
              {resultSummaryText}
            </Text>
          </Box>
        )}

        {filteredSeries && filteredSeries.length > 0 ? (
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
                  <Table.Header>{t('table_header_name', 'Name')}</Table.Header>
                  <Table.Header>{t('table_header_description', 'Description')}</Table.Header>
                </Table.Row>
              </Table.Head>
              <Table.Body>
                {filteredSeries.map((story) => (
                  <Table.Row key={story.id} _hover={{ bg: 'bg.subtle' }}>
                    <Table.Cell>
                      <Link href={`/stories/${story.id}`} _hover={{ textDecoration: 'underline' }}>
                        {story.name}
                      </Link>
                    </Table.Cell>
                    <Table.Cell>
                      <Text fontSize="sm" color="fg.muted">
                        {story.description}
                      </Text>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
        ) : (
          <Text>{t('no_stories_found', 'No stories found.')}</Text>
        )}
      </Stack>
    </>
  );
}
