# Java Course Hub

A private class app for an ICT Java course, built as course content outgrew slides. Students
sign in and work through the course **one released day at a time** — videos with immediate
practice, in-browser games that run real SQL, per-activity turn-ins, and a short reflection.
The teacher releases days, reads the turned-in work to see who's stuck on what, and manages
the roster.

Course arc: **Unit 1** SQL + JDBC → **Unit 2** JavaFX → **Unit 3** REST API (Spring Boot) →
**Unit 4** capstone (a JavaFX client consuming their own API). Unit 1 weeks 1–2 are written;
each day is designed to fill a ~5-hour class session.

Stack: Next.js 16 (App Router, TypeScript, Tailwind v4) · Supabase (Postgres + Auth) · Vercel.

## What's interesting under the hood

- **A hand-written mini MySQL engine** (`src/lib/minisql.ts`) powers an in-page "DB Fiddle":
  it parses and executes the course's command set (CREATE/DROP/SHOW, USE, DESCRIBE, INSERT,
  SELECT with WHERE/ORDER BY, ALTER, UPDATE, DELETE, SQL_SAFE_UPDATES) with genuine MySQL
  error codes and wording. Console tasks are judged **by effect** — state and result
  comparison against a canonical solution — so any correct spelling passes, and "break it on
  purpose" labs are cleared by hitting the same real error the teacher intended.
- **Eight game engines, one shell.** Row-hunt, SQL typing drills, quests, boss battles
  (an HP-and-hearts quiz where wrong answers re-queue), the SQL console, a clickable MySQL
  Workbench simulator, line-ordering puzzles, and structured answer sheets — all open into
  one full-screen modal with a strict pause-never-reset contract, and all auto-submit their
  results as turn-ins.
- **Course content is data, not pages.** A week is a `Week` object (one file per day) rendered
  by a single template; adding a week of material involves zero JSX.
- **Day-by-day release.** A one-row `course_state` table says which day the class is on;
  students see released days only, and inside a day, steps unlock one at a time as work is
  turned in. Teachers can hand work back, which re-locks that part of the day — even against
  the student's cached local progress.
- **Row Level Security is the actual security boundary**, not redirects. Enrolment is
  invite-only via a teacher-managed class list, enforced by a database trigger that aborts
  any signup for an unlisted email — so the public `/register` page is safe by construction.

> **Working on this with an AI agent?** Point it at [`docs/agent/INDEX.md`](docs/agent/INDEX.md)
> first — that's the entry point to the codebase map, session log, and bug tracker.

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Create a Supabase project** at [supabase.com](https://supabase.com) (free tier is plenty).

3. **Create the tables.** Dashboard → **SQL Editor → New query**, paste all of
   [`supabase/schema.sql`](supabase/schema.sql), and **Run**. It's idempotent, so re-running after
   a schema edit is safe.

4. **Check the auth settings.** Authentication → Providers → Email:
   - *Allow new users to sign up*: **on**. Counter-intuitive, but the database trigger is the
     gate — a signup for an email not on the teacher's class list is aborted at the transaction
     level, so leaving this on is what lets allow-listed students register themselves.
   - *Confirm email*: **off**, so `/register` never leaves a student waiting on an email.

5. **Whitelist the invite callback.** Authentication → URL Configuration → Redirect URLs → add
   `http://localhost:3000/auth/confirm` (and your deployed URL later). Emailed invite links
   bounce without this.

6. **Set environment variables.**

   ```bash
   cp .env.example .env.local
   ```

   | Variable | Where |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → API → Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | same page → "anon public" (or "Publishable key") |
   | `SUPABASE_SERVICE_ROLE_KEY` | same page → "service_role" (or "Secret key") — **server-only** |

   The first two are public by design: Supabase Auth runs in the browser, and Row Level Security —
   not key secrecy — protects the data. The service-role key never leaves
   `src/lib/supabase/admin.ts` (invites, registration's create-user path, roster name fixes).

7. **Create your teacher account.** Register at `/register` — before any teacher exists, the
   first account is allowed through as a bootstrap. Then promote it in the SQL Editor:

   ```sql
   update public.profiles
   set role = 'teacher'
   where id = (select id from auth.users where email = 'you@example.com');
   ```

   Everyone signs up as a student; there's no in-app way to become a teacher, on purpose.

8. **Run it**

   ```bash
   npm run dev
   ```

   Open <http://localhost:3000> and sign in. From **Students**, add the class list — each row
   gets a copyable `/register` link (and optionally an emailed invite). From **Lessons**,
   release day 1 when class starts.

## Deploy

1. Push to GitHub.
2. Import at [vercel.com/new](https://vercel.com/new) — the Next.js preset is detected
   automatically; no build settings to change.
3. **Project → Settings → Environment Variables**: add the same three variables (Production,
   Preview, Development).
4. Deploy, then add `https://<your-domain>/auth/confirm` to Supabase → Authentication → URL
   Configuration → Redirect URLs.

Every push to `main` redeploys, so publishing a new week is: write the content files, commit,
push — then release its days from **Lessons** whenever class gets there.

## Adding a week

New data files plus one line of registration — no page code:

```
src/lib/content/weeks/unit1-week3/
  index.ts             the Week shell (copy week 2's)
  day1.ts … day5.ts    one DayPlan per class day
src/lib/content/index.ts   add the week to weeks[], drop its roadmap[] line
```

Full walkthrough, including the pacing rules and how to pick a game format per lesson:
[`docs/agent/codebase-map/course-content.md`](docs/agent/codebase-map/course-content.md).

## Project layout

[`docs/agent/codebase-map/INDEX.md`](docs/agent/codebase-map/INDEX.md) — one doc per subsystem.
[`docs/agent/log/INDEX.md`](docs/agent/log/INDEX.md) — session-by-session history; the newest
entry says where things stand.
