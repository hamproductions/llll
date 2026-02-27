import { Database } from 'bun:sqlite';
import * as fs from 'fs';

// Character key mapping (based on the TSV file pattern)
const CHAR_KEY_MAP: Record<number, string> = {
  1011: 'other', // Ogami Sachi (101期生)
  1020: 'cerise', // Unit (102期生 trio)
  1021: 'kozue',
  1022: 'kaho',
  1023: 'sayaka',
  1024: 'tsuzuri',
  1025: 'megumi',
  1026: 'rurino',
  1027: 'ginko',
  1028: 'hime',
  1029: 'kosuzu',
  1030: 'ceras',
  1031: 'izumi',
  // Add more as needed
};

// Rarity mapping (based on actual database values)
const RARITY_MAP: Record<number, string> = {
  3: 'r',
  4: 'sr',
  5: 'ur',
  7: 'lr',
  8: 'dr',
  9: 'dr2',
  // Add more as needed
};

interface SkillEffectDetail {
  skillEffectDetailType: string | null;
  effectValue: number | null;
  targetMood: number | null;
}

interface SkillEffect {
  actionType: number;
  orderId: number | null;
}

interface Skill {
  skillLevel: number;
  skillCost: number | null;
  cardSkillEffectId: string | null;
  description: string | null;
}

function getCharacterKey(charactersId: number): string {
  return CHAR_KEY_MAP[charactersId] || `char_${charactersId}`;
}

function getRarityString(rarity: number): string {
  return RARITY_MAP[rarity] || 'unknown';
}

/**
 * Convert skill effects from database to TSV notation format
 * This is a simplified version - you'll need to expand this based on the actual skill effect data
 */
function convertSkillEffectsToNotation(
  db: Database,
  skillSeriesId: number | null,
  skillLevel: number = 1
): string {
  if (!skillSeriesId) return '';

  try {
    // Get skills for this series and level
    const skills = db
      .prepare(
        `SELECT * FROM CardSkills
         WHERE CardSkillSeriesId = ? AND SkillLevel = ?
         ORDER BY Id`
      )
      .all(skillSeriesId, skillLevel) as Skill[];

    if (skills.length === 0) return '';

    const skillParts: string[] = [];

    for (const skill of skills) {
      if (!skill.cardSkillEffectId) continue;

      const effectIds = skill.cardSkillEffectId
        .split(',')
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n));

      for (const effectId of effectIds) {
        const effect = db
          .prepare('SELECT * FROM CardSkillEffects WHERE Id = ?')
          .get(effectId) as SkillEffect | undefined;

        if (!effect) continue;

        // Get effect details
        const detailsPattern = `${effectId}%`;
        const details = db
          .prepare(
            `SELECT * FROM CardSkillEffectDetails
             WHERE CAST(Id AS TEXT) LIKE ?
             ORDER BY Id`
          )
          .all(detailsPattern) as SkillEffectDetail[];

        const effectNotation = convertEffectToNotation(effect, details);
        if (effectNotation) {
          skillParts.push(effectNotation);
        }
      }
    }

    return skillParts.join(';');
  } catch (error) {
    console.error(`Error converting skill effects for series ${skillSeriesId}:`, error);
    return '';
  }
}

/**
 * Convert a single effect and its details to notation format
 * This is where you'll need to implement the actual conversion logic
 * based on the actionType and detail types
 */
function convertEffectToNotation(_effect: SkillEffect, details: SkillEffectDetail[]): string {
  const parts: string[] = [];

  for (const detail of details) {
    if (!detail.skillEffectDetailType) continue;

    const detailType = detail.skillEffectDetailType;
    const value = detail.effectValue;

    // Example conversions - you'll need to expand this significantly
    if (detailType.includes('AP_UP')) {
      parts.push(`ap_up(${value})`);
    } else if (detailType.includes('VOLTAGE_UP')) {
      parts.push(`vol_up(${value})`);
    } else if (detailType.includes('VOLTAGE_BUFF')) {
      parts.push(`vol_buff(${value})`);
    } else if (detailType.includes('SCORE_UP')) {
      parts.push(`score_up(${value})`);
    } else if (detailType.includes('SCORE_BUFF')) {
      parts.push(`score_buff(${value})`);
    } else if (detailType.includes('MENTAL_UP')) {
      parts.push(`mental_up(${value})`);
    } else if (detailType.includes('MENTAL_DOWN')) {
      parts.push(`mental_down(${value})`);
    } else if (detailType.includes('SKILL_COUNT') && detailType.includes('CONDITION')) {
      // Condition: skill_count >= value or skill_count <= value
      if (detailType.includes('GREATER')) {
        return `skill_count >= ${value} ^ `;
      } else if (detailType.includes('LESS')) {
        return `skill_count <= ${value} ^ `;
      }
    } else if (detailType.includes('MENTAL') && detailType.includes('CONDITION')) {
      if (detailType.includes('GREATER')) {
        return `mental_rate >= ${value} ^ `;
      } else if (detailType.includes('LESS')) {
        return `mental_rate <= ${value} ^ `;
      }
    } else if (detailType.includes('VOLTAGE_LEVEL') && detailType.includes('CONDITION')) {
      if (detailType.includes('GREATER')) {
        return `vol_lv >= ${value} ^ `;
      } else if (detailType.includes('LESS')) {
        return `vol_lv <= ${value} ^ `;
      }
    }
  }

  return parts.join(';');
}

