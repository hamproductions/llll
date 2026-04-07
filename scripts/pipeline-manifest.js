export const imageAssetPipelines = [
  {
    key: 'skillicon',
    pattern: 'icon_skill_%',
    logPrefix: '[GetAssets-SkillIcon]',
    localDir: 'data/assets/skillicon',
    sourceExt: 'png',
    outputExt: 'webp'
  },
  {
    key: 'token',
    pattern: '%image_card_middle_vertical_8%%',
    logPrefix: '[GetAssets-Token]',
    localDir: 'data/assets/token',
    sourceExt: 'png',
    outputExt: 'webp'
  },
  {
    key: 'attribute',
    pattern: 'attribute',
    logPrefix: '[GetAssets-Attribute]',
    localDir: 'data/assets/attribute',
    sourceExt: 'png',
    outputExt: 'webp'
  },
  {
    key: 'charaicon',
    pattern: 'charamini',
    logPrefix: '[GetAssets-CharaIcon]',
    localDir: 'data/assets/charaicon',
    sourceExt: 'png',
    outputExt: 'webp'
  },
  {
    key: 'charasymbol',
    pattern: 'charasymbol',
    logPrefix: '[GetAssets-CharaSymbol]',
    localDir: 'data/assets/charasymbol',
    sourceExt: 'png',
    outputExt: 'webp'
  },
  {
    key: 'itemframe',
    pattern: 'itemframe',
    logPrefix: '[GetAssets-ItemFrame]',
    localDir: 'data/assets/itemframe',
    sourceExt: 'png',
    outputExt: 'webp'
  },
  {
    key: 'rarity',
    pattern: 'ui_schoolidolstage2_rarity_%',
    logPrefix: '[GetAssets-Rarity]',
    localDir: 'data/assets/rarity',
    sourceExt: 'png',
    outputExt: 'webp'
  },
  {
    key: 'card-frame',
    pattern: 'image_card_frame_small_%',
    logPrefix: '[GetAssets-CardFrame]',
    localDir: 'data/assets/card-frame',
    sourceExt: 'png',
    outputExt: 'webp'
  },
  {
    key: 'album-art',
    pattern: 'image_music_thumbnail_%',
    logPrefix: '[GetAssets-AlbumArt]',
    localDir: 'data/assets/album-art',
    sourceExt: 'png',
    outputExt: 'webp'
  },
  {
    key: 'stickers',
    pattern: 'image_sticker_%',
    logPrefix: '[GetAssets-Stickers]',
    localDir: 'data/stickers',
    sourceExt: 'png',
    outputExt: 'webp'
  },
  {
    key: 'story-backgrounds',
    pattern: 'story_bg_image_%',
    logPrefix: '[GetAssets-StoryBackgrounds]',
    localDir: 'data/story/backgrounds',
    sourceExt: 'png',
    outputExt: 'webp'
  },
  {
    key: 'story-thumbnails',
    pattern: 'story_thumbnail_%',
    logPrefix: '[GetAssets-StoryThumbnails]',
    localDir: 'data/story/thumbnails',
    sourceExt: 'png',
    outputExt: 'webp'
  },
  {
    key: 'story-monthly-covers',
    pattern: 'image_record_monthly_%',
    logPrefix: '[GetAssets-StoryMonthlyCovers]',
    localDir: 'data/story/monthly',
    sourceExt: 'png',
    outputExt: 'webp'
  },
  {
    key: 'story-parts',
    pattern: 'image_record_monthly_part_%',
    logPrefix: '[GetAssets-StoryParts]',
    localDir: 'data/story/parts',
    sourceExt: 'png',
    outputExt: 'webp'
  },
  {
    key: 'character-profile-base',
    pattern: 'image_prof_data_chara_%',
    logPrefix: '[GetAssets-CharacterProfileBase]',
    localDir: 'data/characters/profile/base',
    sourceExt: 'png',
    outputExt: 'webp'
  },
  {
    key: 'character-profile-season',
    pattern: 'image_prof_data_chara_season_%',
    logPrefix: '[GetAssets-CharacterProfileSeason]',
    localDir: 'data/characters/profile/season',
    sourceExt: 'png',
    outputExt: 'webp'
  },
  {
    key: 'character-profile-custom',
    pattern: 'image_prof_custom_%',
    logPrefix: '[GetAssets-CharacterProfileCustom]',
    localDir: 'data/characters/profile/custom',
    sourceExt: 'png',
    outputExt: 'webp'
  },
  {
    key: 'gacha-top',
    pattern: 'image_gacha_top_%',
    logPrefix: '[GetAssets-GachaTop]',
    localDir: 'data/gacha/top',
    sourceExt: 'png',
    outputExt: 'webp'
  },
  {
    key: 'gacha-pack-turn-18',
    pattern: 'image_gacha_pack_turn_18_%',
    logPrefix: '[GetAssets-GachaPackTurn18]',
    localDir: 'data/gacha/pack-turn-18',
    sourceExt: 'png',
    outputExt: 'webp'
  },
  {
    key: 'gacha-pack-full',
    pattern: 'image_gacha_pack_full_%',
    logPrefix: '[GetAssets-GachaPackFull]',
    localDir: 'data/gacha/pack-full',
    sourceExt: 'png',
    outputExt: 'webp'
  },
  {
    key: 'gacha-cardinfo',
    pattern: 'image_gacha_cardinfo_%',
    logPrefix: '[GetAssets-GachaCardInfo]',
    localDir: 'data/gacha/cardinfo',
    sourceExt: 'png',
    outputExt: 'webp'
  },
  {
    key: 'gacha-banner',
    pattern: 'image_gacha_banner_%',
    logPrefix: '[GetAssets-GachaBanner]',
    localDir: 'data/gacha/banner',
    sourceExt: 'png',
    outputExt: 'webp'
  },
  {
    key: 'downloads-os',
    pattern: 'image_download_os_%',
    logPrefix: '[GetAssets-DownloadsOs]',
    localDir: 'data/downloads/os',
    sourceExt: 'png',
    outputExt: 'webp'
  },
  {
    key: 'live-stage-image',
    pattern: 'live_stage_image_%',
    logPrefix: '[GetAssets-LiveStageImage]',
    localDir: 'data/live/stages',
    sourceExt: 'png',
    outputExt: 'webp'
  },
  {
    key: 'grand-prix-logo',
    pattern: 'image_grand_prix_logo_%',
    logPrefix: '[GetAssets-GrandPrixLogo]',
    localDir: 'data/grand-prix/logo',
    sourceExt: 'png',
    outputExt: 'webp'
  },
  {
    key: 'character-profile-etc',
    pattern: 'image_prof_etc_%',
    logPrefix: '[GetAssets-CharacterProfileEtc]',
    localDir: 'data/characters/profile/etc',
    sourceExt: 'png',
    outputExt: 'webp'
  },
  {
    key: 'item-atlas',
    pattern: 'item',
    logPrefix: '[GetAssets-ItemAtlas]',
    localDir: 'data/assets/items',
    sourceExt: 'spriteatlas',
    outputExt: 'png'
  },
  {
    key: 'emoji-atlas',
    pattern: 'sc_emoji_atlas',
    logPrefix: '[GetAssets-EmojiAtlas]',
    localDir: 'data/assets/emoji',
    sourceExt: 'png',
    outputExt: 'png'
  },
  {
    key: 'emoji-sprite',
    pattern: 'sc_emoji_sprite',
    logPrefix: '[GetAssets-EmojiSprite]',
    localDir: 'data/assets/emoji',
    sourceExt: 'asset',
    outputExt: 'asset'
  }
];

