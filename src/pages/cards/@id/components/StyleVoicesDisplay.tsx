import type { StyleVoice } from '../+data';
import { Box, Stack } from 'styled-system/jsx';
import { Text } from '~/components/ui/text';

interface StyleVoicesDisplayProps {
  voices: StyleVoice[];
  title: string;
}

function StyleVoicesDisplay({ voices, title }: StyleVoicesDisplayProps) {
  if (!voices || voices.length === 0) {
    return null;
  }

  return (
    <Stack gap="4" w="full" mt="4">
      <Text fontSize="2xl" fontWeight="bold">
        {title}
      </Text>
      {voices.map((voice) => (
        <Box key={voice.id} borderRadius="md" borderWidth="1px" p="4">
          <Text>{voice.name}</Text>
        </Box>
      ))}
    </Stack>
  );
}

export { StyleVoicesDisplay };
