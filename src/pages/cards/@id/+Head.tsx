import { t } from 'i18next';
import { useData } from 'vike-react/useData';
import type { PageData } from './+data';
import { Metadata } from '~/components/layout/Metadata';
// import { getAlbumArtPublicPath } from '~/utils/assets'; // Not used for cards currently

export function Head() {
  const data = useData<PageData>();
  const cardData = data.cardDataList?.[0];

  const title = cardData?.name || t('card_details');
  const description = cardData?.description || t('card_details_description_fallback');

  return <Metadata title={`${title} | ${t('site_name')}`} description={description} />;
}
