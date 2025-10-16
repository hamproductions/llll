import type { StoryLine } from './storyParser';

/**
 * Convert story lines to markdown format
 */
export function storyToMarkdown(lines: StoryLine[], chapterTitle?: string): string {
  let markdown = '';

  if (chapterTitle) {
    markdown += `# ${chapterTitle}\n\n`;
  }

  for (const line of lines) {
    switch (line.type) {
      case 'dialogue':
        if (line.characterName) {
          // Remove HTML tags from content
          const plainText = line.content
            .replace(/<ruby>(.*?)<rt>(.*?)<\/rt><\/ruby>/g, '$1')
            .replace(/<br\/?>/g, '\n')
            .replace(/<[^>]+>/g, '');
          markdown += `**${line.characterName}**: ${plainText}\n\n`;
        } else {
          // Dialogue without character name (old format)
          const plainText = line.content
            .replace(/<ruby>(.*?)<rt>(.*?)<\/rt><\/ruby>/g, '$1')
            .replace(/<br\/?>/g, '\n')
            .replace(/<[^>]+>/g, '');
          markdown += `${plainText}\n\n`;
        }
        break;

      case 'narration':
        const plainText = line.content
          .replace(/<ruby>(.*?)<rt>(.*?)<\/rt><\/ruby>/g, '$1')
          .replace(/<br\/?>/g, '\n')
          .replace(/<[^>]+>/g, '');
        markdown += `_${plainText}_\n\n`;
        break;

      case 'separator':
        markdown += `---\n\n`;
        break;

      case 'bgm':
        // Optionally include BGM as a comment
        // markdown += `<!-- BGM: ${line.bgmId} ${line.action} -->\n\n`;
        break;

      default:
        // Skip other types
        break;
    }
  }

  return markdown.trim();
}
