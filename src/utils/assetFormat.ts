export function formatDuration(totalSeconds?: number | null) {
  if (!totalSeconds || totalSeconds <= 0) {
    return 'Unknown length';
  }

  const normalizedSeconds = totalSeconds >= 1000 ? Math.round(totalSeconds / 1000) : totalSeconds;
  const minutes = Math.floor(normalizedSeconds / 60);
  const seconds = normalizedSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function formatPreviewWindow(start?: number | null, end?: number | null) {
  if (start == null || end == null || end <= start) {
    return 'Preview unavailable';
  }

  return `${formatDuration(start)} - ${formatDuration(end)}`;
}

export function formatBytes(size: number) {
  if (size < 1024) {
    return `${size} B`;
  }

  const units = ['KB', 'MB', 'GB', 'TB'];
  let value = size / 1024;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

export function getCardVoiceTypeLabel(fileName: string) {
  const normalized = fileName.replace(/\.webm$/i, '');
  const match = normalized.match(/vo_card_\d+_(.+)$/);
  const rawType = match?.[1] ?? normalized;

  return rawType
    .split('_')
    .filter(Boolean)
    .map((part) => (/^\d+$/.test(part) ? part : `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`))
    .join(' ');
}
