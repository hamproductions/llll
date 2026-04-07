import { useData } from 'vike-react/useData';
import { Box, Grid, Stack } from 'styled-system/jsx';
import { Metadata } from '~/components/layout/Metadata';
import { AudioArchiveCard } from '~/components/library/AudioArchiveCard';
import { StatCard } from '~/components/library/StatCard';
import { Table } from '~/components/ui/table';
import { Text } from '~/components/ui/text';
import type { PageData } from './+data';

export function Page() {
  const data = useData<PageData>();

  return (
    <>
      <Metadata title="Asset Archive" />
      <Stack gap="8" py="8">
        <Stack gap="3">
          <Text fontSize="4xl" fontWeight="black">
            Asset Archive
          </Text>
          <Text color="fg.muted" maxW="4xl">
            A maintained index of the repository’s useful media and saved datasets: songs, art,
            card voices, story voices, videos, models, and exportable files.
          </Text>
        </Stack>

        <Grid gridTemplateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap="4">
          <StatCard label="Released songs" value={data.counts.releasedSongs} />
          <StatCard label="Album art" value={data.counts.albumArt} />
          <StatCard label="Story voices" value={data.counts.storyVoices} />
          <StatCard label="Card voices" value={data.counts.cardVoices} />
          <StatCard label="Card videos" value={data.counts.cardVideos} />
          <StatCard label="3D files" value={data.counts.modelFiles} />
        </Grid>

        <Stack gap="4">
          <Text fontSize="2xl" fontWeight="bold">
            Saved data
          </Text>
          <Box borderWidth="1px" borderRadius="xl" overflowX="auto">
            <Table.Root variant="outline">
              <Table.Head>
                <Table.Row>
                  <Table.Header>Path</Table.Header>
                  <Table.Header>Size</Table.Header>
                </Table.Row>
              </Table.Head>
              <Table.Body>
                {data.savedData.map((entry) => (
                  <Table.Row key={entry.path}>
                    <Table.Cell>{entry.path}</Table.Cell>
                    <Table.Cell>{entry.sizeLabel}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
        </Stack>

        <Stack gap="4">
          <Text fontSize="2xl" fontWeight="bold">
            Card voice archive
          </Text>
          <Grid gridTemplateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap="4">
            {data.cardVoiceEntries.map((entry) => (
              <AudioArchiveCard
                key={entry.id}
                title={entry.typeLabel}
                subtitle={entry.subtitle}
                description={entry.title}
                audioUrl={entry.audioUrl}
              />
            ))}
          </Grid>
        </Stack>

        <Stack gap="4">
          <Text fontSize="2xl" fontWeight="bold">
            Story voice archive
          </Text>
          <Grid gridTemplateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap="4">
            {data.storyVoiceEntries.map((entry) => (
              <AudioArchiveCard
                key={entry.id}
                title={entry.subtitle}
                subtitle={entry.typeLabel}
                description={entry.title}
                audioUrl={entry.audioUrl}
              />
            ))}
          </Grid>
        </Stack>
      </Stack>
    </>
  );
}
