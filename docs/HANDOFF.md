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

## Status: v1 FEATURE-COMPLETE — builds clean, not yet run against a real Supabase project

`npm run build` passes: TypeScript checks, `/` and `/teacher` prerender static,
`/week/unit1-week1` prerenders via `generateStaticParams()`, both API routes are
dynamic. Every page in the v1 scope exists and renders.

**What has not happened yet:** nobody has created the Supabase project, run
`supabase/schema.sql`, or submitted a real reflection end to end. Everything
touching the database is written but unexercised. That is the next session's
job — see "Next steps".

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

`docs/CODEBASE_MAP.md` — file-by-file tour and the two request flows.
Folder-level READMEs hold the conventions for each area. `AGENTS.md` has the
project-wide rules (below the auto-managed Next.js block — never edit inside
those markers).

## How to resume

Open this folder in Claude Code and say:
*"Read docs/HANDOFF.md and continue from the 'Next steps' list."*
