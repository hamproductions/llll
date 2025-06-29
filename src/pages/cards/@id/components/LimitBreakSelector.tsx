import type { TFunction } from 'i18next';
import { RadioGroup } from '~/components/ui/radio-group';
import { Flex } from 'styled-system/jsx';

export interface LimitBreakItem {
  value: string;
  label: string;
  disabled?: boolean;
}

interface LimitBreakSelectorProps {
  collection: { items: LimitBreakItem[] };
  value: string[];
  onValueChange: (details: { value: string }) => void;
  t: TFunction;
}

export function LimitBreakSelector({
  collection,
  value,
  onValueChange,
  t
}: LimitBreakSelectorProps) {
  return (
    <Flex justify="center" mb="4">
      <RadioGroup.Root
        value={value[0]}
        onValueChange={onValueChange}
        display="flex"
        gap="4"
        flexDirection="row"
        alignItems="center"
      >
        {collection.items.map((item) => (
          <RadioGroup.Item key={item.value} value={item.value}>
            <RadioGroup.ItemControl />
            <RadioGroup.ItemText>{item.label}</RadioGroup.ItemText>
          </RadioGroup.Item>
        ))}
      </RadioGroup.Root>
    </Flex>
  );
}
