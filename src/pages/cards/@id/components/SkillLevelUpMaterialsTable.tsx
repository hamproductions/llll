import { useTranslation } from 'react-i18next';
import type { SkillLevelUpMaterial } from '../+data';
import { Box, Stack } from 'styled-system/jsx';
import { Table } from '~/components/ui/table';
import { Text } from '~/components/ui/text';

interface SkillLevelUpMaterialsTableProps {
  materials: SkillLevelUpMaterial[];
  title: string;
}

export function SkillLevelUpMaterialsTable({ materials, title }: SkillLevelUpMaterialsTableProps) {
  const { t } = useTranslation();

  if (!materials || materials.length === 0) {
    return null;
  }

  return (
    <Stack gap="4" w="full" mt="4">
      <Text fontSize="xl" fontWeight="bold">
        {title}
      </Text>
      <Box borderRadius="lg" borderWidth="1px" overflowX="auto">
        <Table.Root width="full" css={{ tableLayout: 'auto' }}>
          <Table.Head bg="bg.subtle">
            <Table.Row>
              <Table.Header
                py="3"
                px="4"
                color="fg.muted"
                textAlign="left"
                fontSize="sm"
                fontWeight="semibold"
              >
                {t('skill_level')}
              </Table.Header>
              <Table.Header
                py="3"
                px="4"
                color="fg.muted"
                textAlign="left"
                fontSize="sm"
                fontWeight="semibold"
              >
                {t('material')} 1
              </Table.Header>
              <Table.Header
                py="3"
                px="4"
                color="fg.muted"
                textAlign="left"
                fontSize="sm"
                fontWeight="semibold"
              >
                {t('material')} 2
              </Table.Header>
              <Table.Header
                py="3"
                px="4"
                color="fg.muted"
                textAlign="left"
                fontSize="sm"
                fontWeight="semibold"
              >
                {t('material')} 3
              </Table.Header>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {materials
              .sort(
                (a, b) =>
                  (a.skillLevel ?? 0) - (b.skillLevel ?? 0) ||
                  (a.skillType ?? 0) - (b.skillType ?? 0)
              )
              .map((material, idx) => (
                <Table.Row
                  key={material.id}
                  borderTopWidth={idx === 0 ? '0' : '1px'}
                  borderColor="border.subtle"
                >
                  <Table.Cell py="3" px="4" fontSize="sm">
                    {material.skillLevel}
                  </Table.Cell>
                  <Table.Cell py="3" px="4" fontSize="sm">
                    {material.itemName1 ? `${material.itemName1} (x${material.costNum1})` : '-'}
                  </Table.Cell>
                  <Table.Cell py="3" px="4" fontSize="sm">
                    {material.itemName2 ? `${material.itemName2} (x${material.costNum2})` : '-'}
                  </Table.Cell>
                  <Table.Cell py="3" px="4" fontSize="sm">
                    {material.itemName3 ? `${material.itemName3} (x${material.costNum3})` : '-'}
                  </Table.Cell>
                </Table.Row>
              ))}
          </Table.Body>
        </Table.Root>
      </Box>
    </Stack>
  );
}
