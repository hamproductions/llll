import { useTranslation } from 'react-i18next';
import type { LimitBreakMaterial } from '../+data';
import { Box } from 'styled-system/jsx';
import { Table } from '~/components/ui/table';

interface LimitBreakMaterialsTableProps {
  materials: LimitBreakMaterial[];
}

export function LimitBreakMaterialsTable({ materials }: LimitBreakMaterialsTableProps) {
  const { t } = useTranslation();

  if (!materials || materials.length === 0) {
    return null;
  }

  return (
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
              {t('limit_break_level')}
            </Table.Header>
            <Table.Header
              py="3"
              px="4"
              color="fg.muted"
              textAlign="left"
              fontSize="sm"
              fontWeight="semibold"
            >
              {t('material')}
            </Table.Header>
            <Table.Header
              py="3"
              px="4"
              color="fg.muted"
              textAlign="left"
              fontSize="sm"
              fontWeight="semibold"
            >
              {t('quantity')}
            </Table.Header>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {materials
            .sort((a, b) => (a.limitBreakTimes ?? 0) - (b.limitBreakTimes ?? 0))
            .map((material: LimitBreakMaterial, idx) => (
              <Table.Row
                key={`${material.limitBreakTimes}-${material.itemName}`}
                borderTopWidth={idx === 0 ? '0' : '1px'}
                borderColor="border.subtle"
              >
                <Table.Cell py="3" px="4" fontSize="sm">
                  {material.limitBreakTimes}
                </Table.Cell>
                <Table.Cell py="3" px="4" fontSize="sm">
                  {material.itemName}
                </Table.Cell>
                <Table.Cell py="3" px="4" fontSize="sm">
                  {material.costNum}
                </Table.Cell>
              </Table.Row>
            ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
}
