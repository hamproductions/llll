import { Center, Stack } from 'styled-system/jsx';
import { Link } from '~/components/ui/link';
import { Text } from '~/components/ui/text';
import { useTranslation } from 'react-i18next';

export { Page };

/* Or:
import { usePageContext } from 'vike-vue/usePageContext'
import { usePageContext } from 'vike-solid/usePageContext'
*/

function Page() {
  const { t } = useTranslation();
  return (
    <Center w="100vw" h="100vh">
      <Stack>
        <Text>{t('error_page.something_went_wrong')}</Text>
        <Link href="/">{t('error_page.go_back')}</Link>
      </Stack>
    </Center>
  );
}
