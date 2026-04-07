import { useData } from 'vike-react/useData';
import { Metadata } from '~/components/layout/Metadata';
import type { PageData } from './+data';

export function Head() {
  const { character } = useData<PageData>();

  return (
    <Metadata
      title={character ? `${character.displayLabel} | Characters` : 'Character'}
      description={character?.introduction ?? 'Character details'}
    />
  );
}
