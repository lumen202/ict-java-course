# HANDOFF — resume point for the next session

> **Open this file first.** It says exactly where the build stands, what's done,
> what's not, and what to do next. Update it whenever a work session ends.
> Last updated: 2026-08-07.

## What this project is

A mini course website for an ICT teacher who can't attend class in person.
Students follow weekly self-paced modules (video track **or** reading track →
activity with a personal "twist" → self-check questions → reflection form).
The teacher reads reflections to see who's stuck on what. No grading.

Course arc: **Unit 1** SQL + JDBC → **Unit 2** JavaFX → **Unit 3** REST API
(Spring Boot) → **Unit 4** capstone (JavaFX client consuming their own API).
The site is being built incrementally, **one week at a time. Only Unit 1 /
Week 1 exists so far.**

Stack: **Next.js 16 (App Router, TS, Tailwind v4) + Supabase (Postgres) → deploy on Vercel.**

## Status: v1 FEATURE-COMPLETE + polish pass — builds clean, not yet run against a real Supabase project

`npm run lint` and `npm run build` pass. `/`, `/teacher`, and the 404 prerender
static; `/week/unit1-week1` prerenders via `generateStaticParams()`; both API
routes are dynamic.

2026-08-07 polish session added: global site shell (sticky header + footer in
the layout), redesigned home page (hero, course-arc cards, roadmap timeline),
**in-page YouTube player** on week pages (`video.youtubeId` on the `Week` type;
lazy iframe on `youtube-nocookie.com`), per-week `<title>`s via
`generateMetadata`, localStorage-only "mark week done" progress
(`src/components/WeekProgress.tsx` — personal checklist, not teacher-visible),
custom 404, and a fixed body font (scaffold had hard-coded Arial). Also added
the mind palace (per-folder `_palace/` agent memory — see below) and the
**no-AI-commits rule** in `AGENTS.md`.

**What has not happened yet:** nobody has created the Supabase project, run
`supabase/schema.sql`, or submitted a real reflection end to end. Everything
touching the database is written but unexercised. That is the next session's
job — see "Next steps".

Working tree note: everything from the polish session is **uncommitted by
design** — agents must not commit (see `AGENTS.md`); the human reviews and
commits. Last pushed commit is `b50dcf2` on `github.com/lumen202/ict-java-course`
(private).

### Done ✅

| Piece | Where |
|---|---|
| Next.js scaffold | repo root — TS + Tailwind v4 + App Router, `src/` layout |
| Content model | `src/lib/content/types.ts` — `Week` type; week pages render 100% from data |
| Week 1 content | `src/lib/content/weeks/unit1-week1.ts` — SQL intro, both tracks, activity + twist, 5 self-check Q&As |
| Content registry | `src/lib/content/index.ts` — `weeks[]`, `roadmap[]`, `getWeek()` |
| DB schema | `supabase/schema.sql` — `reflections` table, RLS: anon may INSERT only |
| Supabase helpers | `src/lib/supabase.ts` — `getAnonClient()` / `getServiceClient()`, null-safe when env missing |
| Student submit API | `src/app/api/reflections/route.ts` — POST, validates + length-bounds, inserts via anon key |
| Teacher fetch API | `src/app/api/teacher/reflections/route.ts` — POST, `TEACHER_PASSCODE` check, reads via service-role key |
| Self-check component | `src/components/SelfCheck.tsx` |
| Reflection form | `src/components/ReflectionForm.tsx` |
| Week page | `src/app/week/[slug]/page.tsx` — generic template, verified against the Next 16 docs, uses `PageProps<'/week/[slug]'>` |
| Home page | `src/app/page.tsx` — intro, "how a week works", available weeks, roadmap, teacher link |
| Teacher page | `src/app/teacher/page.tsx` — passcode → reflections list, newest first, week filter |
| Layout metadata | `src/app/layout.tsx` — title "Java Course Hub" + description |
| `.env.example` | 4 vars, documented, `!.env.example` un-ignored in `.gitignore` |
| Self-documentation | conventions section in `AGENTS.md` (below the auto-managed block), `docs/CODEBASE_MAP.md`, README in `src/app/`, `src/components/`, `src/lib/content/`, `supabase/` |
| Root `README.md` | setup (Supabase → schema → env → dev), deploy to Vercel, how to add a week |
| Site shell | `src/components/SiteHeader.tsx` + `SiteFooter.tsx`, rendered in `layout.tsx`; title template; custom `not-found.tsx` |
| In-page video, day-paced | `video.days: DayPlan[]` on the `Week` type — week 1 schedules Bro Code's "MySQL tutorial for beginners" playlist over 5 days (≤15 min video/day + practice); rendered as day cards with `VideoEmbed` players. Playlist map for future weeks: `src/lib/_palace/DECISIONS.md` D6 |
| Grading secrecy | student-facing copy never mentions grading either way (it IS ungraded — teacher-side secret); rule in `AGENTS.md` |
| Progress (local-only) | `src/components/WeekProgress.tsx` — `MarkWeekDone` on week pages, `WeekDoneBadge` on home; localStorage `jch-done:<slug>` |
| Home redesign | hero, unit cards, numbered "how a week works", roadmap timeline |
| Mind palace | per-folder `_palace/` dirs (STATE + DECISIONS + logs/) in `src/app`, `src/components`, `src/lib`, `supabase`, `docs`; protocol in `docs/MIND_PALACE.md` |
| Session logs | `docs/logs/` — one file per work session, backfilled to the start; context survives HANDOFF rewrites |
| No-AI-commits rule | `AGENTS.md` — agents never `git commit`/`push`; human commits |

