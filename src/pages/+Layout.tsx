import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, HStack, Stack, styled } from 'styled-system/jsx';
import {
  FaCompactDisc, FaImages, FaMusic, FaPeopleGroup, FaStar,
  FaGift, FaFaceGrinWink, FaDownload, FaHeadphones, FaTrophy,
  FaBoxOpen, FaBars, FaCube, FaBone, FaPhotoFilm
} from 'react-icons/fa6';
import { ColorModeToggle } from '~/components/layout/ColorModeToggle';
import { Footer } from '~/components/layout/Footer';
import { LanguageToggle } from '~/components/layout/LanguageToggle';
import { Drawer } from '~/components/ui/drawer';
import { Link } from '~/components/ui/link';
import { IconButton } from '~/components/ui/icon-button';

const NAV_ITEMS = [
  { href: '/', key: 'home', icon: FaStar },
  { href: '/cards', key: 'cards', icon: FaImages },
  { href: '/stories', key: 'stories', icon: FaCompactDisc },
  { href: '/music', key: 'songs', icon: FaMusic },
  { href: '/characters', key: 'characters', icon: FaPeopleGroup },
  { href: '/gacha', key: 'gacha', icon: FaGift },
  { href: '/stickers', key: 'stickers', icon: FaFaceGrinWink },
  { href: '/downloads', key: 'downloads', icon: FaDownload },
  { href: '/bgm', key: 'bgm', icon: FaHeadphones },
  { href: '/grand-prix', key: 'grand_prix', icon: FaTrophy },
  { href: '/items', key: 'items', icon: FaBoxOpen },
  { href: '/emoji', key: 'emoji', icon: FaFaceGrinWink },
  { href: '/gallery', key: 'gallery', icon: FaPhotoFilm },
  { href: '/model-viewer', key: 'viewer', icon: FaCube },
  { href: '/spine-viewer', key: 'spine_viewer', icon: FaBone },
];

function NavLink({ href, label, icon: Icon, active }: { href: string; label: string; icon: React.ComponentType; active: boolean }) {
  return (
    <Link
      href={href}
      display="flex"
      alignItems="center"
      gap="3"
      px="4"
      py="2.5"
      borderRadius="lg"
      fontSize="sm"
      fontWeight={active ? 'bold' : 'medium'}
      bg={active ? 'bg.subtle' : 'transparent'}
      _hover={{ bg: 'bg.subtle' }}
      transition="background 0.15s"
      w="full"
      color="fg.default"
      style={{ textDecoration: 'none' }}
    >
      <Box fontSize="lg" flexShrink={0}>
        <Icon />
      </Box>
      {label}
    </Link>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const [currentPath, setCurrentPath] = useState(import.meta.env.BASE_URL);

  const navItems = NAV_ITEMS.map((item) => ({
    ...item,
    label: t(`navigation.${item.key}`, item.key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()))
  }));

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
      <HStack alignItems="stretch" flex={1} gap="0">
        <Box
          display={{ base: 'none', lg: 'flex' }}
          flexDirection="column"
          w="240px"
          flexShrink={0}
          borderRightWidth="1px"
          borderColor="border.default"
          position="sticky"
          top="0"
          h="100vh"
          overflowY="auto"
          py="4"
          px="3"
          _print={{ display: 'none' }}
        >
          <Stack gap="1" flex={1}>
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={currentPath === item.href}
              />
            ))}
          </Stack>
          <Stack gap="3" pt="4" borderTopWidth="1px" borderColor="border.default" mt="2" alignItems="center">
            <LanguageToggle />
            <ColorModeToggle />
          </Stack>
        </Box>

        <Box flex={1} minW={0}>
          <Drawer.Root variant="left">
            <Box
              display={{ base: 'flex', lg: 'none' }}
              alignItems="center"
              justifyContent="space-between"
              px="4"
              py="3"
              borderBottomWidth="1px"
              borderColor="border.default"
              position="sticky"
              top="0"
              zIndex="10"
              bg="bg.default"
              _print={{ display: 'none' }}
            >
              <Drawer.Trigger asChild>
                <IconButton variant="ghost" size="sm">
                  <FaBars />
                </IconButton>
              </Drawer.Trigger>

              <styled.span fontWeight="bold" fontSize="sm">
                {navItems.find((n) => currentPath === n.href)?.label ?? 'LLLL'}
              </styled.span>

              <HStack gap="1">
                <LanguageToggle />
                <ColorModeToggle />
              </HStack>
            </Box>

            <Drawer.Backdrop />
            <Drawer.Positioner>
              <Drawer.Content>
                <Drawer.Header>
                  <HStack justifyContent="space-between" alignItems="center" w="full">
                    <Drawer.Title>{t('navigation.menu', 'Menu')}</Drawer.Title>
                    <Drawer.CloseTrigger asChild>
                      <IconButton variant="ghost" size="sm">✕</IconButton>
                    </Drawer.CloseTrigger>
                  </HStack>
                </Drawer.Header>
                <Drawer.Body>
                  <Stack gap="1">
                    {navItems.map((item) => (
                      <NavLink
                        key={item.href}
                        href={item.href}
                        label={item.label}
                        icon={item.icon}
                        active={currentPath === item.href}
                      />
                    ))}
                  </Stack>
                </Drawer.Body>
                <Drawer.Footer>
                  <HStack gap="1" justifyContent="center">
                    <LanguageToggle />
                    <ColorModeToggle />
                  </HStack>
                </Drawer.Footer>
              </Drawer.Content>
            </Drawer.Positioner>
          </Drawer.Root>

          <Box px={{ base: '4', md: '6' }} py="4" _print={{ maxW: 'unset', w: 'unset', padding: 0 }}>
            {children}
          </Box>
          <Footer />
        </Box>
      </HStack>
    </Stack>
  );
}
