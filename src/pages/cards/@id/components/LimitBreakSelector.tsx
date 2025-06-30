import { RadioGroup } from '~/components/ui/radio-group';
import { Flex } from 'styled-system/jsx';

export interface LimitBreakItem {
  value: string;
  label: string;
  disabled?: boolean;
}

interface LimitBreakSelectorProps {
  collection: { items: LimitBreakItem[] };
  value: string;
  onValueChange: (details: { value: string }) => void;
}

export function LimitBreakSelector({ collection, value, onValueChange }: LimitBreakSelectorProps) {
  return (
    <Flex mb="4">
      <RadioGroup.Root value={value} onValueChange={onValueChange} orientation="horizontal">
        {collection.items.map((item) => (
          <RadioGroup.Item key={item.value} value={item.value}>
            <RadioGroup.ItemControl />
            <RadioGroup.ItemText>{item.label}</RadioGroup.ItemText>
            <RadioGroup.ItemHiddenInput />
          </RadioGroup.Item>
        ))}
      </RadioGroup.Root>
    </Flex>
  );
}
