import type { CrossVoice } from '../+data';
import { Box, HStack, Stack } from 'styled-system/jsx';
import { Text } from '~/components/ui/text';
import { getCardAudioFile } from '~/utils/assets';

interface CrossVoicesDisplayProps {
  cardId: number;
  voices: CrossVoice[];
  title: string;
}

function CrossVoicesDisplay({ cardId, voices, title }: CrossVoicesDisplayProps) {
  if (!voices || voices.length === 0) {
    return null;
  }

  return (
    <Stack gap="4" w="full" mt="4">
      <Text fontSize="2xl" fontWeight="bold">
        {title}
      </Text>
      {voices.map((voice) => (
        <HStack
          key={`${voice.partnerMemberId}-${voice.voiceFileName}`}
          justifyContent="space-between"
          borderRadius="md"
          borderWidth="1px"
          p="4"
        >
          <Box>
            <Text fontWeight="semibold">{voice.partnerName}</Text>
          </Box>
          <audio controls src={getCardAudioFile(cardId, voice.voiceFileName)}>
            Audio not supported
          </audio>
        </HStack>
      ))}
    </Stack>
  );
}

export { CrossVoicesDisplay };
