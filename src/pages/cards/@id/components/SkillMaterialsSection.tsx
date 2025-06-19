import type { TFunction } from 'i18next';
import type { SkillLevelUpMaterial } from '../+data';
import { SkillLevelUpMaterialsTable } from './SkillLevelUpMaterialsTable';

interface SkillMaterialsSectionProps {
  specialAppealMaterials?: SkillLevelUpMaterial[];
  appealMaterials?: SkillLevelUpMaterial[];
  t: TFunction;
}

export function SkillMaterialsSection(props: SkillMaterialsSectionProps) {
  const { specialAppealMaterials, appealMaterials, t } = props;
  return (
    <>
      {(specialAppealMaterials?.length ?? 0) > 0 && (
        <SkillLevelUpMaterialsTable
          materials={specialAppealMaterials!}
          title={t('special_appeal_level_up_materials')}
        />
      )}

      {(appealMaterials?.length ?? 0) > 0 && (
        <SkillLevelUpMaterialsTable
          materials={appealMaterials!}
          title={t('normal_skill_level_up_materials')}
        />
      )}
    </>
  );
}
