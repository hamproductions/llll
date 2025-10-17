// Environment: server

import type { PageContext } from 'vike/types';
import { getDrizzleDb } from '~/utils/database';
import { advSeries, advDatas } from '../../../../../drizzle/schema';
import { eq, asc } from 'drizzle-orm';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { parseStoryScript, type StoryLine } from '~/utils/storyParser';
import { getCharacterStyle } from '~/utils/characterStyles';

export { data };

async function data(pageContext: PageContext) {
  const { id: seriesIdString, chapterId: chapterIdString } = pageContext.routeParams;
  const seriesId = parseInt(seriesIdString, 10);
  const chapterId = parseInt(chapterIdString, 10);

  const db = getDrizzleDb();

  // Fetch series information
  const seriesResult = await db
    .select()
    .from(advSeries)
    .where(eq(advSeries.id, seriesId))
    .limit(1);

  const series = seriesResult[0] ?? null;

  // Fetch chapter information
  const chapterResult = await db
    .select()
    .from(advDatas)
    .where(eq(advDatas.id, chapterId))
    .limit(1);

  const chapter = chapterResult[0] ?? null;

  // Fetch all chapters for navigation
  const allChapters = await db
    .select({
      id: advDatas.id,
      orderId: advDatas.orderId,
      name: advDatas.name
    })
    .from(advDatas)
    .where(eq(advDatas.advSeriesId, seriesId))
    .orderBy(asc(advDatas.orderId));

  // Find prev/next chapters
  const currentIndex = allChapters.findIndex((c) => c.id === chapterId);
  const prevChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null;

  // Load and parse story script file
  let parsedScript: StoryLine[] = [];
  if (chapter?.scriptId) {
    try {
      const scriptPath = join(
        process.cwd(),
        '../data/story',
        `story_main_${chapter.scriptId}.txt`
      );
      const scriptContent = await readFile(scriptPath, 'utf-8');
      const parsed = parseStoryScript(scriptContent);

      // Enrich dialogue lines with character styles
      parsedScript = await Promise.all(
        parsed.map(async (line) => {
          if (line.type === 'dialogue' && line.characterName) {
            const characterStyle = await getCharacterStyle(line.characterName);
            return { ...line, characterStyle };
          }
          return line;
        })
      );
    } catch (error) {
      console.error(`Failed to load script ${chapter.scriptId}:`, error);
      parsedScript = [];
    }
  }

  return {
    series,
    chapter,
    parsedScript,
    prevChapter,
    nextChapter,
    seriesId,
    chapterId
  };
}

export type PageData = Awaited<ReturnType<typeof data>>;
