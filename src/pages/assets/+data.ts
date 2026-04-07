// Environment: server

import { getAssetArchive } from '~/utils/assetLibrary';

export { data };

async function data() {
  return getAssetArchive();
}

export type PageData = Awaited<ReturnType<typeof data>>;
