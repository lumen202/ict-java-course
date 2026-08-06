# Site shell, in-page video, local progress tracking

## What shipped

- **Global chrome**: `SiteHeader` + `SiteFooter` rendered from the root layout; title template;
  custom `not-found.tsx`.
- **Home page redesign** (later replaced by the role-scoped dashboard): hero, unit cards,
  numbered "how a week works", roadmap timeline.
- **In-page video**: `VideoEmbed` (lazy `youtube-nocookie.com` iframe, zero client JS) plus an
  optional `video.youtubeId` on the `Week` type. Superseded the same day by the day-by-day plan —
  see `2026-08-07-playlist-day-pacing-and-copy-bans.md`.
- **`WeekProgress`**: `MarkWeekDone` + `WeekDoneBadge`, localStorage only.
- Per-week `<title>`s via `generateMetadata`.

## Bugs found and fixed

- The scaffold's `globals.css` hard-coded `font-family: Arial`, silently overriding the Geist
  fonts loaded in the layout.
- The first `WeekProgress` implementation read localStorage with setState-inside-`useEffect`,
  which **fails lint** under `react-hooks/set-state-in-effect`. Rewritten with
  `useSyncExternalStore` and a `false` server snapshot, which also removes the hydration
  mismatch. Use that pattern for any future browser-storage read.

## New standing rule

At the owner's request: **AI agents must never `git commit` or `git push`.** Work ends at passing
lint + build + updated docs; the human reviews and commits. Recorded in `AGENTS.md`.
