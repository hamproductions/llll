import type { StyleMovie } from '../+data';
import { Box, Stack } from 'styled-system/jsx';
import { Text } from '~/components/ui/text';

interface StyleMoviesDisplayProps {
  movies: StyleMovie[];
  title: string;
}

function StyleMoviesDisplay({ movies, title }: StyleMoviesDisplayProps) {
  if (!movies || movies.length === 0) {
    return null;
  }

  return (
    <Stack gap="4" w="full" mt="4">
      <Text fontSize="2xl" fontWeight="bold">
        {title}
      </Text>
      {movies.map((movie) => (
        <Box key={movie.id} borderRadius="md" borderWidth="1px" p="4">
          <Text>{movie.name}</Text>
        </Box>
      ))}
    </Stack>
  );
}

export { StyleMoviesDisplay };
