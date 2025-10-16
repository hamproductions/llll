import { useTranslation } from 'react-i18next';
import { useData } from 'vike-react/useData';
import type { PageData } from './+data';
import { Text } from '~/components/ui/text';
import { Metadata } from '~/components/layout/Metadata';
import { Box, Stack } from 'styled-system/jsx';
import { Link } from '~/components/ui/link';
import { Table } from '~/components/ui/table';
import { Button } from '~/components/ui/button';

export function Page() {
  const { t } = useTranslation();
  const { series, chapters, seriesId }: PageData = useData();

  if (!series) {
    return (
      <>
        <Metadata />
        <Stack gap="6" alignItems="center" w="full" py="8">
          <Text fontSize="2xl">{t('story_not_found', 'Story series not found.')}</Text>
          <Link href="/stories">
            <Button>{t('back_to_stories', 'Back to Stories')}</Button>
          </Link>
        </Stack>
      </>
    );
  }

  return (
    <>
      <Metadata />
      <Stack gap="6" alignItems="center" w="full" py="8" _print={{ display: 'none' }}>
        <Stack gap="2" alignItems="center" w="full" maxW="5xl" px={{ base: '4', md: '0' }}>
          <Link href="/stories">
            <Button variant="ghost" size="sm">
              ← {t('back_to_stories', 'Back to Stories')}
            </Button>
          </Link>
          <Text textAlign="center" fontSize="4xl" fontWeight="bold">
            {series.name}
          </Text>
          {series.description && (
            <Text textAlign="center" fontSize="lg" color="fg.muted">
              {series.description}
            </Text>
          )}
        </Stack>

        <Box w="full" maxW="5xl" px={{ base: '4', md: '0' }}>
          <Text fontSize="sm" color="fg.muted" textAlign="right">
            {t('chapter_count', '{{count}} chapters', { count: chapters.length })}
          </Text>
        </Box>

        {chapters && chapters.length > 0 ? (
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
                  <Table.Header>{t('table_header_chapter_name', 'Chapter Name')}</Table.Header>
                  <Table.Header>{t('table_header_part', 'Part')}</Table.Header>
                </Table.Row>
              </Table.Head>
              <Table.Body>
                {chapters.map((chapter) => (
                  <Table.Row key={chapter.id} _hover={{ bg: 'bg.subtle' }}>
                    <Table.Cell>
                      <Link
                        href={`/stories/${seriesId}/${chapter.id}`}
                        _hover={{ textDecoration: 'underline' }}
                      >
                        {chapter.name}
                      </Link>
                    </Table.Cell>
                    <Table.Cell>
                      <Text fontSize="sm" color="fg.muted">
                        {chapter.subTitleName}
                      </Text>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
        ) : (
          <Text>{t('no_chapters_found', 'No chapters found for this story.')}</Text>
        )}
      </Stack>
    </>
  );
}
