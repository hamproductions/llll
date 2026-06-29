// Environment: server

import fs from 'fs/promises';
import path from 'path';

export { data };
export type { SpineTimelineData, TimelineIndexEntry };

interface TimelineIndexEntry {
  id: string;
  characterId: number | null;
  trackCount: number;
  animCount: number;
}

interface SpineTimelineData {
  families: Record<string, TimelineIndexEntry[]>;
  characterNames: Record<number, string>;
  spinePaths: Record<string, { skelPath: string; atlasPath: string }>;
}

const FAMILIES = ['skill', 'special_appeal', 'costume_preview'];

async function readIndex(fam: string): Promise<TimelineIndexEntry[]> {
  try {
    const p = path.join(process.cwd(), 'data/live/spine-timelines', fam, 'index.json');
    return JSON.parse(await fs.readFile(p, 'utf-8'));
  } catch {
    return [];
  }
}

async function readManifest(): Promise<{
  names: Record<number, string>;
  spinePaths: Record<string, { skelPath: string; atlasPath: string }>;
}> {
  try {
    const p = path.join(process.cwd(), 'data/spine/manifest.json');
    const m = JSON.parse(await fs.readFile(p, 'utf-8'));
    const names: Record<number, string> = {};
    const spinePaths: Record<string, { skelPath: string; atlasPath: string }> = {};
    for (const a of m.assets) {
      const cid = a.metadata?.characterId;
      if (cid) names[cid] = a.metadata.characterName || a.metadata.characterNameJp || String(cid);
      spinePaths[a.id] = { skelPath: a.skelPath, atlasPath: a.atlasPath };
    }
    return { names, spinePaths };
  } catch {
    return { names: {}, spinePaths: {} };
  }
}

async function data(): Promise<SpineTimelineData> {
  const families: Record<string, TimelineIndexEntry[]> = {};
  for (const fam of FAMILIES) {
    families[fam] = await readIndex(fam);
  }
  const { names, spinePaths } = await readManifest();
  return { families, characterNames: names, spinePaths };
}
