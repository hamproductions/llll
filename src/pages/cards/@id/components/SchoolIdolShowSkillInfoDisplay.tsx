import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { SchoolIdolShowSkills } from '../+data';
import { Box, HStack, Stack } from 'styled-system/jsx';
import { createListCollection, Select } from '~/components/ui/select';
import { Text } from '~/components/ui/text';

interface SchoolIdolShowSkillInfoDisplayProps {
  skills: SchoolIdolShowSkills[];
  label: string;
}

export function SchoolIdolShowSkillInfoDisplay({
  skills,
  label
}: SchoolIdolShowSkillInfoDisplayProps) {
  const { t } = useTranslation();
  const [selectedSkillLevel, setSelectedSkillLevel] = useState<number | undefined>(14);

  const availableSkillLevels = useMemo(() => {
    if (!skills || skills.length === 0) {
      return createListCollection({ items: [] });
    }
    const levels = skills
      .map((s) => s.skill_level)
      .filter((l) => l !== null && l !== undefined)
      .sort((a, b) => a - b);

    const uniqueLevels = [...new Set(levels)];

    if (uniqueLevels.length <= 1) {
      return createListCollection({ items: [] });
    }

    return createListCollection({
      items: uniqueLevels.map((level) => ({
        value: String(level),
        label: t('level_value', { value: level })
      }))
    });
  }, [skills, t]);

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

  const selectedSkill =
    skills.find((skill) => skill.skill_level === selectedSkillLevel) ?? skills[0];

  if (!skills || skills.length === 0) return null;

  return (
    <Stack gap="2" mt="4">
      <Text fontSize="xl" fontWeight="bold">
        {label}
      </Text>

      {availableSkillLevels.items.length > 1 && (
        <HStack mb="2">
          <label htmlFor={`${label.replace(/\s+/g, '-')}-skill-level-select`}>
            {t('select_skill_level')}:
          </label>
          <Select.Root
            collection={availableSkillLevels}
            value={selectedSkillLevel !== undefined ? [String(selectedSkillLevel)] : []}
            onValueChange={handleLevelChange}
            positioning={{ sameWidth: true }}
            id={`${label.replace(/\s+/g, '-')}-skill-level-select`}
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
                <Select.ItemGroup id={`${label.replace(/\s+/g, '-')}-levels`}>
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

      {selectedSkill && (
        <Box borderRadius="md" borderWidth="1px" mb="2" p="3">
          <Text fontSize="md" fontWeight="semibold">
            {[
              selectedSkill.skill_level !== null &&
                selectedSkill.skill_level !== undefined &&
                `${t('skill_level')}: ${selectedSkill.skill_level}`,
              selectedSkill.skill_cost !== null &&
                selectedSkill.skill_cost !== undefined &&
                `${t('skill_cost')}: ${selectedSkill.skill_cost}`
            ]
              .filter(Boolean)
              .join(' | ')}
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
        </Box>
      )}
    </Stack>
  );
}
