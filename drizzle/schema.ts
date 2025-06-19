import { sqliteTable, integer, text, primaryKey } from 'drizzle-orm/sqlite-core';

export const bundle = sqliteTable('bundle', {
  uid: integer().primaryKey(),
  label: text(),
  ext: text(),
  resourceType: integer('resource_type'),
  size: integer(),
  checksum: integer(),
  encryptionSalt: integer('encryption_salt'),
  priority: integer()
});

export const bundleCategory = sqliteTable('bundle_category', {
  uid: integer().references(() => bundle.uid, {
    onDelete: 'cascade',
    onUpdate: 'cascade'
  }),
  category: text()
});

export const bundleContent = sqliteTable('bundle_content', {
  uid: integer().references(() => bundle.uid, {
    onDelete: 'cascade',
    onUpdate: 'cascade'
  }),
  label: text(),
  ext: text()
});

export const bundleDependency = sqliteTable('bundle_dependency', {
  uid: integer().references(() => bundle.uid, {
    onDelete: 'cascade',
    onUpdate: 'cascade'
  }),
  dependency: text()
});

export const metadata = sqliteTable(
  'metadata',
  {
    type: text(),
    name: text(),
    value: text()
  },
  (table) => [
    primaryKey({
      columns: [table.type, table.name],
      name: 'metadata_type_name_pk'
    })
  ]
);

export const birthdayrarebonusesTsv = sqliteTable('birthdayrarebonuses.tsv', {
  f181Edbfb: integer('F181edbfb'),
  f29E35Ec6: integer('F29e35ec6'),
  fcbd0831E: text('Fcbd0831e'),
  fa88100D5: integer('Fa88100d5'),
  f5895B635: integer('F5895b635'),
  f095F5966: integer('F095f5966'),
  f906Cc98C: integer('F906cc98c'),
  f91968Ea0: integer('F91968ea0')
});

export const selectTicketExchangeRate = sqliteTable('SelectTicketExchangeRate', {
  id: integer('Id').primaryKey(),
  selectTicketSeriesId: integer('SelectTicketSeriesId'),
  exchangeItemType: integer('ExchangeItemType'),
  exchangeItemId: integer('ExchangeItemId'),
  exchangeItemQuantity: integer('ExchangeItemQuantity'),
  f52B9D439: text('F52b9d439'),
  f10Bd438F: text('F10bd438f')
});

export const seasongraderewardsTsv = sqliteTable('seasongraderewards.tsv', {
  f96Cf0Fae: integer('F96cf0fae'),
  f9A5C8C9E: integer('F9a5c8c9e'),
  f50B97836: integer('F50b97836'),
  fc0Ca68Dc: integer('Fc0ca68dc')
});

export const questLiveLoadings = sqliteTable('QuestLiveLoadings', {
  id: integer('Id').primaryKey(),
  title: text('Title'),
  orderId: integer('OrderId'),
  startTime: text('StartTime'),
  endTime: text('EndTime')
});

export const grandPrixQuestStages = sqliteTable('GrandPrixQuestStages', {
  id: integer('Id').primaryKey(),
  grandPrixSeriesId: integer('GrandPrixSeriesId'),
  name: text('Name'),
  description: text('Description'),
  hint: text('Hint'),
  orderId: integer('OrderId'),
  stageType: integer('StageType'),
  liveStagesId: integer('LiveStagesId'),
  questMusicsType: integer('QuestMusicsType'),
  questMusicsDetail: integer('QuestMusicsDetail'),
  deckRestrictedType: integer('DeckRestrictedType'),
  deckRestrictedDetail: integer('DeckRestrictedDetail'),
  questLevel: integer('QuestLevel'),
  questRank: integer('QuestRank'),
  firstClearRewardSeriesId: integer('FirstClearRewardSeriesId'),
  completeRewardSeriesId: integer('CompleteRewardSeriesId'),
  dropRewardSeriesId: integer('DropRewardSeriesId'),
  randomDropRewardSeriesId: integer('RandomDropRewardSeriesId'),
  score1: integer('Score1'),
  score2: integer('Score2'),
  score3: integer('Score3'),
  stylePoint: integer('StylePoint'),
  gainMusicExp: integer('GainMusicExp'),
  scoreBonusValue0: integer('ScoreBonusValue0'),
  scoreBonusValue1: integer('ScoreBonusValue1'),
  scoreBonusValue2: integer('ScoreBonusValue2'),
  scoreBonusValue3: integer('ScoreBonusValue3'),
  f9719B992: integer('F9719b992')
});

export const tutorialDeckCards = sqliteTable('TutorialDeckCards', {
  id: integer('Id').primaryKey(),
  tutorialDeckDatasId: integer('TutorialDeckDatasId'),
  slotNo: integer('SlotNo'),
  cardDatasId: integer('CardDatasId'),
  styleLevel: integer('StyleLevel'),
  limitBreakTimes: integer('LimitBreakTimes'),
  specialAppealLevel: integer('SpecialAppealLevel'),
  skillLevel: integer('SkillLevel')
});

export const costumes = sqliteTable('Costumes', {
  id: integer('Id').primaryKey(),
  label: text('Label')
});

export const campaignTsv = sqliteTable('campaign.tsv', {
  fabbc503B: integer('Fabbc503b'),
  fb6D06453: integer('Fb6d06453'),
  f5B3D6C96: integer('F5b3d6c96'),
  f60977De0: text('F60977de0'),
  f7Eb380E3: text('F7eb380e3'),
  f02A1F017: integer('F02a1f017'),
  fb815E107: text('Fb815e107'),
  fbe026386: text('Fbe026386')
});

export const musicMasteryLoveBonuses = sqliteTable('MusicMasteryLoveBonuses', {
  id: integer('Id').primaryKey(),
  level: integer('Level'),
  loveRate: integer('LoveRate')
});

export const liveStages = sqliteTable('LiveStages', {
  id: integer('Id').primaryKey(),
  name: text('Name'),
  description: text('Description'),
  baseUseMental: integer('BaseUseMental'),
  mentalStepClass: integer('MentalStepClass'),
  baseGainVoltage: integer('BaseGainVoltage'),
  voltageStepClass: integer('VoltageStepClass'),
  backGroundId: integer('BackGroundId'),
  f4Bfe67Be: integer('F4bfe67be'),
  f115F6E66: integer('F115f6e66'),
  f3490Ce68: text('F3490ce68'),
  f566D6Bfc: text('F566d6bfc')
});

export const cardSeries = sqliteTable('CardSeries', {
  id: integer('Id').primaryKey(),
  evolution0Id: integer('Evolution0Id'),
  evolution1Id: integer('Evolution1Id'),
  evolution2Id: integer('Evolution2Id'),
  obtainFanLvPt: integer('ObtainFanLvPt'),
  evolution1FanLvPt: integer('Evolution1FanLvPt'),
  evolution2FanLvPt: integer('Evolution2FanLvPt'),
  limitBreak1FanLvPt: integer('LimitBreak1FanLvPt'),
  limitBreak2FanLvPt: integer('LimitBreak2FanLvPt'),
  limitBreak3FanLvPt: integer('LimitBreak3FanLvPt'),
  limitBreak4FanLvPt: integer('LimitBreak4FanLvPt'),
  limitedType: integer('LimitedType'),
  f410E2A7E: text('F410e2a7e'),
  f955Df5A6: integer('F955df5a6'),
  f9012E323: integer('F9012e323'),
  f0C458B62: integer('F0c458b62'),
  f0680827B: integer('F0680827b'),
  f20648Cce: integer('F20648cce'),
  f45A9260E: integer('F45a9260e'),
  f5B1245D8: integer('F5b1245d8')
});

export const questLiveReleaseConditions = sqliteTable('QuestLiveReleaseConditions', {
  id: integer('Id').primaryKey(),
  releaseQuestId: integer('ReleaseQuestId'),
  conditionsType: integer('ConditionsType'),
  conditionsValue: integer('ConditionsValue'),
  startTime: text('StartTime'),
  endTime: text('EndTime')
});

export const stamps = sqliteTable('Stamps', {
  id: integer('Id').primaryKey(),
  name: text('Name'),
  stampNo: integer('StampNo'),
  stampType: integer('StampType'),
  charactersId: integer('CharactersId'),
  startTime: text('StartTime'),
  endTime: text('EndTime')
});

export const itemexchangecategoryfilterTsv = sqliteTable('itemexchangecategoryfilter.tsv', {
  ffafb9A7F: integer('Ffafb9a7f'),
  f2Dfca51E: text('F2dfca51e'),
  f0Fcfe849: integer('F0fcfe849'),
  fbedab598: integer('Fbedab598'),
  fe61C6F29: integer('Fe61c6f29')
});

export const tutorialDeckDatas = sqliteTable('TutorialDeckDatas', {
  id: integer('Id').primaryKey(),
  deckName: text('DeckName'),
  deckNo: integer('DeckNo'),
  generationsId: integer('GenerationsId')
});

export const gradeaddskilleffectsTsv = sqliteTable('gradeaddskilleffects.tsv', {
  f542Fcd2D: integer('F542fcd2d'),
  f02786084: integer('F02786084'),
  f7C965Ccd: integer('F7c965ccd')
});

export const giftBonusGachas = sqliteTable('GiftBonusGachas', {
  id: integer('Id').primaryKey(),
  singleGachaPrice: integer('SingleGachaPrice'),
  singleGachaPopId: integer('SingleGachaPopId'),
  consectiveGachaPrice: integer('ConsectiveGachaPrice'),
  consectiveGachaTimes: integer('ConsectiveGachaTimes'),
  consectiveGachaPopId: integer('ConsectiveGachaPopId'),
  paidSisCaOnlyGachaFlag: integer('PaidSIsCaOnlyGachaFlag'),
  paidSisCaOnlyGachaPrice: integer('PaidSIsCaOnlyGachaPrice'),
  paidSisCaOnlyGachaTimes: integer('PaidSIsCaOnlyGachaTimes'),
  paidSisCaOnlyGachaPointFlag: integer('PaidSIsCaOnlyGachaPointFlag'),
  paidSisCaOnlyGachaaPopId: integer('PaidSIsCaOnlyGachaaPopId'),
  fd3D0Fa91: integer('Fd3d0fa91'),
  f2Ccd41A2: integer('F2ccd41a2'),
  f35Ca1357: integer('F35ca1357'),
  f086C1F1A: integer('F086c1f1a')
});

export const stageskillconditionsTsv = sqliteTable('stageskillconditions.tsv', {
  ffb9Da42D: integer('Ffb9da42d'),
  f9A785Df5: integer('F9a785df5')
});

export const cardLevels = sqliteTable('CardLevels', {
  id: integer('Id').primaryKey(),
  experienceType: integer('ExperienceType'),
  cardLevel: integer('CardLevel'),
  experience: integer('Experience'),
  cumulativeExperience: integer('CumulativeExperience')
});

export const characterFavoriteGifts = sqliteTable('CharacterFavoriteGifts', {
  id: integer('Id').primaryKey(),
  itemsId: integer('ItemsId'),
  charactersId: integer('CharactersId'),
  favoriteRank: integer('FavoriteRank')
});

export const loginBonusRewardDatas = sqliteTable('LoginBonusRewardDatas', {
  id: integer('Id').primaryKey(),
  loginBonusRewardSeriesId: integer('LoginBonusRewardSeriesId'),
  dayCount: integer('DayCount'),
  rewardType: integer('RewardType'),
  rewardId: integer('RewardId'),
  rewardNum: integer('RewardNum'),
  lifeTimeDay: integer('LifeTimeDay'),
  rewardTextId: integer('RewardTextId')
});

export const gradequestlivepointbonusTsv = sqliteTable('gradequestlivepointbonus.tsv', {
  f134F6E41: integer('F134f6e41'),
  f3Bde3919: integer('F3bde3919'),
  f88656288: integer('F88656288'),
  f287639Bb: text('F287639bb'),
  f8F1E7402: integer('F8f1e7402'),
  fb1C86157: integer('Fb1c86157'),
  fb0B792D3: integer('Fb0b792d3'),
  fea435De7: integer('Fea435de7')
});

export const targetsTsv = sqliteTable('targets.tsv', {
  f8D192D1B: integer('F8d192d1b'),
  fe656D944: integer('Fe656d944'),
  f2E1Ecd5F: integer('F2e1ecd5f')
});

export const comics = sqliteTable('Comics', {
  id: integer('Id').primaryKey(),
  name: text('Name'),
  viewType: integer('ViewType'),
  startTime: text('StartTime'),
  endTime: text('EndTime'),
  f35A27A2C: integer('F35a27a2c'),
  f1Ed17E1B: text('F1ed17e1b')
});

