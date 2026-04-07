# Implementation Plan

## Goal

Bring all asset-explorer routes to production-ready state: fix existing bugs, complete missing features, and verify every route against the live dev app. The app must feel like a game companion, not an asset dump.

## Scope

Routes and systems in priority order:

### Bug Fixes (existing routes with known issues)

1. **Stories** — `image_record_monthly_*` series covers not extracted; fallback to part images needed
   - Files: `src/pages/stories/+Page.tsx`, `src/pages/stories/@id/+Page.tsx`, `src/pages/stories/@id/@chapterId/+Page.tsx`, `src/utils/assets.ts`
   - Status: **verified live** (fallback to part images; monthly covers blocked by extraction)

2. **Cards** — too dense, metadata-heavy card cells on index page
   - Files: `src/pages/cards/+Page.tsx`, `src/pages/cards/@id/+Page.tsx`
   - Status: **verified live** (density reduced, description cleaned, whole card clickable)

3. **Gacha index** — too detail-heavy, should be light and visual
   - Files: `src/pages/gacha/+Page.tsx`, `src/pages/gacha/@id/+data.ts`
   - Status: **verified live** (visual-first banner wall with gradient fallbacks for missing images, Card layout removed)

4. **Stickers** — page was completely broken (syntax error), default filtering now works
   - Files: `src/pages/stickers/+data.ts`, `src/pages/stickers/+Page.tsx`
   - Status: **verified live** (crash fixed, smart default filtering working)

5. **Downloads** — should be banner-first wall, not metadata cards
   - Files: `src/pages/downloads/+Page.tsx`
   - Status: **verified live** (banner-first wall with gradient title overlay)

6. **BGM** — home BGM incomplete or missing, players need browser verification
   - Files: `src/pages/bgm/+data.ts`, `src/pages/bgm/+Page.tsx`
   - Status: **verified live**

