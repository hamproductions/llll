// Environment: server

import fs from 'fs/promises';
import path from 'path';

export { data };
export type { SpineAsset, PageData };

interface SpineAsset {
  id: string;
  category: string;
  label: string;
  skelPath: string;
  atlasPath: string;
  textures: string[];
  metadata: Record<string, string | number | null>;
}

interface Manifest {
  generatedAt: string;
  assets: SpineAsset[];
}

type PageData = Awaited<ReturnType<typeof data>>;

async function readManifest(): Promise<SpineAsset[]> {
  const manifestPath = path.join(process.cwd(), 'data/spine/manifest.json');
  try {
    const raw = await fs.readFile(manifestPath, 'utf-8');
    const manifest: Manifest = JSON.parse(raw);
    return manifest.assets;
  } catch {
    return [];
  }
}

async function data() {
  const assets = await readManifest();
  const categories = [...new Set(assets.map((a) => a.category))].sort();

  return { assets, categories };
}
