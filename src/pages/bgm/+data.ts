// Environment: server

import { Database } from 'bun:sqlite';
import fs from 'fs/promises';
import { join } from 'path';

export { data };

const homeSetNames: Record<string, string> = {
  '3010011-3010012': 'Spring',
  '3010021-3010022': 'Summer',
  '3010031-3010032': 'Autumn',
  '3010041-3010042': 'Winter'
};

const CATEGORY_ORDER = ['home', 'story', 'quest', 'gacha', 'collection', 'with', 'fes', 'rhythm', 'title', 'other'] as const;
const CATEGORY_LABELS: Record<string, string> = {
  home: 'Home',
  story: 'Story',
  quest: 'Quest',
  gacha: 'Gacha',
  collection: 'Collection',
  with: 'With×Meets',
  fes: 'Fes×Live',
  rhythm: 'Rhythm Game',
  title: 'Title',
  other: 'Other',
};

function classifyBgm(filename: string): string {
  if (filename.startsWith('bgm_home_')) return 'home';
  if (filename.startsWith('bgm_adv_')) return 'story';
  if (filename.startsWith('bgm_quest_')) return 'quest';
  if (filename.startsWith('bgm_gacha_')) return 'gacha';
  if (filename.startsWith('bgm_collection_')) return 'collection';
  if (filename.startsWith('bgm_with_')) return 'with';
  if (filename.startsWith('bgm_fes_')) return 'fes';
  if (filename.startsWith('bgm_rhythm_')) return 'rhythm';
  if (filename.startsWith('bgm_title_')) return 'title';
  return 'other';
}

function formatAudioName(value: string): string {
  return value
    .replace(/\.wav$/i, '')
    .replace(/^bgm_(adv|home|quest|collection|gacha|with|fes|rhythm|title)_/, '')
    .replace(/^\d+@/, '')
    .replace(/@/g, ' — ')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (part) => part.toUpperCase())
    .trim() || value;
}

async function data() {
  const sqlite = new Database(join(import.meta.dirname, '../../../../data/db.sqlite3'));
  const audioDir = join(import.meta.dirname, '../../../../data/music/out');
  const audioFiles = await fs.readdir(audioDir);

  const findAudioFile = (key: string) =>
    audioFiles.find((file) => file === `${key}.wav` || file.startsWith(`${key}@`)) ?? null;

  try {
    const homeBgms = sqlite
      .query(
        `SELECT Id as id, DaytimeBgmId as daytimeBgmId, NighttimeBgmId as nighttimeBgmId, StartTime as startTime, EndTime as endTime
         FROM HomeBgms
         ORDER BY StartTime DESC`
      )
      .all() as {
        id: number;
        daytimeBgmId: number;
        nighttimeBgmId: number;
        startTime: string;
        endTime: string;
      }[];

    const seenPairs = new Set<string>();
    const homeBgmSets = homeBgms
      .map((bgm) => {
        const pairKey = `${bgm.daytimeBgmId}-${bgm.nighttimeBgmId}`;
        if (seenPairs.has(pairKey)) return null;
        seenPairs.add(pairKey);

        return {
          pairKey,
          name: homeSetNames[pairKey] ?? `Set ${seenPairs.size}`,
          daytimeAudioFile: findAudioFile(`bgm_home_${bgm.daytimeBgmId}`),
          nighttimeAudioFile: findAudioFile(`bgm_home_${bgm.nighttimeBgmId}`)
        };
      })
      .filter(Boolean) as {
        pairKey: string;
        name: string;
        daytimeAudioFile: string | null;
        nighttimeAudioFile: string | null;
      }[];

    const allBgmFiles = audioFiles
      .filter((f) => f.endsWith('.wav') && !f.startsWith('bgm_live_') && !f.startsWith('bgm_preview_') && !f.startsWith('bgm_home_'))
      .sort();

    const categorizedBgms: Record<string, { id: string; audioFile: string; displayName: string }[]> = {};

    for (const file of allBgmFiles) {
      const category = classifyBgm(file);
      if (!categorizedBgms[category]) categorizedBgms[category] = [];
      categorizedBgms[category].push({
        id: file,
        audioFile: file,
        displayName: formatAudioName(file)
      });
    }

    const sections = CATEGORY_ORDER
      .filter((cat) => cat !== 'home' && categorizedBgms[cat]?.length)
      .map((cat) => ({
        key: cat,
        label: CATEGORY_LABELS[cat] ?? cat,
        bgms: categorizedBgms[cat]!
      }));

    return { homeBgmSets, sections };
  } finally {
    sqlite.close();
  }
}

export type PageData = Awaited<ReturnType<typeof data>>;
