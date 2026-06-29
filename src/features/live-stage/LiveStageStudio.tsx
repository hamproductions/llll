import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StageRenderer, type RoutineClip, type Motion } from './StageRenderer';
import { Box, HStack, Stack, styled } from 'styled-system/jsx';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import {
  getChoreographyUrl,
  getMusicTrackUrl,
  getSpineAssetUrl,
  getQuestBgUrl
} from '~/utils/assets';
import type { LiveStageData, SpineVariant, StageSong } from '~/pages/live-stage/+data';

const GCS_BASE =
  import.meta.env.PUBLIC_ENV__GCS_BASE_URL || 'https://storage.googleapis.com/llll-card';
const gcsMusicUrl = (soundId: number | string) => `${GCS_BASE}/music/mp3/bgm_live_${soundId}.mp3`;

interface ChoreoSlot {
  slot: string;
  characterId: number;
  defaultSpine: string;
  wx: number;
  wy: number;
  wz: number;
  motion?: Motion | null;
  clips: RoutineClip[];
}
interface Choreography {
  musicId: string;
  bpm: number | null;
  duration: number;
  slots: ChoreoSlot[];
}

interface Slot {
  key: string;
  slotName: string;
  characterId: number;
  variantId: string;
  routine: RoutineClip[];
  wx: number;
  wy: number;
  wz: number;
  motion: Motion | null;
  scaleMul: number;
  offsetX: number;
}

function variantLabel(v: SpineVariant): string {
  if (v.cardName) return `${v.cardName} (#${v.variantId})`;
  return `Variant #${v.variantId}`;
}

function variantIdToChar(variantId: string): number {
  const m = variantId.match(/spine_(\d+)_/);
  return m ? Number(m[1]) : 0;
}

