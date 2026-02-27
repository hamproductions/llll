import { useTranslation } from 'react-i18next';

import type { SkillEffectDetailWithRecursion } from '../card-data';
import { Box, HStack, Stack, styled } from 'styled-system/jsx';
import { Text } from '~/components/ui/text';
import { getPicUrl } from '~/utils/assets';

function findTokenResourceId(details: SkillEffectDetailWithRecursion[]): number | string | null {
  const resourceId = details.find((d) =>
    d.skillEffectDetailType?.endsWith('RESOURCE_ID')
  )?.effectValue;
  if (resourceId != null) {
    const hasExpandedSeries = details.some(
      (d) => d.subSeries && d.skillEffectDetailType?.includes('TOKEN_CARD')
    );
    if (hasExpandedSeries) return resourceId;
  }
  for (const d of details) {
    if (d.subEffect) {
      const found = findTokenResourceId(d.subEffect.details);
      if (found != null) return found;
    }
  }
  return null;
}

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
      <Box ml="2" pl="4">
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

          const resourceId = findTokenResourceId(effect.details);

          const hasEffectContent = showEffectDetails || (effectDetails && effectDetails.length > 0);
          if (!hasEffectContent) return null;

          return (
            <Box key={effect.id}>
              {showEffectDetails && (
                <Text color="fg.muted" fontSize="xs" fontWeight="medium">
                  {t('effect_id')}: {effect.id} | {t('action_type')}: {effect.actionType} |{' '}
                  {t('order_id')}: {effect.orderId}
                </Text>
              )}
              <HStack alignItems="flex-start">
                {resourceId && (
                  <styled.img
                    src={getPicUrl(resourceId.toString(), 'token')}
                    alt="Token Icon"
                    maxW="12"
                  />
                )}
                <Stack gap={0}>{effectDetails}</Stack>
              </HStack>
            </Box>
          );
        })
        .filter(Boolean);

      const hasSkillContent =
        showEffectDetails || skillDescription || (skillEffects && skillEffects.length > 0);

      if (!hasSkillContent) return null;

      return (
        <HStack key={subSkill.id} alignItems="flex-start">
          <styled.img
            src={getPicUrl(detail.subSeries?.skillIcon?.toString() ?? '', 'skillIcon')}
            alt="Skill Icon"
            maxW="12"
          />
          <Stack gap={0}>
            <Text fontSize="xs" fontWeight="semibold">
              {t('skill_level')}: {subSkill.skillLevel} | {t('skill_cost')}: {subSkill.skillCost}
            </Text>
            {skillDescription}
            {skillEffects}
          </Stack>
        </HStack>
      );
    })
    .filter(Boolean);

  const subSeriesContent = detail.subSeries &&
    (showEffectDetails || (subSeriesSkills && subSeriesSkills.length > 0)) && (
      <HStack alignItems="flex-start">
        <Stack gap={0}>
          <Text color="fg.muted" fontSize="xs" fontWeight="medium">
            {detail.subSeries.series.name}{' '}
            {showEffectDetails && <>(ID: {detail.subSeries.series.id})</>}
          </Text>
          {subSeriesSkills}
        </Stack>
      </HStack>
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

      const resourceId = findTokenResourceId(subEffect.details);

      const hasSubEffectDetailsToShow =
        showEffectDetails || (subEffectInnerDetails && subEffectInnerDetails.length > 0);
      if (!hasSubEffectDetailsToShow) return null;

      return (
        <Box key={`${subEffect.id}-${idx}`}>
          {showEffectDetails && (
            <Text color="fg.muted" fontSize="xs" fontWeight="medium">
              {t('sub_params_effect')}: {subEffect.actionType} (Order: {subEffect.orderId})
            </Text>
          )}
          {resourceId && (
            <styled.img
              src={getPicUrl(resourceId.toString(), 'token')}
              alt="Token Icon"
              maxW="12"
            />
          )}
          {subEffectInnerDetails}
        </Box>
      );
    })
    .filter(Boolean);

  const subParamsEffectsContent = detail.subParamsEffects &&
    (showEffectDetails || (subParamsEffectsDetails && subParamsEffectsDetails.length > 0)) && (
      <Box pl="4">{subParamsEffectsDetails}</Box>
    );

  const hasAnyContent = mainText || subEffectContent || subSeriesContent || subParamsEffectsContent;

  if (!hasAnyContent) {
    return null;
  }

  return (
    <Box pl={`${indent}px`}>
      {mainText}
      <Stack>
        {subEffectContent}
        {subSeriesContent}
        {subParamsEffectsContent}
      </Stack>
    </Box>
  );
}
