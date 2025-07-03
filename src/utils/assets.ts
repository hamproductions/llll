import { join } from 'path-browserify';

const getAssetUrl = (path: string) => {
  return join(import.meta.env.PUBLIC_ENV__BASE_URL ?? '/', path);
};
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
        return `assets/skillicon/skill_icon_skill_${id}.webp`;
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
