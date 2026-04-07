import fs from 'fs/promises';
import path from 'path';
import { acbAssetPipelines, imageAssetPipelines } from './pipeline-manifest.js';
import { processGenericImageAssets, runCommand } from './fetch-assets';

const HASU_PYTHON = process.env.HASU_PYTHON || 'python3.11';

export async function fetchSharedAssets() {
  const projectRoot = process.cwd();
  const appDataRoot = path.join(projectRoot, 'data');
  const tmpBaseDir = path.join(appDataRoot, 'tmp_shared_assets_processing');
  const dbSqlitePath = path.join(projectRoot, '../', 'data', 'db.sqlite3');

  function shouldProcessImageAsset(
    assetConfig: (typeof imageAssetPipelines)[number],
    assetFilename: string
  ) {
    if (
      assetConfig.key === 'character-profile-base' &&
      assetFilename.startsWith('image_prof_data_chara_season_')
    ) {
      return false;
    }

    if (
      assetConfig.key === 'story-monthly-covers' &&
      assetFilename.startsWith('image_record_monthly_part_')
    ) {
      return false;
    }

    return true;
  }

  async function fetchAndProcessSpecificAssets(assetConfig: (typeof imageAssetPipelines)[number]) {
    const { key, pattern, logPrefix, localDir } = assetConfig;
    const destDir = path.join(projectRoot, localDir);
    await fs.mkdir(destDir, { recursive: true });

    const existingFiles = new Set<string>();
    try {
      const destFiles = await fs.readdir(destDir);
      destFiles.forEach((file) => {
        existingFiles.add(path.basename(file, path.extname(file)));
      });
    } catch {}

    const fetchedAssetsDir = path.join(tmpBaseDir, `fetched_raw_assets_${key}`);
    await fs.mkdir(fetchedAssetsDir, { recursive: true });

    console.log(`Fetching assets matching pattern: ${pattern} to ${fetchedAssetsDir}...`);
    await runCommand(
      HASU_PYTHON,
      ['-m', 'silverwind.tool.get_assets', '-p', 'android', dbSqlitePath, fetchedAssetsDir, pattern],
      path.join(projectRoot, '../hasu_tools'),
      logPrefix
    );

    const fetchedFiles = await fs.readdir(fetchedAssetsDir);
    let processed = 0;
    let skipped = 0;

    for (const assetFilename of fetchedFiles) {
      if (!shouldProcessImageAsset(assetConfig, assetFilename)) {
        continue;
      }

      const baseAssetName = assetFilename.replace(/\.[^.]+$/, '');
      if (existingFiles.has(baseAssetName)) {
        skipped++;
        continue;
      }

      await processGenericImageAssets(
        assetFilename,
        fetchedAssetsDir,
        destDir,
        tmpBaseDir,
        projectRoot,
        `${key}-${assetFilename}`
      );
      processed++;
    }

    console.log(`${key} assets summary: ${processed} processed, ${skipped} skipped`);
    await fs.rm(fetchedAssetsDir, { recursive: true, force: true });
  }

  async function fetchAndProcessStoryVoices(assetConfig: (typeof acbAssetPipelines)[number]) {
    const voiceDestDir = path.join(projectRoot, assetConfig.localDir);
    await fs.mkdir(voiceDestDir, { recursive: true });

    const processedAcbPrefixes = new Set<string>();
    try {
      const destFiles = await fs.readdir(voiceDestDir);
      for (const file of destFiles) {
        if (!file.endsWith('.webm')) continue;
        const baseName = path.basename(file, '.webm');
        processedAcbPrefixes.add(baseName.replace(/_\d{4}_.*$/, ''));
      }
    } catch {}

    const fetchedAssetsDir = path.join(tmpBaseDir, `fetched_raw_assets_${assetConfig.key}`);
    await fs.mkdir(fetchedAssetsDir, { recursive: true });

    await runCommand(
      HASU_PYTHON,
      ['-m', 'silverwind.tool.get_assets', '-p', 'android', dbSqlitePath, fetchedAssetsDir, assetConfig.pattern],
      path.join(projectRoot, '../hasu_tools'),
      assetConfig.logPrefix
    );

    const fetchedFiles = await fs.readdir(fetchedAssetsDir);
    const toProcess = fetchedFiles.filter((file) => {
      const baseAssetName = file.replace(/\.[^.]+$/, '');
      return !processedAcbPrefixes.has(baseAssetName);
    });

    for (const voiceAssetFilename of toProcess) {
      const baseAssetName = voiceAssetFilename.replace(/\.[^.]+$/, '');
      const voiceAssetSourcePath = path.join(fetchedAssetsDir, voiceAssetFilename);
      const tmpVoiceProcessingDir = path.join(tmpBaseDir, `processing_voice_${baseAssetName}`);

      try {
        await fs.mkdir(tmpVoiceProcessingDir, { recursive: true });
        await fs.copyFile(voiceAssetSourcePath, path.join(tmpVoiceProcessingDir, voiceAssetFilename));

        await runCommand(
          HASU_PYTHON,
          ['-m', 'silverwind.tool.acb', tmpVoiceProcessingDir],
          path.join(projectRoot, '../hasu_tools'),
          `[ACBDecrypt-${baseAssetName}]`
        );

        const voiceOutDir = path.join(tmpVoiceProcessingDir, 'out');
        const voiceFiles = await fs.readdir(voiceOutDir);
        for (const file of voiceFiles) {
          const destFilePath = path.join(
            voiceDestDir,
            `${path.basename(file, path.extname(file))}.webm`
          );

          try {
            await fs.access(destFilePath);
            continue;
          } catch {}

          await runCommand('ffmpeg', [
            '-i',
            path.join(voiceOutDir, file),
            '-c:a',
            'libopus',
            '-b:a',
            '96k',
            '-n',
            destFilePath
          ]);
        }

        await fs.rm(tmpVoiceProcessingDir, { recursive: true, force: true });
      } catch (error) {
        console.warn(
          `Failed to process voice asset ${voiceAssetFilename}: ${(error as Error).message}`
        );
      }
    }

    await fs.rm(fetchedAssetsDir, { recursive: true, force: true });
  }

  try {
    for (const assetConfig of imageAssetPipelines) {
      await fetchAndProcessSpecificAssets(assetConfig);
    }

    for (const assetConfig of acbAssetPipelines) {
      await fetchAndProcessStoryVoices(assetConfig);
    }
  } finally {
    await fs.rm(tmpBaseDir, { recursive: true, force: true });
  }
}

await fetchSharedAssets();
