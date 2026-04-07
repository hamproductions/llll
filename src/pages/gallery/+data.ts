// Environment: server

import { readdir } from 'fs/promises';
import { join } from 'path';

export { data };

async function readImages(dir: string): Promise<string[]> {
  try {
    const files = await readdir(dir);
    return files.filter((f) => f.endsWith('.webp') || f.endsWith('.png')).sort();
  } catch {
    return [];
  }
}

async function data() {
  const appDataRoot = join(import.meta.dirname, '../../../data');
  const rootDataRoot = join(import.meta.dirname, '../../../../data');

  const [profBase, profSeason, profCustom, profEtc, photos] = await Promise.all([
    readImages(join(appDataRoot, 'characters/profile/base')),
    readImages(join(appDataRoot, 'characters/profile/season')),
    readImages(join(appDataRoot, 'characters/profile/custom')),
    readImages(join(appDataRoot, 'characters/profile/etc')),
    readImages(join(rootDataRoot, 'assets/photo_10512/final')),
  ]);

  return {
    sections: [
      { key: 'illustrations', label: 'Illustrations', files: profEtc, count: profEtc.length },
      { key: 'photos', label: 'Photos', files: photos, count: photos.length },
      { key: 'profile-base', label: 'Profile', files: profBase, count: profBase.length },
      { key: 'profile-season', label: 'Profile (Season)', files: profSeason, count: profSeason.length },
      { key: 'profile-custom', label: 'Card Profiles', files: profCustom, count: profCustom.length },
    ],
  };
}

export type PageData = Awaited<ReturnType<typeof data>>;
