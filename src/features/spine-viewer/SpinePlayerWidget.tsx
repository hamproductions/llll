import { useEffect, useRef } from 'react';
import { SpinePlayer } from '@esotericsoftware/spine-player';
import '@esotericsoftware/spine-player/dist/spine-player.css';

interface SpinePlayerWidgetProps {
  skelUrl: string;
  atlasUrl: string;
  animation?: string;
  skin?: string;
  backgroundColor?: string;
  onReady?: (player: SpinePlayer) => void;
  onAnimationsLoaded?: (animations: string[], skins: string[]) => void;
}

export function SpinePlayerWidget({
  skelUrl,
  atlasUrl,
  animation,
  skin,
  backgroundColor = '#1a1a2e',
  onReady,
  onAnimationsLoaded
}: SpinePlayerWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<SpinePlayer | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    playerRef.current?.dispose();
    containerRef.current.innerHTML = '';

    const isJson = skelUrl.endsWith('.json');
    const player = new SpinePlayer(containerRef.current, {
      ...(isJson ? { jsonUrl: skelUrl } : { binaryUrl: skelUrl }),
      atlasUrl: atlasUrl,
      skin: skin || undefined,
      premultipliedAlpha: true,
      backgroundColor: backgroundColor,
      showControls: true,
      alpha: true,
      preserveDrawingBuffer: false,
      success: (p) => {
        onReady?.(p);
        if (p.skeleton) {
          const anims = p.skeleton.data.animations.map((a) => a.name);
          const skins = p.skeleton.data.skins.map((s) => s.name);
          onAnimationsLoaded?.(anims, skins);
          const startAnim = animation || anims[0];
          if (startAnim && p.animationState) {
            p.animationState.setAnimation(0, startAnim, true);
          }
        }
      },
      error: (_p, msg) => {
        console.error('Spine player error:', msg);
      }
    });

    playerRef.current = player;

    return () => {
      player.dispose();
      playerRef.current = null;
    };
  }, [skelUrl, atlasUrl]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player?.animationState || !animation) return;
    player.animationState.setAnimation(0, animation, true);
  }, [animation]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player?.skeleton || !skin) return;
    player.skeleton.setSkinByName(skin);
    player.skeleton.setSlotsToSetupPose();
  }, [skin]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', position: 'relative' }}
    />
  );
}
