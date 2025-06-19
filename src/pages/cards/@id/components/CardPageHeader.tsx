import type { TFunction } from 'i18next';
import { FaArrowLeft } from 'react-icons/fa6';
import { Text } from '~/components/ui/text';
import { Box, Stack } from 'styled-system/jsx';
import { Link } from '~/components/ui/link';

interface CardPageHeaderProps {
  name?: string;
  description?: string;
  t: TFunction;
}

export function CardPageHeader({ name, description, t }: CardPageHeaderProps) {
  return (
    <Stack alignItems="center" w="full">
      <Box>
        <Link href="/cards">
          <FaArrowLeft />
          {t('back_to_list')}
        </Link>
      </Box>
      <Text textAlign="center" fontSize="3xl" fontWeight="bold">
        {name}
      </Text>
      <Text textAlign="center">{description}</Text>
    </Stack>
  );
}
