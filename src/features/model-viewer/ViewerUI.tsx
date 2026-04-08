import { Component, Suspense, useEffect, useMemo, useRef, useState, useCallback, type ReactNode } from 'react';
import * as THREE from 'three';
import { Box, HStack, Stack } from 'styled-system/jsx';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { Viewport } from './Viewport';
import { CharacterModel, type CharacterModelHandle } from './CharacterModel';
import type { Asset3D } from '~/pages/model-viewer/+data';
import { get3dAssetUrl } from '~/utils/assets';

class ModelErrorBoundary extends Component<{ children: ReactNode; resetKey?: string }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidUpdate(prevProps: { resetKey?: string }) {
    if (prevProps.resetKey !== this.props.resetKey) this.setState({ hasError: false });
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

type BgMode = 'dark' | 'light' | 'transparent';
type CameraMode = 'orbit' | 'fps' | 'turntable';

const CAMERA_MODE_LABELS: Record<CameraMode, string> = {
  orbit: 'Orbit',
  fps: 'WASD',
  turntable: 'Spin'
};

const EXPRESSION_PRESETS = [
  { label: 'Neutral', shapes: [] },
  { label: 'Smile', shapes: [['smile'], ['happy']] },
  { label: 'Angry', shapes: [['angry'], ['brow_down']] },
  { label: 'Sad', shapes: [['sad'], ['troubled']] },
  { label: 'Surprised', shapes: [['surprised'], ['wide']] }
];

const MOUTH_PRESETS = [
  { label: 'A', shapes: [['mouth_a'], ['a']] },
  { label: 'I', shapes: [['mouth_i'], ['i']] },
  { label: 'U', shapes: [['mouth_u'], ['u']] },
  { label: 'E', shapes: [['mouth_e'], ['e']] },
  { label: 'O', shapes: [['mouth_o'], ['o']] }
];

const CATEGORY_LABELS: Record<string, string> = {
  all: 'All',
  costume: 'Costume',
  stage: 'Stage',
  prop: 'Prop',
  item: 'Item',
  ppadv: 'Story Prop',
  unknown: 'Other'
};

interface ViewerUIProps {
  assets: Asset3D[];
  categories: string[];
}

const normalizeShape = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

function getDisplayName(asset: Asset3D): string {
  const meta = asset.metadata;
  if (asset.category === 'costume') {
    const charName = meta.characterName || meta.characterNameJp || '';
    const costumeName = meta.costumeName || '';
    if (charName && costumeName) return `${charName} - ${costumeName}`;
    if (charName) return `${charName}`;
  }
  if (meta.assetName && typeof meta.assetName === 'string') {
    return meta.assetName;
  }
  return asset.label.replace(/^3d_(costume|stage|prop|item)_/, '').replace(/[_-]+/g, ' ');
}

function resolveModelUrl(asset: Asset3D): string {
  if (asset.category === 'unknown') {
    return `/3d/${asset.glbPath}`;
  }
  return get3dAssetUrl(asset.glbPath);
}

function EnvironmentRoom() {
  const envAssetUrl = get3dAssetUrl('stage/3d_stage_03/3d_stage_03.glb');
  const envTextureDir = get3dAssetUrl('stage/3d_stage_03/');
  const [envTexMap, setEnvTexMap] = useState<Record<string, Record<string, string>> | null>(null);

  useEffect(() => {
    const texJsonUrl = get3dAssetUrl('stage/3d_stage_03/textures.json');
    fetch(texJsonUrl)
      .then((r) => r.json())
      .then(setEnvTexMap)
      .catch(() => setEnvTexMap({}));
  }, []);

  if (!envTexMap) return null;

  return (
    <CharacterModel
      url={envAssetUrl}
      textureDir={envTextureDir}
      textureMap={envTexMap}
    />
  );
}

export function ViewerUI({ assets, categories }: ViewerUIProps) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState(assets[0]?.id ?? '');
  const [bgMode, setBgMode] = useState<BgMode>('dark');
  const [showGrid, setShowGrid] = useState(true);
  const [activeExpression, setActiveExpression] = useState('Neutral');
  const [activeMouth, setActiveMouth] = useState('');
  const modelRef = useRef<CharacterModelHandle>(null);

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
          (a.metadata.characterName && String(a.metadata.characterName).toLowerCase().includes(q)) ||
          (a.metadata.costumeName && String(a.metadata.costumeName).toLowerCase().includes(q)) ||
          (a.metadata.stageName && String(a.metadata.stageName).toLowerCase().includes(q))
      );
    }
    return filtered;
  }, [assets, activeCategory, searchQuery]);

  const selectedAsset = useMemo(
    () => assets.find((a) => a.id === selectedAssetId) ?? filteredAssets[0] ?? null,
    [assets, filteredAssets, selectedAssetId]
  );

  const modelUrl = selectedAsset ? resolveModelUrl(selectedAsset) : null;

  const textureDir = selectedAsset
    ? selectedAsset.category === 'unknown'
      ? `/3d/${selectedAsset.textureDir}`
      : get3dAssetUrl(selectedAsset.textureDir)
    : undefined;

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: assets.length };
    for (const a of assets) {
      counts[a.category] = (counts[a.category] || 0) + 1;
    }
    return counts;
  }, [assets]);

  const applyPreset = (groups: string[][]) => {
    const controller = modelRef.current?.expressionController;
    if (!controller) return;
    const names = controller.getBlendShapeNames();
    controller.reset();
    for (const group of groups) {
      const target = names.find((name) => {
        const normalizedName = normalizeShape(name);
        return group.some((part) => normalizedName.includes(normalizeShape(part)));
      });
      if (target) controller.setBlendShape(target, 100);
    }
  };

  useEffect(() => {
    const timeout = window.setTimeout(() => applyPreset([]), 100);
    return () => window.clearTimeout(timeout);
  }, [selectedAssetId]);

  const [meshToggles, setMeshToggles] = useState<Record<string, boolean>>({});
  const TOGGLEABLE = ['Loafer', 'IndoorShoes'];
  const DEFAULT_HIDDEN = ['IndoorShoes'];

  useEffect(() => {
    const handle = modelRef.current;
    if (!handle) return;
    const timeout = window.setTimeout(() => {
      const names = handle.getMeshNames?.() ?? [];
      const toggleable = names.filter(n => TOGGLEABLE.includes(n));
      if (toggleable.length > 0) {
        const state: Record<string, boolean> = {};
        for (const n of toggleable) {
          state[n] = !DEFAULT_HIDDEN.includes(n);
          handle.setMeshVisible(n, state[n]);
        }
        setMeshToggles(state);
      } else {
        setMeshToggles({});
      }
    }, 200);
    return () => window.clearTimeout(timeout);
  }, [selectedAssetId]);

  const [fitTarget, setFitTarget] = useState<{ center: THREE.Vector3; size: THREE.Vector3 } | null>(null);

  useEffect(() => {
    setFitTarget(null);
    const timeout = window.setTimeout(() => {
      const bounds = modelRef.current?.getBounds?.();
      if (bounds) setFitTarget(bounds);
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [selectedAssetId]);

  const [animNames, setAnimNames] = useState<string[]>([]);
  const [activeAnim, setActiveAnim] = useState<string | null>(null);

  const animationUrl = useMemo(() => {
    if (selectedAsset?.category !== 'costume') return undefined;
    const charName = selectedAsset.metadata.characterName;
    if (!charName) return undefined;
    return get3dAssetUrl(`animations/${String(charName).toLowerCase()}.glb`);
  }, [selectedAsset]);

  useEffect(() => {
    setAnimNames([]);
    setActiveAnim(null);
    const timeout = window.setTimeout(() => {
      const names = modelRef.current?.getAnimationNames?.() ?? [];
      if (names.length > 0) setAnimNames(names);
    }, 500);
    return () => window.clearTimeout(timeout);
  }, [selectedAssetId, animationUrl]);

  const hasBlendShapes = selectedAsset?.category === 'costume' || selectedAsset?.category === 'unknown';
  const defaultCameraMode = useCallback((): CameraMode => {
    if (selectedAsset?.category === 'stage') return 'fps';
    if (selectedAsset?.category === 'prop' || selectedAsset?.category === 'item') return 'turntable';
    return 'orbit';
  }, [selectedAsset?.category]);
  const [cameraMode, setCameraMode] = useState<CameraMode>(defaultCameraMode());
  const [showSidebar, setShowSidebar] = useState(true);

  useEffect(() => {
    setCameraMode(defaultCameraMode());
  }, [selectedAsset?.category, defaultCameraMode]);

  return (
    <HStack w="full" h={{ base: 'auto', lg: 'calc(100vh - 64px)' }} minH={{ lg: 'calc(100vh - 64px)' }} gap="0" alignItems="stretch" flexDirection={{ base: 'column', lg: 'row' }}>
      <Box flex={{ base: 'none', lg: '1' }} position="relative" h={{ base: showSidebar ? '35vh' : '70vh', lg: 'auto' }}>
        <Box position="absolute" top="3" left="3" zIndex="10" display={{ base: 'block', lg: 'none' }}>
          <Button size="xs" variant="solid" onClick={() => setShowSidebar(!showSidebar)}>
            {showSidebar ? 'Expand' : 'Panel'}
          </Button>
        </Box>
        <Viewport bgMode={bgMode} showGrid={showGrid} cameraMode={cameraMode} resetKey={selectedAssetId} fitTarget={selectedAsset?.category !== 'stage' ? fitTarget : null}>
          <Suspense fallback={null}>
            {/* TODO: environment room disabled until scale matching is resolved
            {selectedAsset?.category !== 'stage' && (
              <ModelErrorBoundary resetKey="env">
                <EnvironmentRoom />
              </ModelErrorBoundary>
            )}
            */}
            <ModelErrorBoundary resetKey={selectedAssetId}>
              {modelUrl ? (
                <CharacterModel
                  ref={modelRef}
                  url={modelUrl}
                  extraUrls={selectedAsset?.extraGlbs?.map(g =>
                    selectedAsset.category === 'unknown' ? `/3d/${g}` : get3dAssetUrl(g)
                  )}
                  textureDir={textureDir}
                  textureFiles={selectedAsset?.textures}
                  textureMap={selectedAsset?.textureMap}
                  animationUrl={animationUrl}
                />
              ) : null}
            </ModelErrorBoundary>
          </Suspense>
        </Viewport>
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
        display={{ base: showSidebar ? 'flex' : 'none', lg: 'flex' }}
        flex={{ base: '1', lg: 'none' }}
        maxH={{ base: showSidebar ? 'calc(65vh - 64px)' : '0', lg: 'none' }}
      >
        <Text fontWeight="bold" fontSize="lg">
          {selectedAsset ? getDisplayName(selectedAsset) : 'No model'}
        </Text>

        {/* Category tabs */}
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

        {/* Search */}
        <input
          type="text"
          placeholder="Search models..."
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

        {/* Model list */}
        <Stack gap="1" maxH="300px" overflowY="auto">
          {filteredAssets.length === 0 && (
            <Text fontSize="sm" color="fg.muted">No models found</Text>
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
                setActiveExpression('Neutral');
                setActiveMouth('');
                if (window.innerWidth < 1024) setShowSidebar(false);
              }}
            >
              <Text fontSize="xs" truncate>{getDisplayName(asset)}</Text>
            </Button>
          ))}
        </Stack>

        {/* Expression controls (only for character models) */}
        {hasBlendShapes && (
          <>
            <Stack gap="2">
              <Text fontWeight="semibold" fontSize="sm">Expression</Text>
              <HStack gap="2" flexWrap="wrap">
                {EXPRESSION_PRESETS.map((preset) => (
                  <Button
                    key={preset.label}
                    size="xs"
                    variant={activeExpression === preset.label ? 'solid' : 'outline'}
                    onClick={() => {
                      setActiveExpression(preset.label);
                      setActiveMouth('');
                      applyPreset(preset.shapes);
                    }}
                  >
                    {preset.label}
                  </Button>
                ))}
              </HStack>
            </Stack>

            <Stack gap="2">
              <Text fontWeight="semibold" fontSize="sm">Mouth</Text>
              <HStack gap="2" flexWrap="wrap">
                {MOUTH_PRESETS.map((preset) => (
                  <Button
                    key={preset.label}
                    size="xs"
                    variant={activeMouth === preset.label ? 'solid' : 'outline'}
                    onClick={() => {
                      setActiveExpression('Neutral');
                      setActiveMouth(preset.label);
                      applyPreset(preset.shapes);
                    }}
                  >
                    {preset.label}
                  </Button>
                ))}
                <Button
                  size="xs"
                  variant={!activeMouth && activeExpression === 'Neutral' ? 'solid' : 'outline'}
                  onClick={() => {
                    setActiveExpression('Neutral');
                    setActiveMouth('');
                    applyPreset([]);
                  }}
                >
                  Reset
                </Button>
              </HStack>
            </Stack>
          </>
        )}

        {Object.keys(meshToggles).length > 0 && (
          <Stack gap="2">
            <Text fontWeight="semibold" fontSize="sm">Parts</Text>
            <HStack gap="2" flexWrap="wrap">
              {Object.entries(meshToggles).map(([name, visible]) => (
                <Button
                  key={name}
                  size="xs"
                  variant={visible ? 'solid' : 'outline'}
                  onClick={() => {
                    const next = !visible;
                    modelRef.current?.setMeshVisible(name, next);
                    setMeshToggles(prev => ({ ...prev, [name]: next }));
                  }}
                >
                  {name}
                </Button>
              ))}
            </HStack>
          </Stack>
        )}

        {animNames.length > 0 && (
          <Stack gap="2">
            <Text fontWeight="semibold" fontSize="sm">Animation ({animNames.length})</Text>
            <Stack gap="1" maxH="150px" overflowY="auto">
              {animNames.map((name) => (
                <Button
                  key={name}
                  size="xs"
                  variant={activeAnim === name ? 'solid' : 'outline'}
                  justifyContent="flex-start"
                  onClick={() => {
                    if (activeAnim === name) {
                      modelRef.current?.stopAnimation();
                      setActiveAnim(null);
                    } else {
                      modelRef.current?.playAnimation(name);
                      setActiveAnim(name);
                    }
                  }}
                >
                  <Text fontSize="xs" truncate>{name}</Text>
                </Button>
              ))}
            </Stack>
          </Stack>
        )}

        <Stack gap="2">
          <Text fontWeight="semibold" fontSize="sm">Camera</Text>
          <HStack gap="2" flexWrap="wrap">
            {(['orbit', 'turntable', 'fps'] as CameraMode[]).map((mode) => (
              <Button
                key={mode}
                size="xs"
                variant={cameraMode === mode ? 'solid' : 'outline'}
                onClick={() => setCameraMode(mode)}
              >
                {CAMERA_MODE_LABELS[mode]}
              </Button>
            ))}
          </HStack>
          {cameraMode === 'fps' && (
            <Text fontSize="xs" color="fg.muted">
              Click to look. WASD move. Space/Q up/down. Shift sprint.
            </Text>
          )}
        </Stack>

        <Stack gap="2">
          <Text fontWeight="semibold" fontSize="sm">Background</Text>
          <HStack gap="2" flexWrap="wrap">
            {(['dark', 'light', 'transparent'] as BgMode[]).map((mode) => (
              <Button
                key={mode}
                size="xs"
                variant={bgMode === mode ? 'solid' : 'outline'}
                onClick={() => setBgMode(mode)}
              >
                {mode}
              </Button>
            ))}
            <Button size="xs" variant={showGrid ? 'solid' : 'outline'} onClick={() => setShowGrid(!showGrid)}>
              Grid
            </Button>
          </HStack>
        </Stack>
      </Stack>
    </HStack>
  );
}
