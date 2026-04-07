import { readdir, stat } from 'fs/promises';
import { join, basename } from 'path';
import { asc } from 'drizzle-orm';
import { advDatas, advSeries, musics } from '../../drizzle/schema';
import {
  getAlbumArtPublicPath,
  getCardAudioFile,
  getMusicTrackUrl,
  getStoryVoiceUrl
} from './assets';
import { formatBytes, formatDuration, formatPreviewWindow, getCardVoiceTypeLabel } from './assetFormat';
import { getDrizzleDb } from './database';
import { filterReleasedContent } from './release';

export interface MusicLibraryEntry {
  id: number;
  title: string;
  description: string;
  soundId: number | null;
  durationLabel: string;
  previewLabel: string;
  imageUrl: string;
  audioUrl: string | null;
}

export interface VoiceArchiveEntry {
  id: string;
  title: string;
  subtitle: string;
  audioUrl: string;
  typeLabel: string;
}

export interface SavedDataEntry {
  path: string;
  sizeLabel: string;
}

export interface AssetArchiveData {
  counts: {
    releasedSongs: number;
    storySeries: number;
    storyChapters: number;
    albumArt: number;
    storyVoices: number;
    cardVoices: number;
    cardImages: number;
    cardVideos: number;
    modelFiles: number;
  };
  savedData: SavedDataEntry[];
  storyVoiceEntries: VoiceArchiveEntry[];
  cardVoiceEntries: VoiceArchiveEntry[];
}

async function walkFiles(dirPath: string): Promise<string[]> {
  const entries = await readdir(dirPath, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = join(dirPath, entry.name);

      if (entry.isDirectory()) {
        return walkFiles(entryPath);
      }

      return [entryPath];
    })
  );

  return files.flat();
}

async function safeWalkFiles(dirPath: string) {
  try {
    return await walkFiles(dirPath);
  } catch {
    return [];
  }
}

async function getSavedData(pathName: string): Promise<SavedDataEntry | null> {
  try {
    const details = await stat(pathName);
    return {
      path: pathName.replace(`${process.cwd()}/`, ''),
      sizeLabel: formatBytes(details.size)
    };
  } catch {
    return null;
  }
}

export async function getMusicLibrary() {
  const db = getDrizzleDb();
  const releasedSongs = filterReleasedContent(
    await db
      .select({
        id: musics.id,
        title: musics.title,
        description: musics.description,
        soundId: musics.soundId,
        songTime: musics.songTime,
        previewStartTime: musics.previewStartTime,
        previewEndTime: musics.previewEndTime,
        startTime: musics.startTime
      })
      .from(musics)
      .orderBy(asc(musics.orderId)),
    undefined,
    (item) => item.startTime
  );

  return releasedSongs.map<MusicLibraryEntry>((song) => ({
    id: song.id,
    title: song.title ?? `Song ${song.id}`,
    description: song.description ?? '',
    soundId: song.soundId,
    durationLabel: formatDuration(song.songTime),
    previewLabel: formatPreviewWindow(song.previewStartTime, song.previewEndTime),
    imageUrl: getAlbumArtPublicPath(song.id),
    audioUrl: song.soundId ? getMusicTrackUrl(song.soundId) : null
  }));
}

export async function getAssetArchive() {
  const db = getDrizzleDb();
  const dataRoot = join(process.cwd(), 'data');
  const publicRoot = join(process.cwd(), 'public');

  const [releasedSongs, releasedSeries, releasedChapters, albumArtFiles, storyVoiceFiles, cardFiles, modelFiles] =
    await Promise.all([
      db
        .select({
          id: musics.id,
          startTime: musics.startTime
        })
        .from(musics)
        .orderBy(asc(musics.orderId)),
      db
        .select({
          id: advSeries.id,
          startTime: advSeries.startTime
        })
        .from(advSeries),
      db
        .select({
          id: advDatas.id,
          startTime: advDatas.startTime
        })
        .from(advDatas),
      safeWalkFiles(join(dataRoot, 'assets', 'album-art')),
      safeWalkFiles(join(dataRoot, 'story', 'voice')),
      safeWalkFiles(join(dataRoot, 'cards')),
      safeWalkFiles(join(publicRoot, '3d'))
    ]);

  const releasedSongsCount = filterReleasedContent(releasedSongs, undefined, (item) => item.startTime).length;
  const releasedSeriesCount = filterReleasedContent(releasedSeries, undefined, (item) => item.startTime).length;
  const releasedChaptersCount = filterReleasedContent(releasedChapters, undefined, (item) => item.startTime).length;

  const cardVoiceFiles = cardFiles.filter((file) => file.includes('/voice/') && file.endsWith('.webm'));
  const cardImageFiles = cardFiles.filter((file) => file.includes('/images/') && /\.(webp|png|jpg)$/i.test(file));
  const cardVideoFiles = cardFiles.filter((file) => file.includes('/videos/') && /\.(webm|mp4)$/i.test(file));
  const storyVoices = storyVoiceFiles.filter((file) => file.endsWith('.webm')).sort();

  const cardVoiceEntries = cardVoiceFiles
    .sort()
    .slice(0, 18)
    .map<VoiceArchiveEntry>((filePath) => {
      const fileName = basename(filePath);
      const cardId = Number(filePath.split('/').at(-3) ?? 0);

      return {
        id: fileName,
        title: fileName.replace(/\.webm$/i, ''),
        subtitle: `Card ${cardId}`,
        typeLabel: getCardVoiceTypeLabel(fileName),
        audioUrl: getCardAudioFile(cardId, fileName.replace(/\.webm$/i, ''))
      };
    });

  const storyVoiceEntries = storyVoices.slice(0, 18).map<VoiceArchiveEntry>((filePath) => {
    const fileName = basename(filePath);
    const voiceId = fileName.replace(/\.webm$/i, '');
    const speaker = voiceId.split('@')[1] ?? 'Unknown';

    return {
      id: voiceId,
      title: voiceId,
      subtitle: speaker,
      typeLabel: 'Story voice',
      audioUrl: getStoryVoiceUrl(voiceId)
    };
  });

  const savedData = (
    await Promise.all([
      getSavedData(join(process.cwd(), 'exported-cards.tsv')),
      getSavedData(join(process.cwd(), '..', 'data', 'db.sqlite3')),
      getSavedData(join(process.cwd(), 'budget.json'))
    ])
  ).filter((item): item is SavedDataEntry => item !== null);

  return {
    counts: {
      releasedSongs: releasedSongsCount,
      storySeries: releasedSeriesCount,
      storyChapters: releasedChaptersCount,
      albumArt: albumArtFiles.filter((file) => file.endsWith('.webp')).length,
      storyVoices: storyVoices.length,
      cardVoices: cardVoiceFiles.length,
      cardImages: cardImageFiles.length,
      cardVideos: cardVideoFiles.length,
      modelFiles: modelFiles.filter((file) => /\.(glb|gltf|obj|png|json)$/i.test(file)).length
    },
    savedData,
    storyVoiceEntries,
    cardVoiceEntries
  } satisfies AssetArchiveData;
}
