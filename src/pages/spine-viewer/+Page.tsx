import { SpineViewerUI } from '~/features/spine-viewer/SpineViewerUI';
import { useData } from 'vike-react/useData';
import type { PageData } from './+data';

export function Page() {
  const { assets, categories } = useData<PageData>();
  return <SpineViewerUI assets={assets} categories={categories} />;
}
