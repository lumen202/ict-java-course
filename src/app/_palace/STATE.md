# STATE — `src/app/` (2026-08-07)

Protocol: [`docs/MIND_PALACE.md`](../../../docs/MIND_PALACE.md) · How-it-works: [`../README.md`](../README.md)

- **Layout** (`layout.tsx`): Geist fonts, title template `%s · Java Course Hub`,
  global `<SiteHeader>`/`<SiteFooter>` around every page.
- **Home** (`page.tsx`): hero → 4-unit course-arc cards → "how a week works" →
  available week cards (client `<WeekDoneBadge>`) → roadmap timeline. Fully
  driven by `weeks[]`/`roadmap[]`.
- **Week template** (`week/[slug]/page.tsx`): SSG via `generateStaticParams()`;
  per-week titles via `generateMetadata()`; video track renders `video.days` as
  day cards (day chip + focus + "N min of video" / "practice day", embedded
  `<VideoEmbed>` players in a 2-col grid, "✍️ Then do:" practice box); ends
  with `<MarkWeekDone>`.
- **Copy rule**: no grading mentions anywhere student-facing, either direction
  (see AGENTS.md; docs/_palace D-entries).
- **Teacher** (`teacher/page.tsx`): client page, passcode → reflections list,
  week filter.
- **API routes**: `api/reflections` (student submit, anon key) and
  `api/teacher/reflections` (passcode + service-role key). Both fail soft (503)
  without env vars.
- **404** (`not-found.tsx`): custom; unknown week slugs land here.
- Verified: `npm run lint` + `npm run build` pass; all static/SSG pages
  prerender.
