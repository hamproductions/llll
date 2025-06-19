import { useTranslation } from 'react-i18next';
import { Text } from '../../components/ui/text';
import { Metadata } from '~/components/layout/Metadata';
import { Stack } from 'styled-system/jsx';
import { Link } from '~/components/ui/link';

export function Page() {
  const { t } = useTranslation();

  const title = t('title');

  return (
    <>
      <Metadata title={title} />
      <Stack alignItems="center" w="full" _print={{ display: 'none' }}>
        <Text textAlign="center" fontSize="3xl" fontWeight="bold">
          {title}
        </Text>
        <Text textAlign="center">{t('description')}</Text>
        <Link href="/cards">{t('navigation.cards')}</Link>
      </Stack>
    </>
  );
}
