import { Stack } from 'styled-system/jsx';
import { Text } from '~/components/ui/text';

interface StatCardProps {
  label: string;
  value: string | number;
  description?: string;
}

export function StatCard({ label, value, description }: StatCardProps) {
  return (
    <Stack gap="2" borderWidth="1px" borderRadius="xl" bg="bg.panel" p="4" boxShadow="sm">
      <Text fontSize="sm" color="fg.muted" textTransform="uppercase" letterSpacing="widest">
        {label}
      </Text>
      <Text fontSize="3xl" fontWeight="black">
        {value}
      </Text>
      {description ? (
        <Text fontSize="sm" color="fg.muted">
          {description}
        </Text>
      ) : null}
    </Stack>
  );
}
