// Environment: server

import { characters } from '../../../../drizzle/schema';
import { getDrizzleDb } from '~/utils/database';

export async function onBeforePrerenderStart() {
  const db = getDrizzleDb();
  const allCharacters = await db.select({ id: characters.id }).from(characters);

  return allCharacters.map((character) => `/characters/${character.id}`);
}
