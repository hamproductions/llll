import { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { StyleMovie } from '../+data';
import { Box, HStack, Stack, styled } from 'styled-system/jsx';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { getCardVideoUrl, getCardAudioUrl, getCardImageUrl } from '~/utils/assets';

interface StyleMoviesDisplayProps {
  cardId: number;
  movies: StyleMovie[];
  title: string;
}

interface VideoPlayerProps {
  cardId: number;
  movie: StyleMovie;
}

function getRarity(cardId: number): number {
  return Number(cardId.toString()[4]);
}

function VideoPlayer({ cardId, movie }: VideoPlayerProps) {
  const { t } = useTranslation();
  const inVideoRef = useRef<HTMLVideoElement>(null);
  const loopVideoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [inVideoSrc, setInVideoSrc] = useState<string | null>(null);
  const [loopVideoSrc, setLoopVideoSrc] = useState<string | null>(null);
  const [audioSrcs, setAudioSrcs] = useState<string[]>([]);
  const [currentAudioIndex, setCurrentAudioIndex] = useState(0);

  const [activeVideo, setActiveVideo] = useState<'in' | 'loop'>('in');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioFinished, setIsAudioFinished] = useState(false);

  const rarity = getRarity(cardId);

  useEffect(() => {
    let inVideoPath: string | null = null;
    let loopVideoPath: string | null = null;
    const audioPaths: string[] = [];

    switch (movie.movieType) {
      case 1: // get_in -> get_loop
        audioPaths.push(getCardAudioUrl(cardId, 'gacha_0001'));
        audioPaths.push(getCardAudioUrl(cardId, 'gacha_0002'));
        break;
      case 2:
        audioPaths.push(getCardAudioUrl(cardId, 'training_0001'));
        break;
      case 3: // training_in -> training_loop
        audioPaths.push(getCardAudioUrl(cardId, 'message_0001'));
        break;
    }

    if (rarity <= 4) {
      // Display static image with audio
      setInVideoSrc(null);
      setLoopVideoSrc(null);
    } else if (rarity === 8) {
      inVideoPath = getCardVideoUrl(cardId, 'training_in');
      loopVideoPath = getCardVideoUrl(cardId, 'training_loop');
    } else {
      switch (movie.movieType) {
        case 1: // get_in -> get_loop
          inVideoPath = getCardVideoUrl(cardId, 'get_in');
          loopVideoPath = getCardVideoUrl(cardId, 'get_loop');

          break;
        case 2:
          inVideoPath = getCardVideoUrl(cardId, 'training_in');
          loopVideoPath = getCardVideoUrl(cardId, 'training_loop');
          break;
        case 3: // training_in -> training_loop
          inVideoPath = getCardVideoUrl(cardId, 'training_in');
          loopVideoPath = getCardVideoUrl(cardId, 'training_loop');
          break;
      }
    }

    setInVideoSrc(inVideoPath);
    setLoopVideoSrc(loopVideoPath);
    setAudioSrcs(audioPaths);
    setCurrentAudioIndex(0);
    setActiveVideo('in');
    setIsPlaying(false);
    setIsAudioFinished(false);

    // Preload loop video
    if (loopVideoRef.current && loopVideoPath) {
      loopVideoRef.current.load();
    }
    if (audioRef.current && audioPaths.length > 0) {
      audioRef.current.src = audioPaths[0];
      audioRef.current.load();
    }
  }, [cardId, movie.movieType, rarity]);

  const handleInVideoEnded = () => {
    if (loopVideoSrc) {
      setActiveVideo('loop');
      if (isPlaying) {
        void loopVideoRef.current?.play();
      }
    }
  };

  const handleAudioEnded = () => {
    if (currentAudioIndex < audioSrcs.length - 1) {
      const nextIndex = currentAudioIndex + 1;
      setCurrentAudioIndex(nextIndex);
      if (audioRef.current) {
        audioRef.current.src = audioSrcs[nextIndex];
        void audioRef.current.play();
      }
    } else {
      setIsAudioFinished(true);
    }
  };

  const handlePlayPause = () => {
    const videoToControl = activeVideo === 'in' ? inVideoRef.current : loopVideoRef.current;

    if (isPlaying) {
      videoToControl?.pause();
      audioRef.current?.pause();
    } else {
      void videoToControl?.play();
      if (audioRef.current && !isAudioFinished) {
        void audioRef.current.play();
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    // Pause all media
    inVideoRef.current?.pause();
    loopVideoRef.current?.pause();
    audioRef.current?.pause();

    // Reset time
    if (inVideoRef.current) inVideoRef.current.currentTime = 0;
    if (loopVideoRef.current) loopVideoRef.current.currentTime = 0;
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      if (audioSrcs.length > 0) {
        audioRef.current.src = audioSrcs[0];
      }
    }

    setCurrentAudioIndex(0);
    setActiveVideo('in');
    setIsAudioFinished(false);

    const videoToPlay = inVideoRef.current;

    if (videoToPlay) {
      void videoToPlay.play();
    }
    if (audioRef.current) {
      void audioRef.current.play();
    }
    setIsPlaying(true);
  };

  return (
    <Stack key={movie.id} justifyContent="space-between" borderRadius="md" borderWidth="1px" p="4">
      <Box>
        <Text fontWeight="semibold">{movie.name}</Text>
        <Text color="gray.500" fontSize="sm">
          {movie.releaseConditionText}
        </Text>
      </Box>
      <Stack>
        {rarity <= 4 ? (
          <Box position="relative" width="200px" height="300px" backgroundColor="#000">
            <styled.img
              src={getCardImageUrl(cardId, movie.movieType === 1 ? 0 : 1)}
              alt={`${movie.name} Card `}
              position="absolute"
              top="0"
              left="0"
              objectFit="cover"
              width="100%"
              height="100%"
            />
          </Box>
        ) : (
          <>
            <Box position="relative" width="200px" height="300px" backgroundColor="#000">
              {inVideoSrc && (
                <styled.video
                  ref={inVideoRef}
                  src={inVideoSrc}
                  onEnded={handleInVideoEnded}
                  playsInline
                  preload="auto"
                  muted // Mute inline video to allow audio to be controlled by the single audio element
                  zIndex="100"
                  visibility={activeVideo === 'in' ? 'visible' : 'hidden'}
                  position="absolute"
                  top="0"
                  left="0"
                  width="100%"
                  height="100%"
                />
              )}
              {loopVideoSrc && (
                <styled.video
                  ref={loopVideoRef}
                  src={loopVideoSrc}
                  loop
                  playsInline
                  preload="auto"
                  muted // Mute inline video to allow audio to be controlled by the single audio element
                  visibility={activeVideo === 'loop' ? 'visible' : 'hidden'}
                  position="absolute"
                  top="0"
                  left="0"
                  width="100%"
                  height="100%"
                />
              )}
            </Box>
          </>
        )}
        {audioSrcs.length > 0 && (
          <styled.audio
            ref={audioRef}
            src={audioSrcs[0]}
            preload="auto"
            onEnded={handleAudioEnded}
          />
        )}

        <HStack justifyContent="space-between" mt="2">
          <Button onClick={handlePlayPause}>{isPlaying ? 'Pause' : 'Play'}</Button>
          <Button onClick={handleRestart}>Restart</Button>
        </HStack>
      </Stack>
    </Stack>
  );
}

interface HomeVideoPlayerProps {
  cardId: number;
  homeVariant: 0 | 1;
}

function HomeVideoPlayer({ cardId, homeVariant }: HomeVideoPlayerProps) {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const rarity = getRarity(cardId);

  useEffect(() => {
    let videoPath: string | null = null;

    if (rarity <= 4) {
      // Display static image
      videoPath = null;
    } else if (rarity === 8) {
      videoPath = getCardVideoUrl(cardId, 'training_loop');
    } else {
      videoPath = getCardVideoUrl(cardId, 'home', homeVariant.toString());
    }

    setVideoSrc(videoPath);
    setIsPlaying(false);

    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [cardId, homeVariant, rarity]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        void videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleRestart = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      void videoRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <Stack borderRadius="md" borderWidth="1px" p="4">
      <Box>
        <Text fontWeight="semibold">
          {homeVariant === 0 ? t('home_video_unawakened_title') : t('home_video_awakened_title')}
        </Text>
      </Box>
      <Stack>
        {rarity <= 4 ? (
          <Box position="relative" width="200px" height="300px" backgroundColor="#000">
            <styled.img
              src={getCardImageUrl(cardId, homeVariant)}
              alt={`${homeVariant === 0 ? t('home_video_unawakened_title') : t('home_video_awakened_title')} Card `}
              position="absolute"
              top="0"
              left="0"
              objectFit="cover"
              width="100%"
              height="100%"
            />
          </Box>
        ) : (
          <Box position="relative" width="200px" height="300px" backgroundColor="#000">
            {videoSrc && (
              <styled.video
                ref={videoRef}
                src={videoSrc}
                loop
                playsInline
                preload="auto"
                position="absolute"
                top="0"
                left="0"
                width="100%"
                height="100%"
              />
            )}
          </Box>
        )}
        {videoSrc && (
          <HStack justifyContent="space-between" mt="2">
            <Button onClick={handlePlayPause}>{isPlaying ? 'Pause' : 'Play'}</Button>
            <Button onClick={handleRestart}>Restart</Button>
          </HStack>
        )}
      </Stack>
    </Stack>
  );
}

function StyleMoviesDisplay({ cardId, movies, title }: StyleMoviesDisplayProps) {
  return (
    <Stack gap="4" w="full" mt="4" flexWrap="wrap">
      <Text fontSize="2xl" fontWeight="bold">
        {title}
      </Text>
      <HStack>
        {movies.map((movie) => (
          <VideoPlayer key={movie.id} cardId={cardId} movie={movie} />
        ))}
      </HStack>
      <HStack>
        <HomeVideoPlayer cardId={cardId} homeVariant={0} />
        <HomeVideoPlayer cardId={cardId} homeVariant={1} />
      </HStack>
    </Stack>
  );
}

export { StyleMoviesDisplay };
