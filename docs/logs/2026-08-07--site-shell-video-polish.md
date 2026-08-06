# 2026-08-07 — full-site polish, in-page video, progress, mind palace v1

**Who:** Claude (Fable 5) · **Outcome:** polish pass complete, lint+build clean, left uncommitted

- **In-page video**: optional `video.youtubeId` on the `Week` type;
  `VideoEmbed` component (lazy `youtube-nocookie.com` iframe); week 1 wired to
  the Bro Code video; verified present in prerendered HTML.
- **Site shell**: `SiteHeader`/`SiteFooter` in the layout, title template,
  custom 404, redesigned home (hero, unit cards, roadmap timeline).
- **Progress**: `WeekProgress.tsx` — localStorage-only mark-done + home badges;
  rewritten from setState-in-effect to `useSyncExternalStore` after lint
  rejected the first version.
- **Fixed**: scaffold `globals.css` hard-coded Arial, silently disabling the
  Geist fonts.
- **Mind palace v1**: central `docs/mind-palace/` rooms (restructured to
  per-folder `_palace/` later the same day — see next log).
- **New rule at user's request: AI agents must never commit or push.** Added to
  AGENTS.md; all changes from this session left uncommitted for human review.
