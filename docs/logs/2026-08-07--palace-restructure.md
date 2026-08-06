# 2026-08-07 — mind palace restructured to per-folder + session logs

**Who:** Claude (Fable 5) · **Outcome:** distributed memory system in place

- Per user direction: replaced central `docs/mind-palace/` room files with
  per-folder `_palace/` directories (`STATE.md` + `DECISIONS.md` + `logs/`,
  one small file per session) so no memory file grows unboundedly as the app
  scales. `CODEBASE_MAP.md` remains the quick-lookup index.
- Protocol written at `docs/MIND_PALACE.md`; AGENTS.md memory section updated.
- Added this project-level `docs/logs/` layer and backfilled all four sessions
  to date, so history survives HANDOFF rewrites.
- Palaces created: `src/app/_palace`, `src/components/_palace`,
  `src/lib/_palace`, `supabase/_palace`, `docs/_palace`.
