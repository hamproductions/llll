// Environment: server

import { asc } from 'drizzle-orm';
import { items } from '../../../drizzle/schema';
import { getDrizzleDb } from '~/utils/database';

export { data };

async function data() {
  const db = getDrizzleDb();

  const itemRows = await db
    .select({
      id: items.id,
      name: items.name,
      itemType: items.itemType,
      itemCategory: items.itemCategory,
      rarity: items.rarity,
      description: items.description
    })
    .from(items)
    .orderBy(asc(items.itemCategory), asc(items.id));

  return { items: itemRows };
}

export type PageData = Awaited<ReturnType<typeof data>>;
