import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, HStack, Stack } from 'styled-system/jsx';
import { ColorModeToggle } from '~/components/layout/ColorModeToggle';
import { Footer } from '~/components/layout/Footer';
import { LanguageToggle } from '~/components/layout/LanguageToggle';
import { Link } from '~/components/ui/link';

export function Layout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const [_currentPath, setCurrentPath] = useState(import.meta.env.BASE_URL);

  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, [children]);

  return (
    <Stack
      position="relative"
      w="full"
      minH="100vh"
      bgColor="bg.default"
      _print={{ minH: 'unset', gap: 0 }}
    >
      <Container
        zIndex="1"
        position="relative"
        flex={1}
        w="full"
        py={4}
        px={4}
        _print={{ maxW: 'unset', w: 'unset', padding: 0 }}
      >
        <Stack>
          <HStack
            justifyContent="space-between"
            alignItems="center"
            w="full"
            flexWrap="wrap-reverse"
            _print={{ display: 'none' }}
          >
            <HStack>
              <Link href={'/'}>{t(`navigation.home`)}</Link>
              <Link href={'/cards'}>{t(`navigation.cards`)}</Link>
              <Link href={'/stories'}>{t(`navigation.stories`, 'Stories')}</Link>
            </HStack>
            <HStack justifySelf="flex-end">
              <LanguageToggle />
              <ColorModeToggle />
            </HStack>
          </HStack>
          {children}
        </Stack>
      </Container>
      <Footer />
      {/* <Box
        style={{
          ['--bg-image' as 'backgroundImage']: `url('${getAssetUrl('/assets/bg.webp')}')`
        }}
        zIndex="0"
        position="fixed"
        top="0"
        left="0"
        w="100vw"
        h="100vh"
        opacity="0.05"
        backgroundPosition="center"
        backgroundAttachment="fixed"
        backgroundImage="var(--bg-image)"
        backgroundSize="cover"
        mixBlendMode={{ base: 'darken', _dark: 'lighten' }}
        pointerEvents="none"
      /> */}
    </Stack>
  );
}
