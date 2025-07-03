import { useTranslation } from 'react-i18next';
import type { CardDataListItem } from '../+data';
import { SkillInfoDisplay } from './SkillInfoDisplay';
import { Stack } from 'styled-system/jsx';

interface SchoolIdolStageSkillsSectionProps {
  selectedCardData: CardDataListItem;
}

export function SchoolIdolStageSkillsSection({
  selectedCardData
}: SchoolIdolStageSkillsSectionProps) {
  const { t } = useTranslation();

  const { normalSkillInfo, specialAppealInfo, attributeSkillInfo } =
    selectedCardData.schoolIdolStageSkills || {};

  if (!normalSkillInfo && !specialAppealInfo && !attributeSkillInfo) {
    return null;
  }

  return (
    <Stack gap="4" w="full">
      {specialAppealInfo && (
        <SkillInfoDisplay skillInfo={specialAppealInfo} title={t('special_appeal_info')} />
      )}
      {normalSkillInfo && (
        <SkillInfoDisplay
          skillInfo={normalSkillInfo}
          title={t('normal_skill_info')}
          // showEffectDetails
        />
      )}
      {attributeSkillInfo && (
        <SkillInfoDisplay skillInfo={attributeSkillInfo} title={t('attribute_skill_title')} />
      )}
    </Stack>
  );
}