export const flowerStandTypes = sqliteTable('FlowerStandTypes', {
  id: integer('Id').primaryKey(),
  name: text('Name')
});

export const eventMissions = sqliteTable('EventMissions', {
  id: integer('Id').primaryKey(),
  eventMissionSeriesId: integer('EventMissionSeriesId'),
  name: text('Name'),
  description: text('Description'),
  missionType: integer('MissionType'),
  missionCondition: integer('MissionCondition'),
  missionConditionNum: integer('MissionConditionNum'),
  openType: integer('OpenType'),
  nextMissionsId: integer('NextMissionsId'),
  sortOrder: integer('SortOrder'),
  transitionContentsId: integer('TransitionContentsId'),
  f591E4981: integer('F591e4981')
});

export const gradequestseasonreleasecondTsv = sqliteTable('gradequestseasonreleasecond.tsv', {
  f4705B282: integer('F4705b282'),
  f6B927454: integer('F6b927454'),
  f0B47838D: integer('F0b47838d'),
  fcc4Ba611: integer('Fcc4ba611'),
  ffb372281: text('Ffb372281'),
  fd70Ac518: text('Fd70ac518'),
  fe7E7F92F: text('Fe7e7f92f')
});

export const emojisTsv = sqliteTable('emojis.tsv', {
  f62590E34: integer('F62590e34'),
  f6Bdcd439: text('F6bdcd439'),
  f573Fb903: text('F573fb903'),
  fbf7C10D1: integer('Fbf7c10d1'),
  facfe6D41: integer('Facfe6d41'),
  f45C34E1E: integer('F45c34e1e'),
  fda6Abe7A: text('Fda6abe7a'),
  fa503E022: integer('Fa503e022'),
  ff296Bef0: text('Ff296bef0'),
  fe62740C0: integer('Fe62740c0'),
  f93A8114A: text('F93a8114a'),
  fa291F28A: text('Fa291f28a'),
  f82306B09: text('F82306b09'),
  fdadf9389: text('Fdadf9389')
});

export const gradedatasTsv = sqliteTable('gradedatas.tsv', {
  f52790E42: integer('F52790e42'),
  f9C442074: integer('F9c442074'),
  f67Bd1Bba: integer('F67bd1bba'),
  fd9Bc697F: integer('Fd9bc697f'),
  f87006533: integer('F87006533'),
  fa0B6B2D2: integer('Fa0b6b2d2')
});

export const musicMasterySkill = sqliteTable('MusicMasterySkill', {
  id: integer('Id').primaryKey(),
  musicMasterySkillsName: text('MusicMasterySkillsName')
});

export const eventMissionRewards = sqliteTable('EventMissionRewards', {
  id: integer('Id').primaryKey(),
  eventMissionSeriesId: integer('EventMissionSeriesId'),
  eventMissionsId: integer('EventMissionsId'),
  rewardCategory: integer('RewardCategory'),
  rewardType: integer('RewardType'),
  itemsId: integer('ItemsId'),
  rewardNum: integer('RewardNum'),
  rewardTextId: integer('RewardTextId'),
  sortOrder: integer('SortOrder')
});

export const rentaldeckcardsTsv = sqliteTable('rentaldeckcards.tsv', {
  ff41Eae4B: integer('Ff41eae4b'),
  f28704Eb7: integer('F28704eb7'),
  fcb70A093: integer('Fcb70a093'),
  fdcaaf1Bb: integer('Fdcaaf1bb'),
  f2Efb64D6: integer('F2efb64d6'),
  fb7F2356C: integer('Fb7f2356c')
});

export const stagescoremultipliersettingsTsv = sqliteTable('stagescoremultipliersettings.tsv', {
  fc41Fbccb: integer('Fc41fbccb'),
  fa4C9C5D8: integer('Fa4c9c5d8'),
  f34Bad532: integer('F34bad532'),
  f14F1Fd69: integer('F14f1fd69'),
  f6D59298C: integer('F6d59298c')
});

export const stickerexchangesTsv = sqliteTable('stickerexchanges.tsv', {
  f8E581Eb5: integer('F8e581eb5'),
  fc286Cd6D: integer('Fc286cd6d'),
  f84565Cd5: integer('F84565cd5'),
  f56490E2A: integer('F56490e2a'),
  f3Cbd51C4: integer('F3cbd51c4'),
  f2Ba27C05: integer('F2ba27c05'),
  f376A7A0A: integer('F376a7a0a'),
  fb56470F9: integer('Fb56470f9'),
  f8Cee1Ab0: integer('F8cee1ab0'),
  f8368752B: integer('F8368752b'),
  f1Fd625A7: text('F1fd625a7'),
  f8D07Eae0: text('F8d07eae0')
});

export const cardCoordinates = sqliteTable('CardCoordinates', {
  id: integer('Id').primaryKey(),
  cardDatasId: integer('CardDatasId'),
  cardCoordSceneType: integer('CardCoordSceneType'),
  xcoord: integer('XCoord'),
  ycoord: integer('YCoord'),
  scale: integer('Scale')
});

export const liveChannels = sqliteTable('LiveChannels', {
  id: integer('Id').primaryKey(),
  name: text('Name'),
  description: text('Description'),
  orderId: integer('OrderId'),
  startTime: text('StartTime'),
  endTime: text('EndTime')
});

export const raidrewarddatasTsv = sqliteTable('raidrewarddatas.tsv', {
  f3A353C28: integer('F3a353c28'),
  f4909B4B4: integer('F4909b4b4'),
  ffbc5B45D: integer('Ffbc5b45d'),
  fc7A8Cf5A: integer('Fc7a8cf5a'),
  fc0904D6F: integer('Fc0904d6f')
});

export const musics = sqliteTable('Musics', {
  id: integer('Id').primaryKey(),
  orderId: integer('OrderId'),
  title: text('Title'),
  titleFurigana: text('TitleFurigana'),
  jacketId: integer('JacketId'),
  soundId: integer('SoundId'),
  description: text('Description'),
  generationsId: integer('GenerationsId'),
  unitId: integer('UnitId'),
  centerCharacterId: integer('CenterCharacterId'),
  singerCharacterId: text('SingerCharacterId'),
  supportCharacterId: text('SupportCharacterId'),
  musicType: integer('MusicType'),
  experienceType: integer('ExperienceType'),
  beatPointCoefficient: integer('BeatPointCoefficient'),
  apIncrement: integer('ApIncrement'),
  songTime: integer('SongTime'),
  playTime: integer('PlayTime'),
  feverSectionNo: integer('FeverSectionNo'),
  previewStartTime: integer('PreviewStartTime'),
  previewEndTime: integer('PreviewEndTime'),
  previewFadeInTime: integer('PreviewFadeInTime'),
  previewFadeOutTime: integer('PreviewFadeOutTime'),
  releaseConditionType: integer('ReleaseConditionType'),
  releaseConditionDetail: integer('ReleaseConditionDetail'),
  releaseConditionText: text('ReleaseConditionText'),
  startTime: text('StartTime'),
  endTime: text('EndTime'),
  ffb2E1F7E: integer('Ffb2e1f7e'),
  fae727Ad9: integer('Fae727ad9'),
  fa8D4A488: integer('Fa8d4a488'),
  f74357B13: integer('F74357b13'),
  fdad87316: text('Fdad87316')
});

export const seasons = sqliteTable('Seasons', {
  id: integer('Id').primaryKey(),
  name: text('Name'),
  startTime: text('StartTime'),
  endTime: text('EndTime')
});

export const raidtopprogressimageTsv = sqliteTable('raidtopprogressimage.tsv', {
  f1696A35B: integer('F1696a35b'),
  fdd3Bc511: integer('Fdd3bc511'),
  f1083D0E3: integer('F1083d0e3'),
  fd1218E2A: integer('Fd1218e2a')
});

export const tutorialQuestAreas = sqliteTable('TutorialQuestAreas', {
  id: integer('Id').primaryKey(),
  name: text('Name'),
  number: integer('Number'),
  description: text('Description'),
  orderId: integer('OrderId'),
  imageType: integer('ImageType'),
  bgImageId: integer('BgImageId'),
  nextTutorialQuestAreasId: integer('Next_TutorialQuestAreasId'),
  generationsId: integer('GenerationsId')
});

export const ticketonlygachasTsv = sqliteTable('ticketonlygachas.tsv', {
  f21Adde08: integer('F21adde08'),
  f0954Ebc8: integer('F0954ebc8'),
  fa6A99946: integer('Fa6a99946'),
  f0Ebca02F: integer('F0ebca02f'),
  fdd2F16C7: integer('Fdd2f16c7'),
  fe1119561: integer('Fe1119561'),
  f1C828067: integer('F1c828067'),
  f8F543Bd0: integer('F8f543bd0')
});

export const rentalcarddatasTsv = sqliteTable('rentalcarddatas.tsv', {
  f43641Aaa: integer('F43641aaa'),
  fc3482B21: integer('Fc3482b21'),
  fb742Fde1: integer('Fb742fde1'),
  f6Dd82F09: integer('F6dd82f09'),
  f37Dac02C: integer('F37dac02c'),
  f9F8F10A2: integer('F9f8f10a2')
});

export const downloadImages = sqliteTable('DownloadImages', {
  id: integer('Id').primaryKey(),
  downloadType: integer('DownloadType'),
  title: text('Title'),
  orderId: integer('OrderId'),
  startTime: text('StartTime'),
  endTime: text('EndTime')
});

export const limitBreakMaterialRate = sqliteTable('LimitBreakMaterialRate', {
  id: integer('Id').primaryKey(),
  cardSeriesId: integer('CardSeriesId'),
  limitBreakMaterialId: integer('LimitBreakMaterialId'),
  limitBreakMaterialQuantity: integer('LimitBreakMaterialQuantity')
});

export const items = sqliteTable('Items', {
  id: integer('Id').primaryKey(),
  name: text('Name'),
  nameFurigana: text('NameFurigana'),
  itemType: integer('ItemType'),
  itemCategory: integer('ItemCategory'),
  rarity: integer('Rarity'),
  effectValue: integer('EffectValue'),
  limitNum: integer('LimitNum'),
  requestableNum: integer('RequestableNum'),
  description: text('Description'),
  startTime: text('StartTime'),
  endTime: text('EndTime')
});

export const memberVoices = sqliteTable('MemberVoices', {
  id: integer('Id').primaryKey(),
  charactersId: integer('CharactersId'),
  name: text('Name'),
  priority: integer('Priority'),
  voiceName: text('VoiceName'),
  releaseConditionText: text('ReleaseConditionText')
});

export const raidresourceTsv = sqliteTable('raidresource.tsv', {
  f783C04A4: integer('F783c04a4'),
  fe5D9C5C5: integer('Fe5d9c5c5'),
  fbb0Bdc71: integer('Fbb0bdc71'),
  f14239C19: integer('F14239c19'),
  f46F2C2Ca: integer('F46f2c2ca')
});

export const gradechalqueststagesrewardsTsv = sqliteTable('gradechalqueststagesrewards.tsv', {
  fd90D31A1: integer('Fd90d31a1'),
  fdcfb4A70: integer('Fdcfb4a70'),
  f71D4Dcc9: integer('F71d4dcc9'),
  f9B6B0043: integer('F9b6b0043'),
  fb0076525: integer('Fb0076525')
});

export const sectionSkillEffects = sqliteTable('SectionSkillEffects', {
  id: integer('Id').primaryKey(),
  actionType: integer('ActionType'),
  orderId: integer('OrderId')
});

export const gradequeststagesTsv = sqliteTable('gradequeststages.tsv', {
  f63Bd4Daa: integer('F63bd4daa'),
  f6Bcb6263: text('F6bcb6263'),
  f1F2F6509: text('F1f2f6509'),
  f012E1F36: text('F012e1f36'),
  f2Daa80E5: integer('F2daa80e5'),
  f210B7F99: integer('F210b7f99'),
  f88A2B46A: integer('F88a2b46a'),
  fcc51D4Eb: integer('Fcc51d4eb'),
  f049D9081: integer('F049d9081'),
  f4Dd89622: integer('F4dd89622'),
  fbae0Deff: integer('Fbae0deff')
});

export const rentaldecksTsv = sqliteTable('rentaldecks.tsv', {
  feee8102D: integer('Feee8102d'),
  f58029F5D: text('F58029f5d'),
  f4A3Ad2D5: integer('F4a3ad2d5'),
  f18D24F04: integer('F18d24f04'),
  fbe558B36: integer('Fbe558b36'),
  f82Fab9Cd: integer('F82fab9cd'),
  fd50Ef8Fa: integer('Fd50ef8fa'),
  fc3F46A21: text('Fc3f46a21'),
  f1F31Cc11: text('F1f31cc11'),
  fdc9Cedee: text('Fdc9cedee')
});

