import { useTranslation } from 'react-i18next';
import type { CardDataListItem } from '../+data';
import { SchoolIdolShowSkillInfoDisplay } from './SchoolIdolShowSkillInfoDisplay';
import { Stack } from 'styled-system/jsx';

interface SchoolIdolShowSkillsSectionProps {
  selectedCardData: CardDataListItem;
}

export function SchoolIdolShowSkillsSection({
  selectedCardData
}: SchoolIdolShowSkillsSectionProps) {
  const { t } = useTranslation();

  const { centerSkillInfo, rhythmGameSkillInfo, centerAttributeSkillInfo } =
    selectedCardData.schoolIdolShowSkills || {};

  if (!centerSkillInfo && !rhythmGameSkillInfo && !centerAttributeSkillInfo) {
    return null;
  }

  return (
    <Stack gap="4" w="full">
      {centerSkillInfo && (
        <SchoolIdolShowSkillInfoDisplay
          skills={centerSkillInfo}
          label={t('skill_type.center_skill')}
        />
      )}
      {rhythmGameSkillInfo && (
        <SchoolIdolShowSkillInfoDisplay
          skills={rhythmGameSkillInfo}
          label={t('skill_type.rhythm_game_skill')}
        />
      )}
      {centerAttributeSkillInfo && (
        <SchoolIdolShowSkillInfoDisplay
          skills={[centerAttributeSkillInfo]}
          label={t('skill_type.rhythm_game_skill')}
        />
      )}
    </Stack>
  );
}
