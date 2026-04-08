import { Database } from 'bun:sqlite';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

const DATA_3D_DIR = path.join(process.cwd(), 'data/3d');
const DB_PATH = path.join(process.cwd(), '../data/db.sqlite3');
const MANIFEST_PATH = path.join(DATA_3D_DIR, 'manifest.json');

interface Asset3D {
  id: string;
  category: string;
  label: string;
  glbPath: string;
  extraGlbs?: string[];
  textureDir: string;
  textures: string[];
  textureMap: Record<string, Record<string, string>>;
  metadata: Record<string, string | number | null>;
}

interface CostumeRow {
  id: number;
  label: string;
  charName: string | null;
  charNameJp: string | null;
  costumeName: string | null;
  charactersId: number | null;
  costumesId: number | null;
}

interface StageRow {
  id: number;
  name: string | null;
  description: string | null;
}

const CATEGORIES = ['costume', 'stage', 'prop', 'item', 'ppadv'] as const;

async function scanCategory(category: string): Promise<Asset3D[]> {
  const catDir = path.join(DATA_3D_DIR, category);
  let entries: string[];
  try {
    entries = await fs.readdir(catDir);
  } catch {
    return [];
  }

  const assets: Asset3D[] = [];

  for (const entry of entries) {
    const assetDir = path.join(catDir, entry);
    const stat = await fs.stat(assetDir);
    if (!stat.isDirectory()) continue;

    const files = await fs.readdir(assetDir);
    const glbs = files.filter((f) => f.endsWith('.glb'));
    if (glbs.length === 0) continue;
    let glb = glbs[0];
    const labelGlb = glbs.find((g) => g === `${entry}.glb`);
    if (labelGlb) {
      glb = labelGlb;
    } else if (glbs.length > 1) {
      let maxSize = 0;
      for (const g of glbs) {
        const s = (await fs.stat(path.join(assetDir, g))).size;
        if (s > maxSize) { maxSize = s; glb = g; }
      }
    }

    const textures = files.filter((f) => f.endsWith('.png'));
    const glbPath = `${category}/${entry}/${glb}`;
    const extraGlbs = glbs.filter(g => g !== glb).map(g => `${category}/${entry}/${g}`);
    const textureDir = `${category}/${entry}/`;

    let textureMap: Record<string, Record<string, string>> = {};
    const texMapFile = path.join(assetDir, 'textures.json');
    try {
      const raw = await fs.readFile(texMapFile, 'utf-8');
      textureMap = JSON.parse(raw);
    } catch {}

    assets.push({
      id: entry,
      category,
      label: entry,
      glbPath,
      extraGlbs: extraGlbs.length > 0 ? extraGlbs : undefined,
      textureDir,
      textures,
      textureMap,
      metadata: {}
    });
  }

  return assets;
}

function enrichCostumes(assets: Asset3D[], db: Database) {
  const rows = db
    .query<CostumeRow, []>(
      `SELECT cm.Id as id, cm.Label as label,
              c.LatinAlphabetNameFirst as charName, c.NameFirst as charNameJp,
              co.Label as costumeName,
              cm.CharactersId as charactersId, cm.CostumesId as costumesId
       FROM CostumeModels cm
       LEFT JOIN Characters c ON cm.CharactersId = c.Id
       LEFT JOIN Costumes co ON cm.CostumesId = co.Id`
    )
    .all();

  const byLabel = new Map(rows.map((r) => [`3d_costume_${r.id}`, r]));

  for (const asset of assets) {
    const row = byLabel.get(asset.label);
    if (row) {
      asset.metadata = {
        characterName: row.charName,
        characterNameJp: row.charNameJp,
        costumeName: row.costumeName,
        charactersId: row.charactersId,
        costumesId: row.costumesId
      };
    }
  }
}

function enrichPpadv(assets: Asset3D[]) {
  for (const asset of assets) {
    const match = asset.label.match(/^ppadv(\d+)_(.+)$/);
    if (match) {
      const name = match[2]
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      asset.metadata.assetName = name;
      asset.metadata.ppadvId = parseInt(match[1], 10);
    }
  }
}

function enrichFromDeps(assets: Asset3D[], db: Database, prefix: string) {
  for (const asset of assets) {
    const deps = db
      .query<{ dependency: string }, [string]>(
        `SELECT bd.dependency FROM bundle b JOIN bundle_dependency bd ON b.uid = bd.uid WHERE b.label = ?`
      )
      .all(asset.label);

    const fbxDeps = deps
      .map((d) => d.dependency)
      .filter((d) => d.endsWith('.fbx'));

    if (fbxDeps.length > 0) {
      const mainFbx = fbxDeps[0];
      const name = mainFbx
        .replace(/^__/, '')
        .replace(/\.fbx$/, '')
        .replace(/^sc_(bg|pp)\d+_/, '')
        .replace(/_/g, ' ')
        .trim();
      asset.metadata.assetName = name;
    }
  }
}

async function main() {
  const db = new Database(DB_PATH, { readonly: true });
  const allAssets: Asset3D[] = [];

  for (const category of CATEGORIES) {
    const assets = await scanCategory(category);
    if (category === 'costume') enrichCostumes(assets, db);
    if (category === 'stage' || category === 'prop' || category === 'item') {
      enrichFromDeps(assets, db, category);
    }
    if (category === 'ppadv') {
      enrichPpadv(assets);
    }
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