export const grandPrixPointBonuses = sqliteTable('GrandPrixPointBonuses', {
  id: integer('Id').primaryKey(),
  grandPrixesId: integer('GrandPrixesId'),
  targetType: integer('TargetType'),
  targetDetail: integer('TargetDetail'),
  targetNum: integer('TargetNum'),
  bonusValue: integer('BonusValue')
});

export const characters = sqliteTable('Characters', {
  id: integer('Id').primaryKey(),
  nameLast: text('NameLast'),
  nameFirst: text('NameFirst'),
  latinAlphabetNameLast: text('LatinAlphabetNameLast'),
  latinAlphabetNameFirst: text('LatinAlphabetNameFirst'),
  generationsId: integer('GenerationsId'),
  seriesType: integer('SeriesType'),
  iconOrderId: integer('IconOrderId'),
  characterVoice: text('CharacterVoice'),
  themeColor: text('ThemeColor'),
  introduction: text('Introduction'),
  showSeasonFanLvStartTime: text('ShowSeasonFanLvStartTime'),
  showSeasonFanLvEndTime: text('ShowSeasonFanLvEndTime'),
  ffcbe3734: integer('Ffcbe3734'),
  f67739Ed2: integer('F67739ed2'),
  fd94Eff57: integer('Fd94eff57'),
  fa43Ca79C: text('Fa43ca79c'),
  fb5513E11: text('Fb5513e11'),
  fe711F126: integer('Fe711f126'),
  f5Ffc33Ef: text('F5ffc33ef'),
  f3D03Ee66: text('F3d03ee66')
});

export const gradechalseasonTsv = sqliteTable('gradechalseason.tsv', {
  f40474697: integer('F40474697'),
  f96F1D0Af: text('F96f1d0af'),
  f5761E0F2: integer('F5761e0f2'),
  f513Dde48: integer('F513dde48'),
  fd30B1Eee: text('Fd30b1eee'),
  f7Abcaf44: text('F7abcaf44')
});

export const exchangePointConvert = sqliteTable('ExchangePointConvert', {
  id: integer('Id').primaryKey(),
  convertItemType: integer('ConvertItemType'),
  convertItemId: integer('ConvertItemId'),
  convertItemQuantity: integer('ConvertItemQuantity'),
  convertTime: text('ConvertTime')
});

export const missions = sqliteTable('Missions', {
  id: integer('Id').primaryKey(),
  name: text('Name'),
  description: text('Description'),
  missionType: integer('MissionType'),
  missionConditionType: integer('MissionConditionType'),
  missionConditionNum: integer('MissionConditionNum'),
  missionConditionDetail: integer('MissionConditionDetail'),
  openType: integer('OpenType'),
  nextMissionsId: integer('NextMissionsId'),
  sortOrder: integer('SortOrder'),
  transitionContentsId: integer('TransitionContentsId'),
  startTime: text('StartTime'),
  endTime: text('EndTime'),
  f9Eaa01E0: integer('F9eaa01e0')
});

export const memberFanLevels = sqliteTable('MemberFanLevels', {
  id: integer('Id').primaryKey(),
  memberFanLevel: integer('MemberFanLevel'),
  experience: integer('Experience'),
  cumulativeExperience: integer('CumulativeExperience')
});

export const flowerStandColors = sqliteTable('FlowerStandColors', {
  id: integer('Id').primaryKey(),
  name: text('Name'),
  colorCode: text('ColorCode'),
  orderId: integer('OrderId')
});

export const grandPrixReleaseCondition = sqliteTable('GrandPrixReleaseCondition', {
  id: integer('Id').primaryKey(),
  releaseGrandPrixId: integer('ReleaseGrandPrixId'),
  conditionsType: integer('ConditionsType'),
  conditionsValue: integer('ConditionsValue'),
  startTime: text('StartTime'),
  endTime: text('EndTime')
});

export const dailyQuestSeries = sqliteTable('DailyQuestSeries', {
  id: integer('Id').primaryKey(),
  name: text('Name'),
  description: text('Description'),
  isSunday: integer('IsSunday'),
  isMonday: integer('IsMonday'),
  isTuesday: integer('IsTuesday'),
  isWednesday: integer('IsWednesday'),
  isThursday: integer('IsThursday'),
  isFriday: integer('IsFriday'),
  isSaturday: integer('IsSaturday'),
  startTime: text('StartTime'),
  endTime: text('EndTime')
});

export const gradeaddskillsTsv = sqliteTable('gradeaddskills.tsv', {
  f5D6C8Fa5: integer('F5d6c8fa5'),
  f9939E3E1: text('F9939e3e1'),
  fcbd184Be: text('Fcbd184be'),
  f3B4A1768: integer('F3b4a1768'),
  fce34A276: text('Fce34a276'),
  f6F03Bff8: integer('F6f03bff8')
});

export const flowerStandIdolPictures = sqliteTable('FlowerStandIdolPictures', {
  id: integer('Id').primaryKey(),
  name: text('Name'),
  charactersId: integer('CharactersId')
});

export const sidestylesettingsTsv = sqliteTable('sidestylesettings.tsv', {
  f60Bf5Ce0: integer('F60bf5ce0'),
  f4Df93001: integer('F4df93001'),
  ff403Efdb: integer('Ff403efdb'),
  f7A1Efff0: text('F7a1efff0')
});

export const itemsourcesTsv = sqliteTable('itemsources.tsv', {
  f39C7874F: integer('F39c7874f'),
  fa6F6A4C7: text('Fa6f6a4c7'),
  f4264B55D: text('F4264b55d')
});

export const questAreaReleaseConditions = sqliteTable('QuestAreaReleaseConditions', {
  id: integer('Id').primaryKey(),
  releaseAreaId: integer('ReleaseAreaId'),
  conditionsType: integer('ConditionsType'),
  conditionsValue: integer('ConditionsValue'),
  startTime: text('StartTime'),
  endTime: text('EndTime')
});

export const shopItems = sqliteTable('ShopItems', {
  id: integer('Id').primaryKey(),
  shopId: integer('ShopId'),
  name: text('Name'),
  itemType: integer('ItemType'),
  itemId: integer('ItemId'),
  itemQuantity: integer('ItemQuantity'),
  price: integer('Price'),
  isPaidSisCaOnly: integer('IsPaidSIsCaOnly'),
  orderId: integer('OrderId'),
  description: text('Description'),
  rewardTextId: integer('RewardTextId'),
  startTime: text('StartTime'),
  endTime: text('EndTime')
});

export const liveLocations = sqliteTable('LiveLocations', {
  id: integer('Id').primaryKey(),
  label: text('Label'),
  propsIds: text('PropsIds')
});

export const cardskillmodesTsv = sqliteTable('cardskillmodes.tsv', {
  f9925E6F8: integer('F9925e6f8'),
  f5D009B66: text('F5d009b66'),
  fa3631E4A: text('Fa3631e4a'),
  ff93D53B8: integer('Ff93d53b8')
});

export const tutorialQuestStages = sqliteTable('TutorialQuestStages', {
  id: integer('Id').primaryKey(),
  tutorialQuestAreasId: integer('TutorialQuestAreasId'),
  name: text('Name'),
  description: text('Description'),
  hint: text('Hint'),
  mapNumber: integer('MapNumber'),
  stageType: integer('StageType'),
  useType: integer('UseType'),
  useItemsId: integer('Use_ItemsId'),
  useNum: integer('UseNum'),
  liveStagesId: integer('LiveStagesId'),
  questMusicsId: integer('QuestMusicsId'),
  loveCorrectionValue: integer('LoveCorrectionValue'),
  bonusVoltage: integer('BonusVoltage'),
  bonusMental: integer('BonusMental'),
  bonusHeart: integer('BonusHeart'),
  bonusLove: integer('BonusLove'),
  firstClearRewardSeriesId: integer('FirstClearRewardSeriesId'),
  completeRewardSeriesId: integer('CompleteRewardSeriesId'),
  randomDropRewardSeriesId: integer('RandomDropRewardSeriesId'),
  score1: integer('Score1'),
  score2: integer('Score2'),
  score3: integer('Score3'),
  stylePoint: integer('StylePoint'),
  gainMusicExp: integer('GainMusicExp')
});

export const cardSkillLevelUpMaterials = sqliteTable('CardSkillLevelUpMaterials', {
  id: integer('Id').primaryKey(),
  cardSeriesId: integer('CardSeriesId'),
  skillType: integer('SkillType'),
  skillLevel: integer('SkillLevel'),
  costItemsId1: integer('Cost_ItemsId1'),
  costNum1: integer('CostNum1'),
  costItemsId2: integer('Cost_ItemsId2'),
  costNum2: integer('CostNum2'),
  costItemsId3: integer('Cost_ItemsId3'),
  costNum3: integer('CostNum3'),
  fa1Aadd43: text('Fa1aadd43'),
  f233F7B92: text('F233f7b92')
});

export const musicMasteryLevels = sqliteTable('MusicMasteryLevels', {
  id: integer('Id').primaryKey(),
  musicsId: integer('MusicsId'),
  level: integer('Level'),
  musicMasterySkillsId: integer('MusicMasterySkillsId')
});

export const raidquestseriesTsv = sqliteTable('raidquestseries.tsv', {
  fe13E46Fd: integer('Fe13e46fd'),
  f09E3F2Fb: text('F09e3f2fb'),
  fbef0105C: text('Fbef0105c'),
  ffd66A1Da: integer('Ffd66a1da'),
  f69Db03F4: integer('F69db03f4'),
  ffdd8F19B: text('Ffdd8f19b'),
  f45021Edf: text('F45021edf')
});

export const gradequestsquareTsv = sqliteTable('gradequestsquare.tsv', {
  f4378520F: integer('F4378520f'),
  f7Be1E878: integer('F7be1e878'),
  f1D7E58E3: integer('F1d7e58e3'),
  fd25F2117: integer('Fd25f2117'),
  f1903F2B2: integer('F1903f2b2'),
  f0B424B25: text('F0b424b25')
});

export const presentTexts = sqliteTable('PresentTexts', {
  id: integer('Id').primaryKey(),
  description: text('Description')
});

export const advstorydigestmoviesTsv = sqliteTable('advstorydigestmovies.tsv', {
  f8Ec9Bcb2: integer('F8ec9bcb2'),
  f5E21925C: text('F5e21925c'),
  f2Afbaa72: integer('F2afbaa72'),
  f01421428: integer('F01421428')
});

export const advSeries = sqliteTable('AdvSeries', {
  id: integer('Id').primaryKey(),
  seasonsId: integer('SeasonsId'),
  name: text('Name'),
  description: text('Description'),
  startTime: text('StartTime'),
  endTime: text('EndTime'),
  fd876F2B0: integer('Fd876f2b0'),
  f57C6Cd0B: integer('F57c6cd0b')
});

export const dreamQuestSeries = sqliteTable('DreamQuestSeries', {
  id: integer('Id').primaryKey(),
  charactersId: integer('CharactersId'),
  name: text('Name'),
  orderId: integer('OrderId'),
  startTime: text('StartTime'),
  endTime: text('EndTime'),
  f5819322C: integer('F5819322c'),
  fe55A9344: text('Fe55a9344'),
  f60A03C13: integer('F60a03c13')
});

export const standardQuestStages = sqliteTable('StandardQuestStages', {
  id: integer('Id').primaryKey(),
  standardQuestAreasId: integer('StandardQuestAreasId'),
  name: text('Name'),
  description: text('Description'),
  hint: text('Hint'),
  stageType: integer('StageType'),
  useType: integer('UseType'),
  useItem: integer('UseItem'),
  useNum: integer('UseNum'),
  liveStagesId: integer('LiveStagesId'),
  questMusicsType: integer('QuestMusicsType'),
  questMusicsDetail: integer('QuestMusicsDetail'),
  deckRestrictedType: integer('DeckRestrictedType'),
  deckRestrictedDetail: integer('DeckRestrictedDetail'),
  questLevel: integer('QuestLevel'),
  firstClearRewardSeriesId: integer('FirstClearRewardSeriesId'),
  completeRewardSeriesId: integer('CompleteRewardSeriesId'),
  dropRewardSeriesId: integer('DropRewardSeriesId'),
  randomDropRewardSeriesId: integer('RandomDropRewardSeriesId'),
  score1: integer('Score1'),
  score2: integer('Score2'),
  score3: integer('Score3'),
  gainStylePoint: integer('GainStylePoint'),
  gainMusicExp: integer('GainMusicExp'),
  fae984545: integer('Fae984545')
});

