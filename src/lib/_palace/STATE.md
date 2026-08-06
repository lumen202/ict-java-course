# STATE — `src/lib/` (2026-08-07)

Protocol: [`docs/MIND_PALACE.md`](../../../docs/MIND_PALACE.md) · How-it-works: [`../content/README.md`](../content/README.md)

- `content/types.ts` — the `Week` type. Video track is a **day-by-day plan**:
  `video.days: DayPlan[]`, each day = focus + `VideoAssignment[]` (youtubeId +
  length) + required `practice`. `playlistUrl` links the full playlist.
- `content/weeks/unit1-week1.ts` — Week 1 (SQL intro), `status: "available"`.
  Video track = Bro Code "MySQL tutorial for beginners" playlist
  (`PLZPZq0r_RZOMskz6MdsMOgxzheIyjo-BZ`, 31 videos, ~2h59m total), days 1–5
  covering playlist videos #1–5 + logical operators + ORDER BY; day 5 is a
  no-video practice day.
- `content/index.ts` — `weeks[]` (display order), `roadmap[]` (units 1–4
  coming soon), `getWeek(slug)`.
- `supabase/client.ts` — `createBrowserClient` for client components.
- `supabase/server.ts` — `createServerClient` bound to request cookies; use in
  server components, route handlers, server actions. Queries run as the
  logged-in user, so RLS applies.
- `auth.ts` — `getCurrentUser()` (user + profile role), `requireUser()`,
  `requireTeacher()`. Always uses `getUser()`, never `getSession()`.
- ~~`supabase.ts`~~ deleted 2026-08-07 (anon/service-role helpers) — replaced by
  the two clients above when accounts landed.
