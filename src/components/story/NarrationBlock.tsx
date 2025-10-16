import { Box } from 'styled-system/jsx';
import { Text } from '~/components/ui/text';
import type { StoryLine } from '~/utils/storyParser';

interface NarrationBlockProps {
  line: StoryLine;
}

export function NarrationBlock({ line }: NarrationBlockProps) {
  return (
    <Box w="full" maxW="4xl" mx="auto" my="3" px="4">
      <Text
        fontSize="md"
        lineHeight="1.8"
        color="fg.default"
        textAlign="center"
        fontStyle="italic"
        dangerouslySetInnerHTML={{ __html: line.content }}
      />
    </Box>
  );
}
