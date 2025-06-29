import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useData } from 'vike-react/useData';

import type { PageData } from './+data';
import { CardPageHeader } from './components/CardPageHeader';
import { LimitBreakSelector } from './components/LimitBreakSelector';
import { SelectedCardDataDisplay } from './components/SelectedCardDataDisplay';
import { AdditionalInfoSection } from './components/AdditionalInfoSection';
import { SkillMaterialsSection } from './components/SkillMaterialsSection';
import { createListCollection } from '~/components/ui/select';
import { Box, Stack, styled } from 'styled-system/jsx';
import { getCardUrl } from '~/utils/assets';

export function Page() {
  const { t } = useTranslation();

  const {
    cardDataList,
    skillLevelUpMaterials,
    styleMovies,
    styleVoices,
    limitBreakMaterials,
    limitBreakMaterialRates
  }: PageData = useData();

  const basicCardInfo = cardDataList?.[0];

  const specialAppealMaterials = (skillLevelUpMaterials ?? []).filter((m) => m.skillType === 1);
  const appealMaterials = (skillLevelUpMaterials ?? []).filter((m) => m.skillType === 2);

  const [selectedLimitBreakIndex, setSelectedLimitBreakIndex] = useState(0);
  if (!basicCardInfo) {
    return null;
  }

  const selectedCardData = cardDataList[selectedLimitBreakIndex];

  const limitBreakOptions = useMemo(() => {
    if (!cardDataList) return createListCollection({ items: [] });
    return createListCollection({
      items: cardDataList.map((_, index) => ({
        value: String(index),
        label: t('limit_break', { level: index })
      }))
    });
  }, [cardDataList, t]);

  // Ensure selected index is valid if cardDataList changes
  useEffect(() => {
    if (selectedLimitBreakIndex >= cardDataList.length) {
      setSelectedLimitBreakIndex(0);
    }
  }, [cardDataList, selectedLimitBreakIndex]);

  return (
    <>
      <Stack alignItems="center" w="full" _print={{ display: 'none' }}>
        {/* Metadata is handled in +Head.tsx */}
        <CardPageHeader
          name={basicCardInfo.name ?? undefined}
          description={basicCardInfo.description ?? undefined}
          t={t}
        />
        <Stack gap="2" w="full" mt="4">
          {selectedCardData.cardSeriesId && (
            <Stack direction={{ md: 'row' }} w="full" maxH="300px">
              <Box>
                <styled.img
                  src={getCardUrl(
                    selectedCardData.cardSeriesId,
                    `${selectedCardData.cardSeriesId}0`
                  )}
                  alt={`${selectedCardData.name} Unawakened`}
                  h="full"
                  mx="auto"
                />
              </Box>
              <Box>
                <styled.img
                  src={getCardUrl(
                    selectedCardData.cardSeriesId,
                    `${selectedCardData.cardSeriesId}1`
                  )}
                  alt={`${selectedCardData.name} Awakened`}
                  h="full"
                  mx="auto"
                />
              </Box>
            </Stack>
          )}
          {cardDataList.length > 1 && (
            <LimitBreakSelector
              collection={limitBreakOptions}
              value={String(selectedLimitBreakIndex)}
              onValueChange={(details) => {
                console.log(details);
                setSelectedLimitBreakIndex(Number(details.value));
              }}
            />
          )}

          <Stack gap="4" w="full" mt="4">
            <SelectedCardDataDisplay selectedCardData={selectedCardData} t={t} />

            <SkillMaterialsSection
              specialAppealMaterials={specialAppealMaterials}
              appealMaterials={appealMaterials}
              t={t}
            />

            {selectedLimitBreakIndex === 0 && (
              <AdditionalInfoSection
                limitBreakMaterials={limitBreakMaterials}
                styleMovies={styleMovies}
                styleVoices={styleVoices}
                limitBreakMaterialRates={limitBreakMaterialRates}
                t={t}
              />
            )}
          </Stack>
        </Stack>
      </Stack>
    </>
  );
}
