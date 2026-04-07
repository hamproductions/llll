// Environment: server

import { asc, like } from 'drizzle-orm';
import { bundle, grandPrix } from '../../../drizzle/schema';
import { getDrizzleDb } from '~/utils/database';
import { filterReleasedContent } from '~/utils/release';

export { data };

async function data() {
  const db = getDrizzleDb();

  const [events, logos] = await Promise.all([
    filterReleasedContent(
      await db
        .select({
          id: grandPrix.id,
          name: grandPrix.name,
          description: grandPrix.description,
          grandPrixType: grandPrix.grandPrixType,
          startTime: grandPrix.startTime,
          endTime: grandPrix.endTime
        })
        .from(grandPrix)
        .orderBy(asc(grandPrix.startTime)),
      undefined,
      (event) => event.startTime
    ),
    db
      .select({
        label: bundle.label
      })
      .from(bundle)
      .where(like(bundle.label, 'image_grand_prix_logo_%'))
      .orderBy(asc(bundle.label))
  ]);

  return {
    events: events
      .map((event, index) => ({
        ...event,
        logoId: logos[index]?.label?.replace('image_grand_prix_logo_', '') ?? null
      }))
      .reverse()
  };
}

export type PageData = Awaited<ReturnType<typeof data>>;
