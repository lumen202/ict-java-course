# 2026-08-07 — site shell, video embed, progress components

**Who:** Claude (Fable 5) · **Scope:** four new components

## What changed
- New: `SiteHeader`, `SiteFooter` (global chrome, rendered from the layout),
  `VideoEmbed` (in-page YouTube player), `WeekProgress` (exports `MarkWeekDone`
  + `WeekDoneBadge`).
- `SelfCheck` / `ReflectionForm` untouched.

## Why / decisions
- D4–D6 recorded.

## Learned / traps for future agents
- First version of `WeekProgress` used setState-inside-useEffect for the
  localStorage read — **lint fails** on `react-hooks/set-state-in-effect`.
  Rewritten with `useSyncExternalStore` (D5). Use that pattern for any future
  browser-storage reads.

## Left undone
- Nothing.
