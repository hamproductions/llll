import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useData } from 'vike-react/useData';

import type { PageData } from './+data';
import { CardPageHeader } from './components/CardPageHeader';
import { SelectedCardDataDisplay } from './components/SelectedCardDataDisplay';
import { SchoolIdolShowSkillsSection } from './components/SchoolIdolShowSkillsSection';
import { SchoolIdolStageSkillsSection } from './components/SchoolIdolStageSkillsSection';
import { AdditionalInfoSection } from './components/AdditionalInfoSection';
import { SkillMaterialsSection } from './components/SkillMaterialsSection';
import { LimitBreakSelector } from './components/LimitBreakSelector';
import { Box, Stack, styled } from 'styled-system/jsx';
import { getCardUrl } from '~/utils/assets';
import { Tabs } from '~/components/ui/tabs';

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

  const specialAppealMaterials = (skillLevelUpMaterials ?? []).filter((m: any) => m.skillType === 1);
  const appealMaterials = (skillLevelUpMaterials ?? []).filter((m: any) => m.skillType === 2);

  const [selectedLimitBreakIndex, setSelectedLimitBreakIndex] = useState(0);
  if (!basicCardInfo) {
    return null;
  }

  const selectedCardData = cardDataList[selectedLimitBreakIndex];

  const limitBreakOptions = useMemo(() => {
    if (!cardDataList) return { items: [] };
    return {
      items: cardDataList.map((_: any, index: number) => ({
        value: String(index),
        label: t('limit_break', { level: index })
      }))
    };
  }, [cardDataList, t]);

  const TABS = [
    {
      value: 'stage',
      label: t('school_idol_stage'),
      component: (
        <>
          <SchoolIdolStageSkillsSection selectedCardData={selectedCardData} />
          <SkillMaterialsSection
            specialAppealMaterials={specialAppealMaterials}
            appealMaterials={appealMaterials}
            t={t}
          />
        </>
      )
    },
    {
      value: 'show',
      label: t('school_idol_show'),
      component: (
        <>
          <SchoolIdolShowSkillsSection selectedCardData={selectedCardData} />
        </>
      )
    }
  ];

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

          <Stack gap="4" borderRadius="md" borderWidth="1px" w="full" mt="4" p="4">
            <SelectedCardDataDisplay selectedCardData={selectedCardData} t={t} />

            {cardDataList.length > 1 && (
              <LimitBreakSelector
                collection={limitBreakOptions}
                value={String(selectedLimitBreakIndex)}
                onValueChange={(details) => {
                  setSelectedLimitBreakIndex(Number(details.value));
                }}
              />
            )}

            <Tabs.Root defaultValue={TABS[0].value} width="full">
              <Tabs.List>
                {TABS.map((tab) => (
                  <Tabs.Trigger key={tab.value} value={tab.value}>
                    {tab.label}
                  </Tabs.Trigger>
                ))}
              </Tabs.List>
              {TABS.map((tab) => (
                <Tabs.Content key={tab.value} value={tab.value}>
                  {tab.component}
                </Tabs.Content>
              ))}
            </Tabs.Root>

            <AdditionalInfoSection
              cardId={selectedCardData.cardSeriesId ?? 0}
              limitBreakMaterials={limitBreakMaterials}
              styleMovies={styleMovies}
              styleVoices={styleVoices}
              limitBreakMaterialRates={limitBreakMaterialRates}
              t={t}
            />
          </Stack>
        </Stack>
      </Stack>
    </>
  );
}
