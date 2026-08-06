# DECISIONS — `src/lib/` (append-only)

- **D1** — Content = data, not pages. Adding a week: one file in
  `content/weeks/` + register in `content/index.ts` + delete its `roadmap[]`
  line. Nothing else.
- **D2** — Slugs are permanent once shared with students. `unit1-week1` must
  never change.
- **D3** — Both tracks (video + reading) must genuinely cover the same
  material; every activity needs a twist that can't be copied from a tutorial;
  ~5 self-check items per week.
- **D4** — ~~`supabase.ts` may only be imported from `src/app/api/` routes.~~
  Superseded by D8: with RLS-per-user, server components read directly.
- **D8** (2026-08-07, supersedes D4) — Supabase clients live in
  `src/lib/supabase/{client,server}.ts` and may be used from server components,
  route handlers, server actions, and (browser client) client components. Safe
  because every query runs as the logged-in user under RLS. **No service-role
  client exists anymore** — nothing in the app bypasses RLS.
- **D9** — `src/lib/auth.ts` is the only place that decides access:
  `getCurrentUser` / `requireUser` / `requireTeacher`. Always `getUser()` (token
  verified with Supabase), never `getSession()` (cookie contents unverified).
- **D5** — `video.youtubeId` is optional by design: weeks whose video isn't on
  YouTube fall back to an external link instead of an embed.
- **D6** — Supersedes D5 (same day): video track is paced **day-by-day** (`DayPlan[]`): students have no
  prior foundation, so each day gets ~10–20 min of video + mandatory practice
  text, instead of one long video. Budget ≈2× video length as real time. The
  unit's source playlist is Bro Code "MySQL tutorial for beginners" (~3h of
  video across 31 short videos) — later weeks continue where week 1 stopped
  (UPDATE/DELETE #6, keys #13–14, constraints #9–12, joins #15–16…).
- **D7** — **Grading is never mentioned in content, either direction.** The
  course is ungraded but that's a teacher-side secret (user directive,
  2026-08-07). Applies to all week copy.