export const difficultybgimagesTsv = sqliteTable('difficultybgimages.tsv', {
  fd496949D: integer('Fd496949d'),
  f493A02Ac: integer('F493a02ac'),
  f81145A82: integer('F81145a82'),
  f316C16Fe: integer('F316c16fe')
});

export const contentsReleaseConditions = sqliteTable('ContentsReleaseConditions', {
  id: integer('Id').primaryKey(),
  releaseContentsId: integer('ReleaseContentsId'),
  conditionsType: integer('ConditionsType'),
  conditionsValue: integer('ConditionsValue'),
  startTime: text('StartTime'),
  endTime: text('EndTime')
});

export const rhythmgameskilllvupitemdetailsTsv = sqliteTable('rhythmgameskilllvupitemdetails.tsv', {
  f9E8102E1: integer('F9e8102e1'),
  f1Ed965B6: integer('F1ed965b6'),
  f9F7Afc9D: integer('F9f7afc9d'),
  ff97D351F: integer('Ff97d351f')
});

export const styleMovies = sqliteTable('StyleMovies', {
  id: integer('Id').primaryKey(),
  cardSeriesId: integer('CardSeriesId'),
  movieType: integer('MovieType'),
  name: text('Name'),
  releaseConditionText: text('ReleaseConditionText')
});

export const beginnermissionbannerrewardsTsv = sqliteTable('beginnermissionbannerrewards.tsv', {
  f39F43415: integer('F39f43415'),
  fd06Dcd77: integer('Fd06dcd77'),
  fc72Be5F2: integer('Fc72be5f2'),
  f0D470081: integer('F0d470081'),
  fda73D722: integer('Fda73d722')
});

export const missionRewards = sqliteTable('MissionRewards', {
  id: integer('Id').primaryKey(),
  missionsId: integer('MissionsId'),
  rewardCategory: integer('RewardCategory'),
  rewardType: integer('RewardType'),
  itemsId: integer('ItemsId'),
  rewardNum: integer('RewardNum'),
  rewardTextId: integer('RewardTextId')
});

export const liveProps = sqliteTable('LiveProps', {
  id: integer('Id').primaryKey(),
  label: text('Label')
});

export const beginnermissionshintTsv = sqliteTable('beginnermissionshint.tsv', {
  f8F16C143: integer('F8f16c143'),
  f00790966: text('F00790966'),
  fa9049E41: text('Fa9049e41')
});

export const gradeTsv = sqliteTable('grade.tsv', {
  fbe11B7C9: integer('Fbe11b7c9'),
  f78739Ca9: text('F78739ca9'),
  f02A95Afb: integer('F02a95afb')
});

export const rhythmgametotalmissionrewardsTsv = sqliteTable('rhythmgametotalmissionrewards.tsv', {
  fa553C557: integer('Fa553c557'),
  f892Fa504: integer('F892fa504'),
  ff2A814Ed: integer('Ff2a814ed'),
  ff5Bbcb67: integer('Ff5bbcb67'),
  f1B7Cd663: integer('F1b7cd663'),
  f5A0Ccd84: integer('F5a0ccd84')
});

export const textsPlaceHolder = sqliteTable('TextsPlaceHolder', {
  id: integer('Id').primaryKey(),
  description: text('Description')
});

export const challengeModeReleaseCondition = sqliteTable('ChallengeModeReleaseCondition', {
  id: integer('Id').primaryKey(),
  releaseChallengeModeId: integer('ReleaseChallengeModeId'),
  conditionsType: integer('ConditionsType'),
  conditionsValue: integer('ConditionsValue'),
  startTime: text('StartTime'),
  endTime: text('EndTime')
});

export const cardduetvoiceTsv = sqliteTable('cardduetvoice.tsv', {
  f5Eba05E5: integer('F5eba05e5'),
  fc59Ddc03: integer('Fc59ddc03'),
  f5Dc95Cf8: text('F5dc95cf8')
});

export const itemexchangesTsv = sqliteTable('itemexchanges.tsv', {
  ff8Ff7288: integer('Ff8ff7288'),
  fa69F497D: integer('Fa69f497d'),
  f8857A349: integer('F8857a349'),
  f05Aed7E3: integer('F05aed7e3'),
  f8E91Dae8: integer('F8e91dae8'),
  fc4D59C47: integer('Fc4d59c47'),
  f24C8C926: integer('F24c8c926'),
  f65Be8Ac9: integer('F65be8ac9'),
  f538Cc16B: integer('F538cc16b'),
  f8Fb5C78C: integer('F8fb5c78c'),
  f1E7288Dd: integer('F1e7288dd'),
  f0E7Bd432: integer('F0e7bd432'),
  f250792D2: text('F250792d2'),
  f00144Bf9: text('F00144bf9'),
  f413B2F93: text('F413b2f93'),
  f3424781D: integer('F3424781d'),
  f92B5Fcd4: text('F92b5fcd4'),
  f6309Fa34: integer('F6309fa34'),
  f47C1D775: integer('F47c1d775'),
  f3E69F31F: integer('F3e69f31f'),
  f4F04822B: integer('F4f04822b')
});

export const musicdroprewardsTsv = sqliteTable('musicdroprewards.tsv', {
  f87D44F82: integer('F87d44f82'),
  f3Da70Ed1: integer('F3da70ed1'),
  f6Bad54A9: integer('F6bad54a9'),
  fbcde7730: text('Fbcde7730'),
  fd45Abf1C: text('Fd45abf1c')
});

export const loginBonuses = sqliteTable('LoginBonuses', {
  id: integer('Id').primaryKey(),
  name: text('Name'),
  loginBonusRewardSeriesId: integer('LoginBonusRewardSeriesID'),
  isLoop: integer('IsLoop'),
  loginBonusTextId: text('LoginBonusTextId'),
  startTime: text('StartTime'),
  endTime: text('EndTime')
});

export const helpImages = sqliteTable('HelpImages', {
  id: integer('Id').primaryKey(),
  name: text('Name'),
  scene: integer('Scene'),
  orderId: integer('OrderId'),
  titleTextId: integer('TitleTextId')
});

export const musicdroprewarddetailsTsv = sqliteTable('musicdroprewarddetails.tsv', {
  f987B199D: integer('F987b199d'),
  f8B6E5259: integer('F8b6e5259'),
  fc7E3Dd4F: integer('Fc7e3dd4f'),
  f8B325A53: integer('F8b325a53'),
  fe51D8E4B: integer('Fe51d8e4b'),
  f0Cab07Ea: integer('F0cab07ea'),
  fe88A5F5C: integer('Fe88a5f5c')
});

export const costumeModels = sqliteTable('CostumeModels', {
  id: integer('Id').primaryKey(),
  label: text('Label'),
  charactersId: integer('CharactersId'),
  costumesId: integer('CostumesId'),
  hairStyleId: integer('HairStyleId')
});

export const centerattributesTsv = sqliteTable('centerattributes.tsv', {
  f45B078F4: integer('F45b078f4'),
  f2430Ed9C: integer('F2430ed9c'),
  f67831650: text('F67831650'),
  f2F114C3D: text('F2f114c3d'),
  fd29F2B78: integer('Fd29f2b78'),
  fd8B0251F: text('Fd8b0251f')
});

export const campaignaddrewardsTsv = sqliteTable('campaignaddrewards.tsv', {
  f2477Edb5: integer('F2477edb5'),
  fd7F722Aa: integer('Fd7f722aa'),
  fdfb49F08: integer('Fdfb49f08'),
  fcf4Abf2A: integer('Fcf4abf2a'),
  fa1B46B2B: integer('Fa1b46b2b'),
  f989A6E79: integer('F989a6e79'),
  f4074B699: integer('F4074b699')
});

export const sectionSkillEffectDetails = sqliteTable('SectionSkillEffectDetails', {
  id: integer('Id').primaryKey(),
  skillEffectDetailType: text('SkillEffectDetailType'),
  targetMood: integer('TargetMood'),
  effectValue: integer('EffectValue')
});

export const cardSkillEffects = sqliteTable('CardSkillEffects', {
  id: integer('Id').primaryKey(),
  actionType: integer('ActionType'),
  orderId: integer('OrderId')
});

export const musicLearningQuestStages = sqliteTable('MusicLearningQuestStages', {
  id: integer('Id').primaryKey(),
  learningLiveSeriesId: integer('LearningLiveSeriesId'),
  name: text('Name'),
  description: text('Description'),
  hint: text('Hint'),
  stageType: integer('StageType'),
  useType: integer('UseType'),
  useItem: integer('UseItem'),
  useNum: integer('UseNum'),
  liveStagesId: integer('LiveStagesId'),
  questMusicsType: integer('QuestMusicsType'),
  questMusicsDetail: integer('QuestMusicsDetail'),
  deckRestrictedType: integer('DeckRestrictedType'),
  deckRestrictedDetail: integer('DeckRestrictedDetail'),
  questLevel: integer('QuestLevel'),
  questRank: integer('QuestRank'),
  firstClearRewardSeriesId: integer('FirstClearRewardSeriesId'),
  dropRewardSeriesId: integer('DropRewardSeriesId'),
  randomDropRewardSeriesId: integer('RandomDropRewardSeriesId'),
  score1: integer('Score1'),
  gainStylePoint: integer('GainStylePoint'),
  gainMusicExp: integer('GainMusicExp'),
  f71De3065: integer('F71de3065'),
  f64940Ef0: text('F64940ef0'),
  f348F68F2: text('F348f68f2')
});

export const missionAchieveRewards = sqliteTable('MissionAchieveRewards', {
  id: integer('Id').primaryKey(),
  missionType: integer('MissionType'),
  achieveMarkNum: integer('AchieveMarkNum'),
  rewardType: integer('RewardType'),
  itemsId: integer('ItemsId'),
  rewardNum: integer('RewardNum'),
  rewardTextId: integer('RewardTextId'),
  sortOrder: integer('SortOrder')
});

export const dailyLiveReleaseConditions = sqliteTable('DailyLiveReleaseConditions', {
  id: integer('Id').primaryKey(),
  releaseDailyLivesId: integer('ReleaseDailyLivesId'),
  conditionsType: integer('ConditionsType'),
  conditionsValue: integer('ConditionsValue'),
  startTime: text('StartTime'),
  endTime: text('EndTime')
});

export const graderewardsTsv = sqliteTable('graderewards.tsv', {
  fd418F1B5: integer('Fd418f1b5'),
  f3895390D: integer('F3895390d')
});

export const dreamLiveReleaseConditions = sqliteTable('DreamLiveReleaseConditions', {
  id: integer('Id').primaryKey(),
  releaseDreamLiveId: integer('ReleaseDreamLiveId'),
  conditionsType: integer('ConditionsType'),
  conditionsValue: integer('ConditionsValue'),
  startTime: text('StartTime'),
  endTime: text('EndTime')
});

export const cardSkillEffectDetails = sqliteTable('CardSkillEffectDetails', {
  id: integer('Id').primaryKey(),
  skillEffectDetailType: text('SkillEffectDetailType'),
  targetMood: integer('TargetMood'),
  effectValue: integer('EffectValue')
});

export const grandPrixRewardDatas = sqliteTable('GrandPrixRewardDatas', {
  id: integer('Id').primaryKey(),
  grandPrixRewardsId: integer('GrandPrixRewardsId'),
  rewardType: integer('RewardType'),
  rewardItemId: integer('RewardItemId'),
  rewardNum: integer('RewardNum'),
  isEmphasize: integer('IsEmphasize'),
  isUsePresentBox: integer('IsUsePresentBox'),
  lifeTimeDay: integer('LifeTimeDay'),
  rewardTextId: integer('RewardTextId')
});

export const rhythmgametotalmissionsTsv = sqliteTable('rhythmgametotalmissions.tsv', {
  f052A9927: integer('F052a9927'),
  ffea05E02: text('Ffea05e02'),
  f21Fa2Ca5: integer('F21fa2ca5'),
  fd7227267: integer('Fd7227267'),
  fd0Ef7828: text('Fd0ef7828'),
  f96941Bf7: text('F96941bf7')
});

export const centerattributeeffectsTsv = sqliteTable('centerattributeeffects.tsv', {
  f175E6Edb: integer('F175e6edb'),
  f9Cafdaca: integer('F9cafdaca'),
  f24649A7B: integer('F24649a7b')
});

export const centerskillconditionsTsv = sqliteTable('centerskillconditions.tsv', {
  fe5B639F6: integer('Fe5b639f6'),
  f80C30D1A: integer('F80c30d1a'),
  fa2Ab2478: integer('Fa2ab2478'),
  f44A9Ec27: integer('F44a9ec27')
});

