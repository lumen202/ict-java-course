# Java Course Hub

A private class app for an ICT Java course. Students sign in, work through one week at a time —
a **video track** and a **reading track** covering the same material, an activity with a required
"twist" that can't be copied from the tutorial, self-check questions with hidden answers, and a
short reflection. The teacher reads the reflections to see who's stuck on what, and manages the
roster.

Course arc: **Unit 1** SQL + JDBC → **Unit 2** JavaFX → **Unit 3** REST API (Spring Boot) →
**Unit 4** capstone (a JavaFX client consuming their own API). Weeks are published one at a time.

Stack: Next.js 16 (App Router, TypeScript, Tailwind v4) · Supabase (Postgres + Auth) · Vercel.

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

4. **Turn off self-serve signup.** Authentication → Providers → Email → uncheck *Allow new users
   to sign up*. Accounts are created by teacher invite only; without this the API still allows
   self-registration even though the app has no signup form.

5. **Whitelist the invite callback.** Authentication → URL Configuration → Redirect URLs → add
   `http://localhost:3000/auth/confirm` (and your deployed URL later). Invite links bounce
   without this.

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
   not key secrecy — protects the data. The service-role key bypasses RLS and is used in exactly
   one place, sending invites.

7. **Create your teacher account.** Authentication → **Users → Add user** (email + password, mark
   it confirmed), then in the SQL Editor:

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

   Open <http://localhost:3000> and sign in. From **Students** you can invite the rest of the class.

## Deploy

1. Push to GitHub.
2. Import at [vercel.com/new](https://vercel.com/new) — the Next.js preset is detected
   automatically; no build settings to change.
3. **Project → Settings → Environment Variables**: add the same three variables (Production,
   Preview, Development).
4. Deploy, then add `https://<your-domain>/auth/confirm` to Supabase → Authentication → URL
   Configuration → Redirect URLs.

Every push to `main` redeploys, so publishing a new week is: write the content file, commit, push.

## Adding a week

One new file plus one line of registration — no page code:

```
src/lib/content/weeks/unit1-week2.ts   # export a `Week` object
src/lib/content/index.ts               # add it to weeks[], drop its roadmap[] line
```

Full walkthrough, including the day-by-day video pacing rules:
[`docs/agent/codebase-map/course-content.md`](docs/agent/codebase-map/course-content.md).

## Project layout

[`docs/agent/codebase-map/INDEX.md`](docs/agent/codebase-map/INDEX.md) — one doc per subsystem.
[`docs/agent/log/INDEX.md`](docs/agent/log/INDEX.md) — session-by-session history; the newest
entry says where things stand.
