import { Box, HStack, Stack } from 'styled-system/jsx';
import { Link } from '~/components/ui/link';
import { Text } from '~/components/ui/text';

interface AudioArchiveCardProps {
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  imageAlt?: string;
  audioUrl: string;
  href?: string;
  metadata?: string[];
}

export function AudioArchiveCard({
  title,
  subtitle,
  description,
  imageUrl,
  imageAlt,
  audioUrl,
  href,
  metadata
}: AudioArchiveCardProps) {
  return (
    <Stack
      gap="4"
      borderWidth="1px"
      borderRadius="xl"
      bg="bg.panel"
      p="4"
      h="full"
      boxShadow="sm"
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={imageAlt ?? title}
          style={{
            width: '100%',
            aspectRatio: '1 / 1',
            objectFit: 'cover',
            borderRadius: '0.75rem'
          }}
        />
      ) : null}
      <Stack gap="2" flex="1">
        <Text fontSize="lg" fontWeight="bold" lineClamp="2">
          {title}
        </Text>
        {subtitle ? (
          <Text fontSize="sm" color="fg.muted">
            {subtitle}
          </Text>
        ) : null}
        {description ? (
          <Text fontSize="sm" color="fg.muted" lineClamp="3">
            {description}
          </Text>
        ) : null}
        {metadata && metadata.length > 0 ? (
          <HStack gap="2" flexWrap="wrap">
            {metadata.map((item) => (
              <Box
                key={item}
                px="2"
                py="1"
                borderRadius="full"
                bg="bg.muted"
                color="fg.muted"
                fontSize="xs"
              >
                {item}
              </Box>
            ))}
          </HStack>
        ) : null}
      </Stack>
      <audio controls preload="none" src={audioUrl} style={{ width: '100%' }}>
        Your browser does not support audio playback.
      </audio>
      {href ? (
        <Link href={href} _hover={{ textDecoration: 'underline' }}>
          Open source
        </Link>
      ) : null}
    </Stack>
  );
}
