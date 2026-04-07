import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useData } from 'vike-react/useData';
import { Box, Grid, Stack, styled } from 'styled-system/jsx';
import { Metadata } from '~/components/layout/Metadata';
import { Input } from '~/components/ui/input';
import { Text } from '~/components/ui/text';
import { getDownloadImageUrl } from '~/utils/assets';
import type { PageData } from './+data';

export function Page() {
  const { t } = useTranslation();
  const { downloads } = useData<PageData>();
  const [query, setQuery] = useState('');

  const filteredDownloads = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return downloads.filter((download) => {
      if (normalizedQuery === '') return true;

      return [download.title, String(download.downloadType)]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalizedQuery));
    });
  }, [downloads, query]);

  return (
    <>
      <Metadata title={t('downloads_header', 'Loading Screens')} />
      <Stack gap="6" alignItems="center" w="full" py="8" _print={{ display: 'none' }}>
        <Stack gap="2" alignItems="center" w="full" maxW="6xl" px={{ base: '4', md: '0' }}>
          <Text textAlign="center" fontSize="4xl" fontWeight="bold">
            {t('downloads_header', 'Loading Screens')}
          </Text>
          <Text color="fg.muted" textAlign="center" maxW="3xl">
            {t('downloads_description', 'Official loading screen images from the game')}
          </Text>
        </Stack>

        <Stack w="full" maxW="6xl" px={{ base: '4', md: '0' }}>
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('filter_downloads', 'Search images...')}
          />
        </Stack>

        <Grid
          gridTemplateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', xl: 'repeat(4, 1fr)' }}
          gap="3"
          w="full"
          maxW="6xl"
          px={{ base: '4', md: '0' }}
        >
          {filteredDownloads.map((download) => (
            <Box
              key={download.id}
              overflow="hidden"
              borderRadius="xl"
              transition="all 0.2s"
              _hover={{ shadow: 'lg', transform: 'scale(1.02)' }}
            >
              <styled.img
                src={getDownloadImageUrl(download.id)}
                alt={download.title ?? ''}
                w="full"
                display="block"
              />
            </Box>
          ))}
        </Grid>
      </Stack>
    </>
  );
}
