#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = path.join(__dirname, '..', '.cache');

function clearCache() {
  if (fs.existsSync(CACHE_DIR)) {
    console.log('🗑️  Clearing cache directory:', CACHE_DIR);
    fs.rmSync(CACHE_DIR, { recursive: true, force: true });
    console.log('✅ Cache cleared successfully');
  } else {
    console.log('ℹ️  No cache directory found');
  }
}

clearCache();