export const limitbreakmaterialconvertrateTsv = sqliteTable('limitbreakmaterialconvertrate.tsv', {
  fda917381: integer('Fda917381'),
  f6665C2Db: integer('F6665c2db'),
  f985B407A: integer('F985b407a'),
  fdd6D8B1D: integer('Fdd6d8b1d'),
  fbed3Bd45: integer('Fbed3bd45'),
  fb19Fa15F: integer('Fb19fa15f')
});

export const liveItems = sqliteTable('LiveItems', {
  id: integer('Id').primaryKey(),
  label: text('Label'),
  bindBoneId: integer('BindBoneId'),
  posesId: integer('PosesId')
});

export const rhythmgameclassesTsv = sqliteTable('rhythmgameclasses.tsv', {
  fe53A510F: integer('Fe53a510f'),
  f215D58C6: text('F215d58c6'),
  f7E443D25: integer('F7e443d25')
});

export const seasongraderewarddatasTsv = sqliteTable('seasongraderewarddatas.tsv', {
  fcfefd1F8: integer('Fcfefd1f8'),
  fa213480B: integer('Fa213480b'),
  facdee5F2: integer('Facdee5f2'),
  ff25B5905: integer('Ff25b5905'),
  fb374C71B: integer('Fb374c71b'),
  f7446E815: integer('F7446e815')
});

export const gradequestsquaredatasTsv = sqliteTable('gradequestsquaredatas.tsv', {
  f3399Cd6C: integer('F3399cd6c'),
  f1Bd3C1Af: text('F1bd3c1af'),
  f967Eac4D: integer('F967eac4d'),
  fd50E2D75: integer('Fd50e2d75'),
  f39Eaa0D8: integer('F39eaa0d8'),
  f80Cc3Ba9: integer('F80cc3ba9')
});

export const customComplementMaterials = sqliteTable('CustomComplementMaterials', {
  id: integer('Id').primaryKey(),
  name: text('Name'),
  orderId: integer('OrderId'),
  startTime: text('StartTime'),
  endTime: text('EndTime')
});

export const standardQuestAreas = sqliteTable('StandardQuestAreas', {
  id: integer('Id').primaryKey(),
  name: text('Name'),
  number: integer('Number'),
  description: text('Description'),
  orderId: integer('OrderId'),
  imageType: integer('ImageType'),
  bgImageId: integer('BgImageId'),
  soundId: integer('SoundId'),
  generationsId: integer('GenerationsId'),
  startTime: text('StartTime'),
  endTime: text('EndTime')
});

export const musicMasteryMentalBonuses = sqliteTable('MusicMasteryMentalBonuses', {
  id: integer('Id').primaryKey(),
  level: integer('Level'),
  demandDamagePt: integer('DemandDamagePt')
});

export const gradeaddskilleffectdetailsTsv = sqliteTable('gradeaddskilleffectdetails.tsv', {
  f65Bf439B: integer('F65bf439b'),
  f49F62C6B: text('F49f62c6b'),
  f36E2Ec14: integer('F36e2ec14'),
  f0E3B216A: integer('F0e3b216a')
});

export const gpprizeexchangesTsv = sqliteTable('gpprizeexchanges.tsv', {
  f463F12Cd: integer('F463f12cd'),
  f31317A03: integer('F31317a03'),
  f08Eda1E3: integer('F08eda1e3'),
  f8E9C999E: integer('F8e9c999e'),
  f52655210: integer('F52655210'),
  f24C58A50: integer('F24c58a50'),
  fdcd85383: integer('Fdcd85383'),
  f2Ca610E5: integer('F2ca610e5'),
  f85Ca437A: integer('F85ca437a'),
  f4Ea7E17E: integer('F4ea7e17e'),
  f2F781624: text('F2f781624'),
  f40C87Eb5: text('F40c87eb5')
});

export const tablistTsv = sqliteTable('tablist.tsv', {
  fed4097B6: integer('Fed4097b6'),
  fd9906F0E: text('Fd9906f0e')
});

export const styleVoices = sqliteTable('StyleVoices', {
  id: integer('Id').primaryKey(),
  cardSeriesId: integer('CardSeriesId'),
  name: text('Name'),
  priority: integer('Priority'),
  voiceName: text('VoiceName'),
  releaseConditionText: text('ReleaseConditionText')
});

export const cardLimitBreakMaterials = sqliteTable('CardLimitBreakMaterials', {
  id: integer('Id').primaryKey(),
  cardSeriesId: integer('CardSeriesId'),
  limitBreakTimes: integer('LimitBreakTimes'),
  costItemsId: integer('CostItemsId'),
  costNum: integer('CostNum')
});

export const stageskilleffectdetailsTsv = sqliteTable('stageskilleffectdetails.tsv', {
  f66853F76: integer('F66853f76'),
  f9C4405A3: integer('F9c4405a3'),
  f78C7D356: text('F78c7d356'),
  fb43A4Bbb: integer('Fb43a4bbb')
});

export const musicLearningQuestSeries = sqliteTable('MusicLearningQuestSeries', {
  id: integer('Id').primaryKey(),
  musicsId: integer('MusicsId'),
  name: text('Name'),
  startTime: text('StartTime'),
  endTime: text('EndTime'),
  f534F050C: integer('F534f050c')
});

export const eventLoginBonuses = sqliteTable('EventLoginBonuses', {
  id: integer('Id').primaryKey(),
  name: text('Name'),
  loginBonusRewardSeriesId: integer('LoginBonusRewardSeriesId'),
  eventLoginBonusType: integer('EventLoginBonusType'),
  loginBonusTextId: text('LoginBonusTextId'),
  startTime: text('StartTime'),
  endTime: text('EndTime')
});

export const raidresourcerecoverydatasTsv = sqliteTable('raidresourcerecoverydatas.tsv', {
  f39E693C6: integer('F39e693c6'),
  f7Da637D3: integer('F7da637d3'),
  f6A0Bbca0: integer('F6a0bbca0'),
  ffb542828: integer('Ffb542828'),
  ff8A3934F: integer('Ff8a3934f'),
  f510C386F: integer('F510c386f')
});

export const petalExchangeRates = sqliteTable('PetalExchangeRates', {
  id: integer('Id').primaryKey(),
  rarity: integer('Rarity'),
  price: integer('Price'),
  exchangeLimitLower: integer('ExchangeLimitLower'),
  exchangeLimitUpper: integer('ExchangeLimitUpper')
});

export const grandprixdailypointsTsv = sqliteTable('grandprixdailypoints.tsv', {
  f6426Ef2B: integer('F6426ef2b'),
  fa4A24Ab1: integer('Fa4a24ab1'),
  fa751Aafe: integer('Fa751aafe'),
  fb24B4E64: integer('Fb24b4e64'),
  fa4Dcb47F: integer('Fa4dcb47f')
});

export const advalbumsTsv = sqliteTable('advalbums.tsv', {
  f5Ceda8F0: integer('F5ceda8f0'),
  f910C7967: text('F910c7967'),
  f5596B7F9: text('F5596b7f9')
});

export const gradequestseriesTsv = sqliteTable('gradequestseries.tsv', {
  f7A0D560D: integer('F7a0d560d'),
  f00E89811: text('F00e89811'),
  f4C4Cbdc6: integer('F4c4cbdc6'),
  fe7D88Ece: integer('Fe7d88ece'),
  f4F7E83Cf: integer('F4f7e83cf'),
  f1Cd06C8F: text('F1cd06c8f'),
  f6Ac48Fc0: integer('F6ac48fc0'),
  f234090Eb: integer('F234090eb'),
  f1C7E5752: text('F1c7e5752'),
  ff6A900Fd: integer('Ff6a900fd'),
  f0C3F8981: integer('F0c3f8981'),
  f16B06D2A: text('F16b06d2a'),
  fe9B71105: text('Fe9b71105')
});

export const gradequestseriesreleasecondTsv = sqliteTable('gradequestseriesreleasecond.tsv', {
  f16763528: integer('F16763528'),
  f9726F06B: integer('F9726f06b'),
  fbf0B9446: integer('Fbf0b9446'),
  fc049F13E: integer('Fc049f13e'),
  ffaa79F80: text('Ffaa79f80'),
  f58E94A86: text('F58e94a86')
});

export const rhythmgameclassmissionrewardsTsv = sqliteTable('rhythmgameclassmissionrewards.tsv', {
  f57F29351: integer('F57f29351'),
  fbdacae86: integer('Fbdacae86'),
  f94760091: integer('F94760091'),
  f6Ceb4F3E: integer('F6ceb4f3e'),
  fc35360B9: integer('Fc35360b9'),
  fc51Adc32: integer('Fc51adc32')
});

export const cardskilleffectdetailparamsTsv = sqliteTable('cardskilleffectdetailparams.tsv', {
  f24958Ec9: integer('F24958ec9'),
  f4A3393C3: text('F4a3393c3'),
  f5D6Ebe96: text('F5d6ebe96')
});

export const commonmissionsTsv = sqliteTable('commonmissions.tsv', {
  fae2B1671: integer('Fae2b1671'),
  fa1545858: integer('Fa1545858'),
  fc73Bd859: integer('Fc73bd859'),
  fd5E55C3B: integer('Fd5e55c3b'),
  f3D18984B: integer('F3d18984b'),
  f997Ae174: integer('F997ae174'),
  fd5972973: text('Fd5972973'),
  f97157Ebf: text('F97157ebf')
});

export const liveTimelinesEvol = sqliteTable('LiveTimelinesEvol', {
  id: integer('Id').primaryKey(),
  label: text('Label'),
  musicId: integer('MusicId'),
  locationsId: integer('LocationsId'),
  freeId: integer('FreeId'),
  nextId: integer('NextId'),
  fc29E839E: text('Fc29e839e')
});

export const gradequestseasonTsv = sqliteTable('gradequestseason.tsv', {
  f727Cd310: integer('F727cd310'),
  f62568Bd3: text('F62568bd3'),
  f38C5139B: integer('F38c5139b'),
  f609172D0: integer('F609172d0'),
  fc17C5015: integer('Fc17c5015'),
  f5Fc2F4Df: text('F5fc2f4df'),
  f36Aa8C50: text('F36aa8c50')
});

export const gradequestrewardsTsv = sqliteTable('gradequestrewards.tsv', {
  f5F39F1Ac: integer('F5f39f1ac'),
  f3Cdf67F9: integer('F3cdf67f9'),
  fb1B284Ff: integer('Fb1b284ff'),
  fd03A765A: integer('Fd03a765a'),
  fd4279C93: integer('Fd4279c93'),
  f73075B6F: integer('F73075b6f'),
  f201B8D06: text('F201b8d06'),
  f3Abbdccd: integer('F3abbdccd')
});

export const campaignaddrewardseriesTsv = sqliteTable('campaignaddrewardseries.tsv', {
  fb86425A8: integer('Fb86425a8'),
  f854B7Fc1: integer('F854b7fc1'),
  f1C422E7B: integer('F1c422e7b'),
  f6B451Eed: integer('F6b451eed')
});

export const dailyQuestStages = sqliteTable('DailyQuestStages', {
  id: integer('Id').primaryKey(),
  dailyQuestSeriesId: integer('DailyQuestSeriesId'),
  name: text('Name'),
  description: text('Description'),
  hint: text('Hint'),
  stageType: integer('StageType'),
  useType: integer('UseType'),
  useItem: integer('UseItem'),
  useNum: integer('UseNum'),
  liveStagesId: integer('LiveStagesId'),
  questMusicsType: integer('QuestMusicsType'),
  questMusicsDetail: integer('QuestMusicsDetail'),
  deckRestrictedType: integer('DeckRestrictedType'),
  deckRestrictedDetail: integer('DeckRestrictedDetail'),
  questLevel: integer('QuestLevel'),
  questRank: integer('QuestRank'),
  firstClearRewardSeriesId: integer('FirstClearRewardSeriesId'),
  completeRewardSeriesId: integer('CompleteRewardSeriesId'),
  dropRewardSeriesId: integer('DropRewardSeriesId'),
  randomDropRewardSeriesId: integer('RandomDropRewardSeriesId'),
  score1: integer('Score1'),
  score2: integer('Score2'),
  score3: integer('Score3'),
  gainStylePoint: integer('GainStylePoint'),
  gainMusicExp: integer('GainMusicExp'),
  f2E5Db975: integer('F2e5db975')
});

export const grandPrixRewards = sqliteTable('GrandPrixRewards', {
  id: integer('Id').primaryKey(),
  grandPrixesId: integer('GrandPrixesId'),
  grandPrixRewardType: integer('GrandPrixRewardType'),
  minTargetNum: integer('MinTargetNum'),
  maxTargetNum: integer('MaxTargetNum'),
  f68330Ba1: integer('F68330ba1')
});

