# 2026-08-07 — site shell, embedded video, polish pass

**Who:** Claude (Fable 5) · **Scope:** layout, home, week template, globals.css, not-found

## What changed
- `layout.tsx`: added `<SiteHeader>`/`<SiteFooter>`, title template.
- `page.tsx`: rewritten — hero, unit cards, numbered "how a week works",
  roadmap timeline; local footer removed (D6).
- `week/[slug]/page.tsx`: `generateMetadata` for per-week titles; video track
  now stacked full-width with in-page `<VideoEmbed>` (falls back to a link
  when `youtubeId` is absent); `<MarkWeekDone>` appended.
- `globals.css`: body font pointed at the Geist variable, zinc-50/950
  backgrounds, smooth scroll, emerald selection.
- `not-found.tsx`: custom 404.

## Why / decisions
- D6 recorded.

## Learned / traps for future agents
- **The scaffold's `globals.css` hard-codes Arial** — it silently overrides the
  fonts `layout.tsx` loads via `next/font`. Fixed; don't reintroduce.
- Prerendered HTML verified to contain the `youtube-nocookie.com` embed and the
  per-week `<title>`.

## Left undone
- Nothing in this folder.
