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

  return (
    <Stack gap="2" w="full" maxW="4xl" my="3" mx="auto" px={{ base: '4', md: '0' }}>
      {hasCharacterName ? (
        <HStack gap="3" alignItems="flex-start">
          <Box flexShrink={0} pt="2" display={{ base: 'none', md: 'flex' }} alignItems="center" gap="2">
            {characterStyle.characterId && (
              <styled.img
                src={getPicUrl(String(characterStyle.characterId), 'charaIcon')}
                alt={line.characterName}
                borderRadius="full"
                w="40px"
                h="40px"
                flexShrink={0}
                objectFit="cover"
              />
            )}
            <Text color={characterStyle.color} fontSize="sm" fontWeight="semibold" whiteSpace="nowrap">
              {line.characterName}
            </Text>
            {line.voiceId && <VoicePlayer voiceId={line.voiceId} voiceUrl={getStoryVoiceUrl(line.voiceId)} index={index} />}
          </Box>

          <Box
            flex="1"
            borderLeftWidth="3px"
            borderLeftColor={characterStyle.color}
            borderRadius="lg"
            p="4"
            bg="bg.muted"
            borderLeftStyle="solid"
          >
            <HStack display={{ base: 'flex', md: 'none' }} gap="2" alignItems="center" mb="2">
              {characterStyle.characterId && (
                <styled.img
                  src={getPicUrl(String(characterStyle.characterId), 'charaIcon')}
                  alt={line.characterName}
                  borderRadius="full"
                  w="32px"
                  h="32px"
                  flexShrink={0}
                  objectFit="cover"
                />
              )}
              <Text color={characterStyle.color} fontSize="xs" fontWeight="semibold">
                {line.characterName}
              </Text>
              {line.voiceId && <VoicePlayer voiceId={line.voiceId} voiceUrl={getStoryVoiceUrl(line.voiceId)} index={index} />}
            </HStack>

            <Text
              dangerouslySetInnerHTML={{ __html: line.content }}
              fontSize="md"
              lineHeight="1.7"
            />
          </Box>
        </HStack>
      ) : (
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
