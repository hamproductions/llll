import type { TFunction } from 'i18next';
import type { ListCollection } from '@ark-ui/react';
import { Select } from '~/components/ui/select';
import { Box } from 'styled-system/jsx';

export interface LimitBreakItem {
  value: string;
  label: string;
  disabled?: boolean;
}

interface LimitBreakSelectorProps {
  collection: ListCollection<LimitBreakItem>;
  value: string[];
  onValueChange: (details: { value: string[] }) => void;
  t: TFunction;
}

export function LimitBreakSelector({
  collection,
  value,
  onValueChange,
  t
}: LimitBreakSelectorProps) {
  return (
    <Box mb="4">
      <Select.Root
        collection={collection}
        value={value}
        onValueChange={onValueChange}
        positioning={{ sameWidth: true }}
        w="fit-content"
      >
        <Select.Label>{t('select_limit_break')}:</Select.Label>
        <Select.Control>
          <Select.Trigger>
            <Select.ValueText placeholder={t('select_limit_break')} />
            <Select.Indicator>▼</Select.Indicator>
          </Select.Trigger>
        </Select.Control>
        <Select.Positioner>
          <Select.Content>
            <Select.ItemGroup id="limit-break">
              {collection.items.map((item) => (
                <Select.Item key={item.value} item={item}>
                  <Select.ItemText>{item.label}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.ItemGroup>
          </Select.Content>
        </Select.Positioner>
      </Select.Root>
    </Box>
  );
}
