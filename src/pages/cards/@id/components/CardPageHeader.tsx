import type { TFunction } from 'i18next';
import { FaArrowLeft } from 'react-icons/fa6';
import { Text } from '~/components/ui/text';
import { Box, Stack } from 'styled-system/jsx';
import { Link } from '~/components/ui/link';

interface CardPageHeaderProps {
  name?: string;
  character?: {
    id: number;
    displayLabel: string;
  } | null;
  t: TFunction;
}

export function CardPageHeader({ name, character, t }: CardPageHeaderProps) {
  return (
    <Stack alignItems="center" w="full">
      <Box display="flex" gap="4" flexWrap="wrap" justifyContent="center">
        <Link href="/cards">
          <FaArrowLeft />
          {t('back_to_list')}
        </Link>
        {character ? <Link href={`/characters/${character.id}`}>{character.displayLabel}</Link> : null}
      </Box>
      <Text textAlign="center" fontSize="3xl" fontWeight="bold">
        {name}
      </Text>
    </Stack>
  );
}