### Next steps ❌ (in order)

1. **Stand up Supabase.** Create the project, run `supabase/schema.sql` in the
   SQL Editor, copy the 4 values into `.env.local` (`cp .env.example .env.local`).
2. **End-to-end test locally.** `npm run dev` → submit a reflection on
   `/week/unit1-week1` → confirm the row appears on `/teacher` with the
   passcode. Also check the failure paths: wrong passcode → 401 message; empty
   name/hardest-part → validation message.
3. **Deploy.** Push to GitHub, import in Vercel, set the same 4 env vars, verify
   the deployed site does the same round trip.
4. **Share `/week/unit1-week1` with students**, then read reflections to decide
   what week 2 needs to re-explain.
5. **Write week 2** — `Week 2 — UPDATE, DELETE, and primary keys` is already in
   `roadmap[]`. One new file in `src/lib/content/weeks/` + register in
   `index.ts` + delete its roadmap line. See `src/lib/content/README.md`.

### Known gaps (accepted for v1, revisit if they bite)

- **No rate limiting** on `/api/reflections` — it's a public unauthenticated
  insert. Bounded by length checks only. Fine for one class; add a limit if the
  URL ever leaks.
- **Passcode is sent in the request body, not a session.** Reloading `/teacher`
  means re-entering it. Deliberate — no auth system in v1.
- **No edit/delete for reflections.** Remove rows in the Supabase dashboard.
- **Teacher fetch caps at 500 rows.** Fine for a class; paginate if it grows.

## Decisions already made (don't relitigate)

- **Content = data, not pages.** Adding week 2 must mean: one new file in
  `src/lib/content/weeks/` + registering it in `index.ts`. Nothing else.
- **Supabase only touched from API routes** (server). Keys stay out of the
  browser; env vars intentionally have no `NEXT_PUBLIC_` prefix.
- **Auth kept minimal on purpose**: students are anonymous (name field only),
  teacher uses a single passcode env var. No accounts/Supabase Auth in v1.
- **RLS**: anon key can only INSERT into `reflections`; reads go through the
  service-role key server-side.
- **Slugs are permanent** once shared with students (`unit1-week1`).
- **Two learning tracks per week** (video + reading) because at least one
  student struggles with video learning; both tracks feed the same activity.
- **Video is paced day-by-day** (~10–20 min/day + practice) — students have no
  prior foundation; never assign one long unbroken video.
- **Grading is never mentioned to students, either direction.** The course is
  ungraded; that stays a teacher-side secret.
- Every activity has a **"twist"** that can't be copied from the tutorial.

## Env vars (needed before reflections work)

| Var | From |
|---|---|
| `SUPABASE_URL` | Supabase → Project Settings → API |
| `SUPABASE_ANON_KEY` | same page ("anon public") |
| `SUPABASE_SERVICE_ROLE_KEY` | same page ("service_role" — secret!) |
| `TEACHER_PASSCODE` | invent one |

Local: `.env.local` (never committed). Vercel: Project → Settings →
Environment Variables.

## Where things are

`docs/CODEBASE_MAP.md` — the index: file-by-file tour, request flows, and
pointers to each folder's memory. Each major folder has a `_palace/` directory
(STATE, DECISIONS, per-session logs) — read it before touching the folder, log
after; protocol in `docs/MIND_PALACE.md`. Project-wide session history:
`docs/logs/`. Folder-level READMEs hold the conventions for each area.
`AGENTS.md` has the project-wide rules (below the auto-managed Next.js block —
never edit inside those markers), including: **AI agents must never commit or
push — the human does that.**

## How to resume

Open this folder in Claude Code and say:
*"Read docs/HANDOFF.md and continue from the 'Next steps' list."*
