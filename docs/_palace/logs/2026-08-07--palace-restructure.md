# 2026-08-07 — mind palace created, then restructured per-folder

**Who:** Claude (Fable 5) · **Scope:** memory system

## What changed
- First pass: central `docs/mind-palace/` with one room file per subfolder.
- Same day, per user direction: **restructured** into distributed per-folder
  `_palace/` directories (STATE + DECISIONS + logs/) so no file grows
  unboundedly as the app scales; deleted `docs/mind-palace/`; wrote the
  protocol at `docs/MIND_PALACE.md`; added project-level `docs/logs/`.
- Added the no-AI-commits rule to `AGENTS.md` (D2) at the user's explicit
  request.

## Why / decisions
- D2, D3 recorded.

## Learned / traps for future agents
- `_palace/` inside `src/app/` is safe: the App Router treats `_`-prefixed
  folders as private (never routed).

## Left undone
- Nothing.
