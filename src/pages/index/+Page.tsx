import { useTranslation } from 'react-i18next';
import { Text } from '../../components/ui/text';
import { Metadata } from '~/components/layout/Metadata';
import { Stack, Box, HStack } from 'styled-system/jsx';
import { Button } from '~/components/ui/button';
import { Link } from '~/components/ui/link';

export function Page() {
  const { t } = useTranslation();

  const title = t('title');
  const description = t('description');

  return (
    <>
      <Metadata title={title} />
      <Stack gap="8" alignItems="center" w="full" _print={{ display: 'none' }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          w="full"
          h="400px"
          color="white"
          textAlign="center"
          textShadow="0 0 10px rgba(0,0,0,0.8)"
          bgPosition="center"
          bgImage="url(/assets/homepage_hero.webp)" // Placeholder image
          bgSize="cover"
        >
          <Stack gap="4" justifyContent="center">
            <Text fontSize="5xl" fontWeight="extrabold">
              {title}
            </Text>
            <Text fontSize="xl">{description}</Text>
            <HStack justifyContent="center" flexWrap="wrap" gap="3">
              <Link href="/cards">
                <Button size="lg" variant="solid">
                  {t('home_page.explore_cards')}
                </Button>
              </Link>
              <Link href="/stories">
                <Button size="lg" variant="solid">
                  {t('home_page.explore_stories', 'Explore Stories')}
                </Button>
              </Link>
              <Link href="https://hamproductions.github.io/llll-chart/" target="_blank">
                <Button size="lg" variant="outline">
                  {t('home_page.rhythm_game_charts')}
                </Button>
              </Link>
            </HStack>
          </Stack>
        </Box>
      </Stack>
    </>
  );
}
