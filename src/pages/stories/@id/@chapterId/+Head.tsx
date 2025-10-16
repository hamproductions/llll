import { useData } from 'vike-react/useData';
import type { PageData } from './+data';
import { Metadata } from '~/components/layout/Metadata';

export function Head() {
  const { chapter, series } = useData<PageData>();
  const title = chapter ? `${series?.name ?? 'Story'} - ${chapter.name}` : 'Story Chapter';

  return <Metadata title={title} />;
}
