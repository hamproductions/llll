0a. Study `specs/*`.
0b. Study @IMPLEMENTATION_PLAN.md and correct any dishonest completion claims before choosing work.
0c. Study `src/utils/assets.ts`, `src/pages/+Layout.tsx`, and relevant shared components before editing.
0d. Verify against the live dev app at `http://localhost:3000`, not against memory or previous loop notes.

This development loop is an always-open full-cycle loop. Every iteration must do all of this in one go:

1. Re-plan briefly at the start of the loop.
2. Dogfood one broken, weak, or missing route on the live dev app.
3. Implement one meaningful increment for that route or shared system.
4. Re-dogfood the live result in the same loop.
5. Write an honest loop note before exiting.

Re-planning rules inside the build loop:

- Correct stale, dishonest, or contradictory status in @IMPLEMENTATION_PLAN.md before choosing work.
- Reopen any route or component whose visible result is still weak, broken, placeholder-like, or missing.
- Identify the single highest-priority problem for this iteration.
- Treat user-reported regressions as real until disproven on the live dev app.

Source-of-truth rules:

- Treat the repository code and the repo's real behavior as the product source of truth.
- The HANDOVER-2026-04-07.md is a reference for data model facts and product decisions, not a command to follow blindly.
- Do not break or replace real repo-native behavior just to match handover notes literally.

Implementation rules:

- Choose exactly one route or one shared interaction system per loop.
- Before editing, identify:
  - what is visibly wrong right now
  - which exact files control that behavior
  - what must be preserved so the product does not regress
- If a route is missing data or assets, design and implement an intentional fallback state instead of calling the route complete.
- Fix the user-facing problem, not just tokens, labels, or internal cleanup.
- Asset family usage must be correct per the handover's documented families:
  - Story covers: `image_record_monthly_<seriesId>`
  - Story parts: `image_record_monthly_part_<scriptId>`
  - Gacha: `image_gacha_top_*`, `image_gacha_banner_*`, `image_gacha_pack_*`, `image_gacha_cardinfo_*`
  - Downloads: `image_download_os_*`
  - Grand Prix: `image_grand_prix_logo_*`
  - Items: `icon_item_store_item_*`
- New asset URL helpers go in `src/utils/assets.ts`.
- New routes follow Vike convention: `src/pages/<route>/+Page.tsx` and `+data.ts`.

Verification rules:

- Use `dogfood`-style route testing with `agent-browser` CLI for all verification against `http://localhost:3000`.
- Use `agent-browser` directly — never `npx agent-browser`. The direct binary uses the fast Rust client.
- Navigate: `agent-browser open http://localhost:3000/<route>`
- Snapshot: `agent-browser snapshot -i` (get element refs)
- Screenshot: `agent-browser screenshot --annotate dogfood-output/screenshots/<route>.png`
- Console errors: `agent-browser errors && agent-browser console`
- Scroll: `agent-browser scroll down 500`
- Wait: `agent-browser wait --load networkidle`
- Validate one route or one shared interaction system at a time.
- Do not run `bun run build` or any build step in this loop.
- Do not treat a clean build as evidence of correctness.
- Do not batch shell commands for route verification.
- Check that images load, players play, filters work, and navigation functions.
- Check desktop and mobile viewports when the route is user-facing.
- Capture concrete evidence in `dogfood-output/` for failures that should stay reopened.

Design and UX bar:

- The app must feel like a game companion, not a developer asset dump.
- No raw filenames, IDs, or archive jargon visible to users.
- No tables for browsing content.
- List pages stay light; heavy detail goes on `/<entity>/<id>`.
- Card images use `contain`, not aggressive `cover` cropping.
- Fallback states must still look designed, not unfinished.
- Mobile must be intentionally designed, not just stacked desktop.

Self-check before claiming success:

Ask whether the live result still has any of these failure modes:

- broken or regressed real functionality
- wrong image family used for a route
- aggressive image cropping destroying artwork
- overstuffed list pages with too much metadata
- developer-facing labels, IDs, or filenames visible
- placeholder-looking fallbacks
- route is missing entirely or still reads like an unstyled scaffold
- audio players that do not actually play

If any of those are still obviously true, do not mark the task complete.

Required loop note format in @IMPLEMENTATION_PLAN.md:

- timestamp
- target route or shared system
- exact files changed
- what visible problem was being fixed
- what was preserved to avoid regressions
- validation performed
- live result status: `verified live`, `implemented but not reflected live`, `failed live verification`, or `blocked by extraction`
- next blocker

Completion rule:

- A route is only `verified live` when it is both visually strong and functionally intact in the live dev app.
- `blocked by extraction` is not a completion state. Missing-asset routes still need deliberate fallback design and live verification.