function formatTime(s: number): string {
  if (!isFinite(s)) return '00:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export function LiveStageStudio({
  songs,
  variantsByChar,
  characterNames,
  stageBgIds,
  stageBgByMusicId
}: LiveStageData) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const rendererRef = useRef<StageRenderer | null>(null);
  const audioReadyRef = useRef(false);
  const fallbackSrcRef = useRef('');
  const slotsRef = useRef<Slot[]>([]);

  const [selectedSongId, setSelectedSongId] = useState<number | null>(songs[0]?.id ?? null);
  const [rendererReady, setRendererReady] = useState(false);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [bgImageId, setBgImageId] = useState<string>(() =>
    stageBgIds.includes('100011') ? '100011' : (stageBgIds[0] ?? '')
  );
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [baseScale, setBaseScale] = useState(0.32);
  const [spread, setSpread] = useState(1);
  const [groundY, setGroundY] = useState(0.45);
  const [bpm, setBpm] = useState<number | null>(null);
  const [status, setStatus] = useState('Loading…');

  slotsRef.current = slots;

  const selectedSong = useMemo(
    () => songs.find((s) => s.id === selectedSongId) ?? null,
    [songs, selectedSongId]
  );

  const layoutFormation = useCallback(
    (current: Slot[]) => {
      const r = rendererRef.current;
      const canvas = canvasRef.current;
      if (!r || !canvas || current.length === 0) return;
      const h = canvas.clientHeight || 720;
      const w = canvas.clientWidth || 1280;
      const zVals = current.flatMap((s) =>
        s.motion && s.motion.z.length > 0 ? s.motion.z.map((k) => k.c[3]) : [s.wz]
      );
      const zFront = Math.min(...zVals);
      r.setProjection({ w, h, groundY, spread, baseScale, zFront });
      for (const slot of current) {
        if (!r.hasActor(slot.key)) continue;
        r.setPlacement(slot.key, {
          baseWx: slot.wx,
          baseWy: slot.wy,
          baseWz: slot.wz,
          motion: slot.motion,
          scaleMul: slot.scaleMul,
          offsetX: slot.offsetX
        });
      }
    },
    [baseScale, spread, groundY]
  );

  const loadSlotActor = useCallback(
    async (slot: Slot) => {
      const r = rendererRef.current;
      if (!r) return;
      const variant = (variantsByChar[slot.characterId] ?? []).find((v) => v.id === slot.variantId);
      if (!variant) return;
      try {
        await r.loadActor(
          slot.key,
          getSpineAssetUrl(variant.skelPath),
          getSpineAssetUrl(variant.atlasPath)
        );
        r.setRoutine(slot.key, slot.routine);
      } catch (e) {
        console.error('loadActor failed', slot.key, e);
      }
    },
    [variantsByChar]
  );

  const fetchChoreography = useCallback(async (musicId: number): Promise<Choreography | null> => {
    try {
      const res = await fetch(getChoreographyUrl(musicId));
      if (!res.ok) return null;
      return (await res.json()) as Choreography;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const r = new StageRenderer(canvas);
    rendererRef.current = r;
    r.setClockSource(() => {
      const a = audioRef.current;
      if (!a || !audioReadyRef.current) return null;
      return a.paused ? null : a.currentTime;
    });
    setRendererReady(true);
    const onResize = () => layoutFormation(slotsRef.current);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      r.dispose();
      rendererRef.current = null;
      setRendererReady(false);
    };
  }, []);

  const loadSong = useCallback(
    async (song: StageSong) => {
      const r = rendererRef.current;
      if (!r) return;
      setStatus(`Loading ${song.title}…`);
      setPlaying(false);
      audioReadyRef.current = false;

      const mappedBg = stageBgByMusicId[String(song.id)];
      if (mappedBg) setBgImageId(mappedBg);

      for (const old of slotsRef.current) r.removeActor(old.key);

      const audio = audioRef.current;
      if (audio && song.soundId) {
        fallbackSrcRef.current = gcsMusicUrl(song.soundId);
        audio.src = getMusicTrackUrl(song.soundId);
        audio.load();
        audio.currentTime = 0;
      }

      const choreo = await fetchChoreography(song.id);
      setBpm(choreo?.bpm ?? null);

      let next: Slot[];
      if (choreo && choreo.slots.length > 0) {
        next = choreo.slots.map((cs, i) => {
          const variants = variantsByChar[cs.characterId] ?? [];
          const fromSpine = variants.find((v) => v.id === cs.defaultSpine);
          return {
            key: `slot-${i}-${cs.slot}`,
            slotName: cs.slot,
            characterId: cs.characterId,
            variantId: (fromSpine ?? variants[0])?.id ?? cs.defaultSpine,
            routine: cs.clips,
            wx: cs.wx,
            wy: cs.wy,
            wz: cs.wz,
            motion: cs.motion ?? null,
            scaleMul: 1,
            offsetX: 0
          };
        });
      } else {
        next = [];
      }

      await Promise.all(next.map((slot) => loadSlotActor(slot)));
      setSlots(next);
      slotsRef.current = next;
      requestAnimationFrame(() => layoutFormation(next));
      r.resyncClock();
      setStatus(
        next.length > 0
          ? `${song.title} — ${next.length} performers · ${choreo?.bpm ?? '?'} BPM`
          : `${song.title} — no choreography data`
      );
    },
    [fetchChoreography, loadSlotActor, layoutFormation, variantsByChar, stageBgByMusicId]
  );

  useEffect(() => {
    if (rendererReady && selectedSong) void loadSong(selectedSong);
  }, [selectedSongId, rendererReady]);

  useEffect(() => {
    layoutFormation(slots);
  }, [baseScale, spread, groundY, layoutFormation, slots]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = speed;
  }, [speed]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted;
  }, [muted, selectedSongId]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    const r = rendererRef.current;
    const next = !playing;
    setPlaying(next);
    if (r) r.playing = next;
    if (audio && audio.src) {
      if (next)
        audio.play().catch(() => {
          setPlaying(false);
          if (r) r.playing = false;
        });
      else audio.pause();
    }
  }, [playing]);

  const onSeek = useCallback((value: number) => {
    const audio = audioRef.current;
    const r = rendererRef.current;
    if (audio && isFinite(audio.duration)) audio.currentTime = (value / 1000) * audio.duration;
    setCurrentTime(audio?.currentTime ?? 0);
    r?.resyncClock();
  }, []);

  const changeCostume = useCallback(
    async (key: string, variantId: string) => {
      setSlots((prev) => prev.map((s) => (s.key === key ? { ...s, variantId } : s)));
      const slot = slotsRef.current.find((s) => s.key === key);
      if (!slot) return;
      const merged = { ...slot, variantId };
      await loadSlotActor(merged);
      layoutFormation(slotsRef.current.map((s) => (s.key === key ? merged : s)));
    },
    [loadSlotActor, layoutFormation]
  );

  const updateSlotTransform = useCallback(
    (key: string, patch: Partial<Slot>) => {
      setSlots((prev) => {
        const nextSlots = prev.map((s) => (s.key === key ? { ...s, ...patch } : s));
        slotsRef.current = nextSlots;
        layoutFormation(nextSlots);
        return nextSlots;
      });
    },
    [layoutFormation]
  );

  const sliderVal = duration > 0 ? (currentTime / duration) * 1000 : 0;

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
        bg="#05050a"
        overflow="hidden"
      >
        <Box
          style={{
            aspectRatio: '512 / 1024',
            width: 'auto',
            height: '100%',
            maxWidth: '100%',
            maxHeight: '100%'
          }}
          position="relative"
          overflow="hidden"
        >
          {/* Real in-game backdrop: portrait painting with classroom wall + parquet floor in one image. */}
          <Box
            style={{
              background: bgImageId ? undefined : '#05050a',
              backgroundImage: bgImageId ? `url(${getQuestBgUrl(bgImageId)})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
            position="absolute"
            inset="0"
          />
          <styled.canvas
            ref={canvasRef}
            style={{ display: 'block' }}
            position="absolute"
            inset="0"
            w="full"
            h="full"
          />
        </Box>

        <HStack
          style={{ background: 'rgba(10,10,20,0.82)', backdropFilter: 'blur(6px)' }}
          position="absolute"
          left="0"
          right="0"
          bottom="0"
          gap="3"
          alignItems="center"
          borderTopWidth="1px"
          borderColor="rgba(255,255,255,0.12)"
          py="3"
          px="4"
        >
          <Button size="md" onClick={togglePlay} colorPalette="pink">
            {playing ? '❚❚ Pause' : '▶ Play'}
          </Button>
          <Button
            size="md"
            variant="outline"
            onClick={() => {
              const next = !muted;
              setMuted(next);
              if (audioRef.current) audioRef.current.muted = next;
            }}
          >
            {muted ? '🔇' : '🔊'}
          </Button>
          <Text minW="110px" color="white" fontSize="sm" fontVariantNumeric="tabular-nums">
            {formatTime(currentTime)} / {formatTime(duration)}
          </Text>
          <input
            type="range"
            min={0}
            max={1000}
            value={sliderVal}
            onChange={(e) => onSeek(Number(e.target.value))}
            style={{ flex: 1, height: '6px', accentColor: '#ec4899' }}
          />
          <styled.select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            borderRadius="md"
            py="1"
            px="2"
            color="fg.default"
            fontSize="sm"
            bg="bg.subtle"
          >
            {[0.25, 0.5, 1, 1.5, 2].map((s) => (
              <option key={s} value={s}>
                {s}x
              </option>
            ))}
          </styled.select>
        </HStack>

        <audio
          ref={audioRef}
          onLoadedMetadata={() => {
            audioReadyRef.current = true;
            setDuration(audioRef.current?.duration ?? 0);
          }}
          onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
          onPlay={() => {
            setPlaying(true);
            if (rendererRef.current) rendererRef.current.playing = true;
          }}
          onPause={() => {
            setPlaying(false);
            if (rendererRef.current) rendererRef.current.playing = false;
          }}
          onEnded={() => setPlaying(false)}
          onError={() => {
            const audio = audioRef.current;
            if (audio && fallbackSrcRef.current && audio.src !== fallbackSrcRef.current) {
              audio.src = fallbackSrcRef.current;
              audio.load();
              if (playing) void audio.play().catch(() => {});
            }
          }}
          style={{ display: 'none' }}
        >
          <track kind="captions" />
        </audio>
      </Box>

      <Stack
        gap="4"
        borderLeftWidth={{ base: '0', lg: '1px' }}
        borderColor="border.default"
        w={{ base: 'full', lg: '380px' }}
        p="4"
        bg="bg.default"
        overflowY="auto"
      >
        <Stack gap="1">
          <Text fontSize="lg" fontWeight="bold">
            Live Stage
          </Text>
          <Text color="fg.muted" fontSize="xs">
            {status}
          </Text>
        </Stack>

        <Stack gap="1">
          <Text fontSize="sm" fontWeight="semibold">
            Song
          </Text>
          <styled.select
            value={selectedSongId ?? ''}
            onChange={(e) => setSelectedSongId(Number(e.target.value))}
            borderColor="border.default"
            borderRadius="md"
            borderWidth="1px"
            p="2"
            color="fg.default"
            fontSize="sm"
            bg="bg.subtle"
          >
            {songs.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </styled.select>
          {bpm != null && (
            <Text color="fg.muted" fontSize="xs">
              Choreography loaded · {bpm} BPM
            </Text>
          )}
        </Stack>

        <Stack gap="2">
          <Text fontSize="sm" fontWeight="semibold">
            Background
          </Text>
          {stageBgIds.length > 0 && (
            <Box
              display="grid"
              gap="1"
              gridTemplateColumns="repeat(4, 1fr)"
              maxH="160px"
              overflowY="auto"
            >
              {stageBgIds.map((id) => (
                <Box
                  as="button"
                  key={id}
                  onClick={() => setBgImageId(bgImageId === id ? '' : id)}
                  style={{
                    backgroundImage: `url(${getQuestBgUrl(id)})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                  title={id}
                  borderColor={bgImageId === id ? 'colorPalette.default' : 'border.default'}
                  borderRadius="md"
                  borderWidth="2px"
                  h="42px"
                  overflow="hidden"
                  cursor="pointer"
                />
              ))}
            </Box>
          )}
        </Stack>

        <Stack gap="2">
          <Text fontSize="sm" fontWeight="semibold">
            Stage layout
          </Text>
          <LabeledRange
            label={`Scale ${baseScale.toFixed(2)}`}
            min={0.2}
            max={2}
            step={0.05}
            value={baseScale}
            onChange={setBaseScale}
          />
          <LabeledRange
            label={`Spread ${spread.toFixed(2)}`}
            min={0.2}
            max={2}
            step={0.05}
            value={spread}
            onChange={setSpread}
          />
          <LabeledRange
            label={`Ground ${groundY.toFixed(2)}`}
            min={0.1}
            max={0.9}
            step={0.01}
            value={groundY}
            onChange={setGroundY}
          />
        </Stack>

        <Stack gap="3">
          <Text fontSize="sm" fontWeight="semibold">
            Performers ({slots.length}) — costume only
          </Text>
          {slots.map((slot) => (
            <Box
              key={slot.key}
              borderColor="border.default"
              borderRadius="lg"
              borderWidth="1px"
              p="3"
              bg="bg.subtle"
            >
              <Stack gap="2">
                <HStack justifyContent="space-between">
                  <Text fontSize="sm" fontWeight="bold">
                    {characterNames[variantIdToChar(slot.variantId)] ??
                      characterNames[slot.characterId] ??
                      slot.characterId}
                  </Text>
                  <Text color="fg.muted" fontSize="2xs">
                    {slot.slotName}
                  </Text>
                </HStack>

                <SlotSelect
                  label="Costume"
                  value={slot.variantId}
                  onChange={(v) => void changeCostume(slot.key, v)}
                  options={(
                    variantsByChar[variantIdToChar(slot.variantId)] ??
                    variantsByChar[slot.characterId] ??
                    []
                  ).map((vr) => ({
                    value: vr.id,
                    label: variantLabel(vr)
                  }))}
                />

                <LabeledRange
                  label={`Size ${slot.scaleMul.toFixed(2)}`}
                  min={0.4}
                  max={1.8}
                  step={0.05}
                  value={slot.scaleMul}
                  onChange={(v) => updateSlotTransform(slot.key, { scaleMul: v })}
                />
              </Stack>
            </Box>
          ))}
        </Stack>
      </Stack>
    </HStack>
  );
}

function LabeledRange({
  label,
  min,
  max,
  step,
  value,
  onChange
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <Stack gap="0.5">
      <Text color="fg.muted" fontSize="xs">
        {label}
      </Text>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: '100%' }}
      />
    </Stack>
  );
}

function SlotSelect({
  label,
  value,
  onChange,
  options
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  options: { value: string | number; label: string }[];
}) {
  return (
    <Stack gap="0.5">
      <Text color="fg.muted" fontSize="xs">
        {label}
      </Text>
      <styled.select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        borderColor="border.default"
        borderRadius="md"
        borderWidth="1px"
        p="1.5"
        color="fg.default"
        fontSize="xs"
        bg="bg.default"
      >
        {options.map((o) => (
          <option key={String(o.value)} value={o.value}>
            {o.label}
          </option>
        ))}
      </styled.select>
    </Stack>
  );
}