export const tutorialSchoolIdolStageMovies = sqliteTable('TutorialSchoolIdolStageMovies', {
  id: integer('Id').primaryKey(),
  title: text('Title'),
  orderId: integer('OrderId')
});

export const musicMasteryVoltageBonuses = sqliteTable('MusicMasteryVoltageBonuses', {
  id: integer('Id').primaryKey(),
  level: integer('Level'),
  demandVoltagePt: integer('DemandVoltagePt')
});

export const stageskilleffectsTsv = sqliteTable('stageskilleffects.tsv', {
  f64D2Dbb7: integer('F64d2dbb7'),
  fb01Bd308: integer('Fb01bd308')
});

export const musicMasteryHeartBonuses = sqliteTable('MusicMasteryHeartBonuses', {
  id: integer('Id').primaryKey(),
  level: integer('Level'),
  loveRate: integer('LoveRate')
});

export const musicscorerewardsTsv = sqliteTable('musicscorerewards.tsv', {
  f3506D67F: integer('F3506d67f'),
  fb4C4F1C0: integer('Fb4c4f1c0'),
  fc67E89E9: integer('Fc67e89e9'),
  fdfb2Aeb8: integer('Fdfb2aeb8'),
  f46Bbff02: integer('F46bbff02'),
  f31Bccf94: integer('F31bccf94'),
  fafd85A37: integer('Fafd85a37'),
  fb779D2Ac: integer('Fb779d2ac'),
  f2E708316: integer('F2e708316'),
  f5977B380: integer('F5977b380'),
  fc7132623: integer('Fc7132623')
});

export const ingamemissionskilldetailsTsv = sqliteTable('ingamemissionskilldetails.tsv', {
  f27814Bda: integer('F27814bda'),
  f8Ee69Fbf: integer('F8ee69fbf'),
  f71F0Bb1C: integer('F71f0bb1c'),
  f45Ef1Eb5: integer('F45ef1eb5'),
  f7667F852: integer('F7667f852'),
  fef6Ea9E8: integer('Fef6ea9e8'),
  fa63A84E0: integer('Fa63a84e0'),
  f3C555Cd1: integer('F3c555cd1'),
  f3059Cf38: integer('F3059cf38'),
  f61A3066A: integer('F61a3066a'),
  ff2Baee5B: text('Ff2baee5b')
});

export const raidquestreleaseconditionTsv = sqliteTable('raidquestreleasecondition.tsv', {
  f0D7B30D4: integer('F0d7b30d4'),
  fc7A36346: integer('Fc7a36346'),
  f54B0Cc8D: integer('F54b0cc8d'),
  fcc14515E: integer('Fcc14515e'),
  f763C4Ab1: text('F763c4ab1'),
  f431D5F21: text('F431d5f21')
});

export const subCharacters = sqliteTable('SubCharacters', {
  id: integer('Id').primaryKey(),
  label: text('Label')
});

export const raidqueststagesTsv = sqliteTable('raidqueststages.tsv', {
  ff88E5D5A: integer('Ff88e5d5a'),
  fd785B20B: integer('Fd785b20b'),
  f62C00889: text('F62c00889'),
  f1B48Cef7: text('F1b48cef7'),
  f082575Dc: text('F082575dc'),
  f502C4504: integer('F502c4504'),
  fc6C21C54: integer('Fc6c21c54'),
  f7B0Ac729: integer('F7b0ac729'),
  f16E75E06: integer('F16e75e06'),
  f45C66563: integer('F45c66563'),
  fe7770C22: integer('Fe7770c22'),
  f314B458D: integer('F314b458d'),
  f78Cb7Ebe: integer('F78cb7ebe'),
  f11B1512C: integer('F11b1512c'),
  f103B8B0F: integer('F103b8b0f'),
  f43C4987A: integer('F43c4987a'),
  f5E4C2267: integer('F5e4c2267'),
  ffd64A651: integer('Ffd64a651'),
  f9Aff7B8C: integer('F9aff7b8c'),
  f03F62A36: integer('F03f62a36'),
  f74F11Aa0: integer('F74f11aa0'),
  f34029C8A: integer('F34029c8a'),
  f03C9E6B7: integer('F03c9e6b7')
});

export const itemexchangecategorydatasTsv = sqliteTable('itemexchangecategorydatas.tsv', {
  f4728Cb53: integer('F4728cb53'),
  fe9C45Dfa: text('Fe9c45dfa'),
  f9790E5A5: integer('F9790e5a5')
});

export const dreamQuestStages = sqliteTable('DreamQuestStages', {
  id: integer('Id').primaryKey(),
  dreamQuestSeriesId: integer('DreamQuestSeriesId'),
  name: text('Name'),
  description: text('Description'),
  hint: text('Hint'),
  stageType: integer('StageType'),
  useType: integer('UseType'),
  useItem: integer('UseItem'),
  useNum: integer('UseNum'),
  liveStagesId: integer('LiveStagesId'),
  questMusicsType: integer('QuestMusicsType'),
  questMusicsDetail: integer('QuestMusicsDetail'),
  deckRestrictedType: integer('DeckRestrictedType'),
  deckRestrictedDetail: integer('DeckRestrictedDetail'),
  firstClearRewardSeriesId: integer('FirstClearRewardSeriesId'),
  dropRewardSeriesId: integer('DropRewardSeriesId'),
  randomDropRewardSeriesId: integer('RandomDropRewardSeriesId'),
  score1: integer('Score1')
});

export const cardRarities = sqliteTable('CardRarities', {
  id: integer('Id').primaryKey(),
  rarityName: text('RarityName'),
  f29Ee5125: integer('F29ee5125'),
  fc62C3A1B: integer('Fc62c3a1b'),
  f2D1B8118: integer('F2d1b8118'),
  fc2D9Ea26: integer('Fc2d9ea26'),
  f2005F15F: integer('F2005f15f'),
  f23Ace991: integer('F23ace991'),
  ff8Fd2423: integer('Ff8fd2423')
});

export const shops = sqliteTable('Shops', {
  id: integer('Id').primaryKey(),
  shopType: integer('ShopType'),
  name: text('Name'),
  orderId: integer('OrderId')
});

export const raidquestdroprateupTsv = sqliteTable('raidquestdroprateup.tsv', {
  f482D1A19: integer('F482d1a19'),
  f512C70Df: text('F512c70df'),
  ffa3E791F: integer('Ffa3e791f')
});

export const musicLevels = sqliteTable('MusicLevels', {
  id: integer('Id').primaryKey(),
  experienceType: integer('ExperienceType'),
  level: integer('Level'),
  experience: integer('Experience'),
  cumulativeExperience: integer('CumulativeExperience')
});

export const launcherbannersTsv = sqliteTable('launcherbanners.tsv', {
  fe2Dc01Cd: integer('Fe2dc01cd'),
  f725Bad03: integer('F725bad03'),
  f87147961: integer('F87147961'),
  f0747554C: text('F0747554c'),
  f63Ab91D0: text('F63ab91d0')
});

export const homeBgms = sqliteTable('HomeBgms', {
  id: integer('Id').primaryKey(),
  daytimeBgmId: integer('DaytimeBgmId'),
  nighttimeBgmId: integer('NighttimeBgmId'),
  startTime: text('StartTime'),
  endTime: text('EndTime')
});

export const graderewarddatasTsv = sqliteTable('graderewarddatas.tsv', {
  fa1062Cd8: integer('Fa1062cd8'),
  fcc22F961: integer('Fcc22f961'),
  f47485Fdb: integer('F47485fdb'),
  f9Da977Ea: integer('F9da977ea'),
  f2Bf8D1De: integer('F2bf8d1de')
});

export const gradechalqueststagerewarddatasTsv = sqliteTable('gradechalqueststagerewarddatas.tsv', {
  fee5837C5: integer('Fee5837c5'),
  fc30060Bc: integer('Fc30060bc'),
  f2908150A: integer('F2908150a'),
  f9383457A: integer('F9383457a'),
  f00B4E749: integer('F00b4e749'),
  fc27D1Ef7: integer('Fc27d1ef7')
});

export const giftlessGachas = sqliteTable('GiftlessGachas', {
  id: integer('Id').primaryKey(),
  singleGachaPrice: integer('SingleGachaPrice'),
  singleGachaPopId: integer('SingleGachaPopId'),
  consectiveGachaPrice: integer('ConsectiveGachaPrice'),
  consectiveGachaTimes: integer('ConsectiveGachaTimes'),
  consectiveGachaPopId: integer('ConsectiveGachaPopId'),
  paidSisCaOnlyGachaFlag: integer('PaidSIsCaOnlyGachaFlag'),
  paidSisCaOnlyGachaPrice: integer('PaidSIsCaOnlyGachaPrice'),
  paidSisCaOnlyGachaTimes: integer('PaidSIsCaOnlyGachaTimes'),
  paidSisCaOnlyGachaPointFlag: integer('PaidSIsCaOnlyGachaPointFlag'),
  paidSisCaOnlyGachaaPopId: integer('PaidSIsCaOnlyGachaaPopId'),
  fabd8824D: integer('Fabd8824d'),
  f8Caa0D6D: integer('F8caa0d6d'),
  f06C2750A: integer('F06c2750a'),
  f79821252: integer('F79821252')
});

export const memberMovies = sqliteTable('MemberMovies', {
  id: integer('Id').primaryKey(),
  charactersId: integer('CharactersId'),
  movieType: integer('MovieType'),
  name: text('Name'),
  priority: integer('Priority'),
  releaseConditionText: text('ReleaseConditionText')
});

export const raidresourceadddateTsv = sqliteTable('raidresourceadddate.tsv', {
  f8E1Ddabc: integer('F8e1ddabc'),
  fda77A316: integer('Fda77a316'),
  f40Ca8E46: integer('F40ca8e46'),
  f5Abdb99E: text('F5abdb99e')
});

export const rhythmgamehelpimagesTsv = sqliteTable('rhythmgamehelpimages.tsv', {
  f71Be2A34: integer('F71be2a34'),
  f57Df230F: text('F57df230f'),
  fa0Acab23: integer('Fa0acab23'),
  f4Eecd29F: integer('F4eecd29f')
});

export const rhythmgameskillsTsv = sqliteTable('rhythmgameskills.tsv', {
  fedd96Baa: integer('Fedd96baa'),
  f658534Fe: integer('F658534fe'),
  fe491480E: text('Fe491480e'),
  fbcd3Ea61: integer('Fbcd3ea61'),
  f931E6C05: integer('F931e6c05'),
  fb3829Ee8: text('Fb3829ee8'),
  f932Af21A: integer('F932af21a'),
  f1664900F: integer('F1664900f'),
  f7B751386: text('F7b751386')
});

export const liveCharacters = sqliteTable('LiveCharacters', {
  id: integer('Id').primaryKey(),
  label: text('Label'),
  skeletonName: text('SkeletonName'),
  itemsIds: text('ItemsIds'),
  posesIds: text('PosesIds')
});

export const liveMusic = sqliteTable('LiveMusic', {
  id: integer('Id').primaryKey(),
  label: text('Label'),
  musicId: integer('MusicId'),
  haveMusic: integer('HaveMusic'),
  haveMotion: integer('HaveMotion'),
  charactersCount: integer('CharactersCount'),
  charactersIds: text('CharactersIds')
});

export const stageskillconditiondetailsTsv = sqliteTable('stageskillconditiondetails.tsv', {
  f94C2Caeb: integer('F94c2caeb'),
  f94984A62: integer('F94984a62'),
  f5C78A533: text('F5c78a533'),
  fe4Fa33Bf: integer('Fe4fa33bf')
});

export const itemexchangecategorylistTsv = sqliteTable('itemexchangecategorylist.tsv', {
  fd1A1F1Ce: integer('Fd1a1f1ce'),
  f1Abc0478: text('F1abc0478'),
  f3067Ee72: integer('F3067ee72'),
  f0440Fc5F: integer('F0440fc5f'),
  fe776D8F8: integer('Fe776d8f8')
});

export const seasonFanLevels = sqliteTable('SeasonFanLevels', {
  id: integer('Id').primaryKey(),
  seasonsId: integer('SeasonsId'),
  seasonFanLevel: integer('SeasonFanLevel'),
  experience: integer('Experience'),
  cumulativeExperience: integer('CumulativeExperience')
});

export const eventMissionSeries = sqliteTable('EventMissionSeries', {
  id: integer('Id').primaryKey(),
  name: text('Name'),
  description: text('Description'),
  grandPrixesId: integer('GrandPrixesId'),
  startTime: text('StartTime'),
  endTime: text('EndTime')
});

