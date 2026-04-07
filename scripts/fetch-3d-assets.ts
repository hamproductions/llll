import fs from 'fs/promises';
import os from 'node:os';
import path from 'path';
import { Database } from 'bun:sqlite';
import { readableStreamToArrayBuffer } from 'bun';

const HASU_PYTHON = process.env.HASU_PYTHON || 'python3.11';
const PYTHON311_USER_SITE = path.join(os.homedir(), '.local', 'lib', 'python3.11', 'site-packages');
const CATEGORIES = ['costume', 'stage', 'prop', 'item'] as const;

async function run(command: string, args: string[], cwd: string, logPrefix: string, env?: Record<string, string>, stdinData?: string) {
  const proc = Bun.spawn([command, ...args], {
    cwd,
    stdin: stdinData ? 'pipe' : 'ignore',
    stdout: 'pipe',
    stderr: 'pipe',
    env: { ...(process.env as Record<string, string>), ...env }
  });

  if (stdinData && proc.stdin) {
    proc.stdin.write(stdinData);
    proc.stdin.end();
  }

  const stdoutBuf = await readableStreamToArrayBuffer(proc.stdout);
  const stderrBuf = await readableStreamToArrayBuffer(proc.stderr);
  const exitCode = await proc.exited;
  const stdout = new TextDecoder().decode(stdoutBuf);
  const stderr = new TextDecoder().decode(stderrBuf);

  if (exitCode !== 0 && stderr.trim())
    console.error(`${logPrefix} ERR: ${stderr.trim().split('\n').slice(-3).join('\n')}`);

  return { exitCode, stdout, stderr };
}

function resolveAllDeps(db: Database, label: string): string[] {
  const rows = db.query(`
    WITH RECURSIVE dep_tree(label) AS (
      SELECT ?
      UNION
      SELECT bd.dependency
      FROM dep_tree dt
      JOIN bundle b ON b.label = dt.label
      JOIN bundle_dependency bd ON bd.uid = b.uid
    )
    SELECT DISTINCT label FROM dep_tree ORDER BY label
  `).all(label) as { label: string }[];
  return rows.map(r => r.label);
}

async function downloadBundles(labels: string[], downloadDir: string, dbPath: string, hasuToolsDir: string) {
  const toDownload: string[] = [];
  for (const lbl of labels) {
    try { await fs.access(path.join(downloadDir, lbl)); } catch { toDownload.push(lbl); }
  }
  if (toDownload.length === 0) return;

  const batchSize = 50;
  for (let i = 0; i < toDownload.length; i += batchSize) {
    const batch = toDownload.slice(i, i + batchSize);
    await run(
      HASU_PYTHON,
      ['-m', 'silverwind.tool.get_assets', '-p', 'android', dbPath, downloadDir, ...batch],
      hasuToolsDir,
      '[Download]',
      { PYTHONPATH: [hasuToolsDir, PYTHON311_USER_SITE, process.env.PYTHONPATH].filter(Boolean).join(path.delimiter) }
    );
  }
}

async function fetch3dAssets() {
  const projectRoot = process.cwd();
  const repoRoot = path.join(projectRoot, '..');
  const dbPath = path.join(repoRoot, 'data', 'db.sqlite3');
  const hasuToolsDir = path.join(repoRoot, 'hasu_tools');
  const dest3d = path.join(projectRoot, 'data', '3d');
  const downloadDir = path.join(repoRoot, 'data', '3d_bundles');
  const pipelineScript = path.join(repoRoot, 'scripts', 'pipeline_v2', 'pipeline.sh');

  await fs.mkdir(downloadDir, { recursive: true });

  const db = new Database(dbPath, { readonly: true });

  for (const category of CATEGORIES) {
    const catDir = path.join(dest3d, category);
    await fs.mkdir(catDir, { recursive: true });

    const existing = new Set<string>();
    try {
      for (const d of await fs.readdir(catDir)) {
        try {
          const files = await fs.readdir(path.join(catDir, d));
          if (files.some(f => f.endsWith('.glb'))) existing.add(d);
        } catch {}
      }
    } catch {}

    const bundles = db.query(
      `SELECT label FROM bundle WHERE label LIKE ? AND label NOT LIKE '%_svc' ORDER BY label`
    ).all(`3d_${category}_%`) as { label: string }[];

    const toFetch = bundles.filter(b => !existing.has(b.label)).map(b => b.label);
    console.log(`[${category}] ${bundles.length} total, ${existing.size} existing, ${toFetch.length} to fetch`);

    if (toFetch.length === 0) continue;

    let converted = 0;
    let failed = 0;

    for (const label of toFetch) {
      const allDeps = resolveAllDeps(db, label);

      await downloadBundles(allDeps, downloadDir, dbPath, hasuToolsDir);

      const outDir = path.join(catDir, label);
      await fs.mkdir(outDir, { recursive: true });

      const stageDir = path.join(repoRoot, 'data', 'tmp_stage');
      await fs.rm(stageDir, { recursive: true, force: true });
      await fs.mkdir(stageDir, { recursive: true });
      for (const dep of allDeps) {
        const src = path.join(downloadDir, dep);
        const dst = path.join(stageDir, dep);
        try { await fs.symlink(src, dst); } catch {}
      }

      const { exitCode } = await run(
        'bash',
        [pipelineScript, stageDir, outDir],
        repoRoot,
        `[Pipeline]`
      );

      await fs.rm(stageDir, { recursive: true, force: true });

      const glbs = (await fs.readdir(outDir).catch(() => [] as string[])).filter(f => f.endsWith('.glb'));

      if (exitCode === 0 && glbs.length > 0) {
        converted++;
        process.stdout.write(`\r[${category}] ${converted}/${toFetch.length} converted (${label})    `);
      } else {
        failed++;
        await fs.rm(outDir, { recursive: true, force: true });
        process.stdout.write(`\r[${category}] ${converted}/${toFetch.length} ok, ${failed} err (${label} FAILED)    `);
      }
    }

    console.log(`\n[${category}] Done: ${converted} converted, ${failed} failed`);
  }

  db.close();

  console.log('Regenerating 3D manifest...');
  await run('bun', ['run', 'scripts/generate-3d-manifest.ts'], projectRoot, '[Manifest]');
  console.log('Done.');
}

fetch3dAssets().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
