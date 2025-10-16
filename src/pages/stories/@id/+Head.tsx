import { useData } from 'vike-react/useData';
import type { PageData } from './+data';
import { Metadata } from '~/components/layout/Metadata';

export function Head() {
  const { series } = useData<PageData>();
  const title = series?.name ?? 'Story';

  return <Metadata title={title} />;
}
