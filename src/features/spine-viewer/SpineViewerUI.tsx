import { useMemo, useState } from 'react';
import { Box, HStack, Stack } from 'styled-system/jsx';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { SpinePlayerWidget } from './SpinePlayerWidget';
import type { SpineAsset } from '~/pages/spine-viewer/+data';
import { getSpineAssetUrl } from '~/utils/assets';

const CATEGORY_LABELS: Record<string, string> = {
  all: 'All',
  ingame_sd: 'In-Game',
  outgame_sd: 'Menu',
  top_sd: 'Home'
};

interface SpineViewerUIProps {
  assets: SpineAsset[];
  categories: string[];
}

function getDisplayName(asset: SpineAsset): string {
  const { metadata } = asset;
  const charName = metadata.characterName || metadata.characterNameJp || '';
  const cardName = metadata.cardName;
  if (charName && cardName) return `${charName} - ${cardName}`;
  const variant = metadata.variantId;
  if (charName && variant) return `${charName} #${variant}`;
  if (charName) return String(charName);
  return asset.label
    .replace(/^(ingame|outgame|top)_chara_sd_spine_/, '')
    .replace(/[_-]+/g, ' ');
}

export function SpineViewerUI({ assets, categories }: SpineViewerUIProps) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState(assets[0]?.id ?? '');
  const [animations, setAnimations] = useState<string[]>([]);
  const [skins, setSkins] = useState<string[]>([]);
  const [activeAnimation, setActiveAnimation] = useState<string | undefined>();
  const [activeSkin, setActiveSkin] = useState<string | undefined>();

  const filteredAssets = useMemo(() => {
    let filtered = assets;
    if (activeCategory !== 'all') {
      filtered = filtered.filter((a) => a.category === activeCategory);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.label.toLowerCase().includes(q) ||
          getDisplayName(a).toLowerCase().includes(q) ||
          (a.metadata.characterName && String(a.metadata.characterName).toLowerCase().includes(q))
      );
    }
    return filtered;
  }, [assets, activeCategory, searchQuery]);

  const selectedAsset = useMemo(
    () => assets.find((a) => a.id === selectedAssetId) ?? filteredAssets[0] ?? null,
    [assets, filteredAssets, selectedAssetId]
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: assets.length };
    for (const a of assets) {
      counts[a.category] = (counts[a.category] || 0) + 1;
    }
    return counts;
  }, [assets]);

  const skelUrl = selectedAsset ? getSpineAssetUrl(selectedAsset.skelPath) : '';
  const atlasUrl = selectedAsset ? getSpineAssetUrl(selectedAsset.atlasPath) : '';

  return (
    <HStack w="full" h="calc(100vh - 64px)" gap="0" alignItems="stretch" flexDirection={{ base: 'column', lg: 'row' }}>
      <Box flex="1" position="relative" minH={{ base: '60vh', lg: '400px' }}>
        {skelUrl && atlasUrl ? (
          <SpinePlayerWidget
            key={selectedAssetId}
            skelUrl={skelUrl}
            atlasUrl={atlasUrl}
            animation={activeAnimation}
            skin={activeSkin}
            onAnimationsLoaded={(anims, skns) => {
              setAnimations(anims);
              setSkins(skns);
              setActiveAnimation(anims[0]);
              setActiveSkin(skns[0]);
            }}
          />
        ) : (
          <Box display="flex" alignItems="center" justifyContent="center" h="full" bg="bg.subtle">
            <Text color="fg.muted">No spine asset selected</Text>
          </Box>
        )}
      </Box>

      <Stack
        w={{ base: 'full', lg: '360px' }}
        p="4"
        gap="3"
        borderLeftWidth={{ base: '0', lg: '1px' }}
        borderTopWidth={{ base: '1px', lg: '0' }}
        borderColor="border.default"
        overflowY="auto"
        bg="bg.default"
      >
        <Text fontWeight="bold" fontSize="lg">
          {selectedAsset ? getDisplayName(selectedAsset) : 'No model'}
        </Text>

        <HStack gap="1" flexWrap="wrap">
          {['all', ...categories].map((cat) => (
            <Button
              key={cat}
              size="xs"
              variant={activeCategory === cat ? 'solid' : 'ghost'}
              onClick={() => setActiveCategory(cat)}
            >
              {CATEGORY_LABELS[cat] || cat} ({categoryCounts[cat] || 0})
            </Button>
          ))}
        </HStack>

        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: '6px 10px',
            fontSize: '13px',
            borderRadius: '6px',
            border: '1px solid var(--colors-border-default)',
            background: 'var(--colors-bg-subtle)',
            color: 'var(--colors-fg-default)',
            outline: 'none',
            width: '100%'
          }}
        />

        <Stack gap="1" maxH="300px" overflowY="auto">
          {filteredAssets.length === 0 && (
            <Text fontSize="sm" color="fg.muted">No assets found</Text>
          )}
          {filteredAssets.map((asset) => (
            <Button
              key={asset.id}
              size="xs"
              variant={selectedAsset?.id === asset.id ? 'solid' : 'ghost'}
              justifyContent="flex-start"
              textAlign="left"
              overflow="hidden"
              whiteSpace="nowrap"
              onClick={() => {
                setSelectedAssetId(asset.id);
                setAnimations([]);
                setSkins([]);
                setActiveAnimation(undefined);
                setActiveSkin(undefined);
              }}
            >
              <Text fontSize="xs" truncate>{getDisplayName(asset)}</Text>
            </Button>
          ))}
        </Stack>

        {animations.length > 1 && (
          <Stack gap="2">
            <Text fontWeight="semibold" fontSize="sm">Animation ({animations.length})</Text>
            <Stack gap="1" maxH="200px" overflowY="auto">
              {animations.map((anim) => (
                <Button
                  key={anim}
                  size="xs"
                  variant={activeAnimation === anim ? 'solid' : 'outline'}
                  justifyContent="flex-start"
                  onClick={() => setActiveAnimation(anim)}
                >
                  <Text fontSize="xs" truncate>{anim}</Text>
                </Button>
              ))}
            </Stack>
          </Stack>
        )}

        {skins.length > 1 && (
          <Stack gap="2">
            <Text fontWeight="semibold" fontSize="sm">Skin</Text>
            <HStack gap="1" flexWrap="wrap">
              {skins.map((s) => (
                <Button
                  key={s}
                  size="xs"
                  variant={activeSkin === s ? 'solid' : 'outline'}
                  onClick={() => setActiveSkin(s)}
                >
                  {s}
                </Button>
              ))}
            </HStack>
          </Stack>
        )}
      </Stack>
    </HStack>
  );
}
