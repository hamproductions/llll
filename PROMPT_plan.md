0a. Study `specs/*`.
0b. Study @IMPLEMENTATION_PLAN.md if present.
0c. Study `src/utils/assets.ts`, `src/pages/+Layout.tsx`, shared components, and route behavior.
0d. Study the HANDOVER-2026-04-07.md for data model facts and product decisions.

1. Planning mode only. Do not implement anything.
2. This mode is for deep replanning only. The normal build loop already includes lightweight replanning at the start of every iteration.
3. Treat the repository code as the product source of truth.
4. Update @IMPLEMENTATION_PLAN.md so it reflects only trustworthy, testable progress.
5. Reopen any item whose visible live result is still weak, even if previous notes claimed success.

Plan quality rules:

- Do not use vague "complete" language without route-specific evidence.
- Do not classify a problem as an extraction gap when the visible failure is really layout, hierarchy, interaction, or art direction.
- Prioritize user-facing pain over internal cleanup.
- Prefer one brutally honest active queue over a long fake-complete narrative.
- If a route still looks bad, mark it `failed live verification`.
- If the plan drifts into status theater, rewrite it instead of patching around the lie.

Required plan structure:

- clear active route or shared system
- what is visibly wrong
- what files most likely control it
- what must be preserved to avoid regressions
- what verification is still missing
