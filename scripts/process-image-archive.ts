import fs from 'fs/promises';
import path from 'path';
import { processGenericImageAssets } from './fetch-assets';

async function main() {
  const [rawDir, destDir, label = 'archive'] = process.argv.slice(2);

  if (!rawDir || !destDir) {
    throw new Error('usage: bun run scripts/process-image-archive.ts <rawDir> <destDir> [label]');
  }

  const projectRoot = process.cwd();
  const tmpRoot = path.join(projectRoot, 'data', `tmp_process_${label}`);
  const concurrency = Number(process.env.ASSET_ARCHIVE_CONCURRENCY || '6');
  await fs.mkdir(tmpRoot, { recursive: true });
  await fs.mkdir(destDir, { recursive: true });

  const files = await fs.readdir(rawDir);
  let processed = 0;
  let skipped = 0;

  let index = 0;
  async function worker() {
    while (index < files.length) {
      const file = files[index++];
      const outFile = path.join(destDir, `${path.basename(file, path.extname(file))}.webp`);
      try {
        await fs.access(outFile);
        skipped++;
        continue;
      } catch {}

      await processGenericImageAssets(
        file,
        rawDir,
        destDir,
        tmpRoot,
        projectRoot,
        `${label}-${file}`
      );
      processed++;
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));

  console.log(`${label}: ${processed} processed, ${skipped} skipped`);
}

await main();
