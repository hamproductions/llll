import { t } from 'i18next';
import { Metadata } from '~/components/layout/Metadata';

export function Head() {
  return <Metadata title={t('title')} />;
}
