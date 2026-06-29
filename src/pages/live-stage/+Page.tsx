import { useData } from 'vike-react/useData';
import type { LiveStageData } from './+data';
import { LiveStageStudio } from '~/features/live-stage/LiveStageStudio';

export function Page() {
  const data = useData<LiveStageData>();
  return <LiveStageStudio {...data} />;
}
