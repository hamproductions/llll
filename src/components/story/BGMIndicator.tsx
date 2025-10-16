import { useRef, useEffect } from 'react';
import { styled } from 'styled-system/jsx';
import { getStoryBGMUrl } from '~/utils/assets';

interface BGMIndicatorProps {
  bgmId: string;
  action: 'play' | 'stop';
  autoplay?: boolean;
}

export function BGMIndicator({ bgmId, action, autoplay = true }: BGMIndicatorProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!audioRef.current) return;

    if (action === 'play' && autoplay) {
      void audioRef.current.play().catch((err) => {
        console.warn('BGM autoplay failed:', err);
      });
    } else if (action === 'stop') {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [bgmId, action, autoplay]);

  // Just render the audio element hidden - no visual indicator
  return (
    <styled.audio
      ref={audioRef}
      src={getStoryBGMUrl(bgmId)}
      loop
      preload="auto"
      style={{ display: 'none' }}
    >
      Your browser does not support audio playback.
    </styled.audio>
  );
}
