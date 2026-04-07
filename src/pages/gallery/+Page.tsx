import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useData } from 'vike-react/useData';
import { Box, Grid, HStack, Stack, styled } from 'styled-system/jsx';
import { Metadata } from '~/components/layout/Metadata';
import { Text } from '~/components/ui/text';
import { Dialog } from '~/components/ui/dialog';
import { IconButton } from '~/components/ui/icon-button';
import {
  getCharacterProfileImageUrl,
  getCharacterSeasonProfileImageUrl,
  getCharacterCustomProfileImageUrl,
  getProfileEtcImageUrl,
  getPhotoStoryImageUrl,
} from '~/utils/assets';
import type { PageData } from './+data';

function getImageUrl(sectionKey: string, filename: string): string {
  const idMatch = filename.match(/(\d+)/);
  const id = idMatch ? idMatch[1] : filename;

  switch (sectionKey) {
    case 'illustrations':
      return getProfileEtcImageUrl(id);
    case 'photos':
      return getPhotoStoryImageUrl(id);
    case 'profile-base': {
      const charaId = filename.match(/image_prof_data_chara_(\d+)/)?.[1] ?? id;
      return getCharacterProfileImageUrl(charaId);
    }
    case 'profile-season': {
      const match = filename.match(/image_prof_data_chara_season_(\d+)_(\d+)/);
      if (match) return getCharacterSeasonProfileImageUrl(match[1], match[2]);
      const charaId = filename.match(/(\d+)/)?.[1] ?? id;
      return getCharacterSeasonProfileImageUrl(charaId, '1');
    }
    case 'profile-custom': {
      const cardId = filename.match(/image_prof_custom_(\d+)/)?.[1] ?? id;
      return getCharacterCustomProfileImageUrl(cardId);
    }
    default:
      return '';
  }
}

export function Page() {
  const { t } = useTranslation();
  const { sections } = useData<PageData>();
  const [activeSection, setActiveSection] = useState(sections[0]?.key ?? '');
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const currentSection = useMemo(
    () => sections.find((s) => s.key === activeSection) ?? sections[0],
    [sections, activeSection]
  );

  return (
    <>
      <Metadata title={t('gallery_header', 'Gallery')} />
      <Stack gap="6" alignItems="center" w="full" py="8">
        <Text textAlign="center" fontSize="4xl" fontWeight="bold">
          {t('gallery_header', 'Gallery')}
        </Text>

        <HStack gap="2" flexWrap="wrap" justifyContent="center" w="full" maxW="6xl" px={{ base: '4', md: '0' }}>
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
              onClick={() => setActiveSection(section.key)}
            >
              {section.label} ({section.count})
            </Box>
          ))}
        </HStack>

        {currentSection && (
          <Grid
            gridTemplateColumns={{
              base: 'repeat(2, minmax(0, 1fr))',
              sm: 'repeat(3, minmax(0, 1fr))',
              md: 'repeat(4, minmax(0, 1fr))',
              xl: 'repeat(5, minmax(0, 1fr))',
            }}
            gap="3"
            w="full"
            maxW="6xl"
            px={{ base: '4', md: '0' }}
          >
            {currentSection.files.map((file) => {
              const url = getImageUrl(currentSection.key, file);
              return (
                <Box
                  key={file}
                  overflow="hidden"
                  borderRadius="xl"
                  cursor="pointer"
                  transition="all 0.2s"
                  _hover={{ shadow: 'lg', transform: 'scale(1.02)' }}
                  onClick={() => setLightboxUrl(url)}
                >
                  <styled.img
                    src={url}
                    alt=""
                    w="full"
                    display="block"
                    loading="lazy"
                  />
                </Box>
              );
            })}
          </Grid>
        )}
      </Stack>

      <Dialog.Root open={!!lightboxUrl} onOpenChange={(e) => { if (!e.open) setLightboxUrl(null); }}>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content
            bg="transparent"
            shadow="none"
            maxW="90vw"
            maxH="90vh"
            p="0"
            display="flex"
            alignItems="center"
            justifyContent="center"
            onClick={() => setLightboxUrl(null)}
          >
            <Dialog.CloseTrigger asChild position="absolute" top="2" right="2" zIndex="10">
              <IconButton variant="ghost" size="sm" color="white">✕</IconButton>
            </Dialog.CloseTrigger>
            {lightboxUrl && (
              <styled.img
                src={lightboxUrl}
                alt=""
                maxW="90vw"
                maxH="85vh"
                objectFit="contain"
                borderRadius="xl"
              />
            )}
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </>
  );
}
