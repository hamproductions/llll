// Environment: server

import { desc } from 'drizzle-orm';
import { downloadImages } from '../../../drizzle/schema';
import { getDrizzleDb } from '~/utils/database';
import { filterReleasedContent } from '~/utils/release';

export { data };

async function data() {
  const db = getDrizzleDb();

  const downloads = filterReleasedContent(
    await db
      .select({
        id: downloadImages.id,
        downloadType: downloadImages.downloadType,
        title: downloadImages.title,
        orderId: downloadImages.orderId,
        startTime: downloadImages.startTime,
        endTime: downloadImages.endTime
      })
      .from(downloadImages)
      .orderBy(desc(downloadImages.orderId)),
    undefined,
    (item) => item.startTime
  );

  return { downloads };
}

export type PageData = Awaited<ReturnType<typeof data>>;