export const rhythmgameskillconditionsTsv = sqliteTable('rhythmgameskillconditions.tsv', {
  f64293575: integer('F64293575'),
  fb3D38A66: integer('Fb3d38a66'),
  ffb2B09E8: integer('Ffb2b09e8'),
  fb4Ffff4E: integer('Fb4ffff4e')
});

export const questSections = sqliteTable('QuestSections', {
  id: integer('Id').primaryKey(),
  sectionNo: integer('SectionNo'),
  questStagesId: integer('QuestStagesId'),
  sectionSkillsId: integer('SectionSkillsId')
});

export const cardDatas = sqliteTable('CardDatas', {
  id: integer('Id').primaryKey(),
  cardSeriesId: integer('CardSeriesId'),
  name: text('Name'),
  description: text('Description'),
  charactersId: integer('CharactersId'),
  rarity: integer('Rarity'),
  evolveTimes: integer('EvolveTimes'),
  cardLevelLimitAddition: integer('CardLevelLimitAddition'),
  style: integer('Style'),
  mood: integer('Mood'),
  experienceType: integer('ExperienceType'),
  initialSmile: integer('InitialSmile'),
  initialPure: integer('InitialPure'),
  initialCool: integer('InitialCool'),
  initialMental: integer('InitialMental'),
  maxSmile: integer('MaxSmile'),
  maxPure: integer('MaxPure'),
  maxCool: integer('MaxCool'),
  maxMental: integer('MaxMental'),
  beatPoint: integer('BeatPoint'),
  specialAppealSeriesId: integer('SpecialAppealSeriesId'),
  skillSeriesId: integer('SkillSeriesId'),
  attributeId: integer('AttributeId'),
  spineId: integer('SpineId'),
  f17B8B727: integer('F17b8b727'),
  fc2Fd110A: integer('Fc2fd110a'),
  f0E55D0E6: integer('F0e55d0e6'),
  f3Df64B9A: integer('F3df64b9a'),
  fdf846Da0: integer('Fdf846da0'),
  f257Ba05B: integer('F257ba05b')
});

export const centerskillsTsv = sqliteTable('centerskills.tsv', {
  f9C0B8Dcd: integer('F9c0b8dcd'),
  fffd4C5Be: integer('Fffd4c5be'),
  f8Dd61F96: text('F8dd61f96'),
  f9Dc9A4B5: integer('F9dc9a4b5'),
  ff3317055: integer('Ff3317055'),
  f2Feac97D: text('F2feac97d'),
  f097B035A: integer('F097b035a'),
  ffaea1F05: text('Ffaea1f05')
});

export const liveEventsEvol = sqliteTable('LiveEventsEvol', {
  id: integer('Id').primaryKey(),
  label: text('Label'),
  contentsType: integer('ContentsType'),
  locationsId: integer('LocationsId'),
  charactersIds: text('CharactersIds'),
  costumesIds: text('CostumesIds'),
  timelinesIds: text('TimelinesIds')
});

export const stageskillsetsTsv = sqliteTable('stageskillsets.tsv', {
  f30Fc26C1: integer('F30fc26c1'),
  f7D75F9C6: integer('F7d75f9c6'),
  f131E7948: integer('F131e7948')
});

export const rhythmgameskilleffectsTsv = sqliteTable('rhythmgameskilleffects.tsv', {
  f97Df5E5F: integer('F97df5e5f'),
  f94C0803F: integer('F94c0803f'),
  f2C77Bc0C: text('F2c77bc0c'),
  fe9Bbf3B2: integer('Fe9bbf3b2'),
  f3F53D75E: integer('F3f53d75e')
});

export const challengeModeEffectDetails = sqliteTable('ChallengeModeEffectDetails', {
  id: integer('Id').primaryKey(),
  effectDetailType: text('EffectDetailType'),
  targetMood: integer('TargetMood'),
  effectValue: integer('EffectValue')
});

export const tutorialRewardDatas = sqliteTable('TutorialRewardDatas', {
  id: integer('Id').primaryKey(),
  tutorialsId: integer('TutorialsId'),
  rewardType: integer('RewardType'),
  rewardItemId: integer('RewardItemId'),
  rewardNum: integer('RewardNum'),
  lifeTimeDay: integer('LifeTimeDay'),
  rewardTextId: integer('RewardTextId')
});

export const gradechaltotalscorerewarddatasTsv = sqliteTable('gradechaltotalscorerewarddatas.tsv', {
  f142D4146: integer('F142d4146'),
  fa7Cf0052: integer('Fa7cf0052'),
  f226Fa6Ac: integer('F226fa6ac'),
  f39B6B744: integer('F39b6b744'),
  fbcd86086: integer('Fbcd86086'),
  fc6068879: integer('Fc6068879')
});

export const emojicategoryTsv = sqliteTable('emojicategory.tsv', {
  f58D76B2E: integer('F58d76b2e'),
  fe62981Bb: text('Fe62981bb'),
  f44540Da0: integer('F44540da0'),
  f997F5A15: text('F997f5a15'),
  f4A3B926B: text('F4a3b926b')
});

export const gradechalqueststagesTsv = sqliteTable('gradechalqueststages.tsv', {
  ff44F39E0: integer('Ff44f39e0'),
  f966B4A50: integer('F966b4a50'),
  f3635E73B: text('F3635e73b'),
  f8F0B7Ef1: text('F8f0b7ef1'),
  f5Cd09A6E: text('F5cd09a6e'),
  fb819Ae24: integer('Fb819ae24'),
  f82C7869E: integer('F82c7869e'),
  f4F013F25: integer('F4f013f25'),
  fe51Fc767: integer('Fe51fc767'),
  f92Fd21Ac: integer('F92fd21ac'),
  fdae4B451: integer('Fdae4b451'),
  ff0E36995: integer('Ff0e36995'),
  fb31C7E07: integer('Fb31c7e07'),
  f67B3D111: integer('F67b3d111')
});

export const dreamliveserieslistTsv = sqliteTable('dreamliveserieslist.tsv', {
  f54493533: integer('F54493533'),
  faea45333: integer('Faea45333'),
  f461E8B8E: integer('F461e8b8e'),
  f8D12E855: text('F8d12e855'),
  fa2A1633F: text('Fa2a1633f')
});

export const cardSkillSeries = sqliteTable('CardSkillSeries', {
  id: integer('Id').primaryKey(),
  name: text('Name'),
  skillIcon: integer('SkillIcon'),
  skillMainEffect: integer('SkillMainEffect'),
  f896Dfbb8: integer('F896dfbb8')
});

export const eventMissionAchieveRewards = sqliteTable('EventMissionAchieveRewards', {
  id: integer('Id').primaryKey(),
  evemtMissionSeriesId: integer('EvemtMissionSeriesId'),
  achieveMarkNum: integer('AchieveMarkNum'),
  rewardCategory: integer('RewardCategory'),
  rewardType: integer('RewardType'),
  itemsId: integer('ItemsId'),
  rewardNum: integer('RewardNum'),
  rewardTextId: integer('RewardTextId'),
  sortOrder: integer('SortOrder')
});

export const selectTicketSeries = sqliteTable('SelectTicketSeries', {
  id: integer('Id').primaryKey(),
  exchangeTicketName: text('ExchangeTicketName'),
  description: text('Description'),
  exchangeTicketId: integer('ExchangeTicketId'),
  orderId: integer('OrderId'),
  pickUpCardSeriesId1: integer('PickUpCardSeriesId_1'),
  pickUpCardSeriesId2: integer('PickUpCardSeriesId_2'),
  pickUpCardSeriesId3: integer('PickUpCardSeriesId_3'),
  pickUpCardSeriesId4: integer('PickUpCardSeriesId_4'),
  pickUpCardSeriesId5: integer('PickUpCardSeriesId_5'),
  pickUpCardSeriesId6: integer('PickUpCardSeriesId_6'),
  bgType: integer('BgType'),
  startTime: text('StartTime'),
  endTime: text('EndTime'),
  fbc8752A1: integer('Fbc8752a1')
});

export const advDatas = sqliteTable('AdvDatas', {
  id: integer('Id').primaryKey(),
  advSeriesId: integer('AdvSeriesId'),
  name: text('Name'),
  description: text('Description'),
  scriptId: integer('ScriptId'),
  openSeasonFanLevel: integer('OpenSeasonFanLevel'),
  rewardType: text('RewardType'),
  watchRewardId: text('WatchRewardId'),
  watchRewardNum: text('WatchRewardNum'),
  rewardTextId: text('RewardTextId'),
  orderId: integer('OrderId'),
  subTitleName: text('SubTitleName'),
  startTime: text('StartTime'),
  endTime: text('EndTime'),
  fc6637Ea8: integer('Fc6637ea8')
});

export const cardGetMovieSettings = sqliteTable('CardGetMovieSettings', {
  id: integer('Id').primaryKey(),
  cardInfoPositionType: integer('CardInfoPositionType'),
  cardInfoDisplayStartTimeSeconds: integer('CardInfoDisplayStartTimeSeconds'),
  urCardEffectBackgroundId: integer('UrCardEffectBackgroundId')
});

export const learningLiveReleaseConditions = sqliteTable('LearningLiveReleaseConditions', {
  id: integer('Id').primaryKey(),
  releaseLearningLiveId: integer('ReleaseLearningLiveId'),
  conditionsType: integer('ConditionsType'),
  conditionsValue: integer('ConditionsValue'),
  startTime: text('StartTime'),
  endTime: text('EndTime')
});

export const tutorials = sqliteTable('Tutorials', {
  id: integer('Id').primaryKey(),
  tutorialType: integer('TutorialType'),
  step: integer('Step'),
  description: text('Description')
});

export const livePoses = sqliteTable('LivePoses', {
  id: integer('Id').primaryKey(),
  label: text('Label'),
  handSide: integer('HandSide')
});

export const seasongradeTsv = sqliteTable('seasongrade.tsv', {
  f94E2C96D: integer('F94e2c96d'),
  fc9F23057: text('Fc9f23057'),
  f070E4Eb1: text('F070e4eb1'),
  f2Debdb28: text('F2debdb28'),
  fcad5Cb2D: text('Fcad5cb2d'),
  f38309C06: text('F38309c06'),
  f7Bc3906C: text('F7bc3906c'),
  f53B18727: text('F53b18727')
});

export const gachaSeries = sqliteTable('GachaSeries', {
  id: integer('Id').primaryKey(),
  gachaSeriesName: text('GachaSeriesName'),
  description: text('Description'),
  gachaType: integer('GachaType'),
  limitedGachaCount: integer('LimitedGachaCount'),
  limitedGachaResetType: integer('LimitedGachaResetType'),
  gachaExchangePointId: integer('GachaExchangePointId'),
  exchangePointNoticeNum: integer('ExchangePointNoticeNum'),
  exchangePointLockFlag: integer('ExchangePointLockFlag'),
  orderId: integer('OrderId'),
  filterType: integer('FilterType'),
  pickUpCardSeriesId1: integer('PickUpCardSeriesId_1'),
  pickUpCardBonusItemQuantity1: integer('PickUpCardBonusItemQuantity_1'),
  pickUpCardSeriesId2: integer('PickUpCardSeriesId_2'),
  pickUpCardBonusItemQuantity2: integer('PickUpCardBonusItemQuantity_2'),
  pickUpCardSeriesId3: integer('PickUpCardSeriesId_3'),
  pickUpCardBonusItemQuantity3: integer('PickUpCardBonusItemQuantity_3'),
  pickUpCardSeriesId4: integer('PickUpCardSeriesId_4'),
  pickUpCardBonusItemQuantity4: integer('PickUpCardBonusItemQuantity_4'),
  pickUpCardSeriesId5: integer('PickUpCardSeriesId_5'),
  pickUpCardBonusItemQuantity5: integer('PickUpCardBonusItemQuantity_5'),
  pickUpCardSeriesId6: integer('PickUpCardSeriesId_6'),
  pickUpCardBonusItemQuantity6: integer('PickUpCardBonusItemQuantity_6'),
  bgType: integer('BgType'),
  startTime: text('StartTime'),
  endTime: text('EndTime'),
  ff88684B7: text('Ff88684b7'),
  f295E380E: integer('F295e380e'),
  f2884Ace0: integer('F2884ace0'),
  f7Ba681D9: integer('F7ba681d9')
});

export const gradequestrewardsdatasTsv = sqliteTable('gradequestrewardsdatas.tsv', {
  fccef246B: integer('Fccef246b'),
  fb1A96478: integer('Fb1a96478'),
  f7C37394E: integer('F7c37394e'),
  f354Ef6A7: integer('F354ef6a7'),
  f3Abe8Cfe: integer('F3abe8cfe')
});

