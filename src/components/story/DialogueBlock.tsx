import { Box, HStack, Stack } from 'styled-system/jsx';
import { Text } from '~/components/ui/text';
import type { StoryLine } from '~/utils/storyParser';
import { getPicUrl, getStoryVoiceUrl } from '~/utils/assets';
import { styled } from 'styled-system/jsx';
import { VoicePlayer } from './VoicePlayer';

interface DialogueBlockProps {
  line: StoryLine;
  index: number;
}

export function DialogueBlock({ line, index }: DialogueBlockProps) {
  const hasCharacterName = !!line.characterName;
  const characterStyle = line.characterStyle ?? { color: '#8B7D6B', lightColor: '#D3C5B8' };

  function CharacterIcon({ size }: { size: string }) {
    return characterStyle.characterId ? (
      <styled.img
        src={getPicUrl(String(characterStyle.characterId), 'charaIcon')}
        alt={line.characterName}
        borderRadius="full"
        width={size}
        height={size}
        flexShrink={0}
        objectFit="cover"
      />
    ) : null;
  }

  function CharacterLabel({ fontSize }: { fontSize: string }) {
    return (
      <HStack gap="2" alignItems="center">
        <CharacterIcon size={fontSize === 'xs' ? '20px' : '24px'} />
        <Text color={characterStyle.color} fontSize={fontSize} fontWeight="semibold">
          {line.characterName}
        </Text>
        {line.voiceId && <VoicePlayer voiceId={line.voiceId} voiceUrl={getStoryVoiceUrl(line.voiceId)} index={index} />}
      </HStack>
    );
  }

  return (
    <Stack gap="2" w="full" maxW="4xl" my="3" mx="auto">
      {hasCharacterName ? (
        <HStack gap="3" alignItems="flex-start">
          {/* Character indicator - desktop */}
          <Box
            display={{ base: 'none', md: 'block' }}
            flexShrink="0"
            minW="120px"
            pt="1"
            textAlign="right"
          >
            <Box display="flex" justifyContent="flex-end">
              <CharacterLabel fontSize="sm" />
            </Box>
          </Box>

          {/* Dialogue bubble */}
          <Box
            position="relative"
            flex="1"
            borderLeftWidth="3px"
            borderLeftColor={characterStyle.color}
            borderRadius="lg"
            p="4"
            bg="bg.muted"
            borderLeftStyle="solid"
          >
            {/* Character indicator - mobile */}
            <Box display={{ base: 'block', md: 'none' }} mb="2">
              <CharacterLabel fontSize="xs" />
            </Box>

            {/* Dialogue text */}
            <Text
              dangerouslySetInnerHTML={{ __html: line.content }}
              fontSize="md"
              lineHeight="1.7"
            />
          </Box>
        </HStack>
      ) : (
        /* No character - full width dialogue */
        <Stack gap="2" w="full">
          {line.voiceId && (
            <Box>
              <VoicePlayer voiceId={line.voiceId} voiceUrl={getStoryVoiceUrl(line.voiceId)} index={index} />
            </Box>
          )}
          <Box
            borderLeftWidth="3px"
            borderLeftColor={characterStyle.color}
            borderRadius="lg"
            w="full"
            p="4"
            bg="bg.muted"
            borderLeftStyle="solid"
          >
            <Text dangerouslySetInnerHTML={{ __html: line.content }} fontSize="md" lineHeight="1.7" />
          </Box>
        </Stack>
      )}
    </Stack>
  );
}
