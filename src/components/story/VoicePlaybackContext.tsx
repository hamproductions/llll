import { createContext, useContext, useState, useCallback, useRef } from 'react';

interface VoicePlaybackContextType {
  registerPlayer: (voiceId: string, index: number, play: () => Promise<void>) => void;
  unregisterPlayer: (voiceId: string) => void;
  playAll: () => Promise<void>;
  stopAll: () => void;
  isPlayingAll: boolean;
  currentPlayingId: string | null;
}

const VoicePlaybackContext = createContext<VoicePlaybackContextType | null>(null);

interface PlayerEntry {
  voiceId: string;
  index: number;
  play: () => Promise<void>;
}

export function VoicePlaybackProvider({ children }: { children: React.ReactNode }) {
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const playersRef = useRef<PlayerEntry[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  const registerPlayer = useCallback((voiceId: string, index: number, play: () => Promise<void>) => {
    // Remove existing entry if any
    playersRef.current = playersRef.current.filter(p => p.voiceId !== voiceId);
    // Add new entry
    playersRef.current.push({ voiceId, index, play });
    // Sort by index to maintain order
    playersRef.current.sort((a, b) => a.index - b.index);
  }, []);

  const unregisterPlayer = useCallback((voiceId: string) => {
    playersRef.current = playersRef.current.filter(p => p.voiceId !== voiceId);
  }, []);

  const stopAll = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsPlayingAll(false);
    setCurrentPlayingId(null);
  }, []);

  const playAll = useCallback(async () => {
    if (isPlayingAll) {
      stopAll();
      return;
    }

    setIsPlayingAll(true);
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    // Get sorted players (already sorted by index)
    const players = [...playersRef.current];

    for (const { voiceId, play } of players) {
      if (signal.aborted) break;

      setCurrentPlayingId(voiceId);
      try {
        await play();
        // Wait a bit between voices
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        if (signal.aborted) break;
        console.error(`Failed to play voice ${voiceId}:`, error);
      }
    }

    setIsPlayingAll(false);
    setCurrentPlayingId(null);
    abortControllerRef.current = null;
  }, [isPlayingAll, stopAll]);

  return (
    <VoicePlaybackContext.Provider
      value={{
        registerPlayer,
        unregisterPlayer,
        playAll,
        stopAll,
        isPlayingAll,
        currentPlayingId
      }}
    >
      {children}
    </VoicePlaybackContext.Provider>
  );
}

export function useVoicePlayback() {
  const context = useContext(VoicePlaybackContext);
  if (!context) {
    throw new Error('useVoicePlayback must be used within VoicePlaybackProvider');
  }
  return context;
}
