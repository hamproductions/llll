# Gacha

Gacha is split into a light index and a heavier detail page.

## Acceptance Criteria

- `/gacha` is a light, visual index showing gacha banners with minimal text
- No dense metadata, tables, or dev-facing info on the index
- `/gacha/:id` is a detail page showing full gacha information including banner art, card info images, and campaign details
- All gacha asset families render correctly: `image_gacha_top_*`, `image_gacha_banner_*`, `image_gacha_pack_*`, `image_gacha_cardinfo_*`
