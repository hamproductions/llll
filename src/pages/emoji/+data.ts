// Environment: server

import { asc } from 'drizzle-orm';
import { emojisTsv, emojicategoryTsv } from '../../../drizzle/schema';
import { getDrizzleDb } from '~/utils/database';

export { data };

async function data() {
  const db = getDrizzleDb();

  const emojiRows = await db
    .select({
      id: emojisTsv.f62590E34,
      name: emojisTsv.f6Bdcd439,
      slug: emojisTsv.f573Fb903,
      categoryId: emojisTsv.fbf7C10D1,
      sortOrder: emojisTsv.facfe6D41,
      unlockType: emojisTsv.fda6Abe7A,
    })
    .from(emojisTsv)
    .orderBy(asc(emojisTsv.facfe6D41));

  const categoryRows = await db
    .select({
      id: emojicategoryTsv.f58D76B2E,
      name: emojicategoryTsv.fe62981Bb,
      sortOrder: emojicategoryTsv.f44540Da0,
    })
    .from(emojicategoryTsv)
    .orderBy(asc(emojicategoryTsv.f44540Da0));

  return { emojis: emojiRows, categories: categoryRows };
}

export type PageData = Awaited<ReturnType<typeof data>>;
