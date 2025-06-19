import { useTranslation } from 'react-i18next';

import type { SkillEffectDetailWithRecursion } from '../card-data';
import { Box } from 'styled-system/jsx';
import { Text } from '~/components/ui/text';

interface RecursiveSkillEffectDisplayProps {
  detail: SkillEffectDetailWithRecursion;
  level?: number;
}

export function RecursiveSkillEffectDisplay({
  detail,
  level = 0
}: RecursiveSkillEffectDisplayProps) {
  const { t } = useTranslation();
  const indent = level * 16; // 1rem indent per level
  // FIXME: detail.subEffect?.actionType is number, was compared to 'SUB_EFFECT_SET'. This logic needs review.
  const isSubEffectSet = false;

  return (
    <Box
      borderLeftWidth={level > 0 ? '2px' : '0'}
      borderColor="border.subtle"
      py="1"
      pl={`${indent}px`}
    >
      <Text fontSize="xs">
        {detail.skillEffectDetailType}: {detail.effectValue}
        {detail.targetMood !== null && ` (Target Mood: ${detail.targetMood})`}
      </Text>
      {detail.subEffect && !isSubEffectSet && (
        <Box borderLeftWidth="1px" borderColor="border.muted" ml="2" mt="1" pl="4">
          <Text color="fg.muted" fontSize="xs" fontWeight="medium">
            {t('sub_effect_details')}: {detail.subEffect.actionType} (Order:{' '}
            {detail.subEffect.orderId})
          </Text>
          {detail.subEffect.details.map((subDetail, idx) => (
            <RecursiveSkillEffectDisplay
              key={`${subDetail.id}-${idx}`}
              detail={subDetail}
              level={level + (isSubEffectSet ? 0 : 1)}
            />
          ))}
        </Box>
      )}
      {detail.subEffect && isSubEffectSet && (
        <Box ml="2" mt="1" pl="4">
          {detail.subEffect.details.map((subDetail, idx) => (
            <RecursiveSkillEffectDisplay
              key={`${subDetail.id}-${idx}`}
              detail={subDetail}
              level={level + (isSubEffectSet ? 0 : 1)}
            />
          ))}
        </Box>
      )}
      {detail.subSeries && (
        <Box borderLeftWidth="1px" borderColor="border.muted" mt="1" pl="4">
          <Text color="fg.muted" fontSize="xs" fontWeight="medium">
            {t('sub_series_details')}: {detail.subSeries.series.name} (ID:{' '}
            {detail.subSeries.series.id})
          </Text>
          {detail.subSeries.skills // The filtering is now done in card-data.ts
            .map((subSkill) => (
              <Box
                key={subSkill.id}
                borderLeftWidth="1px"
                borderColor="border.default"
                mt="1"
                pl="4"
              >
                <Text fontSize="xs" fontWeight="semibold">
                  {t('skill_level')}: {subSkill.skillLevel} | {t('skill_cost')}:{' '}
                  {subSkill.skillCost}
                </Text>
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
                {subSkill.effects.map((effect) => (
                  <Box
                    key={effect.id}
                    borderLeftWidth="1px"
                    borderColor="border.muted"
                    mt="1"
                    pl="4"
                  >
                    <Text color="fg.muted" fontSize="xs" fontWeight="medium">
                      {t('effect_id')}: {effect.id} | {t('action_type')}: {effect.actionType} |{' '}
                      {t('order_id')}: {effect.orderId}
                    </Text>
                    {effect.details.map((subSeriesSkillDetail, idx) => (
                      <RecursiveSkillEffectDisplay
                        key={`${subSeriesSkillDetail.id}-${idx}`}
                        detail={subSeriesSkillDetail}
                        level={level + 1} // Pass currentSkillLevelForFiltering down
                      />
                    ))}
                  </Box>
                ))}
              </Box>
            ))}
        </Box>
      )}
      {detail.subParamsEffects && detail.subParamsEffects.length > 0 && (
        <Box borderLeftWidth="1px" borderColor="border.muted" ml="2" mt="1" pl="4">
          {detail.subParamsEffects.map((subEffect, idx) => (
            <Box
              key={`${subEffect.id}-${idx}`}
              borderLeftWidth="1px"
              borderColor="border.default"
              mt="1"
              pl="4"
            >
              <Text color="fg.muted" fontSize="xs" fontWeight="medium">
                {t('sub_params_effect')}: {subEffect.actionType} (Order: {subEffect.orderId})
              </Text>
              {subEffect.details.map((subDetail, subIdx) => (
                <RecursiveSkillEffectDisplay
                  key={`${subDetail.id}-${subIdx}`}
                  detail={subDetail}
                  level={level + 1}
                />
              ))}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
