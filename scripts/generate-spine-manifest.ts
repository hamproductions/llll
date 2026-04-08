import { Database } from 'bun:sqlite';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

const DATA_SPINE_DIR = path.join(process.cwd(), 'data/spine');
const DB_PATH = path.join(process.cwd(), '../data/db.sqlite3');
const MANIFEST_PATH = path.join(DATA_SPINE_DIR, 'manifest.json');

interface SpineAsset {
  id: string;
  category: string;
  label: string;
  skelPath: string;
  atlasPath: string;
  textures: string[];
  metadata: Record<string, string | number | null>;
}

interface CharRow {
  Id: number;
  NameFirst: string | null;
  LatinAlphabetNameFirst: string | null;
}

interface CardSpineRow {
  CharactersId: number;
  SpineId: number;
  CardSeriesId: number;
  CardName: string | null;
  Rarity: number;
}

const CATEGORIES = ['ingame_sd', 'outgame_sd', 'top_sd'] as const;

const CHAR_ID_PATTERN = /(\d{4})/;

async function scanCategory(category: string): Promise<SpineAsset[]> {
  const catDir = path.join(DATA_SPINE_DIR, category);
  let entries: string[];
  try {
    entries = await fs.readdir(catDir);
  } catch {
    return [];
  }

  const assets: SpineAsset[] = [];

  for (const entry of entries) {
    const assetDir = path.join(catDir, entry);
    const stat = await fs.stat(assetDir);
    if (!stat.isDirectory()) continue;

    const files = await fs.readdir(assetDir);
    const skels = files.filter((f) => f.endsWith('.skel') || f.endsWith('.skel.json'));
    const atlases = files.filter((f) => f.endsWith('.atlas'));
    const textures = files.filter((f) => f.endsWith('.png'));

    if (skels.length === 0) continue;

    assets.push({
      id: entry,
      category,
      label: entry,
      skelPath: `${category}/${entry}/${skels[0]}`,
      atlasPath: atlases.length > 0 ? `${category}/${entry}/${atlases[0]}` : '',
      textures: textures.map((t) => `${category}/${entry}/${t}`),
      metadata: {}
    });
  }

  return assets;
}

function enrichWithCharacterData(assets: SpineAsset[], db: Database) {
  const chars = db
    .query<CharRow, []>(`SELECT Id, NameFirst, LatinAlphabetNameFirst FROM Characters`)
    .all();
  const charById = new Map(chars.map((r) => [r.Id, r]));

  const cardRows = db
    .query<CardSpineRow, []>(`
      SELECT cd.CharactersId, cd.SpineId, cd.CardSeriesId, cd.Name as CardName, cd.Rarity
      FROM CardDatas cd
      WHERE cd.EvolveTimes = 0
      ORDER BY cd.CharactersId, cd.SpineId
    `)
    .all();

  // Map charId_spineId → card info
  const cardBySpine = new Map<string, CardSpineRow>();
  for (const row of cardRows) {
    const key = `${row.CharactersId}_${String(row.SpineId).padStart(3, '0')}`;
    if (!cardBySpine.has(key)) cardBySpine.set(key, row);
  }

  for (const asset of assets) {
    const match = asset.label.match(CHAR_ID_PATTERN);
    if (!match) continue;

    const charId = parseInt(match[1], 10);
    const charRow = charById.get(charId);
    if (charRow) {
      asset.metadata.characterId = charId;
      asset.metadata.characterName = charRow.LatinAlphabetNameFirst;
      asset.metadata.characterNameJp = charRow.NameFirst;
    }

    const variantMatch = asset.label.match(/_(\d{3})$/);
    if (variantMatch) {
      const variantId = parseInt(variantMatch[1], 10);
      asset.metadata.variantId = variantId;

      const cardKey = `${charId}_${variantMatch[1]}`;
      const card = cardBySpine.get(cardKey);
      if (card) {
        asset.metadata.cardSeriesId = card.CardSeriesId;
        asset.metadata.cardName = card.CardName;
        asset.metadata.cardRarity = card.Rarity;
      }
    }
  }
}

async function main() {
  const db = new Database(DB_PATH, { readonly: true });
  const allAssets: SpineAsset[] = [];

  for (const category of CATEGORIES) {
    const assets = await scanCategory(category);
    enrichWithCharacterData(assets, db);
    allAssets.push(...assets);
    console.log(`${category}: ${assets.length} assets`);
  }

  db.close();

  const manifest = {
    generatedAt: new Date().toISOString(),
    assets: allAssets
  };

  await fs.mkdir(path.dirname(MANIFEST_PATH), { recursive: true });
  await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`\nManifest written: ${MANIFEST_PATH}`);
  console.log(`Total: ${allAssets.length} assets`);
}

main().catch(console.error);
