import type { TFunction } from 'i18next';
import type {
  CrossVoice,
  LimitBreakMaterial,
  StyleMovie,
  StyleVoice,
  LimitBreakMaterialRate
} from '../+data';
import { StyleMoviesDisplay } from './StyleMoviesDisplay';
import { StyleVoicesDisplay } from './StyleVoicesDisplay';
import { CrossVoicesDisplay } from './CrossVoicesDisplay';
import { LimitBreakMaterialRatesTable } from './LimitBreakMaterialRatesTable';

interface AdditionalInfoSectionProps {
  cardId: number;
  limitBreakMaterials?: LimitBreakMaterial[];
  styleMovies?: StyleMovie[];
  styleVoices?: StyleVoice[];
  crossVoices?: CrossVoice[];
  limitBreakMaterialRates?: LimitBreakMaterialRate[];
  t: TFunction;
}

export function AdditionalInfoSection(props: AdditionalInfoSectionProps) {
  const { cardId, styleMovies, styleVoices, crossVoices, limitBreakMaterialRates, t } = props;

  return (
    <>
      {(styleMovies?.length ?? 0) > 0 && (
        <StyleMoviesDisplay cardId={cardId} movies={styleMovies!} title={t('style_movies')} />
      )}

      {(styleVoices?.length ?? 0) > 0 && (
        <StyleVoicesDisplay cardId={cardId} voices={styleVoices!} title={t('style_voices')} />
      )}

      {(crossVoices?.length ?? 0) > 0 && (
        <CrossVoicesDisplay cardId={cardId} voices={crossVoices!} title={t('cross_voices')} />
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
