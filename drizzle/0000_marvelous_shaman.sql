-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `bundle` (
	`uid` integer PRIMARY KEY,
	`label` text,
	`ext` text,
	`resource_type` integer,
	`size` integer,
	`checksum` integer,
	`encryption_salt` integer,
	`priority` integer
);
--> statement-breakpoint
CREATE TABLE `bundle_category` (
	`uid` integer,
	`category` text,
	FOREIGN KEY (`uid`) REFERENCES `bundle`(`uid`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `bundle_content` (
	`uid` integer,
	`label` text,
	`ext` text,
	FOREIGN KEY (`uid`) REFERENCES `bundle`(`uid`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `bundle_dependency` (
	`uid` integer,
	`dependency` text,
	FOREIGN KEY (`uid`) REFERENCES `bundle`(`uid`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `metadata` (
	`type` text,
	`name` text,
	`value` text,
	PRIMARY KEY(`type`, `name`)
);
--> statement-breakpoint
CREATE TABLE `birthdayrarebonuses.tsv` (
	`F181edbfb` integer,
	`F29e35ec6` integer,
	`Fcbd0831e` text,
	`Fa88100d5` integer,
	`F5895b635` integer,
	`F095f5966` integer,
	`F906cc98c` integer,
	`F91968ea0` integer
);
--> statement-breakpoint
CREATE TABLE `SelectTicketExchangeRate` (
	`Id` integer PRIMARY KEY,
	`SelectTicketSeriesId` integer,
	`ExchangeItemType` integer,
	`ExchangeItemId` integer,
	`ExchangeItemQuantity` integer,
	`F52b9d439` text,
	`F10bd438f` text
);
--> statement-breakpoint
CREATE TABLE `seasongraderewards.tsv` (
	`F96cf0fae` integer,
	`F9a5c8c9e` integer,
	`F50b97836` integer,
	`Fc0ca68dc` integer
);
--> statement-breakpoint
CREATE TABLE `QuestLiveLoadings` (
	`Id` integer PRIMARY KEY,
	`Title` text,
	`OrderId` integer,
	`StartTime` text,
	`EndTime` text
);
--> statement-breakpoint
CREATE TABLE `GrandPrixQuestStages` (
	`Id` integer PRIMARY KEY,
	`GrandPrixSeriesId` integer,
	`Name` text,
	`Description` text,
	`Hint` text,
	`OrderId` integer,
	`StageType` integer,
	`LiveStagesId` integer,
	`QuestMusicsType` integer,
	`QuestMusicsDetail` integer,
	`DeckRestrictedType` integer,
	`DeckRestrictedDetail` integer,
	`QuestLevel` integer,
	`QuestRank` integer,
	`FirstClearRewardSeriesId` integer,
	`CompleteRewardSeriesId` integer,
	`DropRewardSeriesId` integer,
	`RandomDropRewardSeriesId` integer,
	`Score1` integer,
	`Score2` integer,
	`Score3` integer,
	`StylePoint` integer,
	`GainMusicExp` integer,
	`ScoreBonusValue0` integer,
	`ScoreBonusValue1` integer,
	`ScoreBonusValue2` integer,
	`ScoreBonusValue3` integer,
	`F9719b992` integer
);
--> statement-breakpoint
CREATE TABLE `TutorialDeckCards` (
	`Id` integer PRIMARY KEY,
	`TutorialDeckDatasId` integer,
	`SlotNo` integer,
	`CardDatasId` integer,
	`StyleLevel` integer,
	`LimitBreakTimes` integer,
	`SpecialAppealLevel` integer,
	`SkillLevel` integer
);
--> statement-breakpoint
CREATE TABLE `Costumes` (
	`Id` integer PRIMARY KEY,
	`Label` text
);
--> statement-breakpoint
CREATE TABLE `campaign.tsv` (
	`Fabbc503b` integer,
	`Fb6d06453` integer,
	`F5b3d6c96` integer,
	`F60977de0` text,
	`F7eb380e3` text,
	`F02a1f017` integer,
	`Fb815e107` text,
	`Fbe026386` text
);
--> statement-breakpoint
CREATE TABLE `MusicMasteryLoveBonuses` (
	`Id` integer PRIMARY KEY,
	`Level` integer,
	`LoveRate` integer
);
--> statement-breakpoint
CREATE TABLE `LiveStages` (
	`Id` integer PRIMARY KEY,
	`Name` text,
	`Description` text,
	`BaseUseMental` integer,
	`MentalStepClass` integer,
	`BaseGainVoltage` integer,
	`VoltageStepClass` integer,
	`BackGroundId` integer,
	`F4bfe67be` integer,
	`F115f6e66` integer,
	`F3490ce68` text,
	`F566d6bfc` text
);
--> statement-breakpoint
CREATE TABLE `CardSeries` (
	`Id` integer PRIMARY KEY,
	`Evolution0Id` integer,
	`Evolution1Id` integer,
	`Evolution2Id` integer,
	`ObtainFanLvPt` integer,
	`Evolution1FanLvPt` integer,
	`Evolution2FanLvPt` integer,
	`LimitBreak1FanLvPt` integer,
	`LimitBreak2FanLvPt` integer,
	`LimitBreak3FanLvPt` integer,
	`LimitBreak4FanLvPt` integer,
	`LimitedType` integer,
	`F410e2a7e` text,
	`F955df5a6` integer,
	`F9012e323` integer,
	`F0c458b62` integer,
	`F0680827b` integer,
	`F20648cce` integer,
	`F45a9260e` integer,
	`F5b1245d8` integer
);
--> statement-breakpoint
CREATE TABLE `QuestLiveReleaseConditions` (
	`Id` integer PRIMARY KEY,
	`ReleaseQuestId` integer,
	`ConditionsType` integer,
	`ConditionsValue` integer,
	`StartTime` text,
	`EndTime` text
);
--> statement-breakpoint
CREATE TABLE `Stamps` (
	`Id` integer PRIMARY KEY,
	`Name` text,
	`StampNo` integer,
	`StampType` integer,
	`CharactersId` integer,
	`StartTime` text,
	`EndTime` text
);
--> statement-breakpoint
CREATE TABLE `itemexchangecategoryfilter.tsv` (
	`Ffafb9a7f` integer,
	`F2dfca51e` text,
	`F0fcfe849` integer,
	`Fbedab598` integer,
	`Fe61c6f29` integer
);
--> statement-breakpoint
CREATE TABLE `TutorialDeckDatas` (
	`Id` integer PRIMARY KEY,
	`DeckName` text,
	`DeckNo` integer,
	`GenerationsId` integer
);
--> statement-breakpoint
CREATE TABLE `gradeaddskilleffects.tsv` (
	`F542fcd2d` integer,
	`F02786084` integer,
	`F7c965ccd` integer
);
--> statement-breakpoint
CREATE TABLE `GiftBonusGachas` (
	`Id` integer PRIMARY KEY,
	`SingleGachaPrice` integer,
	`SingleGachaPopId` integer,
	`ConsectiveGachaPrice` integer,
	`ConsectiveGachaTimes` integer,
	`ConsectiveGachaPopId` integer,
	`PaidSIsCaOnlyGachaFlag` integer,
	`PaidSIsCaOnlyGachaPrice` integer,
	`PaidSIsCaOnlyGachaTimes` integer,
	`PaidSIsCaOnlyGachaPointFlag` integer,
	`PaidSIsCaOnlyGachaaPopId` integer,
	`Fd3d0fa91` integer,
	`F2ccd41a2` integer,
	`F35ca1357` integer,
	`F086c1f1a` integer
);
--> statement-breakpoint
CREATE TABLE `stageskillconditions.tsv` (
	`Ffb9da42d` integer,
	`F9a785df5` integer
);
--> statement-breakpoint
CREATE TABLE `CardLevels` (
	`Id` integer PRIMARY KEY,
	`ExperienceType` integer,
	`CardLevel` integer,
	`Experience` integer,
	`CumulativeExperience` integer
);
--> statement-breakpoint
CREATE TABLE `CharacterFavoriteGifts` (
	`Id` integer PRIMARY KEY,
	`ItemsId` integer,
	`CharactersId` integer,
	`FavoriteRank` integer
);
--> statement-breakpoint
CREATE TABLE `LoginBonusRewardDatas` (
	`Id` integer PRIMARY KEY,
	`LoginBonusRewardSeriesId` integer,
	`DayCount` integer,
	`RewardType` integer,
	`RewardId` integer,
	`RewardNum` integer,
	`LifeTimeDay` integer,
	`RewardTextId` integer
);
--> statement-breakpoint
CREATE TABLE `gradequestlivepointbonus.tsv` (
	`F134f6e41` integer,
	`F3bde3919` integer,
	`F88656288` integer,
	`F287639bb` text,
	`F8f1e7402` integer,
	`Fb1c86157` integer,
	`Fb0b792d3` integer,
	`Fea435de7` integer
);
--> statement-breakpoint
CREATE TABLE `targets.tsv` (
	`F8d192d1b` integer,
	`Fe656d944` integer,
	`F2e1ecd5f` integer
);
--> statement-breakpoint
CREATE TABLE `Comics` (
	`Id` integer PRIMARY KEY,
	`Name` text,
	`ViewType` integer,
	`StartTime` text,
	`EndTime` text,
	`F35a27a2c` integer,
	`F1ed17e1b` text
);
--> statement-breakpoint
CREATE TABLE `FlowerStandTypes` (
	`Id` integer PRIMARY KEY,
	`Name` text
);
--> statement-breakpoint
CREATE TABLE `EventMissions` (
	`Id` integer PRIMARY KEY,
	`EventMissionSeriesId` integer,
	`Name` text,
	`Description` text,
	`MissionType` integer,
	`MissionCondition` integer,
	`MissionConditionNum` integer,
	`OpenType` integer,
	`NextMissionsId` integer,
	`SortOrder` integer,
	`TransitionContentsId` integer,
	`F591e4981` integer
);
--> statement-breakpoint
CREATE TABLE `gradequestseasonreleasecond.tsv` (
	`F4705b282` integer,
	`F6b927454` integer,
	`F0b47838d` integer,
	`Fcc4ba611` integer,
	`Ffb372281` text,
	`Fd70ac518` text,
	`Fe7e7f92f` text
);
--> statement-breakpoint
CREATE TABLE `emojis.tsv` (
	`F62590e34` integer,
	`F6bdcd439` text,
	`F573fb903` text,
	`Fbf7c10d1` integer,
	`Facfe6d41` integer,
	`F45c34e1e` integer,
	`Fda6abe7a` text,
	`Fa503e022` integer,
	`Ff296bef0` text,
	`Fe62740c0` integer,
	`F93a8114a` text,
	`Fa291f28a` text,
	`F82306b09` text,
	`Fdadf9389` text
);
--> statement-breakpoint
CREATE TABLE `gradedatas.tsv` (
	`F52790e42` integer,
	`F9c442074` integer,
	`F67bd1bba` integer,
	`Fd9bc697f` integer,
	`F87006533` integer,
	`Fa0b6b2d2` integer
);
--> statement-breakpoint
CREATE TABLE `MusicMasterySkill` (
	`Id` integer PRIMARY KEY,
	`MusicMasterySkillsName` text
);
--> statement-breakpoint
CREATE TABLE `EventMissionRewards` (
	`Id` integer PRIMARY KEY,
	`EventMissionSeriesId` integer,
	`EventMissionsId` integer,
	`RewardCategory` integer,
	`RewardType` integer,
	`ItemsId` integer,
	`RewardNum` integer,
	`RewardTextId` integer,
	`SortOrder` integer
);
--> statement-breakpoint
CREATE TABLE `rentaldeckcards.tsv` (
	`Ff41eae4b` integer,
	`F28704eb7` integer,
	`Fcb70a093` integer,
	`Fdcaaf1bb` integer,
	`F2efb64d6` integer,
	`Fb7f2356c` integer
);
--> statement-breakpoint
CREATE TABLE `stagescoremultipliersettings.tsv` (
	`Fc41fbccb` integer,
	`Fa4c9c5d8` integer,
	`F34bad532` integer,
	`F14f1fd69` integer,
	`F6d59298c` integer
);
--> statement-breakpoint
CREATE TABLE `stickerexchanges.tsv` (
	`F8e581eb5` integer,
	`Fc286cd6d` integer,
	`F84565cd5` integer,
	`F56490e2a` integer,
	`F3cbd51c4` integer,
	`F2ba27c05` integer,
	`F376a7a0a` integer,
	`Fb56470f9` integer,
	`F8cee1ab0` integer,
	`F8368752b` integer,
	`F1fd625a7` text,
	`F8d07eae0` text
);
--> statement-breakpoint
CREATE TABLE `CardCoordinates` (
	`Id` integer PRIMARY KEY,
	`CardDatasId` integer,
	`CardCoordSceneType` integer,
	`XCoord` integer,
	`YCoord` integer,
	`Scale` integer
);
--> statement-breakpoint
CREATE TABLE `LiveChannels` (
	`Id` integer PRIMARY KEY,
	`Name` text,
	`Description` text,
	`OrderId` integer,
	`StartTime` text,
	`EndTime` text
);
--> statement-breakpoint
CREATE TABLE `raidrewarddatas.tsv` (
	`F3a353c28` integer,
	`F4909b4b4` integer,
	`Ffbc5b45d` integer,
	`Fc7a8cf5a` integer,
	`Fc0904d6f` integer
);
--> statement-breakpoint
CREATE TABLE `Musics` (
	`Id` integer PRIMARY KEY,
	`OrderId` integer,
	`Title` text,
	`TitleFurigana` text,
	`JacketId` integer,
	`SoundId` integer,
	`Description` text,
	`GenerationsId` integer,
	`UnitId` integer,
	`CenterCharacterId` integer,
	`SingerCharacterId` text,
	`SupportCharacterId` text,
	`MusicType` integer,
	`ExperienceType` integer,
	`BeatPointCoefficient` integer,
	`ApIncrement` integer,
	`SongTime` integer,
	`PlayTime` integer,
	`FeverSectionNo` integer,
	`PreviewStartTime` integer,
	`PreviewEndTime` integer,
	`PreviewFadeInTime` integer,
	`PreviewFadeOutTime` integer,
	`ReleaseConditionType` integer,
	`ReleaseConditionDetail` integer,
	`ReleaseConditionText` text,
	`StartTime` text,
	`EndTime` text,
	`Ffb2e1f7e` integer,
	`Fae727ad9` integer,
	`Fa8d4a488` integer,
	`F74357b13` integer,
	`Fdad87316` text
);
--> statement-breakpoint
CREATE TABLE `Seasons` (
	`Id` integer PRIMARY KEY,
	`Name` text,
	`StartTime` text,
	`EndTime` text
);
--> statement-breakpoint
CREATE TABLE `raidtopprogressimage.tsv` (
	`F1696a35b` integer,
	`Fdd3bc511` integer,
	`F1083d0e3` integer,
	`Fd1218e2a` integer
);
--> statement-breakpoint
CREATE TABLE `TutorialQuestAreas` (
	`Id` integer PRIMARY KEY,
	`Name` text,
	`Number` integer,
	`Description` text,
	`OrderId` integer,
	`ImageType` integer,
	`BgImageId` integer,
	`Next_TutorialQuestAreasId` integer,
	`GenerationsId` integer
);
--> statement-breakpoint
CREATE TABLE `ticketonlygachas.tsv` (
	`F21adde08` integer,
	`F0954ebc8` integer,
	`Fa6a99946` integer,
	`F0ebca02f` integer,
	`Fdd2f16c7` integer,
	`Fe1119561` integer,
	`F1c828067` integer,
	`F8f543bd0` integer
);
--> statement-breakpoint
CREATE TABLE `rentalcarddatas.tsv` (
	`F43641aaa` integer,
	`Fc3482b21` integer,
	`Fb742fde1` integer,
	`F6dd82f09` integer,
	`F37dac02c` integer,
	`F9f8f10a2` integer
);
--> statement-breakpoint
CREATE TABLE `DownloadImages` (
	`Id` integer PRIMARY KEY,
	`DownloadType` integer,
	`Title` text,
	`OrderId` integer,
	`StartTime` text,
	`EndTime` text
);
--> statement-breakpoint
CREATE TABLE `LimitBreakMaterialRate` (
	`Id` integer PRIMARY KEY,
	`CardSeriesId` integer,
	`LimitBreakMaterialId` integer,
	`LimitBreakMaterialQuantity` integer
);
--> statement-breakpoint
CREATE TABLE `Items` (
	`Id` integer PRIMARY KEY,
	`Name` text,
	`NameFurigana` text,
	`ItemType` integer,
	`ItemCategory` integer,
	`Rarity` integer,
	`EffectValue` integer,
	`LimitNum` integer,
	`RequestableNum` integer,
	`Description` text,
	`StartTime` text,
	`EndTime` text
);
--> statement-breakpoint
CREATE TABLE `MemberVoices` (
	`Id` integer PRIMARY KEY,
	`CharactersId` integer,
	`Name` text,
	`Priority` integer,
	`VoiceName` text,
	`ReleaseConditionText` text
);
--> statement-breakpoint
CREATE TABLE `raidresource.tsv` (
	`F783c04a4` integer,
	`Fe5d9c5c5` integer,
	`Fbb0bdc71` integer,
	`F14239c19` integer,
	`F46f2c2ca` integer
);
--> statement-breakpoint
CREATE TABLE `gradechalqueststagesrewards.tsv` (
	`Fd90d31a1` integer,
	`Fdcfb4a70` integer,
	`F71d4dcc9` integer,
	`F9b6b0043` integer,
	`Fb0076525` integer
);
--> statement-breakpoint
CREATE TABLE `SectionSkillEffects` (
	`Id` integer PRIMARY KEY,
	`ActionType` integer,
	`OrderId` integer
);
--> statement-breakpoint
CREATE TABLE `gradequeststages.tsv` (
	`F63bd4daa` integer,
	`F6bcb6263` text,
	`F1f2f6509` text,
	`F012e1f36` text,
	`F2daa80e5` integer,
	`F210b7f99` integer,
	`F88a2b46a` integer,
	`Fcc51d4eb` integer,
	`F049d9081` integer,
	`F4dd89622` integer,
	`Fbae0deff` integer
);
--> statement-breakpoint
CREATE TABLE `rentaldecks.tsv` (
	`Feee8102d` integer,
	`F58029f5d` text,
	`F4a3ad2d5` integer,
	`F18d24f04` integer,
	`Fbe558b36` integer,
	`F82fab9cd` integer,
	`Fd50ef8fa` integer,
	`Fc3f46a21` text,
	`F1f31cc11` text,
	`Fdc9cedee` text
);
--> statement-breakpoint
CREATE TABLE `GrandPrixPointBonuses` (
	`Id` integer PRIMARY KEY,
	`GrandPrixesId` integer,
	`TargetType` integer,
	`TargetDetail` integer,
	`TargetNum` integer,
	`BonusValue` integer
);
--> statement-breakpoint
CREATE TABLE `Characters` (
	`Id` integer PRIMARY KEY,
	`NameLast` text,
	`NameFirst` text,
	`LatinAlphabetNameLast` text,
	`LatinAlphabetNameFirst` text,
	`GenerationsId` integer,
	`SeriesType` integer,
	`IconOrderId` integer,
	`CharacterVoice` text,
	`ThemeColor` text,
	`Introduction` text,
	`ShowSeasonFanLvStartTime` text,
	`ShowSeasonFanLvEndTime` text,
	`Ffcbe3734` integer,
	`F67739ed2` integer,
	`Fd94eff57` integer,
	`Fa43ca79c` text,
	`Fb5513e11` text,
	`Fe711f126` integer,
	`F5ffc33ef` text,
	`F3d03ee66` text
);
--> statement-breakpoint
CREATE TABLE `gradechalseason.tsv` (
	`F40474697` integer,
	`F96f1d0af` text,
	`F5761e0f2` integer,
	`F513dde48` integer,
	`Fd30b1eee` text,
	`F7abcaf44` text
);
--> statement-breakpoint
CREATE TABLE `ExchangePointConvert` (
	`Id` integer PRIMARY KEY,
	`ConvertItemType` integer,
	`ConvertItemId` integer,
	`ConvertItemQuantity` integer,
	`ConvertTime` text
);
--> statement-breakpoint
CREATE TABLE `Missions` (
	`Id` integer PRIMARY KEY,
	`Name` text,
	`Description` text,
	`MissionType` integer,
	`MissionConditionType` integer,
	`MissionConditionNum` integer,
	`MissionConditionDetail` integer,
	`OpenType` integer,
	`NextMissionsId` integer,
	`SortOrder` integer,
	`TransitionContentsId` integer,
	`StartTime` text,
	`EndTime` text,
	`F9eaa01e0` integer
);
--> statement-breakpoint
CREATE TABLE `MemberFanLevels` (
	`Id` integer PRIMARY KEY,
	`MemberFanLevel` integer,
	`Experience` integer,
	`CumulativeExperience` integer
);
--> statement-breakpoint
CREATE TABLE `FlowerStandColors` (
	`Id` integer PRIMARY KEY,
	`Name` text,
	`ColorCode` text,
	`OrderId` integer
);
--> statement-breakpoint
CREATE TABLE `GrandPrixReleaseCondition` (
	`Id` integer PRIMARY KEY,
	`ReleaseGrandPrixId` integer,
	`ConditionsType` integer,
	`ConditionsValue` integer,
	`StartTime` text,
	`EndTime` text
);
--> statement-breakpoint
CREATE TABLE `DailyQuestSeries` (
	`Id` integer PRIMARY KEY,
	`Name` text,
	`Description` text,
	`IsSunday` integer,
	`IsMonday` integer,
	`IsTuesday` integer,
	`IsWednesday` integer,
	`IsThursday` integer,
	`IsFriday` integer,
	`IsSaturday` integer,
	`StartTime` text,
	`EndTime` text
);
--> statement-breakpoint
CREATE TABLE `gradeaddskills.tsv` (
	`F5d6c8fa5` integer,
	`F9939e3e1` text,
	`Fcbd184be` text,
	`F3b4a1768` integer,
	`Fce34a276` text,
	`F6f03bff8` integer
);
--> statement-breakpoint
CREATE TABLE `FlowerStandIdolPictures` (
	`Id` integer PRIMARY KEY,
	`Name` text,
	`CharactersId` integer
);
--> statement-breakpoint
CREATE TABLE `sidestylesettings.tsv` (
	`F60bf5ce0` integer,
	`F4df93001` integer,
	`Ff403efdb` integer,
	`F7a1efff0` text
);
--> statement-breakpoint
CREATE TABLE `itemsources.tsv` (
	`F39c7874f` integer,
	`Fa6f6a4c7` text,
	`F4264b55d` text
);
--> statement-breakpoint
CREATE TABLE `QuestAreaReleaseConditions` (
	`Id` integer PRIMARY KEY,
	`ReleaseAreaId` integer,
	`ConditionsType` integer,
	`ConditionsValue` integer,
	`StartTime` text,
	`EndTime` text
);
--> statement-breakpoint
CREATE TABLE `ShopItems` (
	`Id` integer PRIMARY KEY,
	`ShopId` integer,
	`Name` text,
	`ItemType` integer,
	`ItemId` integer,
	`ItemQuantity` integer,
	`Price` integer,
	`IsPaidSIsCaOnly` integer,
	`OrderId` integer,
	`Description` text,
	`RewardTextId` integer,
	`StartTime` text,
	`EndTime` text
);
--> statement-breakpoint
CREATE TABLE `LiveLocations` (
	`Id` integer PRIMARY KEY,
	`Label` text,
	`PropsIds` text
);
--> statement-breakpoint
CREATE TABLE `cardskillmodes.tsv` (
	`F9925e6f8` integer,
	`F5d009b66` text,
	`Fa3631e4a` text,
	`Ff93d53b8` integer
);
--> statement-breakpoint
CREATE TABLE `TutorialQuestStages` (
	`Id` integer PRIMARY KEY,
	`TutorialQuestAreasId` integer,
	`Name` text,
	`Description` text,
	`Hint` text,
	`MapNumber` integer,
	`StageType` integer,
	`UseType` integer,
	`Use_ItemsId` integer,
	`UseNum` integer,
	`LiveStagesId` integer,
	`QuestMusicsId` integer,
	`LoveCorrectionValue` integer,
	`BonusVoltage` integer,
	`BonusMental` integer,
	`BonusHeart` integer,
	`BonusLove` integer,
	`FirstClearRewardSeriesId` integer,
	`CompleteRewardSeriesId` integer,
	`RandomDropRewardSeriesId` integer,
	`Score1` integer,
	`Score2` integer,
	`Score3` integer,
	`StylePoint` integer,
	`GainMusicExp` integer
);
--> statement-breakpoint
CREATE TABLE `CardSkillLevelUpMaterials` (
	`Id` integer PRIMARY KEY,
	`CardSeriesId` integer,
	`SkillType` integer,
	`SkillLevel` integer,
	`Cost_ItemsId1` integer,
	`CostNum1` integer,
	`Cost_ItemsId2` integer,
	`CostNum2` integer,
	`Cost_ItemsId3` integer,
	`CostNum3` integer,
	`Fa1aadd43` text,
	`F233f7b92` text
);
--> statement-breakpoint
CREATE TABLE `MusicMasteryLevels` (
	`Id` integer PRIMARY KEY,
	`MusicsId` integer,
	`Level` integer,
	`MusicMasterySkillsId` integer
);
--> statement-breakpoint
CREATE TABLE `raidquestseries.tsv` (
	`Fe13e46fd` integer,
	`F09e3f2fb` text,
	`Fbef0105c` text,
	`Ffd66a1da` integer,
	`F69db03f4` integer,
	`Ffdd8f19b` text,
	`F45021edf` text
);
--> statement-breakpoint
CREATE TABLE `gradequestsquare.tsv` (
	`F4378520f` integer,
	`F7be1e878` integer,
	`F1d7e58e3` integer,
	`Fd25f2117` integer,
	`F1903f2b2` integer,
	`F0b424b25` text
);
--> statement-breakpoint
CREATE TABLE `PresentTexts` (
	`Id` integer PRIMARY KEY,
	`Description` text
);
--> statement-breakpoint
CREATE TABLE `advstorydigestmovies.tsv` (
	`F8ec9bcb2` integer,
	`F5e21925c` text,
	`F2afbaa72` integer,
	`F01421428` integer
);
--> statement-breakpoint
CREATE TABLE `AdvSeries` (
	`Id` integer PRIMARY KEY,
	`SeasonsId` integer,
	`Name` text,
	`Description` text,
	`StartTime` text,
	`EndTime` text,
	`Fd876f2b0` integer,
	`F57c6cd0b` integer
);
--> statement-breakpoint
CREATE TABLE `DreamQuestSeries` (
	`Id` integer PRIMARY KEY,
	`CharactersId` integer,
	`Name` text,
	`OrderId` integer,
	`StartTime` text,
	`EndTime` text,
	`F5819322c` integer,
	`Fe55a9344` text,
	`F60a03c13` integer
);
--> statement-breakpoint
CREATE TABLE `StandardQuestStages` (
	`Id` integer PRIMARY KEY,
	`StandardQuestAreasId` integer,
	`Name` text,
	`Description` text,
	`Hint` text,
	`StageType` integer,
	`UseType` integer,
	`UseItem` integer,
	`UseNum` integer,
	`LiveStagesId` integer,
	`QuestMusicsType` integer,
	`QuestMusicsDetail` integer,
	`DeckRestrictedType` integer,
	`DeckRestrictedDetail` integer,
	`QuestLevel` integer,
	`FirstClearRewardSeriesId` integer,
	`CompleteRewardSeriesId` integer,
	`DropRewardSeriesId` integer,
	`RandomDropRewardSeriesId` integer,
	`Score1` integer,
	`Score2` integer,
	`Score3` integer,
	`GainStylePoint` integer,
	`GainMusicExp` integer,
	`Fae984545` integer
);
--> statement-breakpoint
CREATE TABLE `difficultybgimages.tsv` (
	`Fd496949d` integer,
	`F493a02ac` integer,
	`F81145a82` integer,
	`F316c16fe` integer
);
--> statement-breakpoint
CREATE TABLE `ContentsReleaseConditions` (
	`Id` integer PRIMARY KEY,
	`ReleaseContentsId` integer,
	`ConditionsType` integer,
	`ConditionsValue` integer,
	`StartTime` text,
	`EndTime` text
);
--> statement-breakpoint
CREATE TABLE `rhythmgameskilllvupitemdetails.tsv` (
	`F9e8102e1` integer,
	`F1ed965b6` integer,
	`F9f7afc9d` integer,
	`Ff97d351f` integer
);
--> statement-breakpoint
CREATE TABLE `StyleMovies` (
	`Id` integer PRIMARY KEY,
	`CardSeriesId` integer,
	`MovieType` integer,
	`Name` text,
	`ReleaseConditionText` text
);
--> statement-breakpoint
CREATE TABLE `beginnermissionbannerrewards.tsv` (
	`F39f43415` integer,
	`Fd06dcd77` integer,
	`Fc72be5f2` integer,
	`F0d470081` integer,
	`Fda73d722` integer
);
--> statement-breakpoint
CREATE TABLE `MissionRewards` (
	`Id` integer PRIMARY KEY,
	`MissionsId` integer,
	`RewardCategory` integer,
	`RewardType` integer,
	`ItemsId` integer,
	`RewardNum` integer,
	`RewardTextId` integer
);
--> statement-breakpoint
CREATE TABLE `LiveProps` (
	`Id` integer PRIMARY KEY,
	`Label` text
);
--> statement-breakpoint
CREATE TABLE `beginnermissionshint.tsv` (
	`F8f16c143` integer,
	`F00790966` text,
	`Fa9049e41` text
);
--> statement-breakpoint
CREATE TABLE `grade.tsv` (
	`Fbe11b7c9` integer,
	`F78739ca9` text,
	`F02a95afb` integer
);
--> statement-breakpoint
CREATE TABLE `rhythmgametotalmissionrewards.tsv` (
	`Fa553c557` integer,
	`F892fa504` integer,
	`Ff2a814ed` integer,
	`Ff5bbcb67` integer,
	`F1b7cd663` integer,
	`F5a0ccd84` integer
);
--> statement-breakpoint
CREATE TABLE `TextsPlaceHolder` (
	`Id` integer PRIMARY KEY,
	`Description` text
);
--> statement-breakpoint
CREATE TABLE `ChallengeModeReleaseCondition` (
	`Id` integer PRIMARY KEY,
	`ReleaseChallengeModeId` integer,
	`ConditionsType` integer,
	`ConditionsValue` integer,
	`StartTime` text,
	`EndTime` text
);
--> statement-breakpoint
CREATE TABLE `cardduetvoice.tsv` (
	`F5eba05e5` integer,
	`Fc59ddc03` integer,
	`F5dc95cf8` text
);
--> statement-breakpoint
CREATE TABLE `itemexchanges.tsv` (
	`Ff8ff7288` integer,
	`Fa69f497d` integer,
	`F8857a349` integer,
	`F05aed7e3` integer,
	`F8e91dae8` integer,
	`Fc4d59c47` integer,
	`F24c8c926` integer,
	`F65be8ac9` integer,
	`F538cc16b` integer,
	`F8fb5c78c` integer,
	`F1e7288dd` integer,
	`F0e7bd432` integer,
	`F250792d2` text,
	`F00144bf9` text,
	`F413b2f93` text,
	`F3424781d` integer,
	`F92b5fcd4` text,
	`F6309fa34` integer,
	`F47c1d775` integer,
	`F3e69f31f` integer,
	`F4f04822b` integer
);
--> statement-breakpoint
CREATE TABLE `musicdroprewards.tsv` (
	`F87d44f82` integer,
	`F3da70ed1` integer,
	`F6bad54a9` integer,
	`Fbcde7730` text,
	`Fd45abf1c` text
);
--> statement-breakpoint
CREATE TABLE `LoginBonuses` (
	`Id` integer PRIMARY KEY,
	`Name` text,
	`LoginBonusRewardSeriesID` integer,
	`IsLoop` integer,
	`LoginBonusTextId` text,
	`StartTime` text,
	`EndTime` text
);
--> statement-breakpoint
CREATE TABLE `HelpImages` (
	`Id` integer PRIMARY KEY,
	`Name` text,
	`Scene` integer,
	`OrderId` integer,
	`TitleTextId` integer
);
--> statement-breakpoint
CREATE TABLE `musicdroprewarddetails.tsv` (
	`F987b199d` integer,
	`F8b6e5259` integer,
	`Fc7e3dd4f` integer,
	`F8b325a53` integer,
	`Fe51d8e4b` integer,
	`F0cab07ea` integer,
	`Fe88a5f5c` integer
);
--> statement-breakpoint
CREATE TABLE `CostumeModels` (
	`Id` integer PRIMARY KEY,
	`Label` text,
	`CharactersId` integer,
	`CostumesId` integer,
	`HairStyleId` integer
);
--> statement-breakpoint
CREATE TABLE `centerattributes.tsv` (
	`F45b078f4` integer,
	`F2430ed9c` integer,
	`F67831650` text,
	`F2f114c3d` text,
	`Fd29f2b78` integer,
	`Fd8b0251f` text
);
--> statement-breakpoint
CREATE TABLE `campaignaddrewards.tsv` (
	`F2477edb5` integer,
	`Fd7f722aa` integer,
	`Fdfb49f08` integer,
	`Fcf4abf2a` integer,
	`Fa1b46b2b` integer,
	`F989a6e79` integer,
	`F4074b699` integer
);
--> statement-breakpoint
CREATE TABLE `SectionSkillEffectDetails` (
	`Id` integer PRIMARY KEY,
	`SkillEffectDetailType` text,
	`TargetMood` integer,
	`EffectValue` integer
);
--> statement-breakpoint
CREATE TABLE `CardSkillEffects` (
	`Id` integer PRIMARY KEY,
	`ActionType` integer,
	`OrderId` integer
);
--> statement-breakpoint
CREATE TABLE `MusicLearningQuestStages` (
	`Id` integer PRIMARY KEY,
	`LearningLiveSeriesId` integer,
	`Name` text,
	`Description` text,
	`Hint` text,
	`StageType` integer,
	`UseType` integer,
	`UseItem` integer,
	`UseNum` integer,
	`LiveStagesId` integer,
	`QuestMusicsType` integer,
	`QuestMusicsDetail` integer,
	`DeckRestrictedType` integer,
	`DeckRestrictedDetail` integer,
	`QuestLevel` integer,
	`QuestRank` integer,
	`FirstClearRewardSeriesId` integer,
	`DropRewardSeriesId` integer,
	`RandomDropRewardSeriesId` integer,
	`Score1` integer,
	`GainStylePoint` integer,
	`GainMusicExp` integer,
	`F71de3065` integer,
	`F64940ef0` text,
	`F348f68f2` text
);
--> statement-breakpoint
CREATE TABLE `MissionAchieveRewards` (
	`Id` integer PRIMARY KEY,
	`MissionType` integer,
	`AchieveMarkNum` integer,
	`RewardType` integer,
	`ItemsId` integer,
	`RewardNum` integer,
	`RewardTextId` integer,
	`SortOrder` integer
);
--> statement-breakpoint
CREATE TABLE `DailyLiveReleaseConditions` (
	`Id` integer PRIMARY KEY,
	`ReleaseDailyLivesId` integer,
	`ConditionsType` integer,
	`ConditionsValue` integer,
	`StartTime` text,
	`EndTime` text
);
--> statement-breakpoint
CREATE TABLE `graderewards.tsv` (
	`Fd418f1b5` integer,
	`F3895390d` integer
);
--> statement-breakpoint
CREATE TABLE `DreamLiveReleaseConditions` (
	`Id` integer PRIMARY KEY,
	`ReleaseDreamLiveId` integer,
	`ConditionsType` integer,
	`ConditionsValue` integer,
	`StartTime` text,
	`EndTime` text
);
--> statement-breakpoint
CREATE TABLE `CardSkillEffectDetails` (
	`Id` integer PRIMARY KEY,
	`SkillEffectDetailType` text,
	`TargetMood` integer,
	`EffectValue` integer
);
--> statement-breakpoint
CREATE TABLE `GrandPrixRewardDatas` (
	`Id` integer PRIMARY KEY,
	`GrandPrixRewardsId` integer,
	`RewardType` integer,
	`RewardItemId` integer,
	`RewardNum` integer,
	`IsEmphasize` integer,
	`IsUsePresentBox` integer,
	`LifeTimeDay` integer,
	`RewardTextId` integer
);
--> statement-breakpoint
CREATE TABLE `rhythmgametotalmissions.tsv` (
	`F052a9927` integer,
	`Ffea05e02` text,
	`F21fa2ca5` integer,
	`Fd7227267` integer,
	`Fd0ef7828` text,
	`F96941bf7` text
);
--> statement-breakpoint
CREATE TABLE `centerattributeeffects.tsv` (
	`F175e6edb` integer,
	`F9cafdaca` integer,
	`F24649a7b` integer
);
--> statement-breakpoint
CREATE TABLE `centerskillconditions.tsv` (
	`Fe5b639f6` integer,
	`F80c30d1a` integer,
	`Fa2ab2478` integer,
	`F44a9ec27` integer
);
--> statement-breakpoint
CREATE TABLE `limitbreakmaterialconvertrate.tsv` (
	`Fda917381` integer,
	`F6665c2db` integer,
	`F985b407a` integer,
	`Fdd6d8b1d` integer,
	`Fbed3bd45` integer,
	`Fb19fa15f` integer
);
--> statement-breakpoint
CREATE TABLE `LiveItems` (
	`Id` integer PRIMARY KEY,
	`Label` text,
	`BindBoneId` integer,
	`PosesId` integer
);
--> statement-breakpoint
CREATE TABLE `rhythmgameclasses.tsv` (
	`Fe53a510f` integer,
	`F215d58c6` text,
	`F7e443d25` integer
);
--> statement-breakpoint
CREATE TABLE `seasongraderewarddatas.tsv` (
	`Fcfefd1f8` integer,
	`Fa213480b` integer,
	`Facdee5f2` integer,
	`Ff25b5905` integer,
	`Fb374c71b` integer,
	`F7446e815` integer
);
--> statement-breakpoint
CREATE TABLE `gradequestsquaredatas.tsv` (
	`F3399cd6c` integer,
	`F1bd3c1af` text,
	`F967eac4d` integer,
	`Fd50e2d75` integer,
	`F39eaa0d8` integer,
	`F80cc3ba9` integer
);
--> statement-breakpoint
CREATE TABLE `CustomComplementMaterials` (
	`Id` integer PRIMARY KEY,
	`Name` text,
	`OrderId` integer,
	`StartTime` text,
	`EndTime` text
);
--> statement-breakpoint
CREATE TABLE `StandardQuestAreas` (
	`Id` integer PRIMARY KEY,
	`Name` text,
	`Number` integer,
	`Description` text,
	`OrderId` integer,
	`ImageType` integer,
	`BgImageId` integer,
	`SoundId` integer,
	`GenerationsId` integer,
	`StartTime` text,
	`EndTime` text
);
--> statement-breakpoint
CREATE TABLE `MusicMasteryMentalBonuses` (
	`Id` integer PRIMARY KEY,
	`Level` integer,
	`DemandDamagePt` integer
);
--> statement-breakpoint
CREATE TABLE `gradeaddskilleffectdetails.tsv` (
	`F65bf439b` integer,
	`F49f62c6b` text,
	`F36e2ec14` integer,
	`F0e3b216a` integer
);
--> statement-breakpoint
CREATE TABLE `gpprizeexchanges.tsv` (
	`F463f12cd` integer,
	`F31317a03` integer,
	`F08eda1e3` integer,
	`F8e9c999e` integer,
	`F52655210` integer,
	`F24c58a50` integer,
	`Fdcd85383` integer,
	`F2ca610e5` integer,
	`F85ca437a` integer,
	`F4ea7e17e` integer,
	`F2f781624` text,
	`F40c87eb5` text
);
--> statement-breakpoint
CREATE TABLE `tablist.tsv` (
	`Fed4097b6` integer,
	`Fd9906f0e` text
);
--> statement-breakpoint
CREATE TABLE `StyleVoices` (
	`Id` integer PRIMARY KEY,
	`CardSeriesId` integer,
	`Name` text,
	`Priority` integer,
	`VoiceName` text,
	`ReleaseConditionText` text
);
--> statement-breakpoint
CREATE TABLE `CardLimitBreakMaterials` (
	`Id` integer PRIMARY KEY,
	`CardSeriesId` integer,
	`LimitBreakTimes` integer,
	`CostItemsId` integer,
	`CostNum` integer
);
--> statement-breakpoint
CREATE TABLE `stageskilleffectdetails.tsv` (
	`F66853f76` integer,
	`F9c4405a3` integer,
	`F78c7d356` text,
	`Fb43a4bbb` integer
);
--> statement-breakpoint
CREATE TABLE `MusicLearningQuestSeries` (
	`Id` integer PRIMARY KEY,
	`MusicsId` integer,
	`Name` text,
	`StartTime` text,
	`EndTime` text,
	`F534f050c` integer
);
--> statement-breakpoint
CREATE TABLE `EventLoginBonuses` (
	`Id` integer PRIMARY KEY,
	`Name` text,
	`LoginBonusRewardSeriesId` integer,
	`EventLoginBonusType` integer,
	`LoginBonusTextId` text,
	`StartTime` text,
	`EndTime` text
);
--> statement-breakpoint
CREATE TABLE `raidresourcerecoverydatas.tsv` (
	`F39e693c6` integer,
	`F7da637d3` integer,
	`F6a0bbca0` integer,
	`Ffb542828` integer,
	`Ff8a3934f` integer,
	`F510c386f` integer
);
--> statement-breakpoint
CREATE TABLE `PetalExchangeRates` (
	`Id` integer PRIMARY KEY,
	`Rarity` integer,
	`Price` integer,
	`ExchangeLimitLower` integer,
	`ExchangeLimitUpper` integer
);
--> statement-breakpoint
CREATE TABLE `grandprixdailypoints.tsv` (
	`F6426ef2b` integer,
	`Fa4a24ab1` integer,
	`Fa751aafe` integer,
	`Fb24b4e64` integer,
	`Fa4dcb47f` integer
);
--> statement-breakpoint
CREATE TABLE `advalbums.tsv` (
	`F5ceda8f0` integer,
	`F910c7967` text,
	`F5596b7f9` text
);
--> statement-breakpoint
CREATE TABLE `gradequestseries.tsv` (
	`F7a0d560d` integer,
	`F00e89811` text,
	`F4c4cbdc6` integer,
	`Fe7d88ece` integer,
	`F4f7e83cf` integer,
	`F1cd06c8f` text,
	`F6ac48fc0` integer,
	`F234090eb` integer,
	`F1c7e5752` text,
	`Ff6a900fd` integer,
	`F0c3f8981` integer,
	`F16b06d2a` text,
	`Fe9b71105` text
);
--> statement-breakpoint
CREATE TABLE `gradequestseriesreleasecond.tsv` (
	`F16763528` integer,
	`F9726f06b` integer,
	`Fbf0b9446` integer,
	`Fc049f13e` integer,
	`Ffaa79f80` text,
	`F58e94a86` text
);
--> statement-breakpoint
CREATE TABLE `rhythmgameclassmissionrewards.tsv` (
	`F57f29351` integer,
	`Fbdacae86` integer,
	`F94760091` integer,
	`F6ceb4f3e` integer,
	`Fc35360b9` integer,
	`Fc51adc32` integer
);
--> statement-breakpoint
CREATE TABLE `cardskilleffectdetailparams.tsv` (
	`F24958ec9` integer,
	`F4a3393c3` text,
	`F5d6ebe96` text
);
--> statement-breakpoint
CREATE TABLE `commonmissions.tsv` (
	`Fae2b1671` integer,
	`Fa1545858` integer,
	`Fc73bd859` integer,
	`Fd5e55c3b` integer,
	`F3d18984b` integer,
	`F997ae174` integer,
	`Fd5972973` text,
	`F97157ebf` text
);
--> statement-breakpoint
CREATE TABLE `LiveTimelinesEvol` (
	`Id` integer PRIMARY KEY,
	`Label` text,
	`MusicId` integer,
	`LocationsId` integer,
	`FreeId` integer,
	`NextId` integer,
	`Fc29e839e` text
);
--> statement-breakpoint
CREATE TABLE `gradequestseason.tsv` (
	`F727cd310` integer,
	`F62568bd3` text,
	`F38c5139b` integer,
	`F609172d0` integer,
	`Fc17c5015` integer,
	`F5fc2f4df` text,
	`F36aa8c50` text
);
--> statement-breakpoint
CREATE TABLE `gradequestrewards.tsv` (
	`F5f39f1ac` integer,
	`F3cdf67f9` integer,
	`Fb1b284ff` integer,
	`Fd03a765a` integer,
	`Fd4279c93` integer,
	`F73075b6f` integer,
	`F201b8d06` text,
	`F3abbdccd` integer
);
--> statement-breakpoint
CREATE TABLE `campaignaddrewardseries.tsv` (
	`Fb86425a8` integer,
	`F854b7fc1` integer,
	`F1c422e7b` integer,
	`F6b451eed` integer
);
--> statement-breakpoint
CREATE TABLE `DailyQuestStages` (
	`Id` integer PRIMARY KEY,
	`DailyQuestSeriesId` integer,
	`Name` text,
	`Description` text,
	`Hint` text,
	`StageType` integer,
	`UseType` integer,
	`UseItem` integer,
	`UseNum` integer,
	`LiveStagesId` integer,
	`QuestMusicsType` integer,
	`QuestMusicsDetail` integer,
	`DeckRestrictedType` integer,
	`DeckRestrictedDetail` integer,
	`QuestLevel` integer,
	`QuestRank` integer,
	`FirstClearRewardSeriesId` integer,
	`CompleteRewardSeriesId` integer,
	`DropRewardSeriesId` integer,
	`RandomDropRewardSeriesId` integer,
	`Score1` integer,
	`Score2` integer,
	`Score3` integer,
	`GainStylePoint` integer,
	`GainMusicExp` integer,
	`F2e5db975` integer
);
--> statement-breakpoint
CREATE TABLE `GrandPrixRewards` (
	`Id` integer PRIMARY KEY,
	`GrandPrixesId` integer,
	`GrandPrixRewardType` integer,
	`MinTargetNum` integer,
	`MaxTargetNum` integer,
	`F68330ba1` integer
);
--> statement-breakpoint
CREATE TABLE `TutorialSchoolIdolStageMovies` (
	`Id` integer PRIMARY KEY,
	`Title` text,
	`OrderId` integer
);
--> statement-breakpoint
CREATE TABLE `MusicMasteryVoltageBonuses` (
	`Id` integer PRIMARY KEY,
	`Level` integer,
	`DemandVoltagePt` integer
);
--> statement-breakpoint
CREATE TABLE `stageskilleffects.tsv` (
	`F64d2dbb7` integer,
	`Fb01bd308` integer
);
--> statement-breakpoint
CREATE TABLE `MusicMasteryHeartBonuses` (
	`Id` integer PRIMARY KEY,
	`Level` integer,
	`LoveRate` integer
);
--> statement-breakpoint
CREATE TABLE `musicscorerewards.tsv` (
	`F3506d67f` integer,
	`Fb4c4f1c0` integer,
	`Fc67e89e9` integer,
	`Fdfb2aeb8` integer,
	`F46bbff02` integer,
	`F31bccf94` integer,
	`Fafd85a37` integer,
	`Fb779d2ac` integer,
	`F2e708316` integer,
	`F5977b380` integer,
	`Fc7132623` integer
);
--> statement-breakpoint
CREATE TABLE `ingamemissionskilldetails.tsv` (
	`F27814bda` integer,
	`F8ee69fbf` integer,
	`F71f0bb1c` integer,
	`F45ef1eb5` integer,
	`F7667f852` integer,
	`Fef6ea9e8` integer,
	`Fa63a84e0` integer,
	`F3c555cd1` integer,
	`F3059cf38` integer,
	`F61a3066a` integer,
	`Ff2baee5b` text
);
--> statement-breakpoint
CREATE TABLE `raidquestreleasecondition.tsv` (
	`F0d7b30d4` integer,
	`Fc7a36346` integer,
	`F54b0cc8d` integer,
	`Fcc14515e` integer,
	`F763c4ab1` text,
	`F431d5f21` text
);
--> statement-breakpoint
CREATE TABLE `SubCharacters` (
	`Id` integer PRIMARY KEY,
	`Label` text
);
--> statement-breakpoint
CREATE TABLE `raidqueststages.tsv` (
	`Ff88e5d5a` integer,
	`Fd785b20b` integer,
	`F62c00889` text,
	`F1b48cef7` text,
	`F082575dc` text,
	`F502c4504` integer,
	`Fc6c21c54` integer,
	`F7b0ac729` integer,
	`F16e75e06` integer,
	`F45c66563` integer,
	`Fe7770c22` integer,
	`F314b458d` integer,
	`F78cb7ebe` integer,
	`F11b1512c` integer,
	`F103b8b0f` integer,
	`F43c4987a` integer,
	`F5e4c2267` integer,
	`Ffd64a651` integer,
	`F9aff7b8c` integer,
	`F03f62a36` integer,
	`F74f11aa0` integer,
	`F34029c8a` integer,
	`F03c9e6b7` integer
);
--> statement-breakpoint
CREATE TABLE `itemexchangecategorydatas.tsv` (
	`F4728cb53` integer,
	`Fe9c45dfa` text,
	`F9790e5a5` integer
);
--> statement-breakpoint
CREATE TABLE `DreamQuestStages` (
	`Id` integer PRIMARY KEY,
	`DreamQuestSeriesId` integer,
	`Name` text,
	`Description` text,
	`Hint` text,
	`StageType` integer,
	`UseType` integer,
	`UseItem` integer,
	`UseNum` integer,
	`LiveStagesId` integer,
	`QuestMusicsType` integer,
	`QuestMusicsDetail` integer,
	`DeckRestrictedType` integer,
	`DeckRestrictedDetail` integer,
	`FirstClearRewardSeriesId` integer,
	`DropRewardSeriesId` integer,
	`RandomDropRewardSeriesId` integer,
	`Score1` integer
);
--> statement-breakpoint
CREATE TABLE `CardRarities` (
	`Id` integer PRIMARY KEY,
	`RarityName` text,
	`F29ee5125` integer,
	`Fc62c3a1b` integer,
	`F2d1b8118` integer,
	`Fc2d9ea26` integer,
	`F2005f15f` integer,
	`F23ace991` integer,
	`Ff8fd2423` integer
);
--> statement-breakpoint
CREATE TABLE `Shops` (
	`Id` integer PRIMARY KEY,
	`ShopType` integer,
	`Name` text,
	`OrderId` integer
);
--> statement-breakpoint
CREATE TABLE `raidquestdroprateup.tsv` (
	`F482d1a19` integer,
	`F512c70df` text,
	`Ffa3e791f` integer
);
--> statement-breakpoint
CREATE TABLE `MusicLevels` (
	`Id` integer PRIMARY KEY,
	`ExperienceType` integer,
	`Level` integer,
	`Experience` integer,
	`CumulativeExperience` integer
);
--> statement-breakpoint
CREATE TABLE `launcherbanners.tsv` (
	`Fe2dc01cd` integer,
	`F725bad03` integer,
	`F87147961` integer,
	`F0747554c` text,
	`F63ab91d0` text
);
--> statement-breakpoint
CREATE TABLE `HomeBgms` (
	`Id` integer PRIMARY KEY,
	`DaytimeBgmId` integer,
	`NighttimeBgmId` integer,
	`StartTime` text,
	`EndTime` text
);
--> statement-breakpoint
CREATE TABLE `graderewarddatas.tsv` (
	`Fa1062cd8` integer,
	`Fcc22f961` integer,
	`F47485fdb` integer,
	`F9da977ea` integer,
	`F2bf8d1de` integer
);
--> statement-breakpoint
CREATE TABLE `gradechalqueststagerewarddatas.tsv` (
	`Fee5837c5` integer,
	`Fc30060bc` integer,
	`F2908150a` integer,
	`F9383457a` integer,
	`F00b4e749` integer,
	`Fc27d1ef7` integer
);
--> statement-breakpoint
CREATE TABLE `GiftlessGachas` (
	`Id` integer PRIMARY KEY,
	`SingleGachaPrice` integer,
	`SingleGachaPopId` integer,
	`ConsectiveGachaPrice` integer,
	`ConsectiveGachaTimes` integer,
	`ConsectiveGachaPopId` integer,
	`PaidSIsCaOnlyGachaFlag` integer,
	`PaidSIsCaOnlyGachaPrice` integer,
	`PaidSIsCaOnlyGachaTimes` integer,
	`PaidSIsCaOnlyGachaPointFlag` integer,
	`PaidSIsCaOnlyGachaaPopId` integer,
	`Fabd8824d` integer,
	`F8caa0d6d` integer,
	`F06c2750a` integer,
	`F79821252` integer
);
--> statement-breakpoint
CREATE TABLE `MemberMovies` (
	`Id` integer PRIMARY KEY,
	`CharactersId` integer,
	`MovieType` integer,
	`Name` text,
	`Priority` integer,
	`ReleaseConditionText` text
);
--> statement-breakpoint
CREATE TABLE `raidresourceadddate.tsv` (
	`F8e1ddabc` integer,
	`Fda77a316` integer,
	`F40ca8e46` integer,
	`F5abdb99e` text
);
--> statement-breakpoint
CREATE TABLE `rhythmgamehelpimages.tsv` (
	`F71be2a34` integer,
	`F57df230f` text,
	`Fa0acab23` integer,
	`F4eecd29f` integer
);
--> statement-breakpoint
CREATE TABLE `rhythmgameskills.tsv` (
	`Fedd96baa` integer,
	`F658534fe` integer,
	`Fe491480e` text,
	`Fbcd3ea61` integer,
	`F931e6c05` integer,
	`Fb3829ee8` text,
	`F932af21a` integer,
	`F1664900f` integer,
	`F7b751386` text
);
--> statement-breakpoint
CREATE TABLE `LiveCharacters` (
	`Id` integer PRIMARY KEY,
	`Label` text,
	`SkeletonName` text,
	`ItemsIds` text,
	`PosesIds` text
);
--> statement-breakpoint
CREATE TABLE `LiveMusic` (
	`Id` integer PRIMARY KEY,
	`Label` text,
	`MusicId` integer,
	`HaveMusic` integer,
	`HaveMotion` integer,
	`CharactersCount` integer,
	`CharactersIds` text
);
--> statement-breakpoint
CREATE TABLE `stageskillconditiondetails.tsv` (
	`F94c2caeb` integer,
	`F94984a62` integer,
	`F5c78a533` text,
	`Fe4fa33bf` integer
);
--> statement-breakpoint
CREATE TABLE `itemexchangecategorylist.tsv` (
	`Fd1a1f1ce` integer,
	`F1abc0478` text,
	`F3067ee72` integer,
	`F0440fc5f` integer,
	`Fe776d8f8` integer
);
--> statement-breakpoint
CREATE TABLE `SeasonFanLevels` (
	`Id` integer PRIMARY KEY,
	`SeasonsId` integer,
	`SeasonFanLevel` integer,
	`Experience` integer,
	`CumulativeExperience` integer
);
--> statement-breakpoint
CREATE TABLE `EventMissionSeries` (
	`Id` integer PRIMARY KEY,
	`Name` text,
	`Description` text,
	`GrandPrixesId` integer,
	`StartTime` text,
	`EndTime` text
);
--> statement-breakpoint
CREATE TABLE `rhythmgameskillconditions.tsv` (
	`F64293575` integer,
	`Fb3d38a66` integer,
	`Ffb2b09e8` integer,
	`Fb4ffff4e` integer
);
--> statement-breakpoint
CREATE TABLE `QuestSections` (
	`Id` integer PRIMARY KEY,
	`SectionNo` integer,
	`QuestStagesId` integer,
	`SectionSkillsId` integer
);
--> statement-breakpoint
CREATE TABLE `CardDatas` (
	`Id` integer PRIMARY KEY,
	`CardSeriesId` integer,
	`Name` text,
	`Description` text,
	`CharactersId` integer,
	`Rarity` integer,
	`EvolveTimes` integer,
	`CardLevelLimitAddition` integer,
	`Style` integer,
	`Mood` integer,
	`ExperienceType` integer,
	`InitialSmile` integer,
	`InitialPure` integer,
	`InitialCool` integer,
	`InitialMental` integer,
	`MaxSmile` integer,
	`MaxPure` integer,
	`MaxCool` integer,
	`MaxMental` integer,
	`BeatPoint` integer,
	`SpecialAppealSeriesId` integer,
	`SkillSeriesId` integer,
	`AttributeId` integer,
	`SpineId` integer,
	`F17b8b727` integer,
	`Fc2fd110a` integer,
	`F0e55d0e6` integer,
	`F3df64b9a` integer,
	`Fdf846da0` integer,
	`F257ba05b` integer
);
--> statement-breakpoint
CREATE TABLE `centerskills.tsv` (
	`F9c0b8dcd` integer,
	`Fffd4c5be` integer,
	`F8dd61f96` text,
	`F9dc9a4b5` integer,
	`Ff3317055` integer,
	`F2feac97d` text,
	`F097b035a` integer,
	`Ffaea1f05` text
);
--> statement-breakpoint
CREATE TABLE `LiveEventsEvol` (
	`Id` integer PRIMARY KEY,
	`Label` text,
	`ContentsType` integer,
	`LocationsId` integer,
	`CharactersIds` text,
	`CostumesIds` text,
	`TimelinesIds` text
);
--> statement-breakpoint
CREATE TABLE `stageskillsets.tsv` (
	`F30fc26c1` integer,
	`F7d75f9c6` integer,
	`F131e7948` integer
);
--> statement-breakpoint
CREATE TABLE `rhythmgameskilleffects.tsv` (
	`F97df5e5f` integer,
	`F94c0803f` integer,
	`F2c77bc0c` text,
	`Fe9bbf3b2` integer,
	`F3f53d75e` integer
);
--> statement-breakpoint
CREATE TABLE `ChallengeModeEffectDetails` (
	`Id` integer PRIMARY KEY,
	`EffectDetailType` text,
	`TargetMood` integer,
	`EffectValue` integer
);
--> statement-breakpoint
CREATE TABLE `TutorialRewardDatas` (
	`Id` integer PRIMARY KEY,
	`TutorialsId` integer,
	`RewardType` integer,
	`RewardItemId` integer,
	`RewardNum` integer,
	`LifeTimeDay` integer,
	`RewardTextId` integer
);
--> statement-breakpoint
CREATE TABLE `gradechaltotalscorerewarddatas.tsv` (
	`F142d4146` integer,
	`Fa7cf0052` integer,
	`F226fa6ac` integer,
	`F39b6b744` integer,
	`Fbcd86086` integer,
	`Fc6068879` integer
);
--> statement-breakpoint
CREATE TABLE `emojicategory.tsv` (
	`F58d76b2e` integer,
	`Fe62981bb` text,
	`F44540da0` integer,
	`F997f5a15` text,
	`F4a3b926b` text
);
--> statement-breakpoint
CREATE TABLE `gradechalqueststages.tsv` (
	`Ff44f39e0` integer,
	`F966b4a50` integer,
	`F3635e73b` text,
	`F8f0b7ef1` text,
	`F5cd09a6e` text,
	`Fb819ae24` integer,
	`F82c7869e` integer,
	`F4f013f25` integer,
	`Fe51fc767` integer,
	`F92fd21ac` integer,
	`Fdae4b451` integer,
	`Ff0e36995` integer,
	`Fb31c7e07` integer,
	`F67b3d111` integer
);
--> statement-breakpoint
CREATE TABLE `dreamliveserieslist.tsv` (
	`F54493533` integer,
	`Faea45333` integer,
	`F461e8b8e` integer,
	`F8d12e855` text,
	`Fa2a1633f` text
);
--> statement-breakpoint
CREATE TABLE `CardSkillSeries` (
	`Id` integer PRIMARY KEY,
	`Name` text,
	`SkillIcon` integer,
	`SkillMainEffect` integer,
	`F896dfbb8` integer
);
--> statement-breakpoint
CREATE TABLE `EventMissionAchieveRewards` (
	`Id` integer PRIMARY KEY,
	`EvemtMissionSeriesId` integer,
	`AchieveMarkNum` integer,
	`RewardCategory` integer,
	`RewardType` integer,
	`ItemsId` integer,
	`RewardNum` integer,
	`RewardTextId` integer,
	`SortOrder` integer
);
--> statement-breakpoint
CREATE TABLE `SelectTicketSeries` (
	`Id` integer PRIMARY KEY,
	`ExchangeTicketName` text,
	`Description` text,
	`ExchangeTicketId` integer,
	`OrderId` integer,
	`PickUpCardSeriesId_1` integer,
	`PickUpCardSeriesId_2` integer,
	`PickUpCardSeriesId_3` integer,
	`PickUpCardSeriesId_4` integer,
	`PickUpCardSeriesId_5` integer,
	`PickUpCardSeriesId_6` integer,
	`BgType` integer,
	`StartTime` text,
	`EndTime` text,
	`Fbc8752a1` integer
);
--> statement-breakpoint
CREATE TABLE `AdvDatas` (
	`Id` integer PRIMARY KEY,
	`AdvSeriesId` integer,
	`Name` text,
	`Description` text,
	`ScriptId` integer,
	`OpenSeasonFanLevel` integer,
	`RewardType` text,
	`WatchRewardId` text,
	`WatchRewardNum` text,
	`RewardTextId` text,
	`OrderId` integer,
	`SubTitleName` text,
	`StartTime` text,
	`EndTime` text,
	`Fc6637ea8` integer
);
--> statement-breakpoint
CREATE TABLE `CardGetMovieSettings` (
	`Id` integer PRIMARY KEY,
	`CardInfoPositionType` integer,
	`CardInfoDisplayStartTimeSeconds` integer,
	`UrCardEffectBackgroundId` integer
);
--> statement-breakpoint
CREATE TABLE `LearningLiveReleaseConditions` (
	`Id` integer PRIMARY KEY,
	`ReleaseLearningLiveId` integer,
	`ConditionsType` integer,
	`ConditionsValue` integer,
	`StartTime` text,
	`EndTime` text
);
--> statement-breakpoint
CREATE TABLE `Tutorials` (
	`Id` integer PRIMARY KEY,
	`TutorialType` integer,
	`Step` integer,
	`Description` text
);
--> statement-breakpoint
CREATE TABLE `LivePoses` (
	`Id` integer PRIMARY KEY,
	`Label` text,
	`HandSide` integer
);
--> statement-breakpoint
CREATE TABLE `seasongrade.tsv` (
	`F94e2c96d` integer,
	`Fc9f23057` text,
	`F070e4eb1` text,
	`F2debdb28` text,
	`Fcad5cb2d` text,
	`F38309c06` text,
	`F7bc3906c` text,
	`F53b18727` text
);
--> statement-breakpoint
CREATE TABLE `GachaSeries` (
	`Id` integer PRIMARY KEY,
	`GachaSeriesName` text,
	`Description` text,
	`GachaType` integer,
	`LimitedGachaCount` integer,
	`LimitedGachaResetType` integer,
	`GachaExchangePointId` integer,
	`ExchangePointNoticeNum` integer,
	`ExchangePointLockFlag` integer,
	`OrderId` integer,
	`FilterType` integer,
	`PickUpCardSeriesId_1` integer,
	`PickUpCardBonusItemQuantity_1` integer,
	`PickUpCardSeriesId_2` integer,
	`PickUpCardBonusItemQuantity_2` integer,
	`PickUpCardSeriesId_3` integer,
	`PickUpCardBonusItemQuantity_3` integer,
	`PickUpCardSeriesId_4` integer,
	`PickUpCardBonusItemQuantity_4` integer,
	`PickUpCardSeriesId_5` integer,
	`PickUpCardBonusItemQuantity_5` integer,
	`PickUpCardSeriesId_6` integer,
	`PickUpCardBonusItemQuantity_6` integer,
	`BgType` integer,
	`StartTime` text,
	`EndTime` text,
	`Ff88684b7` text,
	`F295e380e` integer,
	`F2884ace0` integer,
	`F7ba681d9` integer
);
--> statement-breakpoint
CREATE TABLE `gradequestrewardsdatas.tsv` (
	`Fccef246b` integer,
	`Fb1a96478` integer,
	`F7c37394e` integer,
	`F354ef6a7` integer,
	`F3abe8cfe` integer
);
--> statement-breakpoint
CREATE TABLE `ExchangePointRate` (
	`Id` integer PRIMARY KEY,
	`ExchangePointId` integer,
	`ExchangeItemType` integer,
	`ExchangeItemId` integer,
	`ExchangeItemQuantity` integer,
	`ExchangePrice` integer,
	`LimitedCount` integer,
	`StartTime` text,
	`EndTime` text,
	`F4b84d5e7` integer,
	`F617e33de` integer
);
--> statement-breakpoint
CREATE TABLE `raidevents.tsv` (
	`Fe4cc557f` integer,
	`F84e84c1e` text,
	`Fa74bb41e` text,
	`Fff54eda3` integer,
	`F5642d207` text,
	`F98edcddf` text,
	`Fc5b09e8d` text,
	`F6239897a` text,
	`F07bf56a7` text
);
--> statement-breakpoint
CREATE TABLE `CardEvolutionMaterials` (
	`Id` integer PRIMARY KEY,
	`CostItemsId1` integer,
	`CostNum1` integer,
	`CostItemsId2` integer,
	`CostNum2` integer,
	`CostItemsId3` integer,
	`CostNum3` integer
);
--> statement-breakpoint
CREATE TABLE `DeckMemberPositions` (
	`Id` integer PRIMARY KEY,
	`GenerationsId` integer,
	`CharactersId` integer,
	`OrderId` integer,
	`StartTime` text,
	`EndTime` text
);
--> statement-breakpoint
CREATE TABLE `QuestLiveDownloads` (
	`Id` integer PRIMARY KEY,
	`Title` text,
	`OrderId` integer,
	`StartTime` text,
	`EndTime` text
);
--> statement-breakpoint
CREATE TABLE `musicscorerewarddatas.tsv` (
	`F86b89fee` integer,
	`Fabc08cf1` integer,
	`F4656d10d` integer,
	`F40cbba4a` integer,
	`Fee07019f` integer
);
--> statement-breakpoint
CREATE TABLE `GrandPrixQuestSeries` (
	`Id` integer PRIMARY KEY,
	`Name` text,
	`Description` text,
	`GrandPrixesId` integer,
	`PlayLimitCount` integer,
	`RetireLimitCount` integer,
	`OrderId` integer,
	`SeriesNum` integer,
	`StartTime` text,
	`EndTime` text
);
--> statement-breakpoint
CREATE TABLE `UnitCharacters` (
	`Id` integer PRIMARY KEY,
	`UnitsId` integer,
	`CharactersId` integer,
	`OrderId` integer
);
--> statement-breakpoint
CREATE TABLE `beginnermissionshintimages.tsv` (
	`Fbd2dce34` integer,
	`Feb74af78` integer,
	`F653bed61` integer
);
--> statement-breakpoint
CREATE TABLE `centerskilleffects.tsv` (
	`Ffcd420b7` integer,
	`F36eb0e8b` integer,
	`F2515afa9` integer
);
--> statement-breakpoint
CREATE TABLE `raidrewards.tsv` (
	`F68bba507` integer,
	`F10704a19` integer,
	`Fc7aa1e4b` integer,
	`Fc2247d62` integer
);
--> statement-breakpoint
CREATE TABLE `SectionSkills` (
	`Id` integer PRIMARY KEY,
	`Description` text,
	`ApperanceType` integer,
	`SkillIcon` integer,
	`SectionSkillsEffectId` text
);
--> statement-breakpoint
CREATE TABLE `Stickers` (
	`Id` integer PRIMARY KEY,
	`Name` text,
	`Text` text,
	`CategoryType` integer,
	`CategoryName` integer,
	`SeasonId` integer,
	`CharactersId` integer,
	`Priority` integer,
	`IsVariant` integer,
	`RequirementType` integer,
	`RequirementDetail` text,
	`RequirementValue` integer,
	`RequirementText` text,
	`EditRequirementType` integer,
	`EditRequirementDetail` text,
	`EditRequirementValue` integer,
	`EditRequirementText` text,
	`IsVisibleOnlyPossess` integer,
	`StartTime` text,
	`EndTime` text,
	`AvailableStartTime` text,
	`AvailableEndTime` text,
	`VariantStartTime` text,
	`VariantEndTime` text
);
--> statement-breakpoint
CREATE TABLE `musicscores.tsv` (
	`Fb44b3ff9` integer,
	`Fcc787c69` integer,
	`F0e9527fa` integer,
	`F6e8b542a` integer,
	`Ff24f5360` integer,
	`Ff101fbad` integer,
	`F89a0e79c` integer,
	`Ffa34c59a` integer,
	`F54715d7e` integer,
	`Fa2670946` integer,
	`F3932e468` integer,
	`Fe5191065` integer,
	`F5170a113` integer,
	`F93f303d9` integer,
	`F858e0951` integer,
	`F4df52f35` integer,
	`F39500e08` integer,
	`Fee03a4d7` integer,
	`Fd7ae8d40` integer
);
--> statement-breakpoint
CREATE TABLE `Units` (
	`Id` integer PRIMARY KEY,
	`UnitName` text,
	`OrderId` integer,
	`StartTime` text,
	`EndTime` text
);
--> statement-breakpoint
CREATE TABLE `SimulationGraphLimit` (
	`Id` integer PRIMARY KEY,
	`NumberOfMember` integer,
	`UpperLimitSmile` integer,
	`UpperLimitPure` integer,
	`UpperLimitCool` integer,
	`UpperLimitMental` integer,
	`UpperLimitBP` integer
);
--> statement-breakpoint
CREATE TABLE `ChallengeModeEffects` (
	`Id` integer PRIMARY KEY,
	`StandardQuestStagesId` integer,
	`ActionType` integer,
	`OrderId` integer,
	`Description` text
);
--> statement-breakpoint
CREATE TABLE `livemovies.tsv` (
	`F40492f15` integer,
	`F1053ab0d` text
);
--> statement-breakpoint
CREATE TABLE `Generations` (
	`Id` integer PRIMARY KEY,
	`Name` text,
	`StartTime` text,
	`EndTime` text,
	`Fd3775d1f` integer,
	`F0f093696` integer
);
--> statement-breakpoint
CREATE TABLE `rhythmgameclassdatas.tsv` (
	`F227a9e92` integer,
	`F638e1c31` text,
	`F2c3a3d1e` integer,
	`Fea741c56` integer,
	`F86288421` integer,
	`F3e6b834c` integer,
	`F24ab516f` integer,
	`F92467b13` text,
	`F0c6649a2` text
);
--> statement-breakpoint
CREATE TABLE `CardSkills` (
	`Id` integer PRIMARY KEY,
	`CardSkillSeriesId` integer,
	`SkillLevel` integer,
	`SkillCost` integer,
	`ApperanceType` integer,
	`CardSkillEffectId` text,
	`Description` text
);
--> statement-breakpoint
CREATE TABLE `ChallengeModeStages` (
	`Id` integer PRIMARY KEY,
	`ChallengeModeAreasId` integer,
	`CorrespondedQuestStageId` integer,
	`Name` text,
	`Description` text,
	`Hint` text,
	`MapNumber` integer,
	`StageType` integer,
	`UseType` integer,
	`UseItem` integer,
	`UseNum` integer,
	`LiveStagesId` integer,
	`QuestMusicsType` integer,
	`QuestMusicsDetail` integer,
	`DeckRestrictedType` integer,
	`DeckRestrictedDetail` integer,
	`ChallengeModeEffectId` integer,
	`QuestLevel` integer,
	`FirstClearRewardSeriesId` integer,
	`ChallengeModeScore` integer
);
--> statement-breakpoint
CREATE TABLE `rhythmgameskilllvupitems.tsv` (
	`F5f11e0dc` integer,
	`F2ccded19` integer,
	`Fcb410bd3` integer,
	`F6704d872` integer
);
--> statement-breakpoint
CREATE TABLE `GrandPrix` (
	`Id` integer PRIMARY KEY,
	`Name` text,
	`Description` text,
	`GrandPrixType` integer,
	`GuildRankingTabs` text,
	`PersonalRankingTabs` text,
	`GuildPresentCommentId` integer,
	`PersonalPresentCommentId` integer,
	`InfoStartTime` text,
	`InfoEndTime` text,
	`StartTime` text,
	`EndTime` text
);
--> statement-breakpoint
CREATE TABLE `GachaCampaigns` (
	`Id` integer PRIMARY KEY,
	`CampaignName` text,
	`CampaignType` integer,
	`ConsectiveTimesType` integer,
	`ResetType` integer,
	`PerDayCampaignTimes` integer,
	`GachaSeriesId_1` integer,
	`GachaSeriesId_2` integer,
	`GachaSeriesId_3` integer,
	`GachaSeriesId_4` integer,
	`GachaSeriesId_5` integer,
	`StartTime` text,
	`EndTime` text,
	`F46cc5d1a` integer
);
--> statement-breakpoint
CREATE TABLE `gradechaltotalscorerewards.tsv` (
	`Ff8d16c13` integer,
	`F87e46d32` integer,
	`F65b477f1` integer,
	`F2ab88975` integer
);
--> statement-breakpoint
CREATE TABLE `contentguidances.tsv` (
	`Ff55dc9bb` integer,
	`Fc90b619c` integer,
	`F187b7ed3` integer,
	`F1c4bf00f` integer,
	`F4815601c` integer,
	`F4aea1478` text
);
--> statement-breakpoint
CREATE TABLE `PetalCoinExchangeRate` (
	`Id` integer PRIMARY KEY,
	`Rarity` integer,
	`PetalCoinQuantity` integer
);

*/