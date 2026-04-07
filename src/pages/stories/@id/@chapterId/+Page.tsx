import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useData } from 'vike-react/useData';
import type { PageData } from './+data';
import { Text } from '~/components/ui/text';
import { Metadata } from '~/components/layout/Metadata';
import { Box, Stack, HStack, styled } from 'styled-system/jsx';
import { Link } from '~/components/ui/link';
import { Button } from '~/components/ui/button';
import { storyToMarkdown } from '~/utils/storyMarkdown';
import { DialogueBlock } from '~/components/story/DialogueBlock';
import { NarrationBlock } from '~/components/story/NarrationBlock';
import { SceneSeparator } from '~/components/story/SceneSeparator';
import { VoicePlaybackProvider, useVoicePlayback } from '~/components/story/VoicePlaybackContext';
import { getStoryPartImageUrl, getStoryThumbnailUrl, getStoryBackgroundUrl } from '~/utils/assets';

function StoryContent() {
  const { t } = useTranslation();
  const { series, chapter, parsedScript, prevChapter, nextChapter, seriesId }: PageData =
    useData();
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const { playAll, isPlayingAll } = useVoicePlayback();

  const handleCopyMarkdown = async () => {
    const chapterTitle = chapter?.name ?? 'Story';
    const markdown = storyToMarkdown(parsedScript, chapterTitle);

    try {
      await navigator.clipboard.writeText(markdown);
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (!series || !chapter) {
    return (
      <>
        <Metadata />
        <Stack gap="6" alignItems="center" w="full" py="8">
          <Text fontSize="2xl">{t('chapter_not_found', 'Chapter not found.')}</Text>
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
      <Stack gap="6" w="full" py="8" _print={{ display: 'none' }}>
        {/* Header */}
        <Stack gap="4" w="full" maxW="5xl" mx="auto" px={{ base: '4', md: '0' }}>
          <HStack justifyContent="space-between" w="full" flexWrap="wrap" gap="2">
            <Link href={`/stories/${seriesId}`}>
              <Button variant="ghost" size="sm">
                ← {t('back_to_series', 'Back to Series')}
              </Button>
            </Link>
            <HStack gap="2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => playAll()}
              >
                {isPlayingAll ? '⏹ Stop All' : '▶ Play All Voices'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyMarkdown}
                disabled={parsedScript.length === 0}
              >
                {copyStatus === 'copied' ? '✓ Copied!' : '📋 Copy as Markdown'}
              </Button>
            </HStack>
          </HStack>
          <Box position="relative" borderRadius="2xl" overflow="hidden" minH={{ base: '280px', md: '360px' }}>
            {chapter.scriptId ? (
              <styled.img
                src={getStoryPartImageUrl(chapter.scriptId)}
                alt={chapter.name ?? `Chapter ${chapter.id}`}
                w="full"
                h="full"
                minH={{ base: '280px', md: '360px' }}
                objectFit="cover"
              />
            ) : null}
            <Box
              position="absolute"
              inset="0"
              background="linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.84))"
            />
            <Box position="absolute" inset="0" p={{ base: '5', md: '8' }} display="flex" alignItems="flex-end">
              <HStack gap="4" alignItems="flex-end" w="full" flexWrap="wrap">
                {chapter.scriptId ? (
                  <styled.img
                    src={getStoryThumbnailUrl(chapter.scriptId)}
                    alt={chapter.name ?? `Chapter ${chapter.id}`}
                    w={{ base: '104px', md: '128px' }}
                    h={{ base: '104px', md: '128px' }}
                    objectFit="cover"
                    borderRadius="xl"
                    borderWidth="1px"
                    borderColor="rgba(255,255,255,0.18)"
                  />
                ) : null}
                <Stack gap="2" flex="1" minW="240px">
                  <Text fontSize="sm" color="rgba(255,255,255,0.8)">
                    {series.name}
                  </Text>
                  <Text color="white" textAlign="left" fontSize={{ base: '3xl', md: '4xl' }} fontWeight="black">
                    {chapter.name}
                  </Text>
                  {chapter.subTitleName && (
                    <Text fontSize="lg" color="rgba(255,255,255,0.84)">
                      {chapter.subTitleName}
                    </Text>
                  )}
                </Stack>
              </HStack>
            </Box>
          </Box>
        </Stack>

        {/* Story Content */}
        <Box w="full" minH="60vh">
          {parsedScript.length > 0 ? (
            <Stack gap="0" w="full">
              {parsedScript.map((line, index) => {
                switch (line.type) {
                  case 'dialogue':
                    return <DialogueBlock key={index} line={line} index={index} />;
                  case 'narration':
                    return <NarrationBlock key={index} line={line} />;
                  case 'bg':
                    return (
                      <Box key={index} w="full" maxW="4xl" mx="auto" my="4" px={{ base: '4', md: '0' }}>
                        <styled.img
                          src={getStoryBackgroundUrl(line.content)}
                          alt=""
                          w="full"
                          display="block"
                          borderRadius="xl"
                        />
                      </Box>
                    );
                  case 'bgm':
                    return null;
                  case 'separator':
                    return <SceneSeparator key={index} />;
                  case 'se':
                    // Skip sound effects for now
                    return null;
                  case 'unknown':
                    // Skip unknown commands
                    return null;
                  default:
                    return null;
                }
              })}
            </Stack>
          ) : (
            <Stack gap="4" alignItems="center" py="16">
              <Text fontSize="lg" color="fg.muted">
                {t('no_script_content', 'No script content available for this chapter.')}
              </Text>
            </Stack>
          )}
        </Box>

        {/* Navigation Footer */}
        <Stack
          gap="4"
          w="full"
          maxW="5xl"
          mx="auto"
          px={{ base: '4', md: '0' }}
          pt="8"
          borderTopWidth="1px"
          borderColor="border.default"
        >
          <HStack justifyContent="center">
            <Link href={`/stories/${seriesId}`}>
              <Button variant="ghost" size="md">
                {t('back_to_chapters', 'All Parts')}
              </Button>
            </Link>
          </HStack>

          <HStack justifyContent="space-between" gap="4" w="full">
            <Box flex="1">
              {prevChapter ? (
                <Link href={`/stories/${seriesId}/${prevChapter.id}`}>
                  <Button variant="outline" size="lg" w="full">
                    ← {t('previous', 'Previous')}
                  </Button>
                </Link>
              ) : (
                <Box />
              )}
            </Box>

            <Box flex="1" textAlign="right">
              {nextChapter ? (
                <Link href={`/stories/${seriesId}/${nextChapter.id}`}>
                  <Button variant="outline" size="lg" w="full">
                    {t('next', 'Next')} →
                  </Button>
                </Link>
              ) : (
                <Box />
              )}
            </Box>
          </HStack>
        </Stack>
      </Stack>
    </>
  );
}

export function Page() {
  return (
    <VoicePlaybackProvider>
      <StoryContent />
    </VoicePlaybackProvider>
  );
}
