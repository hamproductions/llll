// Character color scheme and styling
import { sql } from 'drizzle-orm';
import { characters } from '../../drizzle/schema';
import { getDrizzleDb } from './database';

export interface CharacterStyle {
  color: string;
  lightColor: string;
  characterId?: number;
}

interface CharacterData {
  id: number;
  nameFirst: string | null;
  nameLast: string | null;
  themeColor: string | null;
}

let characterCache: CharacterData[] | null = null;

async function getAllCharacters(): Promise<CharacterData[]> {
  if (characterCache) {
    return characterCache;
  }

  const db = getDrizzleDb();
  const result = await db
    .select({
      id: characters.id,
      nameFirst: characters.nameFirst,
      nameLast: characters.nameLast,
      themeColor: characters.themeColor
    })
    .from(characters)
    .where(sql`${characters.nameFirst} IS NOT NULL AND ${characters.nameFirst} != ''`);

  characterCache = result;
  return result;
}

function lightenColor(hex: string, percent: number = 30): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(
    255,
    ((num >> 16) & 0xff) + Math.floor((255 - ((num >> 16) & 0xff)) * (percent / 100))
  );
  const g = Math.min(
    255,
    ((num >> 8) & 0xff) + Math.floor((255 - ((num >> 8) & 0xff)) * (percent / 100))
  );
  const b = Math.min(255, (num & 0xff) + Math.floor((255 - (num & 0xff)) * (percent / 100)));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export async function getCharacterStyle(characterName: string): Promise<CharacterStyle> {
  const allCharacters = await getAllCharacters();

  // Try exact match with first name
  let match = allCharacters.find((c) => c.nameFirst === characterName);

  // Try exact match with last name
  if (!match) {
    match = allCharacters.find((c) => c.nameLast === characterName);
  }

  // Try partial match
  if (!match) {
    match = allCharacters.find(
      (c) =>
        (c.nameFirst && characterName?.includes(c.nameFirst)) ||
        (c.nameFirst && c.nameFirst.includes(characterName)) ||
        (c.nameLast && characterName?.includes(c.nameLast)) ||
        (c.nameLast && c.nameLast.includes(characterName))
    );
  }

  if (match && match.themeColor) {
    return {
      color: match.themeColor,
      lightColor: lightenColor(match.themeColor),
      characterId: match.id
    };
  }

  // Default style
  return {
    color: '#8B7D6B',
    lightColor: '#D3C5B8'
  };
}
