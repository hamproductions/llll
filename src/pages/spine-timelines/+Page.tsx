import { useData } from 'vike-react/useData';
import type { SpineTimelineData } from './+data';
import { SpineTimelinePlayer } from '~/features/spine-timelines/SpineTimelinePlayer';

export function Page() {
  const data = useData<SpineTimelineData>();
  return <SpineTimelinePlayer {...data} />;
}
