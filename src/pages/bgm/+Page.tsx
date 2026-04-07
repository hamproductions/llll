import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useData } from 'vike-react/useData';
import { Box, Grid, HStack, Stack, styled } from 'styled-system/jsx';
import { FaMoon, FaSun } from 'react-icons/fa6';
import { Metadata } from '~/components/layout/Metadata';
import { Card } from '~/components/ui/card';
import { Text } from '~/components/ui/text';
import { getBgmAudioUrl } from '~/utils/assets';
import type { PageData } from './+data';

export function Page() {
  const { t } = useTranslation();
  const { homeBgmSets, sections } = useData<PageData>();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const playableSets = homeBgmSets.filter((s) => s.daytimeAudioFile || s.nighttimeAudioFile);

  const currentSection = activeSection ? sections.find((s) => s.key === activeSection) : null;

  return (
    <>
      <Metadata title="BGM" />
      <Stack gap="6" alignItems="center" w="full" py="6" _print={{ display: 'none' }}>
        <Stack gap="2" alignItems="center" w="full" maxW="5xl" px={{ base: '4', md: '0' }}>
          <Text textAlign="center" fontSize={{ base: '3xl', md: '4xl' }} fontWeight="black">
            {t('bgm', 'BGM')}
          </Text>
        </Stack>

        {playableSets.length > 0 && (
          <Stack gap="3" w="full" maxW="5xl" px={{ base: '4', md: '0' }}>
            <Text fontSize="xl" fontWeight="bold">
              {t('home_bgm', 'Home BGM')}
            </Text>
            <Grid gridTemplateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap="4">
              {playableSets.map((set) => (
                <Card.Root key={set.pairKey} borderRadius="xl">
                  <Card.Body p="4">
                    <Stack gap="4">
                      <Text fontWeight="bold" fontSize="lg">{set.name}</Text>
                      <Stack gap="3">
                        <Stack gap="2">
                          <HStack gap="2" alignItems="center">
                            <FaSun />
                            <Text fontWeight="medium" fontSize="sm">{t('daytime', 'Daytime')}</Text>
                          </HStack>
                          {set.daytimeAudioFile ? (
                            <styled.audio controls loop preload="none" src={getBgmAudioUrl(set.daytimeAudioFile)} style={{ width: '100%' }} />
                          ) : (
                            <Text color="fg.muted" fontSize="sm">{t('audio_unavailable', 'Audio unavailable')}</Text>
                          )}
                        </Stack>
                        <Stack gap="2">
                          <HStack gap="2" alignItems="center">
                            <FaMoon />
                            <Text fontWeight="medium" fontSize="sm">{t('nighttime', 'Nighttime')}</Text>
                          </HStack>
                          {set.nighttimeAudioFile ? (
                            <styled.audio controls loop preload="none" src={getBgmAudioUrl(set.nighttimeAudioFile)} style={{ width: '100%' }} />
                          ) : (
                            <Text color="fg.muted" fontSize="sm">{t('audio_unavailable', 'Audio unavailable')}</Text>
                          )}
                        </Stack>
                      </Stack>
                    </Stack>
                  </Card.Body>
                </Card.Root>
              ))}
            </Grid>
          </Stack>
        )}

        {sections.length > 0 && (
          <Stack gap="3" w="full" maxW="5xl" px={{ base: '4', md: '0' }}>
            <HStack gap="2" flexWrap="wrap">
              {sections.map((section) => (
                <Box
                  key={section.key}
                  as="button"
                  px="3"
                  py="1.5"
                  borderRadius="full"
                  fontSize="sm"
                  cursor="pointer"
                  fontWeight={activeSection === section.key ? 'bold' : 'normal'}
                  bg={activeSection === section.key ? 'bg.emphasized' : 'transparent'}
                  borderWidth="1px"
                  borderColor="border.default"
                  onClick={() => setActiveSection(activeSection === section.key ? null : section.key)}
                >
                  {section.label} ({section.bgms.length})
                </Box>
              ))}
            </HStack>

            {(activeSection ? [currentSection!] : sections).filter(Boolean).map((section) => (
              <Stack key={section.key} gap="3">
                <Text fontSize="xl" fontWeight="bold">{section.label}</Text>
                <Grid gridTemplateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' }} gap="3">
                  {section.bgms.map((bgm) => (
                    <Card.Root key={bgm.id} borderRadius="xl">
                      <Card.Body p="4">
                        <Stack gap="3">
                          <Text fontSize="md" fontWeight="bold" lineClamp="2">
                            {bgm.displayName}
                          </Text>
                          <styled.audio controls loop preload="none" src={getBgmAudioUrl(bgm.audioFile)} style={{ width: '100%' }} />
                        </Stack>
                      </Card.Body>
                    </Card.Root>
                  ))}
                </Grid>
              </Stack>
            ))}
          </Stack>
        )}
      </Stack>
    </>
  );
}
