import type { TFunction } from 'i18next';
import type { CardDataListItem } from '../+data';
import { Text } from '~/components/ui/text';
import { Box } from 'styled-system/jsx';

interface SelectedCardDataDisplayProps {
  selectedCardData: CardDataListItem;
  t: TFunction;
}

export function SelectedCardDataDisplay({ selectedCardData, t }: SelectedCardDataDisplayProps) {
  return (
    <Box>
      <Text fontSize="xl" fontWeight="bold">
        {selectedCardData.name}
      </Text>
      <Text>
        {t('rarity')}: {selectedCardData.rarity} | {t('style')}: {selectedCardData.style} |{' '}
        {t('mood')}: {selectedCardData.mood}
      </Text>
      <Text>
        {t('smile')}: {selectedCardData.initialSmile} ~ {selectedCardData.maxSmile} | {t('pure')}:{' '}
        {selectedCardData.initialPure} ~ {selectedCardData.maxPure} | {t('cool')}:{' '}
        {selectedCardData.initialCool} ~ {selectedCardData.maxCool} | {t('mental')}:{' '}
        {selectedCardData.initialMental} ~ {selectedCardData.maxMental}
      </Text>
    </Box>
  );
}
