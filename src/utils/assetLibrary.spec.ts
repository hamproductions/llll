import { describe, expect, it } from 'vitest';
import { formatBytes, formatDuration, formatPreviewWindow, getCardVoiceTypeLabel } from './assetFormat';

describe('assetLibrary helpers', () => {
  it('formats durations as minutes and seconds', () => {
    expect(formatDuration(125)).toBe('2:05');
    expect(formatDuration(0)).toBe('Unknown length');
  });

  it('formats preview windows', () => {
    expect(formatPreviewWindow(15, 45)).toBe('0:15 - 0:45');
    expect(formatPreviewWindow(20, 20)).toBe('Preview unavailable');
  });

  it('formats byte sizes', () => {
    expect(formatBytes(900)).toBe('900 B');
    expect(formatBytes(1536)).toBe('1.5 KB');
  });

  it('humanizes card voice types', () => {
    expect(getCardVoiceTypeLabel('vo_card_1033505_spappeal_0101.webm')).toBe('Spappeal 0101');
    expect(getCardVoiceTypeLabel('vo_card_1042901_message_0001.webm')).toBe('Message 0001');
  });
});
