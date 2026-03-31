import { useState, useCallback, useRef, Suspense } from 'react';
import { Stack, HStack, Box, Grid } from 'styled-system/jsx';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { Viewport } from './Viewport';
import { CharacterModel, type CharacterModelHandle, type TextureMap } from './CharacterModel';
import type { ExpressionData } from './ExpressionController';

type BgMode = 'dark' | 'light' | 'transparent';

const TEX = '/3d/aoi/textures';

const AOI_TEXTURES: TextureMap = {
  Skin: { mainTex: `${TEX}/SCSch024AoiDeA_Skin_col0.png`, shadowTex: `${TEX}/SCSch024AoiDeA_Skin_col1.png` },
  Cos: { mainTex: `${TEX}/SCSch024AoiDeA_Cos_col0.png`, shadowTex: `${TEX}/SCSch024AoiDeA_Cos_col1.png` },
  Hair_Wolf: { mainTex: `${TEX}/SCSch024AoiDeA_Hair_col0.png`, shadowTex: `${TEX}/SCSch024AoiDeA_Hair_col1.png` },
  Skirt: { mainTex: `${TEX}/SCSch024AoiDeA_Cos_col0.png`, shadowTex: `${TEX}/SCSch024AoiDeA_Cos_col1.png` },
  IndoorShoes: { mainTex: `${TEX}/SCSch024AoiDeA_IndoorShoes_col0.png`, shadowTex: `${TEX}/SCSch024AoiDeA_IndoorShoes_col1.png` },
  Loafer: { mainTex: `${TEX}/SCSch024AoiDeA_IndoorShoes_col0.png`, shadowTex: `${TEX}/SCSch024AoiDeA_IndoorShoes_col1.png` },
  Face: { mainTex: `${TEX}/SCSch024Aoi_Face_col0.png`, shadowTex: `${TEX}/SCSch024Aoi_Face_col1.png` },
  Brow: { mainTex: `${TEX}/SCSch024Aoi_Face_col0.png`, shadowTex: `${TEX}/SCSch024Aoi_Face_col1.png` },
  Eye: { mainTex: `${TEX}/SCSch024Aoi_Eye_col0.png` },
  EyeLens: { mainTex: `${TEX}/SCSch024Aoi_Eye_lens.png` },
  EyeShadow: { mainTex: `${TEX}/SCSch024Aoi_Face_col0.png` },
};

const CHARACTERS: Record<string, { name: string; glbUrl: string }> = {
  aoi: { name: 'Aoi', glbUrl: '/3d/aoi/aoi_full.glb' },
};

const EXPRESSIONS = [
  'normal', 'smile', 'angry', 'sad', 'surprise',
  'happy', 'bitter-smile', 'cool', 'wink-smile',
  'laugh', 'doubt', 'sulk', 'stunned', 'entranced',
] as const;

const MOUTH_SHAPES = ['A', 'I', 'U', 'E', 'O'] as const;

export function ViewerUI() {
  const [characterId, setCharacterId] = useState<string>('aoi');
  const [bgMode, setBgMode] = useState<BgMode>('dark');
  const [showGrid, setShowGrid] = useState(true);
  const [expression, setExpression] = useState<ExpressionData | null>(null);
  const [activeExpr, setActiveExpr] = useState<string>('');
  const [activePose, setActivePose] = useState<string>('idle');
  const modelRef = useRef<CharacterModelHandle>(null);

  const character = CHARACTERS[characterId];

  const handleMouthShape = useCallback((shape: string) => {
    const ctrl = modelRef.current?.expressionController;
    if (!ctrl) return;
    for (const s of MOUTH_SHAPES) {
      ctrl.setBlendShape(`Face_.Mouth_${s}`, s === shape ? 100.0 : 0.0);
    }
  }, []);

  const handleExpression = useCallback(async (name: string) => {
    setActiveExpr(name);
    try {
      const resp = await fetch(`/3d/aoi/expressions/aoi_face_${name}.json`);
      if (resp.ok) {
        const data = await resp.json();
        setExpression(data);
      }
    } catch {
      setExpression(null);
    }
  }, []);

  return (
    <HStack w="full" h="calc(100vh - 64px)" gap="0" alignItems="stretch">
      <Box flex="1" position="relative" minH="400px">
        <Viewport bgMode={bgMode} showGrid={showGrid}>
          <Suspense fallback={null}>
            {character && (
              <CharacterModel
                ref={modelRef}
                url={character.glbUrl}
                textures={AOI_TEXTURES}
                expression={expression}
                animationName={activePose}
              />
            )}
          </Suspense>
        </Viewport>
      </Box>
      <Stack
        w="300px"
        p="4"
        gap="4"
        borderLeftWidth="1px"
        borderColor="border.default"
        overflowY="auto"
        bg="bg.default"
      >
        <Stack gap="2">
          <Text fontWeight="semibold" fontSize="sm">Character</Text>
          <HStack gap="2" flexWrap="wrap">
            {Object.entries(CHARACTERS).map(([id, c]) => (
              <Button key={id} size="sm" variant={characterId === id ? 'solid' : 'outline'} onClick={() => setCharacterId(id)}>
                {c.name}
              </Button>
            ))}
          </HStack>
        </Stack>

        <Stack gap="2">
          <Text fontWeight="semibold" fontSize="sm">Expression</Text>
          <Grid columns={3} gap="1">
            {EXPRESSIONS.map((expr) => (
              <Button key={expr} size="xs" variant={activeExpr === expr ? 'solid' : 'outline'} onClick={() => handleExpression(expr)}>
                {expr}
              </Button>
            ))}
          </Grid>
        </Stack>

        <Stack gap="2">
          <Text fontWeight="semibold" fontSize="sm">Pose</Text>
          <Grid columns={3} gap="1">
            {['idle', 'stand_020', 'stand_070', 'stand_100', 'stand_130', 'stand_150', 'gesture_300', 'gesture_400', 'gesture_500', 'hips_711', 'pose_800', 'seated'].map((p) => (
              <Button key={p} size="xs" variant={activePose === p ? 'solid' : 'outline'} onClick={() => setActivePose(p)}>
                {p}
              </Button>
            ))}
          </Grid>
        </Stack>

        <Stack gap="2">
          <Text fontWeight="semibold" fontSize="sm">Mouth</Text>
          <HStack gap="1" flexWrap="wrap">
            {MOUTH_SHAPES.map((shape) => (
              <Button key={shape} size="xs" variant="outline" onClick={() => handleMouthShape(shape)}>
                {shape}
              </Button>
            ))}
            <Button size="xs" variant="ghost" onClick={() => {
              const ctrl = modelRef.current?.expressionController;
              if (!ctrl) return;
              for (const s of MOUTH_SHAPES) ctrl.setBlendShape(`Face_.Mouth_${s}`, 0);
            }}>
              Reset
            </Button>
          </HStack>
        </Stack>

        <Stack gap="2">
          <Text fontWeight="semibold" fontSize="sm">Background</Text>
          <HStack gap="2" flexWrap="wrap">
            {(['dark', 'light', 'transparent'] as BgMode[]).map((mode) => (
              <Button key={mode} size="xs" variant={bgMode === mode ? 'solid' : 'outline'} onClick={() => setBgMode(mode)}>
                {mode}
              </Button>
            ))}
          </HStack>
        </Stack>

        <Button size="xs" variant={showGrid ? 'solid' : 'outline'} onClick={() => setShowGrid(!showGrid)} w="fit-content">
          Grid
        </Button>
      </Stack>
    </HStack>
  );
}
