import type { TFunction } from 'i18next';
import type { CardDataListItem } from '../+data';
import { Text } from '~/components/ui/text';
import { Box, Grid, HStack, Stack, styled } from 'styled-system/jsx';
import { getPicUrl } from '~/utils/assets';

const RARITY_COLORS: Record<string, string> = {
  UR: '#f59e0b',
  SR: '#a855f7',
  R: '#3b82f6',
  LR: '#ef4444',
  DR: '#ec4899',
  BR: '#10b981'
};

interface SelectedCardDataDisplayProps {
  selectedCardData: CardDataListItem;
  rarityMap?: Record<number, string>;
  t: TFunction;
}

export function SelectedCardDataDisplay({ selectedCardData, rarityMap, t }: SelectedCardDataDisplayProps) {
  const rarityName = rarityMap?.[selectedCardData.rarity ?? 0] ?? String(selectedCardData.rarity);
  const rarityColor = RARITY_COLORS[rarityName] ?? '#6b7280';

  const stats = [
    { label: 'Smile', value: selectedCardData.initialSmile, max: selectedCardData.maxSmile, color: '#f472b6' },
    { label: 'Pure', value: selectedCardData.initialPure, max: selectedCardData.maxPure, color: '#34d399' },
    { label: 'Cool', value: selectedCardData.initialCool, max: selectedCardData.maxCool, color: '#60a5fa' },
    { label: 'Mental', value: selectedCardData.initialMental, max: selectedCardData.maxMental, color: '#fbbf24' }
  ];

  return (
    <Stack gap="4">
      <HStack gap="2" justifyContent="flex-end" flexWrap="wrap">
        <Box
          px="3"
          py="1"
          borderRadius="full"
          fontWeight="bold"
          fontSize="sm"
          style={{ backgroundColor: `${rarityColor}20`, color: rarityColor }}
        >
          {rarityName}
        </Box>
        {selectedCardData.style != null && (
          <styled.img
            src={getPicUrl(String(selectedCardData.style), 'styleIcon')}
            alt={t('style')}
            w="28px"
            h="28px"
          />
        )}
      </HStack>

      <Grid gridTemplateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }} gap="3">
        {stats.map((stat) => (
          <Box
            key={stat.label}
            p="3"
            borderRadius="lg"
            borderWidth="1px"
            borderColor="border.default"
          >
            <Text fontSize="xs" color="fg.muted" fontWeight="medium">
              {stat.label}
            </Text>
            <HStack gap="1" alignItems="baseline">
              <Text fontSize="lg" fontWeight="bold" style={{ color: stat.color }}>
                {stat.max}
              </Text>
              <Text fontSize="xs" color="fg.muted">
                ({stat.value})
              </Text>
            </HStack>
          </Box>
        ))}
      </Grid>
    </Stack>
  );
}