/**
 * Get center skill text from TSV tables
 */
function getCenterSkillText(db: Database, cardId: number): { condition: string; text: string } {
  try {
    const centerSkill = db
      .prepare(
        `SELECT cs.*, cst.description, cst.name
         FROM CardDatas cd
         INNER JOIN centerskillsTsv cst ON cd.CenterSkillSeriesId = cst.CenterSkillSeriesId
         WHERE cd.Id = ?
         LIMIT 1`
      )
      .get(cardId) as any;

    if (centerSkill) {
      // You'll need to parse the description to extract the notation format
      return {
        condition: getCenterSkillCondition(centerSkill),
        text: centerSkill.description || '',
      };
    }
  } catch (error) {
    // Table might not exist or be named differently
  }

  return { condition: '', text: '' };
}

function getCenterSkillCondition(_centerSkill: any): string {
  // Map center skill conditions - this is a placeholder
  // You'll need to implement based on actual data
  return 'fever_start'; // or 'start', 'end', etc.
}

/**
 * Get center attribute text
 */
function getCenterAttributeText(db: Database, cardId: number): string {
  try {
    const centerAttr = db
      .prepare(
        `SELECT cat.description
         FROM CardDatas cd
         INNER JOIN centerattributesTsv cat ON cd.CenterAttributesId = cat.CenterAttributesSeriesId
         WHERE cd.Id = ?
         LIMIT 1`
      )
      .get(cardId) as any;

    return centerAttr?.description || '';
  } catch (error) {
    return '';
  }
}

/**
 * Export cards to TSV format
 */
export function exportCardsToTSV(dbPath: string, outputPath: string) {
  const db = new Database(dbPath);

  // Get all UR+ cards (rarity >= 5) at max evolution (EvolveTimes = 2)
  const cards = db
    .prepare(
      `SELECT cd.*, c.NameFirst, c.NameLast
       FROM CardDatas cd
       LEFT JOIN Characters c ON cd.CharactersId = c.Id
       WHERE cd.Rarity >= 5 AND cd.EvolveTimes = 2
       ORDER BY cd.CharactersId, cd.Id`
    )
    .all() as any[];

  const tsvLines: string[] = [];

  // Header
  tsvLines.push(
    'key\tseries\tother_name\tsmile\tpure\tcool\tmental\trarity\tcenter_skill_condition\traw_center_skill_text\traw_skill_text\tap\tcenter_ability_text'
  );

  for (const card of cards) {
    const key = getCharacterKey(card.CharactersId);
    const series = card.Name || ''; // Use card name as series for now
    const otherName = `${card.NameLast || ''}${card.NameFirst || ''}`.trim();
    const rarity = getRarityString(card.Rarity);

    // Get skills
    const centerSkill = getCenterSkillText(db, card.Id);
    const normalSkill = convertSkillEffectsToNotation(db, card.SkillSeriesId, 1);
    const centerAttribute = getCenterAttributeText(db, card.Id);

    const row = [
      key,
      series,
      otherName,
      card.MaxSmile || 0,
      card.MaxPure || 0,
      card.MaxCool || 0,
      card.MaxMental || 0,
      rarity,
      centerSkill.condition,
      centerSkill.text,
      normalSkill,
      card.BeatPoint || 0,
      centerAttribute,
    ].join('\t');

    tsvLines.push(row);
  }

  // Write to file
  fs.writeFileSync(outputPath, tsvLines.join('\n'), 'utf-8');
  console.log(`Exported ${cards.length} cards to ${outputPath}`);

  db.close();
}

// Main execution
if (import.meta.main) {
  const dbPath =
    process.env.DB_PATH || '/Users/vittayapalotai.tanyawat/code/llll/data/dbs/db_4.7.51_20251023120143.sqlite3';
  const outputPath = process.env.OUTPUT_PATH || './exported-cards.tsv';

  exportCardsToTSV(dbPath, outputPath);
}
