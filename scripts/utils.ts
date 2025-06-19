import fs from 'fs/promises'; // Import fs for file operations
import path from 'path'; // Import path for path manipulation
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';
import { cac } from 'cac'; // Import cac for CLI
import { select } from '@inquirer/prompts'; // Import select for prompting
import {
  bundle
  // Import other tables if needed for future comparisons
  // bundleCategory,
  // bundleContent,
  // bundleDependency,
  // metadata,
  // ...
} from '../drizzle/schema';

async function diffBundleTables(
  dbPath1: string,
  dbPath2: string
): Promise<
  {
    onlyInDb1?: typeof bundle.$inferSelect;
    onlyInDb2?: typeof bundle.$inferSelect;
    diffInContent?: {
      db1: typeof bundle.$inferSelect;
      db2: typeof bundle.$inferSelect;
    };
  }[]
> {
  const sqlite1 = new Database(dbPath1);
  const db1 = drizzle({ client: sqlite1 });

  const sqlite2 = new Database(dbPath2);
  const db2 = drizzle({ client: sqlite2 });

  const differences: {
    onlyInDb1?: typeof bundle.$inferSelect;
    onlyInDb2?: typeof bundle.$inferSelect;
    diffInContent?: {
      db1: typeof bundle.$inferSelect;
      db2: typeof bundle.$inferSelect;
    };
  }[] = [];

  const batchSize = 1000; // Adjust batch size for performance
  let offset = 0;

  while (true) {
    const bundles1 = await db1
      .select()
      .from(bundle)
      .orderBy(bundle.uid)
      .limit(batchSize)
      .offset(offset);
    const bundles2 = await db2
      .select()
      .from(bundle)
      .orderBy(bundle.uid)
      .limit(batchSize)
      .offset(offset);

    if (bundles1.length === 0 && bundles2.length === 0) {
      break;
    }

    let i = 0;
    let j = 0;

    while (i < bundles1.length || j < bundles2.length) {
      const bundle1 = bundles1[i];
      const bundle2 = bundles2[j];

      if (!bundle1) {
        // Remaining bundles only in db2
        differences.push({ onlyInDb2: bundle2 });
        j++;
      } else if (!bundle2) {
        // Remaining bundles only in db1
        differences.push({ onlyInDb1: bundle1 });
        i++;
      } else if (bundle1.uid < bundle2.uid) {
        // Bundle only in db1
        differences.push({ onlyInDb1: bundle1 });
        i++;
      } else if (bundle1.uid > bundle2.uid) {
        // Bundle only in db2
        differences.push({ onlyInDb2: bundle2 });
        j++;
      } else {
        // Same uid, compare content (using checksum as a quick check)
        if (bundle1.checksum !== bundle2.checksum) {
          // Checksums differ, fetch full data if necessary and compare all relevant fields
          // For simplicity, we'll just include the current batch data.
          // For a more thorough comparison, you might fetch the full rows again here.
          differences.push({ diffInContent: { db1: bundle1, db2: bundle2 } });
        }
        i++;
        j++;
      }
    }

    offset += batchSize;
  }

  sqlite1.close();
  sqlite2.close();

  return differences;
}

// CLI setup
const cli = cac('asset-explorer');

cli.command('diff', 'Compare current DB with a historical DB').action(async () => {
  const dbsDir = '../../data/dbs';
  const currentDbPath = '../../data/db.sqlite3';

  try {
    const files = await fs.readdir(dbsDir);
    const dbFiles = files.filter((file) => file.endsWith('.sqlite3'));

    if (dbFiles.length === 0) {
      console.log(`No database files found in ${dbsDir}.`);
      return;
    }

    const choices = dbFiles.map((file) => ({
      name: file,
      value: path.join(dbsDir, file)
    }));

    const selectedDbPath = await select({
      message: 'Select a database file to compare:',
      choices: choices
    });

    console.log(`Comparing ${currentDbPath} with ${selectedDbPath}...`);

    const differences = await diffBundleTables(currentDbPath, selectedDbPath);

    if (differences.length === 0) {
      console.log('No differences found in the bundle table.');
    } else {
      console.log(`Found ${differences.length} differences in the bundle table:`);
      console.dir(differences, { depth: null }); // Use console.dir for better object inspection
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
});

cli.help();
cli.parse();
