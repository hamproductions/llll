import { useState, useRef, useEffect, useCallback } from 'react';
import { Box } from 'styled-system/jsx';
import { Button } from '~/components/ui/button';
import { useVoicePlayback } from './VoicePlaybackContext';

interface VoicePlayerProps {
  voiceId: string;
  voiceUrl: string;
  index: number;
}

export function VoicePlayer({ voiceId, voiceUrl, index }: VoicePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { registerPlayer, unregisterPlayer } = useVoicePlayback();

  const play = useCallback(async () => {
    if (!audioRef.current) return;

    setIsPlaying(true);
    try {
      await audioRef.current.play();
      // Wait for audio to finish
      await new Promise<void>((resolve) => {
        if (!audioRef.current) {
          resolve();
          return;
        }
        const onEnded = () => {
          resolve();
          audioRef.current?.removeEventListener('ended', onEnded);
        };
        audioRef.current.addEventListener('ended', onEnded);
      });
    } catch (error) {
      console.error('Failed to play audio:', error);
      setHasError(true);
      throw error;
    } finally {
      setIsPlaying(false);
    }
  }, []);

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      play().catch(() => {});
    }
  };

  useEffect(() => {
    registerPlayer(voiceId, index, play);
    return () => unregisterPlayer(voiceId);
  }, [voiceId, index, play, registerPlayer, unregisterPlayer]);

  const handleEnded = () => {
    setIsPlaying(false);
  };

  const handleError = () => {
    console.error(`Failed to load voice: ${voiceId}`);
    setHasError(true);
  };

  if (hasError) {
    return null;
  }

  return (
    <Box display="inline-flex" alignItems="center">
      <audio
        ref={audioRef}
        src={voiceUrl}
        onEnded={handleEnded}
        onError={handleError}
        preload="metadata"
      />
      <Button
        size="xs"
        variant="ghost"
        onClick={handlePlayPause}
        aria-label={isPlaying ? 'Pause voice' : 'Play voice'}
        px="1"
        minW="auto"
        h="auto"
      >
        <Box fontSize="sm" lineHeight="1">
          {isPlaying ? '⏸' : '▶'}
        </Box>
      </Button>
    </Box>
  );
}
