import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, HStack, Stack, styled } from 'styled-system/jsx';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { getSpineAssetUrl, getSpineTimelineUrl } from '~/utils/assets';
import { StageRenderer, type RoutineClip } from '~/features/live-stage/StageRenderer';
import type { SpineTimelineData, TimelineIndexEntry } from '~/pages/spine-timelines/+data';

interface TimelineTrack {
  track: string;
  clips: RoutineClip[];
}
interface TimelineDetail {
  id: string;
  family: string;
  characterId: number | null;
  defaultSpine: string;
  tracks: TimelineTrack[];
}

const FAMILY_LABELS: Record<string, string> = {
  skill: 'Skill cut-ins',
  special_appeal: 'Special appeals',
  costume_preview: 'Costume intros'
};

export function SpineTimelinePlayer({ families, characterNames, spinePaths }: SpineTimelineData) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<StageRenderer | null>(null);
  const durationRef = useRef(1);

  const [family, setFamily] = useState<string>('skill');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string>('');
  const [rendererReady, setRendererReady] = useState(false);
  const [status, setStatus] = useState('');

  const list = families[family] ?? [];
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return list.filter(
      (e) =>
        !q ||
        e.id.toLowerCase().includes(q) ||
        (e.characterId != null && (characterNames[e.characterId] ?? '').toLowerCase().includes(q))
    );
  }, [list, query, characterNames]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const r = new StageRenderer(canvas);
    rendererRef.current = r;
    r.playing = true;
    r.setClockSource(() => {
      const d = durationRef.current;
      return d > 0 ? (performance.now() / 1000) % d : 0;
    });
    setRendererReady(true);
    return () => {
      r.dispose();
      rendererRef.current = null;
      setRendererReady(false);
    };
  }, []);

  const load = useCallback(
    async (entry: TimelineIndexEntry) => {
      const r = rendererRef.current;
      const canvas = canvasRef.current;
      if (!r || !canvas) return;
      setStatus(`Loading ${entry.id}…`);
      try {
        const res = await fetch(getSpineTimelineUrl(family, entry.id));
        if (!res.ok) {
          setStatus('Not found');
          return;
        }
        const detail = (await res.json()) as TimelineDetail;
        const paths = spinePaths[detail.defaultSpine];
        if (!paths) {
          setStatus(`Missing spine ${detail.defaultSpine}`);
          return;
        }
        for (const t of detail.tracks) r.removeActor(`tl-${t.track}`);

        const h = canvas.clientHeight || 800;
        const duration =
          Math.max(0.1, ...detail.tracks.flatMap((t) => t.clips.map((c) => c.t + c.dur))) || 1;
        durationRef.current = duration;

        await Promise.all(
          detail.tracks.map(async (t) => {
            const key = `tl-${t.track}`;
            await r.loadActor(
              key,
              getSpineAssetUrl(paths.skelPath),
              getSpineAssetUrl(paths.atlasPath)
            );
            r.setRoutine(key, t.clips);
            r.setTransform(key, 0, -h * 0.32, h / 1100);
          })
        );
        r.resyncClock();
        setStatus(
          `${characterNames[detail.characterId ?? 0] ?? detail.characterId ?? ''} · ${detail.tracks.length} track(s) · ${duration.toFixed(1)}s`
        );
      } catch (e) {
        setStatus('Error');
        console.error(e);
      }
    },
    [family, spinePaths, characterNames]
  );

  useEffect(() => {
    if (rendererReady && selectedId) {
      const entry = list.find((e) => e.id === selectedId);
      if (entry) void load(entry);
    }
  }, [selectedId, rendererReady]);

  useEffect(() => {
    if (filtered.length > 0 && !filtered.some((e) => e.id === selectedId)) {
      setSelectedId(filtered[0].id);
    }
  }, [family]);

  return (
    <HStack
      gap="0"
      flexDirection={{ base: 'column', lg: 'row' }}
      alignItems="stretch"
      w="full"
      h="calc(100vh - 64px)"
    >
      <Box
        display="flex"
        position="relative"
        flex="1"
        justifyContent="center"
        alignItems="center"
        minH={{ base: '50vh', lg: '400px' }}
        bg="#0a0a14"
      >
        <Box
          style={{ aspectRatio: '3 / 4', height: '100%', maxWidth: '100%' }}
          position="relative"
          overflow="hidden"
        >
          <styled.canvas
            ref={canvasRef}
            style={{ display: 'block' }}
            position="absolute"
            inset="0"
            w="full"
            h="full"
          />
        </Box>
      </Box>

      <Stack
        gap="3"
        borderLeftWidth={{ base: '0', lg: '1px' }}
        borderColor="border.default"
        w={{ base: 'full', lg: '380px' }}
        p="4"
        bg="bg.default"
        overflowY="auto"
      >
        <Text fontSize="lg" fontWeight="bold">
          Spine Timelines
        </Text>
        <Text color="fg.muted" fontSize="xs">
          {status}
        </Text>

        <HStack gap="1" flexWrap="wrap">
          {Object.keys(families).map((fam) => (
            <Button
              key={fam}
              size="xs"
              variant={family === fam ? 'solid' : 'outline'}
              onClick={() => setFamily(fam)}
            >
              {FAMILY_LABELS[fam] ?? fam} ({families[fam]?.length ?? 0})
            </Button>
          ))}
        </HStack>

        <input
          type="text"
          placeholder="Search…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            padding: '6px 10px',
            fontSize: '13px',
            borderRadius: '6px',
            border: '1px solid var(--colors-border-default)',
            background: 'var(--colors-bg-subtle)',
            color: 'var(--colors-fg-default)'
          }}
        />

        <Stack gap="1" maxH="calc(100vh - 220px)" overflowY="auto">
          {filtered.map((e) => (
            <Button
              key={e.id}
              size="xs"
              variant={selectedId === e.id ? 'solid' : 'ghost'}
              onClick={() => setSelectedId(e.id)}
              justifyContent="flex-start"
            >
              <Text truncate fontSize="xs">
                {characterNames[e.characterId ?? 0] ?? ''} · {e.id.replace(/^[a-z_]+_/, '')}
              </Text>
            </Button>
          ))}
        </Stack>
      </Stack>
    </HStack>
  );
}
