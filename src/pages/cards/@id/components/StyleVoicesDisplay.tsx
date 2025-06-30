import type { StyleVoice } from '../+data';
import { Box, HStack, Stack } from 'styled-system/jsx';
import { Text } from '~/components/ui/text';
import { getCardAudioFile } from '~/utils/assets';

interface StyleVoicesDisplayProps {
  cardId: number;
  voices: StyleVoice[];
  title: string;
}

function StyleVoicesDisplay({ cardId, voices, title }: StyleVoicesDisplayProps) {
  if (!voices || voices.length === 0) {
    return null;
  }

  return (
    <Stack gap="4" w="full" mt="4">
      <Text fontSize="2xl" fontWeight="bold">
        {title}
      </Text>
      {voices.map((voice) => {
        return (
          <HStack
            key={voice.id}
            justifyContent="space-between"
            borderRadius="md"
            borderWidth="1px"
            p="4"
          >
            <Box>
              <Text fontWeight="semibold">{voice.name}</Text>
              <Text color="gray.500" fontSize="sm">
                {voice.releaseConditionText}
              </Text>
            </Box>
            {voice.voiceName && (
              <audio controls src={getCardAudioFile(cardId, voice.voiceName)}>
                Your browser does not support the audio element.
              </audio>
            )}
          </HStack>
        );
      })}
    </Stack>
  );
}

export { StyleVoicesDisplay };
