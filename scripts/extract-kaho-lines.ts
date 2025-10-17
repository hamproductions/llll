import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { parseStoryScript } from '../src/utils/storyParser';

interface KahoLine {
  scriptId: string;
  content: string;
  voiceId?: string;
}

async function extractKahoLines() {
  const storyDir = join(process.cwd(), '../data/story');
  const kahoLines: KahoLine[] = [];

  try {
    // Read all files in the story directory
    const files = await readdir(storyDir);
    const storyFiles = files.filter(f => f.startsWith('story_main_') && f.endsWith('.txt'));

    console.log(`Found ${storyFiles.length} story files to process...`);

    for (const file of storyFiles) {
      const scriptId = file.replace('story_main_', '').replace('.txt', '');
      const scriptPath = join(storyDir, file);

      try {
        const scriptContent = await readFile(scriptPath, 'utf-8');
        const parsedLines = parseStoryScript(scriptContent);

        // Filter for Kaho's dialogue lines
        const kahoDialogue = parsedLines.filter(
          line => line.type === 'dialogue' &&
                  line.characterName &&
                  line.characterName.includes('花帆')
        );

        for (const line of kahoDialogue) {
          kahoLines.push({
            scriptId,
            content: line.content,
            voiceId: line.voiceId
          });
        }

        if (kahoDialogue.length > 0) {
          console.log(`Found ${kahoDialogue.length} Kaho lines in ${file}`);
        }
      } catch (error) {
        console.error(`Error processing ${file}:`, error);
      }
    }

    console.log(`\nTotal Kaho lines found: ${kahoLines.length}`);

    // Create a gigantic text file with all lines (no annotations, reversed, one line per dialogue)
    const textOutputPath = join(process.cwd(), 'kaho-all-lines.txt');
    const textContent = kahoLines
      .reverse()
      .map((line) => stripHtml(line.content).replace(/\n/g, ' '))
      .join('\n');
    await writeFile(textOutputPath, textContent, 'utf-8');
    console.log(`\nAll lines saved to: ${textOutputPath}`);

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Helper function to strip HTML tags for the text output
function stripHtml(html: string): string {
  return html
    .replace(/<ruby>([^<]+)<rt>[^<]*<\/rt><\/ruby>/g, '$1')
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/<[^>]+>/g, '');
}

extractKahoLines();
