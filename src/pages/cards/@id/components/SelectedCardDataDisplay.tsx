import type { TFunction } from 'i18next';
import type { CardDataListItem } from '../+data';
import { SkillInfoDisplay } from './SkillInfoDisplay';
import { Text } from '~/components/ui/text';
import { Box } from 'styled-system/jsx';

interface SelectedCardDataDisplayProps {
  selectedCardData: CardDataListItem;
  t: TFunction;
}

export function SelectedCardDataDisplay({ selectedCardData, t }: SelectedCardDataDisplayProps) {
  return (
    <Box borderRadius="md" borderWidth="1px" p="4">
      <Text fontSize="xl" fontWeight="bold">
        {selectedCardData.name}
      </Text>
      <Text>
        {t('rarity')}: {selectedCardData.rarity} | {t('style')}: {selectedCardData.style} |{' '}
        {t('mood')}: {selectedCardData.mood}
      </Text>
      <SkillInfoDisplay
        skillInfo={selectedCardData.specialAppealInfo}
        title={t('special_appeal_info')}
      />
      <SkillInfoDisplay
        skillInfo={selectedCardData.normalSkillInfo}
        title={t('normal_skill_info')}
      />
      <SkillInfoDisplay
        title={t('attribute_skill_title', 'Attribute Skill Info')}
        skillInfo={selectedCardData.attributeSkillInfo}
      />
    </Box>
  );
}
