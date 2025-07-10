import type { TFunction } from 'i18next';
import type { LimitBreakMaterial, StyleMovie, StyleVoice, LimitBreakMaterialRate } from '../+data';
import { StyleMoviesDisplay } from './StyleMoviesDisplay';
import { StyleVoicesDisplay } from './StyleVoicesDisplay';
import { LimitBreakMaterialRatesTable } from './LimitBreakMaterialRatesTable';

interface AdditionalInfoSectionProps {
  cardId: number;
  limitBreakMaterials?: LimitBreakMaterial[];
  styleMovies?: StyleMovie[];
  styleVoices?: StyleVoice[];
  limitBreakMaterialRates?: LimitBreakMaterialRate[];
  t: TFunction;
}

export function AdditionalInfoSection(props: AdditionalInfoSectionProps) {
  const { cardId, styleMovies, styleVoices, limitBreakMaterialRates, t } = props;

  return (
    <>
      {(styleMovies?.length ?? 0) > 0 && (
        <StyleMoviesDisplay cardId={cardId} movies={styleMovies!} title={t('style_movies')} />
      )}

      {(styleVoices?.length ?? 0) > 0 && (
        <StyleVoicesDisplay cardId={cardId} voices={styleVoices!} title={t('style_voices')} />
      )}

      {(limitBreakMaterialRates?.length ?? 0) > 0 && (
        <LimitBreakMaterialRatesTable
          rates={limitBreakMaterialRates!}
          title={t('limit_break_material_rates')}
        />
      )}
    </>
  );
}
