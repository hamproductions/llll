import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useData } from 'vike-react/useData';
import { Box, Grid, HStack, Stack, styled } from 'styled-system/jsx';
import { Metadata } from '~/components/layout/Metadata';
import { Text } from '~/components/ui/text';
import { getGrandPrixLogoUrl } from '~/utils/assets';
import type { PageData } from './+data';

export function Page() {
  const { t } = useTranslation();
  const { events } = useData<PageData>();
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const filteredEvents = events.filter((e) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return e.name?.toLowerCase().includes(q);
  });

  useEffect(() => setPage(1), [query]);

  const pageSize = 24;
  const totalPages = Math.ceil(filteredEvents.length / pageSize);
  const pageEvents = filteredEvents.slice((page - 1) * pageSize, page * pageSize);

  return (
    <>
      <Metadata title="Grand Prix" />
      <Stack gap="6" alignItems="center" w="full" py="8" _print={{ display: 'none' }}>
        <Stack gap="2" alignItems="center" w="full" maxW="6xl" px={{ base: '4', md: '0' }}>
          <Text textAlign="center" fontSize={{ base: '3xl', md: '4xl' }} fontWeight="black">
            {t('grand_prix', 'Grand Prix')}
          </Text>
          <Text color="fg.muted" textAlign="center" maxW="2xl">
            {t('grand_prix_description', 'Competitive event history and logos')}
          </Text>
        </Stack>

        <Box w="full" maxW="6xl" px={{ base: '4', md: '0' }}>
          <styled.input
            type="text"
            placeholder={t('filter_grand_prix', 'Search events...')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            w="full"
            px="4"
            py="2"
            borderRadius="lg"
            borderWidth="1px"
            borderColor="border.default"
            fontSize="sm"
            _focus={{ borderColor: 'border.outline', outline: 'none' }}
          />
          <Text color="fg.muted" fontSize="xs" mt="1" textAlign="right">
            {t('showing_count', `Showing ${filteredEvents.length} of ${events.length} events.`)}
          </Text>
        </Box>

        <Grid
          gridTemplateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', xl: 'repeat(4, 1fr)' }}
          gap="3"
          w="full"
          maxW="6xl"
          px={{ base: '4', md: '0' }}
        >
          {pageEvents.map((event) => (
            <Box
              key={event.id}
              overflow="hidden"
              borderRadius="xl"
              transition="all 0.2s"
              _hover={{ transform: 'scale(1.02)', shadow: 'lg' }}
            >
              {event.logoId ? (
                <styled.img
                  src={getGrandPrixLogoUrl(event.logoId)}
                  alt={event.name ?? 'Grand Prix'}
                  w="full"
                  display="block"
                  bg="white"
                />
              ) : (
                <Box w="full" aspectRatio="16/9" bg="bg.emphasized" />
              )}
            </Box>
          ))}
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
