import { useTranslation } from 'react-i18next';
import type { LimitBreakMaterialRate } from '../+data';
import { Box, Stack } from 'styled-system/jsx';
import { Table } from '~/components/ui/table';
import { Text } from '~/components/ui/text';

interface LimitBreakMaterialRatesTableProps {
  rates: LimitBreakMaterialRate[];
  title: string;
}

export function LimitBreakMaterialRatesTable({ rates, title }: LimitBreakMaterialRatesTableProps) {
  const { t } = useTranslation();

  if (!rates || rates.length === 0) {
    return null;
  }

  return (
    <Stack gap="4" w="full" mt="4">
      <Text fontSize="2xl" fontWeight="bold">
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
                {t('material_id')}
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
            {rates.map((rate, idx) => (
              <Table.Row
                key={rate.id}
                borderTopWidth={idx === 0 ? '0' : '1px'}
                borderColor="border.subtle"
              >
                <Table.Cell py="3" px="4" fontSize="sm">
                  {rate.limitBreakMaterialId}
                </Table.Cell>
                <Table.Cell py="3" px="4" fontSize="sm">
                  {rate.limitBreakMaterialQuantity}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>
    </Stack>
  );
}