export const exchangePointRate = sqliteTable('ExchangePointRate', {
  id: integer('Id').primaryKey(),
  exchangePointId: integer('ExchangePointId'),
  exchangeItemType: integer('ExchangeItemType'),
  exchangeItemId: integer('ExchangeItemId'),
  exchangeItemQuantity: integer('ExchangeItemQuantity'),
  exchangePrice: integer('ExchangePrice'),
  limitedCount: integer('LimitedCount'),
  startTime: text('StartTime'),
  endTime: text('EndTime'),
  f4B84D5E7: integer('F4b84d5e7'),
  f617E33De: integer('F617e33de')
});

export const raideventsTsv = sqliteTable('raidevents.tsv', {
  fe4Cc557F: integer('Fe4cc557f'),
  f84E84C1E: text('F84e84c1e'),
  fa74Bb41E: text('Fa74bb41e'),
  fff54Eda3: integer('Fff54eda3'),
  f5642D207: text('F5642d207'),
  f98Edcddf: text('F98edcddf'),
  fc5B09E8D: text('Fc5b09e8d'),
  f6239897A: text('F6239897a'),
  f07Bf56A7: text('F07bf56a7')
});

export const cardEvolutionMaterials = sqliteTable('CardEvolutionMaterials', {
  id: integer('Id').primaryKey(),
  costItemsId1: integer('CostItemsId1'),
  costNum1: integer('CostNum1'),
  costItemsId2: integer('CostItemsId2'),
  costNum2: integer('CostNum2'),
  costItemsId3: integer('CostItemsId3'),
  costNum3: integer('CostNum3')
});

export const deckMemberPositions = sqliteTable('DeckMemberPositions', {
  id: integer('Id').primaryKey(),
  generationsId: integer('GenerationsId'),
  charactersId: integer('CharactersId'),
  orderId: integer('OrderId'),
  startTime: text('StartTime'),
  endTime: text('EndTime')
});

export const questLiveDownloads = sqliteTable('QuestLiveDownloads', {
  id: integer('Id').primaryKey(),
  title: text('Title'),
  orderId: integer('OrderId'),
  startTime: text('StartTime'),
  endTime: text('EndTime')
});

export const musicscorerewarddatasTsv = sqliteTable('musicscorerewarddatas.tsv', {
  f86B89Fee: integer('F86b89fee'),
  fabc08Cf1: integer('Fabc08cf1'),
  f4656D10D: integer('F4656d10d'),
  f40Cbba4A: integer('F40cbba4a'),
  fee07019F: integer('Fee07019f')
});

export const grandPrixQuestSeries = sqliteTable('GrandPrixQuestSeries', {
  id: integer('Id').primaryKey(),
  name: text('Name'),
  description: text('Description'),
  grandPrixesId: integer('GrandPrixesId'),
  playLimitCount: integer('PlayLimitCount'),
  retireLimitCount: integer('RetireLimitCount'),
  orderId: integer('OrderId'),
  seriesNum: integer('SeriesNum'),
  startTime: text('StartTime'),
  endTime: text('EndTime')
});

export const unitCharacters = sqliteTable('UnitCharacters', {
  id: integer('Id').primaryKey(),
  unitsId: integer('UnitsId'),
  charactersId: integer('CharactersId'),
  orderId: integer('OrderId')
});

export const beginnermissionshintimagesTsv = sqliteTable('beginnermissionshintimages.tsv', {
  fbd2Dce34: integer('Fbd2dce34'),
  feb74Af78: integer('Feb74af78'),
  f653Bed61: integer('F653bed61')
});

export const centerskilleffectsTsv = sqliteTable('centerskilleffects.tsv', {
  ffcd420B7: integer('Ffcd420b7'),
  f36Eb0E8B: integer('F36eb0e8b'),
  f2515Afa9: integer('F2515afa9')
});

export const raidrewardsTsv = sqliteTable('raidrewards.tsv', {
  f68Bba507: integer('F68bba507'),
  f10704A19: integer('F10704a19'),
  fc7Aa1E4B: integer('Fc7aa1e4b'),
  fc2247D62: integer('Fc2247d62')
});

export const sectionSkills = sqliteTable('SectionSkills', {
  id: integer('Id').primaryKey(),
  description: text('Description'),
  apperanceType: integer('ApperanceType'),
  skillIcon: integer('SkillIcon'),
  sectionSkillsEffectId: text('SectionSkillsEffectId')
});

export const stickers = sqliteTable('Stickers', {
  id: integer('Id').primaryKey(),
  name: text('Name'),
  text: text('Text'),
  categoryType: integer('CategoryType'),
  categoryName: integer('CategoryName'),
  seasonId: integer('SeasonId'),
  charactersId: integer('CharactersId'),
  priority: integer('Priority'),
  isVariant: integer('IsVariant'),
  requirementType: integer('RequirementType'),
  requirementDetail: text('RequirementDetail'),
  requirementValue: integer('RequirementValue'),
  requirementText: text('RequirementText'),
  editRequirementType: integer('EditRequirementType'),
  editRequirementDetail: text('EditRequirementDetail'),
  editRequirementValue: integer('EditRequirementValue'),
  editRequirementText: text('EditRequirementText'),
  isVisibleOnlyPossess: integer('IsVisibleOnlyPossess'),
  startTime: text('StartTime'),
  endTime: text('EndTime'),
  availableStartTime: text('AvailableStartTime'),
  availableEndTime: text('AvailableEndTime'),
  variantStartTime: text('VariantStartTime'),
  variantEndTime: text('VariantEndTime')
});

export const musicscoresTsv = sqliteTable('musicscores.tsv', {
  fb44B3Ff9: integer('Fb44b3ff9'),
  fcc787C69: integer('Fcc787c69'),
  f0E9527Fa: integer('F0e9527fa'),
  f6E8B542A: integer('F6e8b542a'),
  ff24F5360: integer('Ff24f5360'),
  ff101Fbad: integer('Ff101fbad'),
  f89A0E79C: integer('F89a0e79c'),
  ffa34C59A: integer('Ffa34c59a'),
  f54715D7E: integer('F54715d7e'),
  fa2670946: integer('Fa2670946'),
  f3932E468: integer('F3932e468'),
  fe5191065: integer('Fe5191065'),
  f5170A113: integer('F5170a113'),
  f93F303D9: integer('F93f303d9'),
  f858E0951: integer('F858e0951'),
  f4Df52F35: integer('F4df52f35'),
  f39500E08: integer('F39500e08'),
  fee03A4D7: integer('Fee03a4d7'),
  fd7Ae8D40: integer('Fd7ae8d40')
});

export const units = sqliteTable('Units', {
  id: integer('Id').primaryKey(),
  unitName: text('UnitName'),
  orderId: integer('OrderId'),
  startTime: text('StartTime'),
  endTime: text('EndTime')
});

export const simulationGraphLimit = sqliteTable('SimulationGraphLimit', {
  id: integer('Id').primaryKey(),
  numberOfMember: integer('NumberOfMember'),
  upperLimitSmile: integer('UpperLimitSmile'),
  upperLimitPure: integer('UpperLimitPure'),
  upperLimitCool: integer('UpperLimitCool'),
  upperLimitMental: integer('UpperLimitMental'),
  upperLimitBp: integer('UpperLimitBP')
});

export const challengeModeEffects = sqliteTable('ChallengeModeEffects', {
  id: integer('Id').primaryKey(),
  standardQuestStagesId: integer('StandardQuestStagesId'),
  actionType: integer('ActionType'),
  orderId: integer('OrderId'),
  description: text('Description')
});

export const livemoviesTsv = sqliteTable('livemovies.tsv', {
  f40492F15: integer('F40492f15'),
  f1053Ab0D: text('F1053ab0d')
});

export const generations = sqliteTable('Generations', {
  id: integer('Id').primaryKey(),
  name: text('Name'),
  startTime: text('StartTime'),
  endTime: text('EndTime'),
  fd3775D1F: integer('Fd3775d1f'),
  f0F093696: integer('F0f093696')
});

export const rhythmgameclassdatasTsv = sqliteTable('rhythmgameclassdatas.tsv', {
  f227A9E92: integer('F227a9e92'),
  f638E1C31: text('F638e1c31'),
  f2C3A3D1E: integer('F2c3a3d1e'),
  fea741C56: integer('Fea741c56'),
  f86288421: integer('F86288421'),
  f3E6B834C: integer('F3e6b834c'),
  f24Ab516F: integer('F24ab516f'),
  f92467B13: text('F92467b13'),
  f0C6649A2: text('F0c6649a2')
});

export const cardSkills = sqliteTable('CardSkills', {
  id: integer('Id').primaryKey(),
  cardSkillSeriesId: integer('CardSkillSeriesId'),
  skillLevel: integer('SkillLevel'),
  skillCost: integer('SkillCost'),
  apperanceType: integer('ApperanceType'),
  cardSkillEffectId: text('CardSkillEffectId'),
  description: text('Description')
});

export const challengeModeStages = sqliteTable('ChallengeModeStages', {
  id: integer('Id').primaryKey(),
  challengeModeAreasId: integer('ChallengeModeAreasId'),
  correspondedQuestStageId: integer('CorrespondedQuestStageId'),
  name: text('Name'),
  description: text('Description'),
  hint: text('Hint'),
  mapNumber: integer('MapNumber'),
  stageType: integer('StageType'),
  useType: integer('UseType'),
  useItem: integer('UseItem'),
  useNum: integer('UseNum'),
  liveStagesId: integer('LiveStagesId'),
  questMusicsType: integer('QuestMusicsType'),
  questMusicsDetail: integer('QuestMusicsDetail'),
  deckRestrictedType: integer('DeckRestrictedType'),
  deckRestrictedDetail: integer('DeckRestrictedDetail'),
  challengeModeEffectId: integer('ChallengeModeEffectId'),
  questLevel: integer('QuestLevel'),
  firstClearRewardSeriesId: integer('FirstClearRewardSeriesId'),
  challengeModeScore: integer('ChallengeModeScore')
});

export const rhythmgameskilllvupitemsTsv = sqliteTable('rhythmgameskilllvupitems.tsv', {
  f5F11E0Dc: integer('F5f11e0dc'),
  f2Ccded19: integer('F2ccded19'),
  fcb410Bd3: integer('Fcb410bd3'),
  f6704D872: integer('F6704d872')
});

export const grandPrix = sqliteTable('GrandPrix', {
  id: integer('Id').primaryKey(),
  name: text('Name'),
  description: text('Description'),
  grandPrixType: integer('GrandPrixType'),
  guildRankingTabs: text('GuildRankingTabs'),
  personalRankingTabs: text('PersonalRankingTabs'),
  guildPresentCommentId: integer('GuildPresentCommentId'),
  personalPresentCommentId: integer('PersonalPresentCommentId'),
  infoStartTime: text('InfoStartTime'),
  infoEndTime: text('InfoEndTime'),
  startTime: text('StartTime'),
  endTime: text('EndTime')
});

export const gachaCampaigns = sqliteTable('GachaCampaigns', {
  id: integer('Id').primaryKey(),
  campaignName: text('CampaignName'),
  campaignType: integer('CampaignType'),
  consectiveTimesType: integer('ConsectiveTimesType'),
  resetType: integer('ResetType'),
  perDayCampaignTimes: integer('PerDayCampaignTimes'),
  gachaSeriesId1: integer('GachaSeriesId_1'),
  gachaSeriesId2: integer('GachaSeriesId_2'),
  gachaSeriesId3: integer('GachaSeriesId_3'),
  gachaSeriesId4: integer('GachaSeriesId_4'),
  gachaSeriesId5: integer('GachaSeriesId_5'),
  startTime: text('StartTime'),
  endTime: text('EndTime'),
  f46Cc5D1A: integer('F46cc5d1a')
});

export const gradechaltotalscorerewardsTsv = sqliteTable('gradechaltotalscorerewards.tsv', {
  ff8D16C13: integer('Ff8d16c13'),
  f87E46D32: integer('F87e46d32'),
  f65B477F1: integer('F65b477f1'),
  f2Ab88975: integer('F2ab88975')
});

export const contentguidancesTsv = sqliteTable('contentguidances.tsv', {
  ff55Dc9Bb: integer('Ff55dc9bb'),
  fc90B619C: integer('Fc90b619c'),
  f187B7Ed3: integer('F187b7ed3'),
  f1C4Bf00F: integer('F1c4bf00f'),
  f4815601C: integer('F4815601c'),
  f4Aea1478: text('F4aea1478')
});

export const petalCoinExchangeRate = sqliteTable('PetalCoinExchangeRate', {
  id: integer('Id').primaryKey(),
  rarity: integer('Rarity'),
  petalCoinQuantity: integer('PetalCoinQuantity')
});