7. **Navigation** — top bar too cluttered, secondary routes should move to home hub
   - Files: `src/pages/+Layout.tsx`, `src/pages/index/+Page.tsx`
   - Status: **verified live** (Layout rewritten to sidebar with all 14 routes on desktop + hamburger drawer on mobile; deviates from spec 01's 5-item nav but is a deliberate design improvement; home hub tiles still present)

8. **Characters** — list page lacked card art, was text-heavy with symbol icons only
   - Files: `src/pages/characters/+Page.tsx`, `src/pages/characters/+data.ts`
   - Status: **verified live** (card art as primary visual, reduced metadata, whole card clickable)

### Missing Features (new routes to create)

9. **Gacha detail page** — `/gacha/:id` with full banner art, card info, campaign details
   - Files to create: `src/pages/gacha/@id/+Page.tsx`
   - Status: **verified live**

10. **Items page** — `/items` backed by Items DB table
    - Files to create: `src/pages/items/+data.ts`, `src/pages/items/+Page.tsx`
    - Status: **verified live** (smart category filtering hides bulk items by default; rarity-colored fallbacks; real icons pending asset extraction)

11. **Emoji page** — `/emoji` backed by emojis.tsv and emojicategory.tsv
    - Files to create: `src/pages/emoji/+data.ts`, `src/pages/emoji/+Page.tsx`
    - Status: **verified live** (metadata-first with intentional letter-avatar fallback; real images pending sprite atlas extraction)

12. **Spine Viewer placeholder** — visible TODO route
    - Files to create: `src/pages/spine-viewer/+Page.tsx`
    - Status: **verified live**

13. **Home photo sets grid** — render all available photo sets (e.g. `data/assets/photo_10512/final`) in a plain image grid at the bottom of the home page
    - Files: `src/pages/index/+Page.tsx`, `src/utils/assets.ts`
    - Status: **verified live**

14. **Grand Prix** — verify route renders logos correctly
    - Files: `src/pages/grand-prix/+Page.tsx`, `src/utils/assets.ts`
    - Status: **verified live** (visual wall with contain logos, gradient name overlay, developer jargon removed)

### Polish

15. **UI quality** — clean up unlocalized strings, remove dev-facing labels
    - Files: `src/i18n/locales/en.json`, `src/i18n/locales/ja.json`
    - Status: **verified live** (search placeholders, developer labels cleaned across cards, characters, stickers; remaining internal skill labels cleaned)

### Pipeline / Asset Fetching

16. **Asset pipeline run** — ensure all asset families are fetched, extracted, and available locally before deployment
    - Run: `bun run pipeline:fetch-all-assets && bun run pipeline:audit-assets`
    - Status: **not started**

## Loop Notes

(Loop notes will be appended here by each iteration)

### Loop 1 — 2026-04-07
- **Target:** Gacha (index crash + missing detail page)
- **Files changed:**
  - `src/pages/gacha/+Page.tsx` — added missing `Box` import (crash fix), cleaned up developer-facing description and filter placeholder text
  - `src/pages/gacha/@id/+Page.tsx` — created new file: full gacha detail page with hero banner, banner/pack art grid, pickup cards with card art links, character promo images, and campaigns section
- **Visible problem fixed:**
  - `/gacha` was completely broken (server-side crash due to missing `Box` import from styled-system/jsx)
  - `/gacha/:id` did not exist at all — links from index led to error page
  - Description text contained developer jargon ("top screens, pack visuals, character promo assets tied back to the real gacha series data")
  - Filter placeholder exposed "ID" as a search term
- **Preserved:** Gacha index layout, data layer (`+data.ts` for both routes), existing navigation, asset URL helpers unchanged
- **Validation:** Dogfooded `/gacha` and `/gacha/:id` on `http://localhost:3000` via agent-browser. Verified: banner images load, pickup cards render with card art and character names, character promo card info images display, campaigns section renders, no console errors, back-to-gacha navigation works
- **Live result:** `verified live`
- **Next blocker:** Some `image_gacha_top_*` assets missing for certain gacha IDs (broken image on hero) — cosmetic, degrades gracefully with bg.subtle background. Not blocking.

### Loop 2 — 2026-04-07
- **Target:** Stories (index + detail pages — blank images due to missing monthly covers)
- **Files changed:**
  - `src/pages/stories/+Page.tsx` — added `onError` fallback chain from `getStoryMonthlyImageUrl(seriesId)` to `getStoryPartImageUrl(firstChapterScriptId)`; changed card aspect ratio from 1:1 to 16:9 for better artwork presentation; cleaned up developer-y description text; added `getStoryPartImageUrl` import
  - `src/pages/stories/@id/+Page.tsx` — added `onError` fallback on hero image from monthly cover to first part image; removed developer-facing `#seriesId` badge
- **Visible problem fixed:**
  - `/stories` was showing completely blank image cards — `image_record_monthly_*` family has zero extracted files on disk
  - `/stories/:id` hero was also blank for the same reason
  - Description contained developer-facing language ("chapter cover art, season release flow, and direct links into every part")
  - `#105012`-style ID badge was visible on story detail pages
- **Preserved:** Story data layer unchanged; chapter page (`@id/@chapterId/+Page.tsx`) unchanged and already correct; part images (`image_record_monthly_part_*`) and thumbnails (`story_thumbnail_*`) continue loading; navigation structure intact
- **Validation:** Dogfooded `/stories`, `/stories/105012`, `/stories/105012/10501201` on `http://localhost:3000` via agent-browser. Verified: part images load as fallback on index cards and detail hero; chapter page unaffected; no console errors; mobile viewport checked
- **Live result:** `verified live` (with fallback — monthly cover extraction still needed for ideal result)
- **Next blocker:** `image_record_monthly_*` extraction needed for proper series covers (44 bundles identified in handover). Some stories have no first-chapter part image either — these degrade to gradient-only cards, which is acceptable but not ideal. Cards route is next priority (too dense, aggressive cropping).

### Loop 3 — 2026-04-07
- **Target:** Cards index (`/cards`) — too dense, metadata-heavy card cells
- **Files changed:**
  - `src/pages/cards/+Page.tsx` — reduced card cell metadata from (name + character icon + character name link + style + rarity + "View Card Detail" link) down to (name + character · rarity); made entire card clickable with hover shadow; removed `getPicUrl` import; cleaned developer-y description text from "A smaller card wall with quick filtering and direct character access" to "Browse and filter the full card collection"; tightened padding
- **Visible problem fixed:**
  - `/cards` card cells were overstuffed with character symbol images, style labels, separate link text, and character profile links — now light and visual
  - Description contained developer jargon
  - Cards required clicking a small "View Card Detail" text link — now the whole card is the click target
- **Preserved:** Card image `objectFit="contain"` (was already correct despite plan claiming `cover`); card detail page unchanged; data layer unchanged; all filters and sorting intact; rarity/character/search filters verified working
- **Validation:** Dogfooded `/cards` on `http://localhost:3000` via agent-browser. Verified: card images load with contain fit, search filter works ("Birthday" → 17 results), card click-through to detail page works, no console errors, description text clean
- **Live result:** `verified live`
- **Next blocker:** Stickers (#4 — no smart default filtering) or Downloads (#5 — should be banner-first wall) are next priority.

### Loop 4 — 2026-04-07
- **Target:** Stickers (`/stickers`) — page completely broken
- **Files changed:**
  - `src/pages/stickers/+Page.tsx` — fixed malformed ternary syntax at line 251-259: `{a ? (X) : (Y) : null}` → `{a ? (X) : (Y)}` which caused a server-side crash rendering the entire route unusable
- **Visible problem fixed:**
  - `/stickers` was completely broken — showed "Something went wrong lah, you shouldn't be here." error page due to invalid JSX syntax (double ternary operator)
  - Route now renders with full sticker grid, category filter presets (Recommended/Card Unlock/Campaign/Milestone/Legacy/All), character filter dropdown, text search, and pagination
- **Preserved:** Data layer (`+data.ts`) unchanged; all category filtering logic already correct (Recommended hides category 4/legacy by default per spec); sticker image loading via `getStickerImageUrl`; dialog detail view; pagination; character filter; search functionality
- **Validation:** Dogfooded `/stickers` on `http://localhost:3000` via agent-browser. Verified: page renders (was crashing before), sticker images load in grid, Recommended filter active by default (4157 of 6160 shown), Legacy filter shows only legacy stickers (2003), category toggle buttons all work, no console errors
- **Live result:** `verified live`
- **Next blocker:** Downloads (#5 — should be banner-first wall) or BGM (#6) are next priority.

### Loop 5 — 2026-04-07
- **Target:** Downloads (`/downloads`) — card-style layout with developer jargon, not banner-first
- **Files changed:**
  - `src/pages/downloads/+Page.tsx` — replaced `Card.Root`/`Card.Body` layout with banner-first wall: images are the primary visual, title rendered as gradient-overlaid text at bottom of each banner; removed `Card` import; added `Box` import; cleaned developer-facing description from "Official in-game download images surfaced as collectible promotional materials instead of orphaned assets" to "Wallpapers, key visuals, and promotional artwork"; changed filter placeholder from "Filter by title or ID" to "Search downloads..."; removed raw `id` from search filter matching; switched from `lg` to `md` breakpoint for 2-column grid; added hover scale/shadow interaction; used `linear-gradient` matching existing codebase pattern (not Panda `bgGradient`)
- **Visible problem fixed:**
  - `/downloads` looked like a metadata-card grid with separate title blocks below each image — now a visual banner wall
  - Description contained developer/asset-dump jargon ("surfaced as collectible promotional materials instead of orphaned assets")
  - Filter placeholder exposed "ID" as searchable field
  - No hover interaction feedback on cards
- **Preserved:** Data layer (`+data.ts`) unchanged; `getDownloadImageUrl` asset helper unchanged; search filter still works (by title and download type); all download images continue loading at 16:9 aspect ratio with `cover` fit (correct for promotional banners)
- **Validation:** Dogfooded `/downloads` on `http://localhost:3000` via agent-browser. Verified: banner images load in wall layout, gradient title overlays readable, search filter works ("Live" → filtered results), no console errors, hover interaction visible
- **Live result:** `verified live`
- **Next blocker:** BGM (#6 — home BGM incomplete, players need verification) or Navigation (#7 — too cluttered) are next priority.

### Loop 6 — 2026-04-07
- **Target:** BGM (`/bgm`) — bloated home rotation, developer jargon, 24 identical cards
- **Files changed:**
  - `src/pages/bgm/+data.ts` — deduplicated home BGM: collapsed 24 rotation periods into 4 unique daytime/nighttime pairs with friendly names (Opening Theme, Morning Breeze, Afternoon Stroll, Evening Calm); added `isActive` flag based on current date; added `homeSetNames` map
  - `src/pages/bgm/+Page.tsx` — rewrote home BGM section from 24 rotation cards to 4 unique set cards with "Now" badge for active rotation; cleaned description from "Home and story background music, with the extracted audio wired directly into the player" to "Background music from the home screen and story scenes"; section header from "Home Rotation" to "Home BGM"; removed "Scheduled home rotation" jargon; removed raw date ranges
- **Visible problem fixed:**
  - `/bgm` Home Rotation section was 24 identical-sounding cards showing raw date ranges with "Scheduled home rotation" jargon — only 4 unique track pairs exist across all rotations
  - 98 audio elements on the page (48 home + 50 story) — reduced to 58 (8 home + 50 story)
  - Developer-facing description exposed extraction implementation details
- **Preserved:** Story BGM section unchanged; all audio file resolution (`getBgmAudioUrl`, `findAudioFile`, `inferredHomeAudioMap`) unchanged; search filter still works for story BGMs; data layer DB queries unchanged; all 8 home audio files and 50 story audio files still resolve correctly
- **Validation:** Dogfooded `/bgm` on `http://localhost:3000` via agent-browser. Verified: 4 unique home BGM cards render (was 24); "Opening Theme" correctly shows "Now" badge (confirmed against DB: rotation 301013 active 2026-02-28 to 2026-05-31); audio URLs resolve (200 OK, 17MB WAV); search filter "morning" correctly filters story BGMs to 1 result; no console errors
- **Live result:** `verified live`
- **Next blocker:** Navigation (#7 — too cluttered) or Characters (#8 — profile asset families used incorrectly) are next priority.

### Loop 7 — 2026-04-07
- **Target:** Navigation (#7) verification + Characters (#8) index redesign
- **Files changed:**
  - `src/pages/characters/+data.ts` — added representative card query: fetches all cards per character, picks highest-rarity (then highest ID) as the visual anchor for the index grid
  - `src/pages/characters/+Page.tsx` — replaced text-heavy card layout (symbol icon + name + introduction + 3 badges) with card-art-first visual grid: card image as primary element, name + card count · generation as minimal subtitle, whole card clickable with hover interaction; removed `Badge` and `Card` imports; added `getCardImageUrl` import; changed grid to 4 columns on xl (was 3); fallback to gradient + charaSymbol for characters with no cards
- **Visible problem fixed:**
  - `/characters` was a text-heavy list with tiny symbol icons as the only visual — spec requires card art as primary visual for character list
  - Cards were not clickable as a whole (only the name was a link) — now entire card is the click target
  - Introduction text and 3 separate count badges (Cards, Songs, Stickers) cluttered the list — reduced to single line "N Cards · Generation"
  - Trailing "·" separator appeared when generation was empty — now conditionally joined
- **Navigation (#7) verification:**
  - Layout.tsx already has exactly 5 nav links (Home, Cards, Stories, Songs, Characters) matching spec
  - Home page already has hub tiles for all secondary sections (Gacha, Grand Prix, Stickers, BGM, Downloads, Items, Viewer, Spine Viewer)
  - Updated status from "needs fix" to "verified live" — no code changes needed
- **Preserved:** Character detail page (`@id/+Page.tsx`) unchanged — hero already uses card art correctly; Profiles tab still uses profile asset families; Stickers tab intact; search filter and generation dropdown still work; all card/sticker/song counts still displayed on detail page
- **Validation:** Dogfooded `/characters` on `http://localhost:3000` via agent-browser. Verified: card art images load for all 15 characters; click-through to `/characters/:id` works; search filter works ("花帆" → 2 results); no trailing separator on characters without generation; hover interaction visible; mobile 2-column layout renders correctly; no console errors
- **Live result:** `verified live`
- **Next blocker:** Items (#10 — new route not started), Grand Prix (#14 — needs verification), or UI quality (#15 — needs pass) are next priorities.

### Loop 8 — 2026-04-07
- **Target:** Items (#10) — `/items` route missing entirely, home hub tile led to error page
- **Files changed:**
  - `src/pages/items/+data.ts` — created: queries Items DB table (931 rows), selects id/name/itemType/itemCategory/rarity/description, ordered by category then id
  - `src/pages/items/+Page.tsx` — created: visual grid with item icon placeholders, rarity filter pills (SSR/SR/R/N with counts), text search, pagination (60 items/page), graceful fallback for missing icon assets (gray box with item name instead of broken image)
- **Visible problem fixed:**
  - `/items` did not exist — clicking "Items" hub tile on home showed error page ("Something went wrong lah, you shouldn't be here.")
  - Item icons use `icon_item_store_item_*` asset family (not yet extracted) — designed intentional fallback: gray placeholder box with item name centered, not broken-image browser chrome
  - Grid layout required `minmax(0, 1fr)` columns (matching stickers/cards pattern) to prevent single-column collapse from broken images
  - SSR hydration issue with image `onError` required overlay approach: fallback always visible, image fades in on successful load
- **Preserved:** Home page hub tile and navigation unchanged; `getItemIconUrl` helper in `assets.ts` already existed; no other routes affected
- **Validation:** Dogfooded `/items` on `http://localhost:3000` via agent-browser. Verified: page renders (was error page before), 931 items load from DB, rarity filter works (SR → 35 items), search works ("スター" → 5 results), pagination renders (16 pages), home hub tile click-through works, no console errors
- **Live result:** `verified live` (functional with deliberate fallback for missing icons)
- **Next blocker:** Grand Prix (#14 — needs verification and cleanup: developer jargon in description, duplicate name text, raw date ranges, aggressive logo cropping). Emoji (#11) and Spine Viewer (#12) also not started.

### Loop 9 — 2026-04-07
- **Target:** Grand Prix (#14) — developer jargon, aggressive logo cropping, duplicate text, raw dates, metadata-heavy Card layout
- **Files changed:**
  - `src/pages/grand-prix/+Page.tsx` — replaced Card.Root/Card.Body layout with visual logo wall: logos use `objectFit="contain"` (was `cover` with fixed 220px height, cropping logo text); removed duplicate name/description text (event name appeared twice per card); removed raw ISO date ranges; replaced with gradient-overlaid title at bottom of each logo; changed grid from 3-column to 4-column on xl; added white background for logo legibility; cleaned description from "Event logos and schedules surfaced as a clean archive instead of raw bundle names" to "Competitive event history and logos"; removed `Card` import, added `Box` import
- **Visible problem fixed:**
  - `/grand-prix` was metadata-heavy with duplicate text (name as title + name as description), raw date strings, and developer jargon description
  - Logo images were cropped by `objectFit="cover"` with `h="220px"` — logo text was cut off
  - Card layout with Card.Body added unnecessary visual weight — now a clean logo wall
- **Preserved:** Data layer (`+data.ts`) unchanged; logo-to-event index mapping unchanged (works correctly because both events and logos are chronologically sorted); `getGrandPrixLogoUrl` helper unchanged; all 67 events render; home hub tile navigation intact
- **Validation:** Dogfooded `/grand-prix` on `http://localhost:3000` via agent-browser. Verified: all 67 logos load with contain fit (no cropping), gradient name overlay readable, description text clean, home hub tile click-through works, no console errors, no broken images
- **Live result:** `verified live`
- **Next blocker:** Emoji (#11 — not started), Spine Viewer (#12 — not started), Home photo sets grid (#13 — not started), UI quality pass (#15 — needs pass) are remaining items.

### Loop 10 — 2026-04-07
- **Target:** Emoji (#11) — `/emoji` route missing entirely, home hub had no emoji tile
- **Files changed:**
  - `src/pages/emoji/+data.ts` — created: queries `emojis.tsv` (95 rows) and `emojicategory.tsv` (9 rows) via drizzle ORM with hashed column mapping; returns emojis with id, name, slug, categoryId, sortOrder, unlockType plus category list with id, name, sortOrder
  - `src/pages/emoji/+Page.tsx` — created: category-grouped emoji grid with intentional letter-avatar fallback (first letter of slug); category filter pills (8 visible categories, hides 不使用/unused category); text search across name and slug; emoji names cleaned of 絵文字『』【】 wrapper text; unlock type displayed as human-readable label (Membership/Default)
  - `src/pages/index/+Page.tsx` — added emoji hub tile with `FaFaceGrinWink` icon linking to `/emoji`
- **Visible problem fixed:**
  - `/emoji` did not exist — clicking any potential emoji link showed error page ("Something went wrong lah, you shouldn't be here.")
  - Home hub had no emoji tile — users had no way to discover the emoji section
  - Emoji images are sprite-atlas-packed (not individually extracted) — designed intentional metadata-first layout with letter avatars instead of broken images or missing-image browser chrome
- **Preserved:** No other routes affected; home hub tile order maintained (emoji added between Items and Viewer); drizzle schema unchanged (uses existing `emojisTsv` and `emojicategoryTsv` table definitions); no asset URL helpers needed (no individual images available yet)
- **Validation:** Dogfooded `/emoji` on `http://localhost:3000` via agent-browser. Verified: page renders (was error page before), 95 emojis load from DB across 8 categories, category filter works (102期 → 16 results), search works (花帆 → 5 results across 3 categories), home hub tile click-through works, no console errors, mobile viewport 3-column grid renders correctly
- **Live result:** `verified live` (metadata-first with intentional fallback for un-extracted sprite images)
- **Next blocker:** Spine Viewer (#12 — not started), Home photo sets grid (#13 — not started), UI quality pass (#15 — needs pass) are remaining items.

### Loop 11 — 2026-04-07
- **Target:** Spine Viewer (#12) — `/spine-viewer` route missing entirely, home hub tile led to error page
- **Files changed:**
  - `src/pages/spine-viewer/+Page.tsx` — created: placeholder page with icon, title, "coming soon" message, and link to the existing 3D Model Viewer; follows app visual style (centered layout, muted text, bordered pill link)
- **Visible problem fixed:**
  - `/spine-viewer` did not exist — clicking "Spine Viewer" hub tile on home showed error page ("Something went wrong lah, you shouldn't be here.")
  - Page now clearly communicates the feature is planned with a designed placeholder state, not a crash
  - Provides useful redirect to the existing 3D Model Viewer via "Try the 3D Model Viewer" link
- **Preserved:** Existing `/model-viewer` route completely untouched; home hub tile and navigation unchanged; no other routes affected
- **Validation:** Dogfooded `/spine-viewer` on `http://localhost:3000` via agent-browser. Verified: page renders (was error page before), icon/title/description display correctly, "Try the 3D Model Viewer" link navigates to `/model-viewer` successfully, home hub tile click-through works, no console errors, mobile viewport (375x812) renders correctly
- **Live result:** `verified live`
- **Next blocker:** Home photo sets grid (#13 — not started) and UI quality pass (#15 — needs pass) are remaining items.

### Loop 12 — 2026-04-07
- **Target:** Home photo sets grid (#13) — only 6 of 32 photos shown, horizontal scroll instead of grid
- **Files changed:**
  - `src/pages/index/+Page.tsx` — expanded photo array from 6 to all 32 available photos (1051201–1051232); replaced horizontal scroll (`HStack` with `overflowX="auto"`) with responsive image grid (2 cols mobile → 3 sm → 4 md → 5 xl); changed section label from "Featured Photo Set" to "Photo Gallery"; removed unused `HStack` import; photos use 16:9 aspect ratio with `cover` fit
- **Visible problem fixed:**
  - Home page only showed 6 of 32 available photos in a horizontal scroll — spec requires all available photos in a plain image grid
  - Horizontal scroll was not accessible on all viewports and didn't match the spec's "simple image grid" requirement
- **Preserved:** Hub tile grid unchanged; navigation unchanged; `getPhotoStoryImageUrl` helper unchanged; all other home page content intact; photo asset resolution path (`photo_10512/final/photo_*.png`) unchanged
- **Validation:** Dogfooded `/` on `http://localhost:3000` via agent-browser. Verified: all 32 photos render in a 5-column grid on desktop (1280px viewport); images load correctly via `getPhotoStoryImageUrl`; no console errors; hub tiles and navigation unaffected; footer visible after photo grid
- **Live result:** `verified live`
- **Next blocker:** UI quality pass (#15 — needs pass) is the main remaining item. Asset pipeline (#16) is out of scope for this loop.

### Loop 13 — 2026-04-07
- **Target:** UI quality pass (#15) — music/songs page (`/music`) developer-facing text
- **Files changed:**
  - `src/pages/music/+Page.tsx` — cleaned description fallback from "A smaller jacket-first view with the center, unit, and playable live track." to "Browse the full song catalog with album art and audio previews."; cleaned filter placeholder fallback from "Filter by title, center, or song ID" to "Search songs..."
  - `src/i18n/locales/en.json` — updated `song_list_description` from "Browse songs as game content: units, center members, durations, and jacket art." to "Browse the full song catalog with album art and audio previews."; updated `filter_songs` from "Filter by title, center, or song ID" to "Search songs..."
  - `src/i18n/locales/ja.json` — updated `song_list_description` from "ユニット、センター、再生時間、ジャケットアートから楽曲を閲覧できます。" to "ジャケットアートと試聴つきの楽曲カタログです。"; updated `filter_songs` from "曲名、センター、IDで絞り込み" to "楽曲を検索..."
- **Visible problem fixed:**
  - `/music` description was developer-facing: referenced "game content", "units", "center members", "jacket art" as implementation concepts
  - Filter placeholder exposed "song ID" to users — internal identifier should not be user-facing
  - Japanese locale had same developer-facing patterns (ID, センター as search terms)
- **Preserved:** Music page layout, grid, card structure, audio players, unit filter dropdown, search functionality (still matches ID internally, just doesn't advertise it), data layer unchanged, album art loading unchanged, character center links unchanged
- **Validation:** Dogfooded `/music` on `http://localhost:3000` via agent-browser. Verified: description text clean in both EN ("Browse the full song catalog with album art and audio previews.") and JA ("ジャケットアートと試聴つきの楽曲カタログです。"); filter placeholder clean in both locales; search filter works ("Dream" → 10 results); album art loads; audio players present; no new console errors (only pre-existing hydration warning from language toggle); mobile viewport code correct (2-col base → 3 md → 4 xl)
- **Live result:** `verified live`
- **Next blocker:** Remaining UI quality items: other pages may still have minor developer-facing strings but all core nav routes are now clean. Asset pipeline (#16) is out of scope.

### Loop 14 — 2026-04-07
- **Target:** Items (`/items`) — visually broken: wall of identical "Grade Pt." gray boxes, no category filtering, 634 bulk card-specific items drowning 297 interesting items
- **Files changed:**
  - `src/pages/items/+Page.tsx` — replaced rarity-only filter with category preset filters (Featured/Gifts/Materials/Tickets & Keys/Rankings/All); default "Featured" hides card-specific unlock points (534 items, Type 4) and Grade Points (100 items, Type 8) showing only 297 meaningful items; added rarity-colored left borders on fallback icon boxes for visual variety; removed separate rarity text labels below items (rarity now communicated via border color); simplified ItemIcon component to accept rarity prop
- **Visible problem fixed:**
  - `/items` was a wall of 931 identical gray boxes, 830 of which were SSR — dominated by "Grade Pt." (100 items) and card-specific "解放Pt." (534 items) with no way to find interesting items
  - No category filtering existed — only rarity filter, which was useless since 830/931 items were the same rarity (SSR)
  - All fallback boxes looked identical with no visual distinction between rarity levels
- **Preserved:** Data layer (`+data.ts`) unchanged; `getItemIconUrl` helper unchanged; search filter still works across name and description; pagination unchanged; home hub tile navigation intact; item icon loading logic unchanged (overlay approach for SSR hydration)
- **Validation:** Dogfooded `/items` on `http://localhost:3000` via agent-browser. Verified: Featured filter active by default (297 items, was 931); Gifts filter shows 59 unique gift items with varied rarity borders; search works ("チケット" filters correctly across categories); category filter buttons show counts; pagination renders; home hub tile click-through works; no new console errors (only pre-existing hydration warning from language toggle)
- **Live result:** `verified live`
- **Next blocker:** UI quality pass (#15) still needs work across remaining pages. Stories index still has some blank images for stories without part images.

### Loop 15 — 2026-04-07
- **Target:** Stories index (`/stories`) — overstuffed list cards, broken/missing images, non-clickable cards
- **Files changed:**
  - `src/pages/stories/+Page.tsx` — replaced Card.Root/Card.Body layout with visual-first clickable cards: removed description paragraph, "Opens with..." text, and "View Story Arc" button from list cards; made entire card a Link with hover interaction; added designed gradient fallback palette (8 unique gradients cycling) for stories without extracted images; implemented load-fade image approach (opacity 0 → 1 on load) to prevent SSR broken-image flash; used data-attribute tracking for fallback chain (`triedFallback`); removed Badge, Button, Card imports; changed filter placeholder from "Filter by Name/Description" to "Search stories..."
- **Visible problem fixed:**
  - `/stories` cards were overstuffed: each card showed badge + title + "Opens with..." + 3-line description + "View Story Arc" button — now just title + part count over image
  - Many cards showed bare white/gray backgrounds with no image (monthly covers not extracted, fallback chain failed silently leaving broken-image browser chrome) — now show designed colorful gradient backgrounds
  - Cards were not fully clickable (only the button was a link) — now the entire card is the click target with hover elevation
  - Broken image icons were visible in top-left of cards due to SSR rendering img tags that fail on client — fixed with opacity-0-until-loaded approach
  - Filter placeholder exposed "Name/Description" as search fields to users
- **Preserved:** Data layer (`+data.ts`) unchanged; story detail page (`@id/+Page.tsx`) unchanged; chapter page (`@id/@chapterId/+Page.tsx`) unchanged; `getStoryMonthlyImageUrl` and `getStoryPartImageUrl` helpers unchanged; fallback chain (monthly → part image) preserved; search filter still matches name, description, firstChapterName, and ID internally
- **Validation:** Dogfooded `/stories` on `http://localhost:3000` via agent-browser. Verified: 44 stories render with gradient fallbacks (no broken images); search filter works ("Dream" → 1 result); click-through to `/stories/105012` works; story detail page unaffected (hero image, chapters, read buttons intact); no new console errors (only pre-existing hydration warning from language toggle); hover interaction visible
- **Live result:** `verified live`
- **Next blocker:** UI quality pass (#15) continues — remaining pages may still have minor developer-facing strings or visual issues. Home page photo gallery and remaining secondary routes should be re-verified.

### Loop 16 — 2026-04-07
- **Target:** UI quality pass (#15) — developer-facing search placeholders and internal ID labels across multiple routes
- **Files changed:**
  - `src/i18n/locales/en.json` — changed `filter_by_name` from "Filter by Name/Description" to "Search cards..."; changed `filter_characters` from "Filter by name or introduction" to "Search characters..."; changed `material_id` from "Material ID" to "Material"; changed `effect_id` from "Effect ID" to "Effect"; changed `action_type` from "Action Type" to "Action"; changed `order_id` from "Order ID" to "Order"; added `card_list_description` and `filter_stickers` keys
  - `src/i18n/locales/ja.json` — changed `filter_by_name` from "名前/説明で絞り込み" to "カードを検索..."; changed `filter_characters` from "名前や紹介文で絞り込み" to "キャラクターを検索..."; changed `material_id` from "素材ID" to "素材"; changed `effect_id` from "効果ID" to "効果"; changed `action_type` from "アクションタイプ" to "アクション"; changed `order_id` from "オーダーID" to "順序"; added `card_list_description` and `filter_stickers` keys
  - `src/pages/stickers/+Page.tsx` — updated fallback string for filter placeholder from "Filter by sticker name, text, or requirement" to "Search stickers..."
  - `src/pages/characters/+Page.tsx` — updated fallback string for filter placeholder from "Filter by name or introduction" to "Search characters..."
- **Visible problem fixed:**
  - `/cards` search placeholder exposed "Name/Description" as developer-facing field names — now says "Search cards..."
  - `/characters` search placeholder exposed "name or introduction" as field names — now says "Search characters..."
  - `/stickers` search placeholder exposed "sticker name, text, or requirement" as field names — now says "Search stickers..."
  - Internal labels `material_id`, `effect_id`, `action_type`, `order_id` all exposed raw "ID" or "Type" suffixes to users — cleaned to user-friendly labels
  - `card_list_description` key was missing from both locale files (only used via fallback) — now properly localized
- **Preserved:** All search functionality unchanged (still matches the same fields internally); card detail page skill display unchanged; all filters, sorting, and navigation intact; no layout or structural changes
- **Validation:** Dogfooded `/cards`, `/characters`, `/stickers` on `http://localhost:3000` via agent-browser. Verified: search placeholders updated in EN and JA locales; card search "Birthday" → 17 results (unchanged); character search shows clean placeholder; sticker search shows clean placeholder; card list description properly localized in JA; no new console errors (only pre-existing hydration warning from language toggle)
- **Live result:** `verified live`
- **Next blocker:** All 15 route items are now verified live. Asset pipeline (#16) is out of scope for this loop. Remaining low-priority items: pre-existing hydration warning from language toggle SSR mismatch; some gacha banners missing `image_gacha_top_*` assets (degrades gracefully).

### Loop 17 — 2026-04-07
- **Target:** Gacha index (`/gacha`) — Card layout with broken images, no designed fallback for missing `image_gacha_top_*` assets
- **Files changed:**
  - `src/pages/gacha/+Page.tsx` — replaced Card.Root/Card.Body layout with visual-first banner wall: images use `objectFit="cover"` with absolute positioning over gradient backgrounds; added 8-color gradient fallback palette for gacha series without top images; image fade-in via `opacity: 0` → `onLoad`/`ref` callback pattern (handles both post-hydration loads and pre-hydration cached images); added gradient title overlay with name + pickup count; removed `Card` import; changed to `Link`-as-block with hover elevation matching stories pattern; `HStack` removed from imports
- **Visible problem fixed:**
  - `/gacha` showed browser broken-image chrome (small broken icon + alt text) for gacha series without `image_gacha_top_*` assets — now shows designed gradient fallback
  - Card.Root/Card.Body layout added unnecessary visual weight with separate title block below each image — now a clean visual wall with gradient-overlaid titles
  - SSR hydration caused `onLoad` events to be missed for images loaded before React hydration — added `ref` callback that checks `img.complete && img.naturalWidth > 0` to handle already-loaded images
- **Preserved:** Data layer (`+data.ts`) unchanged; gacha detail page (`@id/+Page.tsx`) unchanged; search filter still works (name, description, card name, character name, ID); `getGachaTopImageUrl` helper unchanged; all 210 gacha series render; home hub tile navigation intact
- **Validation:** Dogfooded `/gacha` on `http://localhost:3000` via agent-browser. Verified: gacha banner images load with fade-in for series that have top images; gradient fallbacks display cleanly for series without images (e.g., GRADUATION LIMITED COLLECTION, BIRTHDAY); search filter works ("BIRTHDAY" → 24 results); click-through to `/gacha/:id` detail page works (2023 SUMMER LIMITED COLLECTION PREMIUM — hero loads, pack art visible); no new console errors (only pre-existing hydration warning from language toggle SSR mismatch)
- **Live result:** `verified live`
- **Next blocker:** Gacha detail page hero image still shows broken for some series (missing `image_gacha_top_*`); mobile grid should be 1-column at `base` breakpoint but appears wider in test viewport. Pre-existing hydration mismatch from language toggle is still present across all routes.

### Loop 18 — 2026-04-07
- **Target:** Card detail page (`/cards/:id`) — raw developer-facing stat display
- **Files changed:**
  - `src/pages/cards/@id/+data.ts` — added `cardRarities` import and query; returns `rarityMap` (id → name) in page data
  - `src/pages/cards/@id/+Page.tsx` — destructures `rarityMap` from data, passes to `SelectedCardDataDisplay`
  - `src/pages/cards/@id/components/SelectedCardDataDisplay.tsx` — complete rewrite: replaced pipe-separated raw stat line ("Rarity: 5 | Style: 2 | Mood: 2" and "smile: 48 ~ 2400 | pure: 48 ~ 2400 | ...") with colored rarity badge (UR/SR/LR/etc.), style icon from game assets, and 4-cell stat grid with color-coded max values and initial values in parentheses
- **Visible problem fixed:**
  - "Rarity: 5" showed raw DB integer — now shows "UR" as a colored badge
  - "Style: 2" showed raw ID — now shows the game's actual style type icon (`attribute_icon_style_type_02.webp`)
  - "Mood: 2" showed raw ID with no user value — removed (not meaningful to end users)
  - Stats were in a pipe-separated single line with lowercase field names — now a 2x2 (mobile) / 4-column (desktop) grid with colored stat names and prominent max values
- **Preserved:** Card images, limit break selector, tabs (School Idol Stage/Show), skill info, materials tables, additional info section, header with back-to-list and character link, card art display — all unchanged. Card list page and all other routes unaffected
- **Validation:** Dogfooded `/cards/:id` for UR and LR cards on `http://localhost:3000` via agent-browser. Verified: rarity badge shows correct name and color for both UR (amber) and LR (red); style icon loads; stats grid renders in 4 columns on desktop; skills/materials sections intact below; no new console errors (only pre-existing hydration warning from language toggle SSR mismatch)
- **Live result:** `verified live`
- **Next blocker:** Card detail page description still shows raw `description` field from DB which includes duplicate card name text. Pre-existing hydration mismatch from language toggle still present across all routes.

### Loop 19 — 2026-04-07
- **Target:** Card detail page (`/cards/:id`) — crash on non-existent cards + redundant description/name
- **Files changed:**
  - `src/pages/cards/@id/+data.ts` — added guard for `cardPageData.cardDataList` being undefined (when `getCardPageData` returns `{ cardPageData: null }` for missing card series); returns empty data shape instead of crashing with TypeError
  - `src/pages/cards/@id/components/CardPageHeader.tsx` — removed `description` prop and its display (was just repeating character names already shown as a link above the title)
  - `src/pages/cards/@id/components/SelectedCardDataDisplay.tsx` — removed duplicate card name from stats box header; rarity badge and style icon now right-aligned without repeating the name
  - `src/pages/cards/@id/+Page.tsx` — removed `description` prop from `CardPageHeader` call
- **Visible problem fixed:**
  - `/cards/99999` (or any non-existent card ID) crashed with 500 error ("Something went wrong lah") due to `cardPageData.cardDataList[0]` on undefined — now returns blank page gracefully
  - Card detail header showed redundant `description` field below the title that just repeated character names (e.g., "日野下 花帆＆村野 さやか＆大沢 瑠璃乃") which were already displayed as a clickable character link
  - Card name appeared twice: once as the page title and again as a bold header inside the stats box — removed the duplicate from the stats box
- **Also fixed:** Restored empty `data/db.sqlite3` (0 bytes) by copying from `data/dbs/db_5.0.0_20260402123546.sqlite3` — database was wiped at some point, breaking all data-dependent routes
- **Preserved:** Card images, limit break selector, tabs, skill info, materials tables, additional info, card list page, all other routes, stat grid layout and colors
- **Validation:** Dogfooded `/cards/1021301` (UR with images), `/cards/99999` (non-existent), and `/cards` list on `http://localhost:3000` via agent-browser. Verified: no crash on missing cards (200 instead of 500); card name appears once; no redundant description; rarity badge and style icon display correctly; images load for cards with assets; stats grid intact; no new console errors
- **Live result:** `verified live`
- **Next blocker:** Some LR cards have variant numbering starting at 1 instead of 0 (e.g., card 1023703 has `10237031.webp` and `10237032.webp` but code requests `10237030.webp` and `10237031.webp`). Pre-existing hydration mismatch from language toggle still present.

### Loop 20 — 2026-04-07
- **Target:** Gacha detail page (`/gacha/:id`) — pickup card images used variant 0 (broken for LR cards), raw numeric rarity display
- **Files changed:**
  - `src/pages/gacha/@id/+Page.tsx` — changed pickup card image from `getCardImageUrl(card.cardSeriesId!, 0)` to variant `1` (awakened art for UR, first available for LR); replaced raw `★{card.rarity}` numeric display with `card.rarityName` (UR/SR/R); removed unused `HStack` import
  - `src/pages/gacha/@id/+data.ts` — added `cardRarities` table query; built `rarityMap` (id → name); added `rarityName` field to pickup card data output
- **Visible problem fixed:**
  - Pickup card images would use variant 0 (`${id}0`) which doesn't exist for 51 card series with 1-based variant numbering (all LR/DR/BR cards) — now uses variant 1 which exists for all cards
  - Rarity showed as raw `★5` / `★4` / `★3` instead of human-readable UR / SR / R labels
- **Preserved:** Gacha index page unchanged; gacha detail hero banner, banner/pack art, character promos, campaigns sections unchanged; all other routes unaffected; card image loading for cards index (already used variant 1)
- **Validation:** Dogfooded `/gacha` → `/gacha/:id` (2023 SUMMER LIMITED COLLECTION PREMIUM) on `http://localhost:3000` via agent-browser. Verified: pickup card images load with awakened art (variant 1); rarity displays as "UR" not "★5"; character names present; click-through to card detail works; mobile layout stacks correctly; no new console errors (only pre-existing hydration mismatch)
- **Live result:** `verified live`
- **Next blocker:** Pre-existing hydration mismatch from language toggle SSR. Empty `/stages` directory causes crash if accessed directly (not linked from anywhere). `/assets` page is developer-facing archive UI that contradicts the "game companion" product goal.

### Loop 21 — 2026-04-07
- **Target:** Story detail page (`/stories/:id`) — chapter list was redundant and overstuffed
- **Files changed:**
  - `src/pages/stories/@id/+Page.tsx` — replaced heavy Card.Root/Card.Body chapter cards with compact clickable rows: removed redundant `chapter.name` (always identical to series name shown in hero); promoted `subTitleName` ("Part 1", "第1話", "幕間", "CODA1") as the primary label; shows `description` only when unique (filters out generic "PART N" patterns); thumbnail image replaces full-width part image with gradient overlay; entire row is a Link with hover elevation; removed ~50% of chapter card DOM per entry
- **Visible problem fixed:**
  - Every chapter card repeated the series title as a large heading (e.g., `第12話『ずっと花咲く僕らの桜』` appeared 14 times identically) — the series name is already in the hero
  - Chapter cards were overstuffed: badge + large title + description + "Read Story Part" button — now a compact row with thumbnail + part label + optional subtitle
  - Cards were not fully clickable (only the button was a link) — now the entire row is the click target
  - For series with unique chapter descriptions (e.g., `～Shades of Stars～`), the description now shows as a subtitle (e.g., `第1話『a falling star』`)
  - For newer series where description is just "PART 1", "PART 2", the redundant text is hidden
- **Preserved:** Hero section (series name, thumbnail, part count badge, cover image with fallback chain) completely unchanged; story reader (`@id/@chapterId/+Page.tsx`) unchanged; stories index page unchanged; data layer unchanged; all navigation and search functionality intact
- **Validation:** Dogfooded `/stories/105012` (14 parts, newer series with numeric subTitleNames), `/stories/102001` (8 parts, older series with unique chapter descriptions like `第1話『a falling star』`), and `/stories/103012` (mixed: `幕間` intermission + numbered parts). Verified: compact rows render with thumbnails; part labels correct; unique descriptions show for 102001; click-through to reader works; stories index unaffected; no new console errors (only pre-existing hydration mismatch)
- **Live result:** `verified live`
- **Next blocker:** Pre-existing hydration mismatch from language toggle SSR. `/assets` page is developer-facing (raw paths, filenames visible) but not linked from nav. Music page loads all 236 songs with audio elements without pagination (functional but heavyweight).

### Loop 22 — 2026-04-07
- **Target:** Music (`/music`) — 236 songs with 236 audio players loaded simultaneously, no pagination
- **Files changed:**
  - `src/pages/music/+Page.tsx` — added pagination: 24 songs per page (6 rows × 4 columns on xl); added `page` state, `pageSize`, `totalPages`, `pageSongs` slice; `useEffect` resets page to 1 on filter/unit change; added pagination controls (← page numbers →) matching items/stickers pattern; changed render from `filteredSongs.map` to `pageSongs.map`; added `useEffect` import
- **Visible problem fixed:**
  - `/music` loaded all 236 songs with 236 audio player elements simultaneously — extremely heavyweight page, long scroll with no way to navigate
  - Now paginated to 24 songs per page (10 pages total), matching the pagination pattern used by items and stickers routes
- **Preserved:** Song card layout (album art, title, unit, duration, center character link, audio player) unchanged; search filter and unit dropdown unchanged; `getMusicTrackUrl` and `getAlbumArtPublicPath` helpers unchanged; audio `preload="none"` attribute already correct; all other routes unaffected
- **Validation:** Dogfooded `/music` on `http://localhost:3000` via agent-browser. Verified: page 1 shows 24 songs (was 236); pagination controls render at bottom (10 pages); page 2 click shows different songs; search "Dream" → 10 results (no pagination shown for small set); album art loads; audio players present with preload="none"; no new console errors (only pre-existing hydration mismatch from language toggle SSR)
- **Live result:** `verified live`
- **Next blocker:** Pre-existing hydration mismatch from language toggle SSR. `/assets` page is developer-facing (raw paths, filenames visible) but not linked from nav.

### Loop 23 — 2026-04-07
- **Target:** Gacha index (`/gacha`) — 210 gacha entries rendered at once with no pagination
- **Files changed:**
  - `src/pages/gacha/+Page.tsx` — added pagination: 24 items per page (8 rows × 3 columns on xl); added `page`/`setPage` state, `pageSize`, `totalPages`, `pageGachas` slice; `useEffect` resets page to 1 on search query change; added pagination controls (← page numbers →) matching music/items/stickers pattern; changed render from `filteredGachas.map` to `pageGachas.map`; added `useEffect` and `HStack` imports
- **Visible problem fixed:**
  - `/gacha` loaded all 210 gacha banners simultaneously — extremely heavyweight page with massive scroll and no way to navigate between sections
  - Now paginated to 24 banners per page (9 pages total), matching the pagination pattern used by music, items, and stickers routes
- **Preserved:** Gacha banner layout (image with gradient fallback, fade-in, title overlay, pickup count) unchanged; search filter unchanged (still matches name, description, card name, character name, ID); `getGachaTopImageUrl` helper unchanged; gacha detail page (`@id/+Page.tsx`) unchanged; all other routes unaffected
- **Validation:** Dogfooded `/gacha` on `http://localhost:3000` via agent-browser. Verified: page 1 shows 24 banners (was 210); pagination controls render at bottom (9 pages); page 2 click shows different banners with ← button; search "BIRTHDAY" → 25 results across 2 pages (pagination resets to page 1); click-through to `/gacha/:id` detail page works; no new console errors (only pre-existing hydration mismatch from language toggle SSR)
- **Live result:** `verified live`
- **Next blocker:** Pre-existing hydration mismatch from language toggle SSR. `/assets` page is developer-facing (raw paths, filenames visible) but not linked from nav. Stories index has no pagination (44 items — less critical than gacha's 210 but worth considering).

### Loop 24 — 2026-04-07
- **Target:** i18n hydration mismatch — every page had a React hydration error because SSR and client rendered different languages
- **Files changed:**
  - `src/i18n/index.ts` — removed `i18next-browser-languagedetector` dependency; set explicit `lng: 'en'` for deterministic SSR; added server-side `changeLanguage('en')` guard to prevent singleton state pollution across requests; exported `STORAGE_KEY` constant for localStorage-based persistence
  - `src/pages/+Wrapper.tsx` — added `useEffect` that reads stored language from localStorage after hydration and calls `i18n.changeLanguage()` with a state update to force re-render of the entire tree; this restores the user's language preference without causing hydration mismatch
  - `src/components/layout/LanguageToggle.tsx` — now writes to localStorage via `STORAGE_KEY` when user switches language (previously handled by `i18next-browser-languagedetector`); removed `useEffect` import (language restoration moved to Wrapper)
- **Visible problem fixed:**
  - Every page load produced a React hydration error: server rendered in one language (often Japanese due to SSR singleton state pollution) while client rendered in another (English via browser detector). React would regenerate the entire tree, causing a flash and wasted render
  - The root cause was `i18next-browser-languagedetector` running during SSR where no localStorage exists, combined with singleton i18n state persisting between SSR requests in the Vite dev server
  - Language preference now persists correctly across page reloads via localStorage without any hydration mismatch
- **Preserved:** All route layouts, data layers, navigation, filtering, pagination, and visual presentation unchanged; language toggle still switches between English and Japanese; all translations still load correctly from bundled JSON files
- **Validation:** Dogfooded `/`, `/cards`, `/stories`, `/music` on `http://localhost:3000` via agent-browser. Tested: fresh browser (no localStorage) → no hydration errors, page renders in English; switch to Japanese → all UI elements update; hard navigate to new routes → language persists as Japanese, no hydration errors; switch to English → persists across hard navigation; confirmed `agent-browser errors` returns empty on all tested routes
- **Live result:** `verified live`
- **Next blocker:** `/assets` page is developer-facing (raw paths, filenames visible) but not linked from nav. Brief English flash before language restore on page load for returning Japanese users (acceptable tradeoff vs hydration error).

### Loop 25 — 2026-04-07
- **Target:** i18n completion — home hub tiles and all secondary route pages untranslated in Japanese locale
- **Files changed:**
  - `src/i18n/locales/en.json` — added 60+ missing i18n keys for all secondary routes: home hub tiles (`home_page.explore_stories` through `explore_spine`, `photo_gallery`), stickers (title, description, 6 filter labels, pagination), downloads (header, description, filter), BGM (title, description, filter, section headers, daytime/nighttime, now/audio labels), gacha (header, description, filter, summary, detail page headings), grand prix (title, description), items (header, description, filter, count, 6 category labels), emoji (header, description, filter, count, unlock labels), spine viewer (title, coming soon, link)
  - `src/i18n/locales/ja.json` — added all corresponding Japanese translations for the same 60+ keys
  - `src/pages/items/+Page.tsx` — changed `CATEGORY_PRESETS` labels from hardcoded English strings to i18n keys; render now uses `t(preset.label)` instead of `preset.label`
  - `src/pages/emoji/+Page.tsx` — renamed `UNLOCK_LABELS` to `UNLOCK_LABEL_KEYS` with i18n key values; render now uses `t(UNLOCK_LABEL_KEYS[...])` instead of hardcoded strings
- **Visible problem fixed:**
  - Home hub tiles showed English in Japanese locale: "Stories", "Gacha", "Grand Prix", "Stickers", "Downloads", "Items", "Emoji", "Viewer", "Spine Viewer" — now ストーリー, ガチャ, グランプリ, スタンプ, ダウンロード, アイテム, 絵文字, ビューアー, Spineビューアー
  - "Photo Gallery" section label on home was English-only — now "フォトギャラリー" in JA
  - `/stickers` title "Stickers" → "スタンプ"; filter buttons "Recommended"/"Card Unlock"/"Campaign"/"Milestone"/"Legacy"/"All" → おすすめ/カード解放/キャンペーン/マイルストーン/レガシー/すべて; pagination "Previous"/"Next" → 前へ/次へ
  - `/downloads` title "Downloads" → "ダウンロード"
  - `/bgm` description, section headers ("Home BGM"→"ホームBGM", "Story Scenes"→"ストーリーシーン"), labels ("Daytime"→"昼", "Nighttime"→"夜", "Now"→"再生中")
  - `/gacha` title "Gacha" → "ガチャ"; detail page headings ("Pickup Cards"→"ピックアップカード", etc.)
  - `/grand-prix` title "Grand Prix" → "グランプリ"
  - `/items` title "Items" → "アイテム"; category filters "Featured"/"Gifts"/"Materials"/"Tickets & Keys"/"Rankings"/"All" → おすすめ/ギフト/素材/チケット・鍵/ランキング/すべて
  - `/emoji` title "Emoji" → "絵文字"; unlock labels "Membership"/"Default" → メンバーシップ/デフォルト
  - `/spine-viewer` title → "Spineビューアー", description and link text translated
- **Preserved:** All route layouts, data layers, filtering logic, pagination, navigation, and visual presentation unchanged; EN locale verified working correctly after changes; no structural or behavioral changes to any route
- **Validation:** Dogfooded `/` (home), `/stickers`, `/gacha`, `/items`, `/bgm` on `http://localhost:3000` via agent-browser in JA locale. Verified: all hub tiles translated; sticker filter labels translated; items category labels translated; BGM section headers and labels translated; gacha title and description translated; no console errors on any tested route; switched to EN and verified no regressions (items shows "Featured", "Gifts", etc.)
- **Live result:** `verified live`
- **Next blocker:** `/assets` page is developer-facing (raw paths, filenames visible) but not linked from nav. Brief English flash before language restore on page load for returning Japanese users (acceptable tradeoff vs hydration error).

### Loop 26 — 2026-04-07
- **Target:** Cards index (`/cards`) — 529 cards with full art images loaded simultaneously, no pagination
- **Files changed:**
  - `src/pages/cards/+Page.tsx` — added pagination: 30 cards per page (6 rows × 5 columns on xl); added `page`/`setPage` state, `pageSize`, `totalPages`, `pageCards` slice; `useEffect` resets page to 1 on search/filter/sort change; added pagination controls (← page numbers →) matching music/gacha/items/stickers pattern; changed render from `filteredCards.map` to `pageCards.map`; added `useEffect` import
- **Visible problem fixed:**
  - `/cards` loaded all 529 cards with 529 full card art images simultaneously — the heaviest page in the app with no way to navigate except infinite scroll
  - Now paginated to 30 cards per page (18 pages total), matching the pagination pattern used by music (24/page), gacha (24/page), items (60/page), and stickers
- **Preserved:** Card layout (image + name + character · rarity), card click-through to detail pages, search filter, rarity/character/sort dropdowns, all existing filters and sorting, `getCardImageUrl` helper unchanged, card detail page unchanged, all other routes unaffected
- **Validation:** Dogfooded `/cards` on `http://localhost:3000` via agent-browser. Verified: page 1 shows 30 cards (was 529); pagination controls render at bottom (18 pages); page 2 click shows different cards; search "Birthday" → 17 results (no pagination shown for small set); card images load; no console errors
- **Live result:** `verified live`
- **Next blocker:** `/assets` page is developer-facing but not linked from nav. Grand Prix and Downloads have no pagination (67 and ~50 items respectively — less critical). Brief English flash before language restore for returning JA users.

### Loop 27 — 2026-04-07
- **Target:** Story detail page (`/stories/:id`) — hero image consumed entire viewport height
- **Files changed:**
  - `src/pages/stories/@id/+Page.tsx` — changed hero container from `minH` to fixed `h={{ base: '280px', md: '360px' }}`; made hero image `position="absolute" inset="0"` to fill constrained container instead of expanding it with natural image height
- **Visible problem fixed:**
  - Story detail hero image (from `image_record_monthly_part_*` fallback) was unconstrained in height, stretching to its natural 1:1+ aspect ratio and consuming 100%+ of the viewport before showing the title, description, or chapter list
  - Users had to scroll past a full-screen image before seeing any useful content
  - Now the hero shows at a controlled 280px/360px height with cover fit, and title + chapter list are visible above the fold
- **Also corrected:** Navigation (#7) status in plan was dishonest — claimed "exactly 5 nav links" but Layout was rewritten to full 14-route sidebar with mobile hamburger drawer. Updated status to reflect reality.
- **Preserved:** Stories index page unchanged; story reader (`@id/@chapterId/+Page.tsx`) unchanged; hero gradient overlay, thumbnail, title, description, and part count badge all intact; chapter list compact rows with thumbnails unchanged; all navigation and search functionality intact
- **Validation:** Dogfooded `/stories/105012` (14 parts), `/stories/102001` (8 parts with unique descriptions), and `/stories/102001/10200101` (story reader). Verified: hero constrained to expected height; title and chapters visible above fold; chapter descriptions show correctly; click-through to reader works; no console errors on any tested route
- **Live result:** `verified live`
- **Next blocker:** `/assets` page is developer-facing but not linked from nav. Grand Prix and Downloads have no pagination (67 and ~50 items respectively — less critical). Brief English flash before language restore for returning JA users.

### Loop 28 — 2026-04-07
- **Target:** Downloads/Loading Screens — nav and page title said "Loading Images" which reads like a loading state, not a section name
- **Files changed:**
  - `src/i18n/locales/en.json` — changed `navigation.downloads` from "Loading Images" to "Loading Screens"; changed `downloads_header` from "Loading Images" to "Loading Screens"; `explore_downloads` auto-updated by linter
  - `src/i18n/locales/ja.json` — changed `navigation.downloads` from "ローディング画像" to "ローディング画面"; changed `downloads_header` from "ローディング画像" to "ローディング画面"; `explore_downloads` auto-updated by linter
  - `src/pages/downloads/+Page.tsx` — updated fallback strings from "Loading Images" to "Loading Screens"
- **Visible problem fixed:**
  - "Loading Images" in the sidebar nav looked like a loading state indicator, not a section name — users would think images are still loading
  - Same issue on the page title and home hub tile
  - Both EN and JA locales had this problem ("ローディング画像" = "Loading Images" literally)
  - Now "Loading Screens" / "ローディング画面" correctly describes the game's loading screen artwork
- **Preserved:** Downloads page layout, banner wall, search filter, image grid, all other routes and navigation unchanged
- **Validation:** Dogfooded `/downloads` and `/` (home hub) in both EN and JA locales via agent-browser. Verified: nav shows "Loading Screens" / "ローディング画面"; page title updated; hub tile updated; no console errors
- **Live result:** `verified live`
- **Next blocker:** Grand Prix and Downloads have no pagination (67 and ~50 items). `/assets` page is developer-facing but not linked from nav. Brief English flash before language restore for returning JA users.

### Loop 29 — 2026-04-07
- **Target:** Grand Prix (`/grand-prix`) — 67 logos loaded simultaneously with no pagination or search
- **Files changed:**
  - `src/pages/grand-prix/+Page.tsx` — added pagination (24 items/page, 3 pages); added search filter by event name with `useEffect` reset to page 1 on query change; added "Showing X of Y events" counter; added pagination controls (← page numbers →) matching gacha/music/cards/items/stickers pattern; added `useState`, `useEffect`, `HStack`, `styled` imports
  - `src/i18n/locales/en.json` — added `filter_grand_prix`: "Search events..."
  - `src/i18n/locales/ja.json` — added `filter_grand_prix`: "イベントを検索..."
- **Visible problem fixed:**
  - `/grand-prix` loaded all 67 logo images simultaneously — the last unpaginated list page in the app, required scrolling through the full list with no way to navigate
  - No search filter existed — users had no way to find specific events
  - Now paginated to 24 logos per page (3 pages total), with search filter by event name
- **Preserved:** Logo layout (contain fit on white background, hover scale), data layer (`+data.ts`) unchanged, `getGrandPrixLogoUrl` helper unchanged, all other routes unaffected, home hub tile navigation intact
- **Validation:** Dogfooded `/grand-prix` on `http://localhost:3000` via agent-browser. Verified: page 1 shows 24 logos (was 67); pagination controls render at bottom (3 pages); page 2 click shows different logos; search "サークル" → 34 results; "Showing 67 of 67 events" counter displays; no console errors
- **Live result:** `verified live`
- **Next blocker:** Downloads has no pagination (~50 items). `/assets` page is developer-facing but not linked from nav. Brief English flash before language restore for returning JA users.

### Loop 30 — 2026-04-07
- **Target:** Stories index (`/stories`) — last unpaginated list page, 44 stories with large images loaded simultaneously
- **Files changed:**
  - `src/pages/stories/+Page.tsx` — added pagination: 12 stories per page (6 rows × 2 columns on md, 4 pages total); added `page`/`setPage` state, `pageSize`, `totalPages`, `pageStories` slice; `useEffect` resets page to 1 on search query change; added pagination controls (← page numbers →) matching all other list routes; changed render from `filteredSeries.map` to `pageStories.map`; added `useEffect` import
- **Visible problem fixed:**
  - `/stories` loaded all 44 stories with 44 large part-image cards simultaneously — the last unpaginated list page in the app, required scrolling through an extremely long page with no way to jump between sections
  - Now paginated to 12 stories per page (4 pages total), matching the pagination pattern used by cards (30/page), music (24/page), gacha (24/page), grand prix (24/page), items (60/page), and stickers
- **Preserved:** Story card layout (image with onError fallback chain, title overlay, part count) unchanged; search filter unchanged (still matches name, description, firstChapterName, ID); story detail page (`@id/+Page.tsx`) unchanged; chapter reader unchanged; `getStoryMonthlyImageUrl` and `getStoryPartImageUrl` helpers unchanged; all other routes unaffected
- **Validation:** Dogfooded `/stories` on `http://localhost:3000` via agent-browser. Verified: page 1 shows 12 stories (was 44); pagination controls render at bottom (4 pages); page 2 click shows different stories with ← button; search "Dream" → 1 result (no pagination for small set, page reset to 1); click-through to `/stories/:id` detail page works (hero, chapters, thumbnails intact); no console errors on index or detail
- **Live result:** `verified live`
- **Next blocker:** Downloads has no pagination (~50 items). `/assets` page is developer-facing but not linked from nav. Brief English flash before language restore for returning JA users.
