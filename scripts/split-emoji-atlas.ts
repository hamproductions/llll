import { readdir, mkdir } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';

const ATLAS_DIR = join(import.meta.dirname, '../data/assets/emoji');
const OUT_DIR = join(import.meta.dirname, '../data/assets/emoji/individual');

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const files = await readdir(ATLAS_DIR);
  const atlasFile = files.find((f) => f.startsWith('sc_emoji_atlas') && (f.endsWith('.png') || f.endsWith('.webp')));

  if (!atlasFile) {
    console.error('No emoji atlas found in', ATLAS_DIR);
    console.log('Available files:', files);
    process.exit(1);
  }

  const atlasPath = join(ATLAS_DIR, atlasFile);
  console.log('Loading atlas:', atlasPath);

  const image = sharp(atlasPath);
  const metadata = await image.metadata();
  const width = metadata.width!;
  const height = metadata.height!;

  console.log(`Atlas size: ${width}x${height}`);

  // Unity emoji atlases are typically grids of equal-sized cells.
  // Common emoji sizes: 64x64, 128x128, 256x256
  // Try to detect cell size by checking common sizes
  const possibleSizes = [64, 128, 96, 48, 32, 256];
  let cellSize = 0;

  for (const size of possibleSizes) {
    if (width % size === 0 && height % size === 0) {
      cellSize = size;
      break;
    }
  }

  if (!cellSize) {
    // Fallback: use GCD-like approach
    for (let s = 256; s >= 16; s--) {
      if (width % s === 0 && height % s === 0) {
        cellSize = s;
        break;
      }
    }
  }

  if (!cellSize) {
    console.error(`Cannot determine cell size for ${width}x${height} atlas`);
    process.exit(1);
  }

  const cols = width / cellSize;
  const rows = height / cellSize;
  const total = cols * rows;

  console.log(`Cell size: ${cellSize}x${cellSize}, grid: ${cols}x${rows}, total: ${total} cells`);

  let extracted = 0;
  const buffer = await image.raw().toBuffer();

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const index = row * cols + col;
      const left = col * cellSize;
      const top = row * cellSize;

      // Check if cell is empty (all transparent)
      const cell = sharp(buffer, {
        raw: { width, height, channels: metadata.channels! }
      }).extract({ left, top, width: cellSize, height: cellSize });

      const cellBuffer = await cell.raw().toBuffer();
      const channels = metadata.channels!;
      let hasContent = false;

      if (channels === 4) {
        // Check alpha channel
        for (let i = 3; i < cellBuffer.length; i += 4) {
          if (cellBuffer[i] > 10) {
            hasContent = true;
            break;
          }
        }
      } else {
        // No alpha, check if not all black/white
        for (let i = 0; i < cellBuffer.length; i++) {
          if (cellBuffer[i] > 10 && cellBuffer[i] < 245) {
            hasContent = true;
            break;
          }
        }
      }

      if (!hasContent) continue;

      const outPath = join(OUT_DIR, `emoji_${String(index).padStart(4, '0')}.png`);
      await sharp(buffer, {
        raw: { width, height, channels: metadata.channels! }
      })
        .extract({ left, top, width: cellSize, height: cellSize })
        .png()
        .toFile(outPath);

      extracted++;
    }
  }

  console.log(`Extracted ${extracted} emoji from ${total} cells`);
}

main().catch(console.error);
