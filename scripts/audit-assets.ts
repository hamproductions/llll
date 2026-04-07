import fs from 'fs/promises';
import path from 'path';
import { Database } from 'bun:sqlite';
import { auditTargets } from './pipeline-manifest.js';

type AuditRow = {
  key: string;
  pattern: string;
  sourceExt: string;
  outputExt: string;
  bundleCount: number;
  localCount: number;
  localDir: string;
};

async function countFiles(dir: string, outputExt: string): Promise<number> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    let total = 0;

    for (const entry of entries) {
      const entryPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        total += await countFiles(entryPath, outputExt);
        continue;
      }

      if (entry.name.endsWith(`.${outputExt}`)) {
        total += 1;
      }
    }

    return total;
  } catch {
    return 0;
  }
}

function getBundleCount(db: Database, pattern: string, sourceExt: string) {
  const row = db
    .query(
      `SELECT COUNT(*) AS count
       FROM bundle
       WHERE label LIKE ? AND ext = ?`
    )
    .get(pattern, sourceExt) as { count: number } | undefined;

  return row?.count ?? 0;
}

async function main() {
  const projectRoot = process.cwd();
  const dbPath = path.join(projectRoot, '../data/db.sqlite3');
  const db = new Database(dbPath, { readonly: true });

  const rows: AuditRow[] = [];

  for (const target of auditTargets) {
    const localDir = path.join(projectRoot, target.localDir);
    rows.push({
      key: target.key,
      pattern: target.pattern,
      sourceExt: target.sourceExt,
      outputExt: target.outputExt,
      bundleCount: getBundleCount(db, target.pattern, target.sourceExt),
      localCount: await countFiles(localDir, target.outputExt),
      localDir: target.localDir
    });
  }

  db.close();

  console.table(
    rows.map((row) => ({
      key: row.key,
      bundleCount: row.bundleCount,
      localCount: row.localCount,
      sourceExt: row.sourceExt,
      outputExt: row.outputExt,
      localDir: row.localDir
    }))
  );

  const missingCriticalTargets = rows.filter(
    (row) =>
      ['stickers', 'story-backgrounds', 'album-art'].includes(row.key) &&
      row.bundleCount > 0 &&
      row.localCount === 0
  );

  if (missingCriticalTargets.length > 0) {
    throw new Error(
      `Critical asset outputs missing: ${missingCriticalTargets.map((row) => row.key).join(', ')}`
    );
  }
}

await main();
