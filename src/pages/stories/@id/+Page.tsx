import { useTranslation } from 'react-i18next';
import { useData } from 'vike-react/useData';
import { Box, HStack, Stack, styled } from 'styled-system/jsx';
import { Metadata } from '~/components/layout/Metadata';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import { Link } from '~/components/ui/link';
import { Text } from '~/components/ui/text';
import { getStoryMonthlyImageUrl, getStoryPartImageUrl, getStoryThumbnailUrl } from '~/utils/assets';

import type { PageData } from './+data';

const formatPartTitle = (value: string | null, index: number, fallback: string) => {
  if (!value) {
    return `${fallback} ${index + 1}`;
  }

  return /^\d+$/.test(value) ? `${fallback} ${value}` : value;
};

export function Page() {
  const { t } = useTranslation();
  const { series, chapters, seriesId, leadScriptId }: PageData = useData();

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
        <Stack gap="4" w="full" maxW="6xl" px={{ base: '4', md: '0' }}>
          <Link href="/stories">
            <Button variant="ghost" size="sm">
              ← {t('back_to_stories', 'Back to Stories')}
            </Button>
          </Link>

          <Card.Root overflow="hidden" borderRadius="2xl">
            <Box position="relative" h={{ base: '280px', md: '360px' }}>
              {leadScriptId ? (
                <styled.img
                  src={getStoryMonthlyImageUrl(series.id)}
                  alt={series.name ?? `Story ${series.id}`}
                  position="absolute"
                  inset="0"
                  w="full"
                  h="full"
                  objectFit="cover"
                  onError={(e) => {
                    const img = e.currentTarget;
                    const fallback = getStoryPartImageUrl(leadScriptId);
                    if (img.src !== fallback) {
                      img.src = fallback;
                    }
                  }}
                />
              ) : null}
              <Box
                position="absolute"
                inset="0"
                background="linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.84))"
              />
              <Box position="absolute" inset="0" p={{ base: '5', md: '8' }} display="flex" alignItems="flex-end">
                <HStack gap="5" alignItems="flex-end" flexWrap="wrap" w="full">
                  {leadScriptId ? (
                    <Box
                      flexShrink={0}
                      borderRadius="xl"
                      overflow="hidden"
                      borderWidth="1px"
                      borderColor="rgba(255,255,255,0.18)"
                    >
                      <styled.img
                        src={getStoryThumbnailUrl(leadScriptId)}
                        alt={series.name ?? `Story ${series.id}`}
                        w={{ base: '112px', md: '144px' }}
                        h={{ base: '112px', md: '144px' }}
                        objectFit="cover"
                      />
                    </Box>
                  ) : null}

                  <Stack gap="3" flex="1" minW="240px">
                    <HStack gap="2" flexWrap="wrap">
                      <Badge>{chapters.length} {t('parts', 'Parts')}</Badge>
                    </HStack>
                    <Stack gap="2">
                      <Text color="white" fontSize={{ base: '3xl', md: '5xl' }} fontWeight="black">
                        {series.name}
                      </Text>
                      {series.description ? (
                        <Text color="rgba(255,255,255,0.84)" maxW="4xl">
                          {series.description}
                        </Text>
                      ) : null}
                    </Stack>
                  </Stack>
                </HStack>
              </Box>
            </Box>
          </Card.Root>
        </Stack>

        <Stack gap="3" w="full" maxW="6xl" px={{ base: '4', md: '0' }}>
          {chapters.map((chapter, index) => {
            const partLabel = formatPartTitle(chapter.subTitleName, index, t('part', 'Part'));
            const hasUniqueDescription = chapter.description && !/^PART\s+\d+$/i.test(chapter.description);

            return (
              <Link
                key={chapter.id}
                href={`/stories/${seriesId}/${chapter.id}`}
                display="block"
                textDecoration="none"
                borderRadius="xl"
                overflow="hidden"
                transition="all 0.2s"
                _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }}
              >
                <HStack
                  alignItems="stretch"
                  gap="0"
                  flexDirection={{ base: 'row', md: 'row' }}
                  bg="bg.default"
                  borderWidth="1px"
                  borderRadius="xl"
                  overflow="hidden"
                >
                  <Box position="relative" w={{ base: '120px', md: '200px' }} minH={{ base: '90px', md: '120px' }} flexShrink={0}>
                    {chapter.scriptId ? (
                      <styled.img
                        src={getStoryThumbnailUrl(chapter.scriptId)}
                        alt={partLabel}
                        w="full"
                        h="full"
                        objectFit="cover"
                      />
                    ) : (
                      <Box w="full" h="full" bg="bg.subtle" />
                    )}
                  </Box>
                  <Stack gap="1" p={{ base: '3', md: '4' }} flex="1" justifyContent="center">
                    <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="bold">
                      {partLabel}
                    </Text>
                    {hasUniqueDescription ? (
                      <Text color="fg.muted" fontSize="sm" lineClamp="1">
                        {chapter.description}
                      </Text>
                    ) : null}
                  </Stack>
                </HStack>
              </Link>
            );
          })}
        </Stack>
      </Stack>
    </>
  );
}
