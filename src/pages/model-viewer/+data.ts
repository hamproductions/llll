// Environment: server

import fs from 'fs/promises';
import path from 'path';

export { data };
export type { Asset3D, PageData };

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

interface Manifest {
  generatedAt: string;
  assets: Asset3D[];
}

type PageData = Awaited<ReturnType<typeof data>>;

async function readManifest(): Promise<Asset3D[]> {
  const manifestPath = path.join(process.cwd(), 'data/3d/manifest.json');
  try {
    const raw = await fs.readFile(manifestPath, 'utf-8');
    const manifest: Manifest = JSON.parse(raw);
    return manifest.assets;
  } catch {
    return [];
  }
}

async function collectLegacyGlbs(): Promise<Asset3D[]> {
  const public3dDir = path.join(process.cwd(), 'public/3d');
  try {
    await fs.access(public3dDir);
  } catch {
    return [];
  }

  const assets: Asset3D[] = [];

  async function walk(dir: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else if (entry.name.endsWith('.glb')) {
        const rel = path.relative(public3dDir, full);
        const dirRel = path.relative(public3dDir, dir);
        const siblingFiles = await fs.readdir(dir);
        const textures = siblingFiles.filter((f) => f.endsWith('.png'));
        const baseName = path.basename(entry.name, '.glb');

        assets.push({
          id: baseName,
          category: 'unknown',
          label: baseName,
          glbPath: rel.replace(/\\/g, '/'),
          textureDir: dirRel ? `${dirRel.replace(/\\/g, '/')}/` : '',
          textures,
          textureMap: {},
          metadata: {}
        });
      }
    }
  }

  await walk(public3dDir);
  return assets;
}

async function data() {
  const manifestAssets = await readManifest();
  const legacyAssets = await collectLegacyGlbs();

  const allAssets = [...manifestAssets, ...legacyAssets];
  const categories = [...new Set(allAssets.map((a) => a.category))].sort();

  return { assets: allAssets, categories };
}
