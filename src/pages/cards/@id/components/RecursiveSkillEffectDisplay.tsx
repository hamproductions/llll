import { useTranslation } from 'react-i18next';

import type { SkillEffectDetailWithRecursion } from '../card-data';
import { Box } from 'styled-system/jsx';
import { Text } from '~/components/ui/text';

interface RecursiveSkillEffectDisplayProps {
  detail: SkillEffectDetailWithRecursion;
  level?: number;
  showEffectDetails?: boolean;
}

export function RecursiveSkillEffectDisplay({
  detail,
  level = 0,
  showEffectDetails = false
}: RecursiveSkillEffectDisplayProps) {
  const { t } = useTranslation();
  const indent = level * 16; // 1rem indent per level

  const mainText = showEffectDetails && (
    <Text fontSize="xs">
      {detail.skillEffectDetailType}: {detail.effectValue}
      {detail.targetMood !== null && ` (Target Mood: ${detail.targetMood})`}
    </Text>
  );

  const subEffectDetails = detail.subEffect?.details
    .map((subDetail, idx) => (
      <RecursiveSkillEffectDisplay
        key={`${subDetail.id}-${idx}`}
        detail={subDetail}
        level={level + 1}
        showEffectDetails={showEffectDetails}
      />
    ))
    .filter(Boolean); // Filter out nulls

  const subEffectContent = detail.subEffect &&
    (showEffectDetails || (subEffectDetails && subEffectDetails.length > 0)) && (
      <Box borderLeftWidth="1px" borderColor="border.muted" ml="2" mt="1" pl="4">
        {showEffectDetails && (
          <Text color="fg.muted" fontSize="xs" fontWeight="medium">
            {t('sub_effect_details')}: {detail.subEffect.actionType} (Order:{' '}
            {detail.subEffect.orderId})
          </Text>
        )}
        {subEffectDetails}
      </Box>
    );

  const subSeriesSkills = detail.subSeries?.skills
    .map((subSkill) => {
      const skillDescription = subSkill.description && subSkill.description.trim() !== '' && (
        <Text fontSize="xs" whiteSpace="pre-line">
          {(subSkill.description ?? '').split('$').map((part, partIndex) =>
            partIndex % 2 === 1 ? (
              <Text as="span" key={partIndex} fontWeight="bold">
                {part}
              </Text>
            ) : (
              <Text as="span" key={partIndex}>
                {part}
              </Text>
            )
          )}
        </Text>
      );

      const skillEffects = subSkill.effects
        .map((effect) => {
          const effectDetails = effect.details
            .map((subSeriesSkillDetail, idx) => (
              <RecursiveSkillEffectDisplay
                key={`${subSeriesSkillDetail.id}-${idx}`}
                detail={subSeriesSkillDetail}
                level={level + 1}
                showEffectDetails={showEffectDetails}
              />
            ))
            .filter(Boolean);

          const hasEffectContent = showEffectDetails || (effectDetails && effectDetails.length > 0);
          if (!hasEffectContent) return null;

          return (
            <Box key={effect.id} borderLeftWidth="1px" borderColor="border.muted" mt="1" pl="4">
              {showEffectDetails && (
                <Text color="fg.muted" fontSize="xs" fontWeight="medium">
                  {t('effect_id')}: {effect.id} | {t('action_type')}: {effect.actionType} |{' '}
                  {t('order_id')}: {effect.orderId}
                </Text>
              )}
              {effectDetails}
            </Box>
          );
        })
        .filter(Boolean);

      const hasSkillContent =
        showEffectDetails || skillDescription || (skillEffects && skillEffects.length > 0);

      if (!hasSkillContent) return null;

      return (
        <Box key={subSkill.id} borderLeftWidth="1px" borderColor="border.default" mt="1" pl="4">
          <Text fontSize="xs" fontWeight="semibold">
            {t('skill_level')}: {subSkill.skillLevel} | {t('skill_cost')}: {subSkill.skillCost}
          </Text>
          {skillDescription}
          {skillEffects}
        </Box>
      );
    })
    .filter(Boolean);

  const subSeriesContent = detail.subSeries &&
    (showEffectDetails || (subSeriesSkills && subSeriesSkills.length > 0)) && (
      <Box borderLeftWidth="1px" borderColor="border.muted" mt="1" pl="4">
        <Text color="fg.muted" fontSize="xs" fontWeight="medium">
          {detail.subSeries.series.name}{' '}
          {showEffectDetails && <>(ID: {detail.subSeries.series.id})</>}
        </Text>
        {subSeriesSkills}
      </Box>
    );

  const subParamsEffectsDetails = detail.subParamsEffects
    ?.map((subEffect, idx) => {
      const subEffectInnerDetails = subEffect.details
        .map((subDetail, subIdx) => (
          <RecursiveSkillEffectDisplay
            key={`${subDetail.id}-${subIdx}`}
            detail={subDetail}
            level={level + 1}
            showEffectDetails={showEffectDetails}
          />
        ))
        .filter(Boolean);

      const hasSubEffectDetailsToShow =
        showEffectDetails || (subEffectInnerDetails && subEffectInnerDetails.length > 0);
      if (!hasSubEffectDetailsToShow) return null;

      return (
        <Box
          key={`${subEffect.id}-${idx}`}
          borderLeftWidth="1px"
          borderColor="border.default"
          mt="1"
          pl="4"
        >
          {showEffectDetails && (
            <Text color="fg.muted" fontSize="xs" fontWeight="medium">
              {t('sub_params_effect')}: {subEffect.actionType} (Order: {subEffect.orderId})
            </Text>
          )}
          {subEffectInnerDetails}
        </Box>
      );
    })
    .filter(Boolean);

  const subParamsEffectsContent = detail.subParamsEffects &&
    (showEffectDetails || (subParamsEffectsDetails && subParamsEffectsDetails.length > 0)) && (
      <Box borderLeftWidth="1px" borderColor="border.muted" ml="2" mt="1" pl="4">
        {subParamsEffectsDetails}
      </Box>
    );

  const hasAnyContent = mainText || subEffectContent || subSeriesContent || subParamsEffectsContent;

  if (!hasAnyContent) {
    return null;
  }

  return (
    <Box borderLeftWidth={level > 0 ? '2px' : '0'} borderColor="border.subtle" pl={`${indent}px`}>
      {mainText}
      {subEffectContent}
      {subSeriesContent}
      {subParamsEffectsContent}
    </Box>
  );
}
