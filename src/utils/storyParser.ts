// Story script parser utility
import type { CharacterStyle } from './characterStyles';

export interface StoryLine {
  type: 'dialogue' | 'narration' | 'bgm' | 'se' | 'separator' | 'unknown';
  content: string;
  voiceId?: string;
  characterName?: string;
  characterStyle?: CharacterStyle;
  bgmId?: string;
  seId?: string;
  action?: 'play' | 'stop';
  raw?: string;
}

/**
 * Parse ruby text (furigana) format
 * Converts 【漢字】{ふりがな} to <ruby> HTML tags
 */
export function parseRubyText(text: string): string {
  return text.replace(/【([^】]+)】\{([^}]+)\}/g, '<ruby>$1<rt>$2</rt></ruby>');
}

/**
 * Parse spacing markers
 * Converts [Space] to actual spaces
 */
export function parseSpacing(text: string): string {
  return text.replace(/\[Space\]/g, ' ');
}

/**
 * Parse line breaks
 * Converts [r] to <br/> tags
 */
export function parseLineBreaks(text: string): string {
  return text.replace(/\[r\]/g, '<br/>');
}

/**
 * Apply all text formatting
 */
export function formatText(text: string): string {
  let formatted = text;
  formatted = parseRubyText(formatted);
  formatted = parseSpacing(formatted);
  formatted = parseLineBreaks(formatted);
  return formatted;
}

/**
 * Extract character name from voice ID
 * Example: vo_adv_10250101_0001_m9000_01@syouzyoa -> syouzyoa
 */
export function extractCharacterName(voiceId: string): string | undefined {
  const match = voiceId.match(/@(.+)$/);
  return match ? match[1] : undefined;
}

/**
 * Parse a single line of the story script
 */
export function parseScriptLine(line: string): StoryLine | null {
  const trimmed = line.trim();

  // Skip empty lines and comments
  if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('★')) {
    return null;
  }

  // Parse メッセージ表示 format (newer stories)
  // Format: [メッセージ表示 CHARACTER vo_adv_... TEXT]
  const messageMatch = trimmed.match(/^\[メッセージ表示\s+([^\s]+)\s+(vo_adv_[^\s]+)\s+(.+)\]$/);
  if (messageMatch) {
    const characterName = messageMatch[1];
    const voiceId = messageMatch[2];
    const text = messageMatch[3];

    return {
      type: 'dialogue',
      content: formatText(text),
      voiceId,
      characterName,
      raw: trimmed
    };
  }

  // Parse ノベルテキスト追加 format (older stories)
  const textMatch = trimmed.match(/^\[ノベルテキスト追加\s+(.+)\]$/);
  if (textMatch) {
    const fullText = textMatch[1];

    // Check for voice acting
    const voiceMatch = fullText.match(/^(.+?)\s+(vo_adv_[^\s]+)$/);

    if (voiceMatch) {
      const text = voiceMatch[1];
      const voiceId = voiceMatch[2];
      // For old format, don't extract character name from @ - it's not meant for display

      return {
        type: 'dialogue',
        content: formatText(text),
        voiceId,
        characterName: undefined, // Don't show character name for old format
        raw: trimmed
      };
    } else {
      // Narration (no voice)
      return {
        type: 'narration',
        content: formatText(fullText),
        raw: trimmed
      };
    }
  }

  // Parse BGM commands
  const bgmPlayMatch = trimmed.match(/^\[BGM再生\s+([^\s]+)/);
  if (bgmPlayMatch) {
    return {
      type: 'bgm',
      content: '',
      bgmId: bgmPlayMatch[1],
      action: 'play',
      raw: trimmed
    };
  }

  const bgmStopMatch = trimmed.match(/^\[BGM停止\s+([^\s]+)/);
  if (bgmStopMatch) {
    return {
      type: 'bgm',
      content: '',
      bgmId: bgmStopMatch[1],
      action: 'stop',
      raw: trimmed
    };
  }

  // Parse sound effect commands
  const sePlayMatch = trimmed.match(/^\[SE再生\s+([^\s]+)/);
  if (sePlayMatch) {
    return {
      type: 'se',
      content: '',
      seId: sePlayMatch[1],
      action: 'play',
      raw: trimmed
    };
  }

  const seStopMatch = trimmed.match(/^\[SE停止\s+([^\s]+)/);
  if (seStopMatch) {
    return {
      type: 'se',
      content: '',
      seId: seStopMatch[1],
      action: 'stop',
      raw: trimmed
    };
  }

  // Parse scene separators (blackouts, transitions)
  if (
    trimmed.match(/^\[暗転_/) ||
    trimmed.match(/^\[ブラックアウト_/) ||
    trimmed.match(/^\[ノベル開始\]/) ||
    trimmed.match(/^\[ノベル終了\]/)
  ) {
    return {
      type: 'separator',
      content: '',
      raw: trimmed
    };
  }

  // Skip 3D, camera, and visual novel rendering commands for now
  if (
    trimmed.match(/^\[キャラ/) ||
    trimmed.match(/^\[3Dオブジェクト/) ||
    trimmed.match(/^\[カメラ/) ||
    trimmed.match(/^\[背景/) ||
    trimmed.match(/^\[ライト/) ||
    trimmed.match(/^\[被写界深度/) ||
    trimmed.match(/^\[待機/) ||
    trimmed.match(/^\[ノベル背景更新\]/) ||
    trimmed.match(/^\[ノベルテキスト削除\]/)
  ) {
    return null; // Skip these for static view
  }

  // Unknown command - return as unknown type for debugging
  if (trimmed.startsWith('[')) {
    return {
      type: 'unknown',
      content: trimmed,
      raw: trimmed
    };
  }

  return null;
}

/**
 * Parse entire story script
 */
export function parseStoryScript(scriptText: string): StoryLine[] {
  const lines = scriptText.split('\n');
  const parsedLines: StoryLine[] = [];

  for (const line of lines) {
    const parsed = parseScriptLine(line);
    if (parsed) {
      parsedLines.push(parsed);
    }
  }

  return parsedLines;
}

/**
 * Group story lines by scenes
 * A scene ends when there's a separator
 */
export interface StoryScene {
  lines: StoryLine[];
  bgm?: string;
}

export function groupIntoScenes(lines: StoryLine[]): StoryScene[] {
  const scenes: StoryScene[] = [];
  let currentScene: StoryScene = { lines: [] };
  let currentBGM: string | undefined;

  for (const line of lines) {
    if (line.type === 'bgm' && line.action === 'play') {
      currentBGM = line.bgmId;
      currentScene.bgm = currentBGM;
    }

    if (line.type === 'separator') {
      if (currentScene.lines.length > 0) {
        scenes.push(currentScene);
        currentScene = { lines: [], bgm: currentBGM };
      }
    } else {
      currentScene.lines.push(line);
    }
  }

  // Push the last scene if it has content
  if (currentScene.lines.length > 0) {
    scenes.push(currentScene);
  }

  return scenes;
}
