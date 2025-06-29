import { join } from 'path-browserify';

const getAssetUrl = (path: string) => {
  return join(import.meta.env.PUBLIC_ENV__BASE_URL ?? '/', path);
};
export const getPicUrl = (
  id: string,
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  type: 'styleIcon' | 'icons' | 'character' | 'thumbnail' | string = 'character'
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
