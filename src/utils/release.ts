import { BUILD_TIMESTAMP } from '../version';

export const ACTIVE_BUILD_TIMESTAMP =
  import.meta.env.PUBLIC_ENV__BUILD_TIMESTAMP || BUILD_TIMESTAMP;

export function buildReleaseTimestamp(buildTimestamp: string): string {
  return new Date(buildTimestamp).toISOString().slice(0, 19).replace('T', ' ');
}

export function isReleasedContent(
  releaseAt: string | null | undefined,
  buildTimestamp: string = ACTIVE_BUILD_TIMESTAMP
): boolean {
  if (!releaseAt) {
    return true;
  }

  return releaseAt <= buildReleaseTimestamp(buildTimestamp);
}

export function filterReleasedContent<T>(
  items: T[],
  buildTimestamp: string = ACTIVE_BUILD_TIMESTAMP,
  getReleaseAt: (item: T) => string | null | undefined
): T[] {
  return items.filter((item) => isReleasedContent(getReleaseAt(item), buildTimestamp));
}
