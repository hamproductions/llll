import type { StyleMovie } from '../+data';
import { Box, HStack, Stack } from 'styled-system/jsx';
import { Text } from '~/components/ui/text';
import { getCardAudioUrl } from '~/utils/assets';

interface StyleMoviesDisplayProps {
  cardId: number;
  movies: StyleMovie[];
  title: string;
}

function StyleMoviesDisplay({ cardId, movies, title }: StyleMoviesDisplayProps) {
  return (
    <Stack gap="4" w="full" mt="4">
      <Text fontSize="2xl" fontWeight="bold">
        {title}
      </Text>
      {movies.map((movie) => {
        const movieType =
          movie.movieType === 1
            ? 'gacha_0001'
            : movie.movieType === 2
              ? 'gacha_0002'
              : 'training_0001';
        return (
          <HStack
            key={movie.id}
            justifyContent="space-between"
            borderRadius="md"
            borderWidth="1px"
            p="4"
          >
            <Box>
              <Text fontWeight="semibold">{movie.name}</Text>
              <Text color="gray.500" fontSize="sm">
                {movie.releaseConditionText}
              </Text>
            </Box>
            <audio controls src={getCardAudioUrl(cardId, movieType)}>
              Your browser does not support the audio element.
            </audio>
          </HStack>
        );
      })}
    </Stack>
  );
}

export { StyleMoviesDisplay };