export const acbAssetPipelines = [
  {
    key: 'story-voice',
    pattern: 'vo_adv_%',
    logPrefix: '[GetAssets-StoryVoices]',
    localDir: 'data/story/voice',
    sourceExt: 'acb',
    outputExt: 'webm'
  }
];

export const uploadTargets = [
  { local: 'data/assets', gcs: 'assets' },
  { local: 'data/assets/album-art', gcs: 'album-art' },
  { local: 'data/cards', gcs: 'cards' },
  { local: 'data/stickers', gcs: 'stickers' },
  { local: 'data/story/voice', gcs: 'story/voice' },
  { local: 'data/story/backgrounds', gcs: 'story/backgrounds' },
  { local: 'data/story/thumbnails', gcs: 'story/thumbnails' },
  { local: 'data/story/parts', gcs: 'story/parts' },
  { local: 'data/story/monthly', gcs: 'story/monthly' },
  { local: 'data/characters/profile/base', gcs: 'characters/profile/base' },
  { local: 'data/characters/profile/season', gcs: 'characters/profile/season' },
  { local: 'data/characters/profile/custom', gcs: 'characters/profile/custom' },
  { local: 'data/gacha/top', gcs: 'gacha/top' },
  { local: 'data/gacha/pack-turn-18', gcs: 'gacha/pack-turn-18' },
  { local: 'data/gacha/pack-full', gcs: 'gacha/pack-full' },
  { local: 'data/gacha/cardinfo', gcs: 'gacha/cardinfo' },
  { local: 'data/gacha/banner', gcs: 'gacha/banner' },
  { local: 'data/downloads/os', gcs: 'downloads/os' },
  { local: 'data/live/stages', gcs: 'live/stages' },
  { local: 'data/grand-prix/logo', gcs: 'grand-prix/logo' },
  { local: 'data/characters/profile/etc', gcs: 'characters/profile/etc' },
  { local: 'data/assets/items', gcs: 'assets/items' },
  { local: 'data/assets/items/individual', gcs: 'assets/items/individual' },
  { local: 'data/assets/emoji', gcs: 'assets/emoji' },
  { local: 'data/assets/emoji/individual', gcs: 'assets/emoji/individual' },
  { local: '../data/assets/photo_10512/final', gcs: 'photo_10512' },
  { local: '../data/music/mp3', gcs: 'music/mp3' },
  { local: '../data/music/out', gcs: 'music/wav' },
  { local: 'data/3d', gcs: '3d' }
];

export const auditTargets = [
  ...imageAssetPipelines,
  ...acbAssetPipelines,
  {
    key: 'music-live',
    pattern: 'bgm_live_%',
    logPrefix: '[Audit-LiveMusic]',
    localDir: '../data/music/mp3',
    sourceExt: 'acb',
    outputExt: 'mp3'
  },
  {
    key: 'music-bgm',
    pattern: 'bgm_adv_%',
    logPrefix: '[Audit-Bgm]',
    localDir: '../data/music/out',
    sourceExt: 'acb',
    outputExt: 'wav'
  }
];
