import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useData } from 'vike-react/useData';
import { Box, Grid, HStack, Stack, styled } from 'styled-system/jsx';
import { Metadata } from '~/components/layout/Metadata';
import { Input } from '~/components/ui/input';
import { Text } from '~/components/ui/text';
import { getEmojiImageUrl } from '~/utils/assets';
import type { PageData } from './+data';

const UNLOCK_LABEL_KEYS: Record<string, string> = {
  JOIN_MEMBERSHIP: 'emoji_unlock_membership',
  '0': 'emoji_unlock_default',
};

export function Page() {
  const { t } = useTranslation();
  const { emojis, categories } = useData<PageData>();
  const [query, setQuery] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);

  const categoryMap = useMemo(() => {
    const map = new Map<number, string>();
    for (const cat of categories) {
      if (cat.id != null && cat.name != null) map.set(cat.id, cat.name);
    }
    return map;
  }, [categories]);

  const filteredEmojis = useMemo(() => {
    const q = query.trim().toLowerCase();
    return emojis.filter((emoji) => {
      if (activeCategoryId !== null && emoji.categoryId !== activeCategoryId) return false;
      if (q === '') return true;
      return [emoji.name, emoji.slug]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q));
    });
  }, [emojis, query, activeCategoryId]);

  const grouped = useMemo(() => {
    const groups: { categoryId: number; categoryName: string; emojis: typeof filteredEmojis }[] = [];
    const byCategory = new Map<number, typeof filteredEmojis>();

    for (const emoji of filteredEmojis) {
      const catId = emoji.categoryId ?? 0;
      if (!byCategory.has(catId)) byCategory.set(catId, []);
      byCategory.get(catId)!.push(emoji);
    }

    const sortedCats = categories
      .filter((c) => c.id != null && byCategory.has(c.id))
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

    for (const cat of sortedCats) {
      groups.push({
        categoryId: cat.id!,
        categoryName: cat.name ?? `Category ${cat.id}`,
        emojis: byCategory.get(cat.id!) ?? [],
      });
    }

    return groups;
  }, [filteredEmojis, categories]);

  return (
    <>
      <Metadata title="Emoji" />
      <Stack gap="6" alignItems="center" w="full" py="8">
        <Stack gap="2" alignItems="center" w="full" maxW="6xl" px={{ base: '4', md: '0' }}>
          <Text textAlign="center" fontSize="4xl" fontWeight="bold">
            {t('emoji_header', 'Emoji')}
          </Text>
          <Text color="fg.muted" textAlign="center" maxW="3xl">
            {t('emoji_description', 'In-game emoji stickers organized by category')}
          </Text>
        </Stack>

        <Stack gap="3" w="full" maxW="6xl" px={{ base: '4', md: '0' }}>
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('filter_emoji', 'Search emoji...')}
          />
          <HStack gap="2" flexWrap="wrap">
            <Box
              as="button"
              px="3"
              py="1"
              borderRadius="full"
              borderWidth="1px"
              fontSize="sm"
              cursor="pointer"
              bg={activeCategoryId === null ? 'bg.subtle' : 'transparent'}
              fontWeight={activeCategoryId === null ? 'bold' : 'normal'}
              onClick={() => setActiveCategoryId(null)}
            >
              {t('all', 'All')} ({emojis.length})
            </Box>
            {categories
              .filter((c) => c.name && !c.name.includes('不使用'))
              .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
              .map((cat) => (
                <Box
                  key={cat.id}
                  as="button"
                  px="3"
                  py="1"
                  borderRadius="full"
                  borderWidth="1px"
                  fontSize="sm"
                  cursor="pointer"
                  bg={activeCategoryId === cat.id ? 'bg.subtle' : 'transparent'}
                  fontWeight={activeCategoryId === cat.id ? 'bold' : 'normal'}
                  onClick={() => setActiveCategoryId(cat.id === activeCategoryId ? null : cat.id)}
                >
                  {cat.name} ({emojis.filter((e) => e.categoryId === cat.id).length})
                </Box>
              ))}
          </HStack>
        </Stack>

        <Text color="fg.muted" fontSize="sm">
          {filteredEmojis.length} {t('emoji_count', 'emoji')}
        </Text>

        <Stack gap="8" w="full" maxW="6xl" px={{ base: '4', md: '0' }}>
          {grouped.map((group) => (
            <Stack key={group.categoryId} gap="3">
              <Text fontSize="sm" fontWeight="bold" textTransform="uppercase" letterSpacing="0.12em" color="fg.muted">
                {group.categoryName}
              </Text>
              <Grid
                gridTemplateColumns={{
                  base: 'repeat(3, minmax(0, 1fr))',
                  sm: 'repeat(4, minmax(0, 1fr))',
                  md: 'repeat(5, minmax(0, 1fr))',
                  lg: 'repeat(6, minmax(0, 1fr))',
                }}
                gap="3"
              >
                {group.emojis.map((emoji) => (
                  <Stack
                    key={emoji.id}
                    gap="1.5"
                    alignItems="center"
                    p="3"
                    borderRadius="xl"
                    borderWidth="1px"
                    bg="bg.subtle"
                  >
                    {emoji.slug ? (
                      <styled.img
                        src={getEmojiImageUrl(emoji.slug)}
                        alt={emoji.name ?? ''}
                        w="48px"
                        h="48px"
                        display="block"
                      />
                    ) : (
                      <Box
                        w="48px"
                        h="48px"
                        borderRadius="lg"
                        bg="bg.default"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        fontSize="xl"
                        fontWeight="bold"
                        color="fg.muted"
                      >
                        ?
                      </Box>
                    )}
                    <Text fontSize="xs" fontWeight="medium" textAlign="center" lineClamp="2">
                      {emoji.name?.replace(/^絵文字[『【]/, '').replace(/[』】]$/, '') ?? `Emoji ${emoji.id}`}
                    </Text>
                    {emoji.unlockType && (
                      <Text fontSize="2xs" color="fg.muted">
                        {UNLOCK_LABEL_KEYS[emoji.unlockType] ? t(UNLOCK_LABEL_KEYS[emoji.unlockType]) : emoji.unlockType}
                      </Text>
                    )}
                  </Stack>
                ))}
              </Grid>
            </Stack>
          ))}
        </Stack>

        {filteredEmojis.length === 0 && (
          <Text color="fg.muted" py="12">
            {t('no_emoji_found', 'No emoji found')}
          </Text>
        )}
      </Stack>
    </>
  );
}
