import { Box } from 'styled-system/jsx';
import { Text } from '~/components/ui/text';

interface SceneSeparatorProps {
  variant?: 'fade' | 'blackout' | 'default';
}

export function SceneSeparator({ variant = 'default' }: SceneSeparatorProps) {
  return (
    <Box w="full" maxW="4xl" mx="auto" my="8" px="4">
      <Box
        h="1px"
        bg="border.default"
        position="relative"
        _before={{
          content: '"✦"',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bg: 'bg.canvas',
          px: '4',
          color: 'fg.muted',
          fontSize: 'sm'
        }}
      />
      {variant !== 'default' && (
        <Text
          fontSize="xs"
          color="fg.muted"
          textAlign="center"
          mt="2"
          textTransform="uppercase"
          letterSpacing="wide"
        >
          {variant}
        </Text>
      )}
    </Box>
  );
}
