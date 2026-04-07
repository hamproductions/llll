## Build & Run

- Dev server: `bun run dev` (serves on localhost:3000)
- Production build: `bun run build`
- Preview production: `bun run preview`

## Validation

- Tests: `bun run test`
- Typecheck: `bun run type-check`
- Lint: `bun run lint`
- All checks: `bun run check`
- Route verification must use `agent-browser` CLI (never `npx agent-browser`) and `dogfood` skill
- Verify against `http://localhost:3000`
- Visual and functional verification are required in the same loop
- Build success is not sufficient evidence of correctness

## Pipeline

- Fetch all assets: `bun run pipeline:fetch-all-assets`
- Audit assets: `bun run pipeline:audit-assets`
- Upload to GCS: `bun run pipeline:upload-assets`

## Operational Notes

- Keep this file brief and operational.
- Put status, bugs, and planning in `IMPLEMENTATION_PLAN.md`.
- Add only durable execution learnings here.

### Codebase Patterns

- Framework: Vike (file-based routing) + React 19 + PandaCSS + Park UI
- Route structure: `src/pages/<route>/+Page.tsx` (component), `+data.ts` (data loader)
- Detail routes: `src/pages/<route>/@id/+Page.tsx`
- Nested detail: `src/pages/<route>/@id/@chapterId/+Page.tsx`
- Asset URL helpers: `src/utils/assets.ts` — central place for all asset URL construction
- Database: LibSQL via Drizzle ORM — `src/utils/database.ts`
- i18n: i18next — locales in `src/i18n/locales/{en,ja}.json`
- Layout: `src/pages/+Layout.tsx` — top nav and page shell
- Styling: PandaCSS with `styled-system/` generated utilities
- 3D viewer: React Three Fiber in `src/features/model-viewer/`
- Data directory: `data/` at repo root — extracted game assets, DB files, music
- Asset families use bundle label prefixes (e.g. `image_gacha_top_*`, `image_record_monthly_*`)
- Known typecheck failures exist in `scripts/fetch-assets.ts`, `src/components/ui/styled/utils/create-style-context.tsx`, `src/lib/create-style-context.tsx`, `src/features/model-viewer/CharacterModel.tsx` — pre-existing, unrelated to route/UI work
- The normal loop should not depend on a separate planning run before doing useful work
- Do not hide layout or interaction failures behind "content gap" or "extraction needed" language
