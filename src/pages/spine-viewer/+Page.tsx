import { useTranslation } from 'react-i18next';
import { Stack, Box } from 'styled-system/jsx';
import { FaPeopleGroup } from 'react-icons/fa6';
import { Text } from '~/components/ui/text';
import { Link } from '~/components/ui/link';
import { Metadata } from '~/components/layout/Metadata';

export function Page() {
  const { t } = useTranslation();

  return (
    <>
      <Metadata title={t('spine_viewer.title', 'Spine Viewer')} />
      <Stack gap="6" alignItems="center" justifyContent="center" w="full" py={{ base: '16', md: '24' }} textAlign="center">
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          w="80px"
          h="80px"
          borderRadius="2xl"
          bg="bg.subtle"
          color="fg.muted"
        >
          <FaPeopleGroup size={36} />
        </Box>
        <Stack gap="2" alignItems="center">
          <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="bold">
            {t('spine_viewer.title', 'Spine Viewer')}
          </Text>
          <Text color="fg.muted" fontSize={{ base: 'md', md: 'lg' }} maxW="md">
            {t('spine_viewer.coming_soon', 'Spine animation viewer is coming soon. Check back later!')}
          </Text>
        </Stack>
        <Link
          href="/model-viewer"
          display="inline-flex"
          alignItems="center"
          gap="2"
          px="4"
          py="2"
          borderRadius="full"
          borderWidth="1px"
          bg="bg.subtle"
          fontWeight="medium"
        >
          {t('spine_viewer.try_3d_viewer', 'Try the 3D Model Viewer')}
        </Link>
      </Stack>
    </>
  );
}
