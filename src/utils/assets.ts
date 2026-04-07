import { join } from 'path-browserify';

const rootDataDir = import.meta.env.PUBLIC_ENV__ROOT_DATA_DIR;
const appDataDir = import.meta.env.PUBLIC_ENV__APP_DATA_DIR;

const joinAssetUrl = (...parts: string[]) =>
  parts
    .filter(Boolean)
    .join('/')
    .replace(/\/+/g, '/')
    .replace('http:/', 'http://')
    .replace('https:/', 'https://');

const getRootDataUrl = (...parts: string[]) => {
  if (!import.meta.env.DEV || !rootDataDir) {
    return null;
  }

  return joinAssetUrl('/@fs', rootDataDir, ...parts);
};

const getAppDataUrl = (...parts: string[]) => {
  if (!import.meta.env.DEV || !appDataDir) {
    return null;
  }

  return joinAssetUrl('/@fs', appDataDir, ...parts);
};

export const getAssetUrl = (path: string) => {
  const gcsBaseUrl = import.meta.env.PUBLIC_ENV__GCS_BASE_URL;
  const localBaseUrl = import.meta.env.PUBLIC_ENV__BASE_URL ?? '/';

  if (gcsBaseUrl) {
    return joinAssetUrl(gcsBaseUrl, path);
  }

  return join(localBaseUrl, path);
};
export const get3dAssetUrl = (assetPath: string) =>
  getAppDataUrl('3d', assetPath) ?? getAssetUrl(join('3d', assetPath));

export const getPicUrl = (
  id: string,
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  type: 'styleIcon' | 'icons' | 'character' | 'thumbnail' | 'skillIcon' | string = 'character'
) => {
  const fileName = (() => {
    switch (type) {
      case 'styleIcon':
        return `assets/attribute/attribute_icon_style_type_${id.padStart(2, '0')}.webp`;
      case 'charaIcon':
        return `assets/charaicon/charamini_icon_face_sd_${id}_01.webp`;
      case 'charaSymbol':
        return `assets/charasymbol/charasymbol_icon_charasymbol_${id}.webp`;
      case 'itemFrame':
        return `assets/itemframe/itemframe_icon_itemframe_emoji_{id}.webp`;
      case 'skillIcon':
        return `assets/skillicon/icon_skill_${id}.webp`;
      case 'token':
        return `assets/token/image_card_middle_vertical_${id}.webp`;
      default:
        return 'assets/';
    }
  })();

  return getAssetUrl(join(fileName));
};

export const getAlbumArtPublicPath = (songId: number | string): string => {
  return getAssetUrl(join('album-art', `image_music_thumbnail_${songId}.webp`));
};

export const getMusicTrackUrl = (soundId: number | string): string => {
  return (
    getRootDataUrl('music', 'mp3', `bgm_live_${soundId}.mp3`) ??
    getAssetUrl(join('music', 'mp3', `bgm_live_${soundId}.mp3`))
  );
};

export const getBgmAudioUrl = (bgmId: number | string): string => {
  const fileName =
    typeof bgmId === 'string' && /\.(wav|mp3|webm)$/i.test(bgmId) ? bgmId : `${bgmId}.wav`;

  return getRootDataUrl('music', 'out', fileName) ?? getAssetUrl(join('music', 'wav', fileName));
};

export const getCardUrl = (id: number, variantId: string): string => {
  return getAssetUrl(join(`cards/${id}/images`, `image_card_full_${variantId}.webp`));
};

export const getCardImageUrl = (id: number, variant: 0 | 1): string => {
  return getAssetUrl(join(`cards/${id}/images`, `image_card_full_${id}${variant}.webp`));
};

export const getCardAudioUrl = (id: number, type: string): string => {
  return getAssetUrl(join(`cards/${id}/voice`, `vo_card_${id}_${type}.webm`));
};

export const getCardAudioFile = (id: number, fileName: string): string => {
  return getAssetUrl(join(`cards/${id}/voice`, `${fileName}.webm`));
};

export const getCardVideoUrl = (id: number, type: string, variant?: string): string => {
  let filename = '';
  switch (type) {
    case 'get_in':
      filename = `picture_ur_get_${id}_in.webm`;
      break;
    case 'get_loop':
      filename = `picture_ur_get_${id}_loop.webm`;
      break;
    case 'training_in':
      filename = `picture_ur_training_${id}_in.webm`;
      break;
    case 'training_loop':
      filename = `picture_ur_training_${id}_loop.webm`;
      break;
    case 'home':
      if (variant !== undefined) {
        filename = `picture_ur_home_${id}${variant}.webm`;
      } else {
        console.warn(`Variant not provided for home video type for card ${id}`);
        return '';
      }
      break;
    default:
      console.warn(`Unknown video type: ${type} for card ${id}`);
      return '';
  }
  return getAssetUrl(join(`cards/${id}/videos`, filename));
};

export const getStoryScriptUrl = (scriptId: number | string): string => {
  return getAssetUrl(join('story', `story_main_${scriptId}.txt`));
};

export const getStoryBGMUrl = (bgmId: string): string => {
  return getBgmAudioUrl(bgmId);
};

export const getStoryVoiceUrl = (voiceId: string): string => {
  return getAssetUrl(join('story', 'voice', `${voiceId}.webm`));
};

export const getStoryBackgroundUrl = (bgId: string): string => {
  return getAssetUrl(join('story', 'backgrounds', `${bgId}.webp`));
};

export const getStoryThumbnailUrl = (scriptId: number | string): string => {
  const fileName = `story_thumbnail_${scriptId}.webp`;
  return getAppDataUrl('story', 'thumbnails', fileName) ?? getAssetUrl(join('story', 'thumbnails', fileName));
};

