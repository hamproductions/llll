import { describe, expect, it } from 'vitest';
import { buildReleaseTimestamp, filterReleasedContent, isReleasedContent } from './release';

describe('release gating', () => {
  it('normalizes the build timestamp into the database format', () => {
    expect(buildReleaseTimestamp('2025-06-18T17:13:11.382Z')).toBe('2025-06-18 17:13:11');
  });

  it('allows released and undated content while blocking future releases', () => {
    const buildTimestamp = '2025-06-18T17:13:11.382Z';

    expect(isReleasedContent('2025-06-18 17:13:11', buildTimestamp)).toBe(true);
    expect(isReleasedContent('2025-06-18 17:13:12', buildTimestamp)).toBe(false);
    expect(isReleasedContent(null, buildTimestamp)).toBe(true);
    expect(isReleasedContent('', buildTimestamp)).toBe(true);
  });

  it('filters future content out of listings', () => {
    const items = [
      { id: 1, startTime: '2025-06-18 17:13:10' },
      { id: 2, startTime: '2025-06-18 17:13:12' },
      { id: 3, startTime: null }
    ];

    expect(
      filterReleasedContent(items, '2025-06-18T17:13:11.382Z', (item) => item.startTime)
    ).toEqual([
      { id: 1, startTime: '2025-06-18 17:13:10' },
      { id: 3, startTime: null }
    ]);
  });
});
