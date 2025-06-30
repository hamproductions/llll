import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { SkillSeriesDetails } from '../card-data';
import { RecursiveSkillEffectDisplay } from './RecursiveSkillEffectDisplay';
import { Box, HStack, Stack } from 'styled-system/jsx';
import { createListCollection, Select } from '~/components/ui/select';
import { Text } from '~/components/ui/text';

interface SkillInfoDisplayProps {
  skillInfo?: SkillSeriesDetails;
  title: string;
  showEffectDetails?: boolean;
}

function SkillInfoDisplay({ skillInfo, title, showEffectDetails = false }: SkillInfoDisplayProps) {
  const { t } = useTranslation();
  const [selectedSkillLevel, setSelectedSkillLevel] = useState<number | undefined>(14);

  const availableSkillLevels = useMemo(() => {
    if (!skillInfo) return createListCollection({ items: [] });
    const levels = skillInfo.skills.map((s) => s.skillLevel).sort((a, b) => (a ?? 0) - (b ?? 0));
    return createListCollection({
      items: levels.map((level) => ({
        value: String(level),
        label: t('level_value', { value: level })
      }))
    });
  }, [skillInfo, t]);

  useEffect(() => {
    if (availableSkillLevels.items.length > 0) {
      if (
        selectedSkillLevel === undefined ||
        !availableSkillLevels.items.some((item) => Number(item.value) === selectedSkillLevel)
      ) {
        setSelectedSkillLevel(Number(availableSkillLevels.items[0].value));
      }
    } else {
      setSelectedSkillLevel(undefined);
    }
  }, [availableSkillLevels, selectedSkillLevel]);

  const handleLevelChange = (details: { value: string[] }) => {
    setSelectedSkillLevel(Number(details.value[0]));
  };

  const selectedSkill = skillInfo?.skills.find((skill) => skill.skillLevel === selectedSkillLevel);

  const hasAnySkillContent = useMemo(() => {
    if (!selectedSkill) return false;

    // Check for description content
    if (selectedSkill.description && selectedSkill.description.trim() !== '') return true;

    // Check if any effect would render
    const effectsToRender = selectedSkill.effects.filter((effect) => {
      const hasDetailsToShow = showEffectDetails || effect.details.length > 0;
      if (!hasDetailsToShow) return false; // Effect itself won't render

      // Check if any of the effect's details would render
      const detailsToRender = effect.details.filter((detail) => {
        // This is a simplified check, ideally RecursiveSkillEffectDisplay would expose a way to check this
        // For now, we assume if showEffectDetails is true or detail has sub-content, it will render
        return (
          showEffectDetails ||
          detail.subEffect ||
          detail.subSeries ||
          (detail.subParamsEffects && detail.subParamsEffects.length > 0)
        );
      });
      return detailsToRender.length > 0;
    });

    return effectsToRender.length > 0;
  }, [selectedSkill, showEffectDetails]);

  if (!skillInfo) return null;

  return (
    <Stack gap="2" mt="4">
      <Text fontSize="xl" fontWeight="bold">
        {title}
      </Text>
      {skillInfo.series.name && skillInfo.series.name.trim() !== '' && (
        <Text>{skillInfo.series.name}</Text>
      )}

      {availableSkillLevels.items.length > 1 && (
        <HStack mb="2">
          <label htmlFor={`${title.replace(/\s+/g, '-')}-skill-level-select`}>
            {t('select_skill_level')}:
          </label>
          <Select.Root
            collection={availableSkillLevels}
            value={selectedSkillLevel !== undefined ? [String(selectedSkillLevel)] : []}
            onValueChange={handleLevelChange}
            positioning={{ sameWidth: true }}
            id={`${title.replace(/\s+/g, '-')}-skill-level-select`}
            w="fit-content"
            mt="1"
          >
            <Select.Control>
              <Select.Trigger>
                <Select.ValueText placeholder={t('select_level')} />
                <Select.Indicator>▼</Select.Indicator>
              </Select.Trigger>
            </Select.Control>
            <Select.Positioner>
              <Select.Content>
                <Select.ItemGroup id={`${title.replace(/\s+/g, '-')}-levels`}>
                  {availableSkillLevels.items.map((item) => (
                    <Select.Item key={item.value} item={item}>
                      <Select.ItemText>{item.label}</Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.ItemGroup>
              </Select.Content>
            </Select.Positioner>
          </Select.Root>
        </HStack>
      )}

      {selectedSkill && hasAnySkillContent && (
        <Box key={selectedSkill.id} borderRadius="md" borderWidth="1px" mb="2" p="3">
          <Text fontSize="md" fontWeight="semibold">
            {t('skill_level')}: {selectedSkill.skillLevel} | {t('skill_cost')}:{' '}
            {selectedSkill.skillCost}
          </Text>
          {selectedSkill.description && selectedSkill.description.trim() !== '' && (
            <Text mb="2" fontSize="sm" whiteSpace="pre-line">
              {(selectedSkill.description ?? '').split('$').map((part, partIndex) =>
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
          )}
          {selectedSkill.effects.map((effect) => {
            const hasDetailsToShow = showEffectDetails || effect.details.length > 0;
            if (!hasDetailsToShow) return null; // Don't render the Box if no content

            return (
              <Box key={effect.id} borderLeftWidth="2px" borderColor="accent.default" mt="2" pl="2">
                {showEffectDetails && (
                  <Text fontSize="sm" fontWeight="medium">
                    {t('effect_id')}: {effect.id} | {t('action_type')}: {effect.actionType} |{' '}
                    {t('order_id')}: {effect.orderId}
                  </Text>
                )}
                {effect.details.map((detail, idx) => (
                  <RecursiveSkillEffectDisplay
                    key={`${detail.id}-${idx}`}
                    detail={detail}
                    level={1}
                    showEffectDetails={showEffectDetails}
                  />
                ))}
              </Box>
            );
          })}
        </Box>
      )}
    </Stack>
  );
}

export { SkillInfoDisplay };
