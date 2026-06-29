// Environment: server

import fs from 'fs/promises';
import path from 'path';
import { asc } from 'drizzle-orm';
import { deckMemberPositions, musics } from '../../../drizzle/schema';
import { getDrizzleDb } from '~/utils/database';

export { data };
export type { LiveStageData, StageSong, SpineVariant, FormationEntry };

interface SpineVariant {
  id: string;
  characterId: number;
  characterName: string;
  characterNameJp: string;
  variantId: number;
  cardName: string | null;
  cardRarity: number | null;
  skelPath: string;
  atlasPath: string;
}

interface StageSong {
  id: number;
  title: string;
  soundId: number | null;
  songTime: number | null;
  generationsId: number | null;
  unitId: number | null;
  centerCharacterId: number | null;
}

interface FormationEntry {
  orderId: number;
  characterId: number;
}

interface ManifestAsset {
  id: string;
  category: string;
  skelPath: string;
  atlasPath: string;
  metadata: {
    characterId?: number;
    characterName?: string;
    characterNameJp?: string;
    variantId?: number;
    cardName?: string;
    cardRarity?: number;
  };
}

interface LiveStageData {
  songs: StageSong[];
  variantsByChar: Record<number, SpineVariant[]>;
  formationsByGen: Record<number, FormationEntry[]>;
  characterNames: Record<number, string>;
  stageBgIds: string[];
  stageBgByMusicId: Record<string, string>;
}

type Manifest = { assets: ManifestAsset[] };

async function readSpineManifest(): Promise<ManifestAsset[]> {
  const manifestPath = path.join(process.cwd(), 'data/spine/manifest.json');
  try {
    const raw = await fs.readFile(manifestPath, 'utf-8');
    return (JSON.parse(raw) as Manifest).assets;
  } catch {
    return [];
  }
}

async function readStageBgIds(): Promise<string[]> {
  try {
    const dir = path.join(process.cwd(), 'data/live/quest-bg');
    const files = await fs.readdir(dir);
    const ids = new Set<string>();
    for (const f of files) {
      const m = f.match(/^(\d+)\.webp$/);
      if (m) ids.add(m[1]);
    }
    return [...ids].sort();
  } catch {
    return [];
  }
}

async function readStageBgMap(): Promise<Record<string, string>> {
  try {
    const p = path.join(process.cwd(), 'data/live/stage_bg_map.json');
    return JSON.parse(await fs.readFile(p, 'utf-8'));
  } catch {
    return {};
  }
}

async function data(): Promise<LiveStageData> {
  const db = getDrizzleDb();
  const assets = await readSpineManifest();
  const stageBgIds = await readStageBgIds();
  const stageBgByMusicId = await readStageBgMap();

  const variantsByChar: Record<number, SpineVariant[]> = {};
  const characterNames: Record<number, string> = {};

  for (const a of assets) {
    if (a.category !== 'ingame_sd') continue;
    const cid = a.metadata.characterId;
    if (!cid) continue;
    characterNames[cid] = a.metadata.characterName || a.metadata.characterNameJp || String(cid);
    (variantsByChar[cid] ??= []).push({
      id: a.id,
      characterId: cid,
      characterName: a.metadata.characterName || '',
      characterNameJp: a.metadata.characterNameJp || '',
      variantId: a.metadata.variantId ?? 0,
      cardName: a.metadata.cardName ?? null,
      cardRarity: a.metadata.cardRarity ?? null,
      skelPath: a.skelPath,
      atlasPath: a.atlasPath
    });
  }
  for (const cid of Object.keys(variantsByChar)) {
    variantsByChar[Number(cid)].sort((x, y) => x.variantId - y.variantId);
  }

  const songRows = await db
    .select({
      id: musics.id,
      title: musics.title,
      soundId: musics.soundId,
      songTime: musics.songTime,
      generationsId: musics.generationsId,
      unitId: musics.unitId,
      centerCharacterId: musics.centerCharacterId
    })
    .from(musics)
    .orderBy(asc(musics.orderId));

  const songs: StageSong[] = songRows
    .filter((s) => s.title && s.soundId)
    .map((s) => ({
      id: s.id,
      title: s.title ?? '',
      soundId: s.soundId,
      songTime: s.songTime,
      generationsId: s.generationsId,
      unitId: s.unitId,
      centerCharacterId: s.centerCharacterId
    }));

  const posRows = await db
    .select({
      generationsId: deckMemberPositions.generationsId,
      charactersId: deckMemberPositions.charactersId,
      orderId: deckMemberPositions.orderId
    })
    .from(deckMemberPositions)
    .orderBy(asc(deckMemberPositions.orderId));

  const formationsByGen: Record<number, FormationEntry[]> = {};
  const seen = new Set<string>();
  for (const p of posRows) {
    if (p.generationsId == null || p.charactersId == null || p.orderId == null) continue;
    const key = `${p.generationsId}:${p.charactersId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    (formationsByGen[p.generationsId] ??= []).push({
      orderId: p.orderId,
      characterId: p.charactersId
    });
  }
  for (const gen of Object.keys(formationsByGen)) {
    formationsByGen[Number(gen)].sort((a, b) => a.orderId - b.orderId);
  }

  return { songs, variantsByChar, formationsByGen, characterNames, stageBgIds, stageBgByMusicId };
}
