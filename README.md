# Java Course Hub

A small course website for an ICT Java class. Students work through weekly
self-paced modules — pick a **video track** or a **reading track**, build the
week's activity (including a required "twist" that can't be copied from the
tutorial), self-check with hidden answers, then submit a short reflection.
The teacher reads the reflections to see who is stuck on what. Nothing is graded.

Course arc: **Unit 1** SQL + JDBC → **Unit 2** JavaFX → **Unit 3** REST API
(Spring Boot) → **Unit 4** capstone (a JavaFX client consuming their own API).
Weeks are published one at a time.

Stack: Next.js 16 (App Router, TypeScript, Tailwind v4) · Supabase (Postgres) ·
deployed on Vercel.

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Create a Supabase project** at [supabase.com](https://supabase.com) (the
   free tier is plenty).

3. **Create the table.** In the Supabase dashboard go to **SQL Editor → New
   query**, paste the contents of [`supabase/schema.sql`](supabase/schema.sql),
   and run it. This creates the `reflections` table and its row-level-security
   policy.

4. **Set environment variables.** Copy the template and fill it in:

   ```bash
   cp .env.example .env.local
   ```

   | Variable | Where to get it |
   |---|---|
   | `SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
   | `SUPABASE_ANON_KEY` | same page → Project API keys → "anon public" |
   | `SUPABASE_SERVICE_ROLE_KEY` | same page → "service_role" (secret — bypasses RLS) |
   | `TEACHER_PASSCODE` | invent one; it's the whole teacher login |

   None of these use the `NEXT_PUBLIC_` prefix, and that is deliberate — see
   [Conventions](#conventions).

5. **Run it**

   ```bash
   npm run dev
   ```

   Open <http://localhost:3000>. The site renders without Supabase configured;
   only reflection submit/read need the keys.

## Deploy

1. Push the repo to GitHub.
2. Import it at [vercel.com/new](https://vercel.com/new) — the Next.js preset is
   detected automatically, no build settings to change.
3. In **Project → Settings → Environment Variables**, add the same four
   variables from step 4 above (Production, Preview, and Development).
4. Deploy. The same Supabase project serves local and production.

## Adding a week

One new file plus one line of registration — no page code:

```
src/lib/content/weeks/unit1-week2.ts   # export a `Week` object
src/lib/content/index.ts               # add it to `weeks[]`
```

See [`src/lib/content/README.md`](src/lib/content/README.md) for the full
walkthrough.

## Conventions

- **Content is data, not pages.** `src/app/week/[slug]/page.tsx` renders any
  week from its `Week` object. There is no per-week JSX.
- **Supabase is only touched from API routes** (server side). No key ever
  reaches the browser, which is why the env vars have no `NEXT_PUBLIC_` prefix.
- **Auth is minimal on purpose.** Students are anonymous (name field only); the
  teacher uses one passcode env var. No accounts in v1.
- **Slugs are permanent** once a link has been shared with students.

## Project layout

See [`docs/CODEBASE_MAP.md`](docs/CODEBASE_MAP.md) for a file-by-file tour, and
[`docs/HANDOFF.md`](docs/HANDOFF.md) for current build state and remaining work.
