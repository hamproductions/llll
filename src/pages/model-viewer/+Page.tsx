import { ViewerUI } from '~/features/model-viewer/ViewerUI';
import { useData } from 'vike-react/useData';
import type { PageData } from './+data';

export function Page() {
  const { assets, categories } = useData<PageData>();
  return <ViewerUI assets={assets} categories={categories} />;
}
