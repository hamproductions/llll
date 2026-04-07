export function getCharacterDisplayName(character: {
  displayName?: string | null;
  nameFirst?: string | null;
  nameLast?: string | null;
}) {
  const displayName = character.displayName?.trim();
  if (displayName) {
    return displayName;
  }

  return `${character.nameLast ?? ''} ${character.nameFirst ?? ''}`.trim();
}
