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
import { Box, Stack } from 'styled-system/jsx';

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
        <Box w="full" mt="4">
          {cardDataList.length > 1 && (
            <LimitBreakSelector
              collection={limitBreakOptions}
              value={[String(selectedLimitBreakIndex)]}
              onValueChange={(details) => setSelectedLimitBreakIndex(Number(details.value[0]))}
              t={t}
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
        </Box>
      </Stack>
    </>
  );
}
