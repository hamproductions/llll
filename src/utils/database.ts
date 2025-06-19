import { Database } from 'bun:sqlite';
import { join } from 'path-browserify';
import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import * as schema from '../../drizzle/schema';

let dbInstance: Database | null = null;
let drizzleDbInstance: BunSQLiteDatabase<typeof schema> | null = null;

export function getDrizzleDb(): BunSQLiteDatabase<typeof schema> {
  if (!dbInstance) {
    // import.meta.dirname will refer to the `database.ts` file's directory
    dbInstance = new Database(
      join(
        import.meta.dirname,
        import.meta.env.NODE_ENV === 'production'
          ? '../../../../data/db.sqlite3'
          : '../../../data/db.sqlite3'
      )
    );
  }
  if (!drizzleDbInstance) {
    drizzleDbInstance = drizzle(dbInstance, { schema });
  }
  return drizzleDbInstance;
}

export function closeDb(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
    drizzleDbInstance = null;
  }
}
