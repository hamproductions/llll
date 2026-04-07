import { useTranslation } from 'react-i18next';
import { Text } from '../../components/ui/text';
import { Metadata } from '~/components/layout/Metadata';
import { Stack, Box, Grid, styled } from 'styled-system/jsx';
import { FaBoxOpen, FaCompactDisc, FaFaceGrinWink, FaGamepad, FaGift, FaImages, FaMusic, FaPeopleGroup, FaPhotoFilm, FaRegFaceSmile, FaStar, FaTicket, FaWaveSquare } from 'react-icons/fa6';
import { Link } from '~/components/ui/link';
import { getPhotoStoryImageUrl } from '~/utils/assets';

export function Page() {
  const { t } = useTranslation();

  const title = t('title');
  const description = t('description');
  const sections = [
    { href: '/cards', title: t('home_page.explore_cards'), icon: FaImages },
    { href: '/stories', title: t('home_page.explore_stories', 'Stories'), icon: FaCompactDisc },
    { href: '/music', title: t('home_page.explore_songs', 'Songs'), icon: FaMusic },
    { href: '/characters', title: t('home_page.explore_characters', 'Characters'), icon: FaPeopleGroup },
    { href: '/gacha', title: t('home_page.explore_gacha', 'Gacha'), icon: FaGift },
    { href: '/grand-prix', title: t('home_page.explore_grand_prix', 'Grand Prix'), icon: FaGamepad },
    { href: '/stickers', title: t('home_page.explore_stickers', 'Stickers'), icon: FaRegFaceSmile },
    { href: '/bgm', title: t('home_page.explore_bgm', 'BGM'), icon: FaWaveSquare },
    { href: '/downloads', title: t('home_page.explore_downloads', 'Loading Screens'), icon: FaTicket },
    { href: '/items', title: t('home_page.explore_items', 'Items'), icon: FaBoxOpen },
    { href: '/emoji', title: t('home_page.explore_emoji', 'Emoji'), icon: FaFaceGrinWink },
    { href: '/gallery', title: t('home_page.explore_gallery', 'Gallery'), icon: FaPhotoFilm },
    { href: '/model-viewer', title: t('home_page.explore_viewer', 'Viewer'), icon: FaStar },
    { href: '/spine-viewer', title: t('home_page.explore_spine', 'Spine Viewer'), icon: FaPeopleGroup }
  ];
  const photos = Array.from({ length: 32 }, (_, index) => 1051201 + index);

  return (
    <>
      <Metadata title={title} />
      <Stack gap="8" alignItems="center" w="full" py={{ base: '8', md: '12' }} _print={{ display: 'none' }}>
        <Box
          w="full"
          maxW="5xl"
          px={{ base: '4', md: '0' }}
        >
          <Stack gap="8" alignItems="center" textAlign="center">
            <Text fontSize={{ base: '4xl', md: '6xl' }} fontWeight="black">
              {title}
            </Text>
            <Text color="fg.muted" fontSize={{ base: 'md', md: 'lg' }} maxW="2xl">
              {description}
            </Text>
            <Grid
              w="full"
              gridTemplateColumns={{ base: 'repeat(3, minmax(0, 1fr))', md: 'repeat(5, minmax(0, 1fr))' }}
              gap="3"
            >
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <Link
                    key={section.href}
                    href={section.href}
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    gap="3"
                    minH={{ base: '104px', md: '120px' }}
                    p="3"
                    borderRadius="2xl"
                    borderWidth="1px"
                    bg="bg.subtle"
                    h="full"
                  >
                    <Icon size={28} />
                    <Text fontWeight="bold" lineClamp="2">
                      {section.title}
                    </Text>
                  </Link>
                );
              })}
            </Grid>

            <Stack gap="3" w="full" alignItems="flex-start">
              <Text fontSize="sm" fontWeight="bold" textTransform="uppercase" letterSpacing="0.18em" color="fg.muted">
                {t('home_page.photo_gallery', 'Photo Gallery')}
              </Text>
              <Grid
                w="full"
                gridTemplateColumns={{ base: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(3, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))', xl: 'repeat(5, minmax(0, 1fr))' }}
                gap="2"
              >
                {photos.map((photoId) => (
                  <Box key={photoId} borderRadius="xl" overflow="hidden" bg="bg.subtle">
                    <styled.img
                      src={getPhotoStoryImageUrl(photoId)}
                      alt={`Photo ${photoId}`}
                      w="full"
                      aspectRatio="16/9"
                      objectFit="cover"
                      display="block"
                    />
                  </Box>
                ))}
              </Grid>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </>
  );
}
