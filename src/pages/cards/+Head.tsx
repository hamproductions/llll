import { t } from 'i18next';
import { useData } from 'vike-react/useData';
import type { PageData } from './+data';
import { Metadata } from '~/components/layout/Metadata';

export function Head() {
  const { cards } = useData<PageData>();

  const pageDescription =
    cards && cards.length > 0
      ? t('card_list_description_with_count', 'Browse all {{count}} available cards.', {
          count: cards.length
        })
      : t('card_list_description', 'Browse all available cards.');

  return (
    <Metadata
      title={`${t('card_list_title', 'Card List')} | ${t('site_name')}`}
      description={pageDescription}
    />
  );
}