export const getStoryPartImageUrl = (scriptId: number | string): string => {
  const fileName = `image_record_monthly_part_${scriptId}.webp`;
  return getAppDataUrl('story', 'parts', fileName) ?? getAssetUrl(join('story', 'parts', fileName));
};

export const getStoryMonthlyImageUrl = (storyId: number | string): string => {
  const fileName = `image_record_monthly_${storyId}.webp`;
  return getAppDataUrl('story', 'monthly', fileName) ?? getAssetUrl(join('story', 'monthly', fileName));
};

export const getStickerImageUrl = (stickerId: number | string): string => {
  const fileName = `image_sticker_${stickerId}.webp`;
  return getAppDataUrl('stickers', fileName) ?? getAssetUrl(join('stickers', fileName));
};

export const getCharacterProfileImageUrl = (characterId: number | string): string => {
  const fileName = `image_prof_data_chara_${characterId}.webp`;
  return (
    getAppDataUrl('characters', 'profile', 'base', fileName) ??
    getAssetUrl(join('characters', 'profile', 'base', fileName))
  );
};

export const getCharacterSeasonProfileImageUrl = (
  characterId: number | string,
  seasonId: number | string
): string => {
  const fileName = `image_prof_data_chara_season_${characterId}_${seasonId}.webp`;
  return (
    getAppDataUrl('characters', 'profile', 'season', fileName) ??
    getAssetUrl(join('characters', 'profile', 'season', fileName))
  );
};

export const getProfileEtcImageUrl = (id: number | string): string => {
  const fileName = `image_prof_etc_${id}.webp`;
  return (
    getAppDataUrl('characters', 'profile', 'etc', fileName) ??
    getAssetUrl(join('characters', 'profile', 'etc', fileName))
  );
};

export const getCharacterCustomProfileImageUrl = (cardDataId: number | string): string => {
  const fileName = `image_prof_custom_${cardDataId}.webp`;
  return (
    getAppDataUrl('characters', 'profile', 'custom', fileName) ??
    getAssetUrl(join('characters', 'profile', 'custom', fileName))
  );
};

export const getGachaTopImageUrl = (gachaSeriesId: number | string): string => {
  const fileName = `image_gacha_top_${gachaSeriesId}.webp`;
  return getAppDataUrl('gacha', 'top', fileName) ?? getAssetUrl(join('gacha', 'top', fileName));
};

export const getGachaPackTurnImageUrl = (gachaSeriesId: number | string): string => {
  const fileName = `image_gacha_pack_turn_18_${gachaSeriesId}.webp`;
  return (
    getAppDataUrl('gacha', 'pack-turn-18', fileName) ??
    getAssetUrl(join('gacha', 'pack-turn-18', fileName))
  );
};

export const getGachaPackFullImageUrl = (gachaSeriesId: number | string): string => {
  const fileName = `image_gacha_pack_full_${gachaSeriesId}.webp`;
  return (
    getAppDataUrl('gacha', 'pack-full', fileName) ??
    getAssetUrl(join('gacha', 'pack-full', fileName))
  );
};

export const getGachaBannerImageUrl = (gachaSeriesId: number | string): string => {
  const fileName = `image_gacha_banner_${gachaSeriesId}.webp`;
  return (
    getAppDataUrl('gacha', 'banner', fileName) ??
    getAssetUrl(join('gacha', 'banner', fileName))
  );
};

export const getGachaCardInfoImageUrl = (
  characterId: number | string,
  variantId: number | string
): string => {
  const fileName = `image_gacha_cardinfo_${characterId}_${String(variantId).padStart(2, '0')}.webp`;
  return (
    getAppDataUrl('gacha', 'cardinfo', fileName) ??
    getAssetUrl(join('gacha', 'cardinfo', fileName))
  );
};

export const getDownloadImageUrl = (downloadId: number | string): string => {
  const fileName = `image_download_os_${downloadId}.webp`;
  return (
    getAppDataUrl('downloads', 'os', fileName) ??
    getAssetUrl(join('downloads', 'os', fileName))
  );
};

export const getItemIconUrl = (itemId: number | string): string => {
  const fileName = `icon_item_${itemId}.png`;
  return (
    getAppDataUrl('assets', 'items', 'individual', fileName) ??
    getRootDataUrl('assets', 'items', 'individual', fileName) ??
    getAssetUrl(join('assets', 'items', 'individual', fileName))
  );
};

export const getEmojiImageUrl = (slug: string): string => {
  const fileName = `${slug}.png`;
  return (
    getAppDataUrl('assets', 'emoji', 'individual', fileName) ??
    getRootDataUrl('assets', 'emoji', 'individual', fileName) ??
    getAssetUrl(join('assets', 'emoji', 'individual', fileName))
  );
};

export const getPhotoStoryImageUrl = (photoId: number | string): string => {
  const fileName = `photo_${photoId}.png`;
  return getRootDataUrl('assets', 'photo_10512', 'final', fileName) ?? getAssetUrl(join('photo_10512', fileName));
};

export const getLiveStageImageUrl = (liveStageId: number | string): string => {
  const fileName = `live_stage_image_${liveStageId}.webp`;
  return (
    getAppDataUrl('live', 'stages', fileName) ??
    getAssetUrl(join('live', 'stages', fileName))
  );
};

export const getGrandPrixLogoUrl = (grandPrixLogoId: number | string): string => {
  const fileName = `image_grand_prix_logo_${grandPrixLogoId}.webp`;
  return (
    getAppDataUrl('grand-prix', 'logo', fileName) ??
    getAssetUrl(join('grand-prix', 'logo', fileName))
  );
};
