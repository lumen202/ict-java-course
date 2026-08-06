# Project Overview

A private class app for an ICT Java course. Students sign in, work through one week at a time,
and submit a short reflection; the teacher reads the reflections to see who's stuck on what and
manages the roster. It is a classroom tool, not a product being sold — there is no marketing page
and no self-serve signup.

Course arc: **Unit 1** SQL + JDBC → **Unit 2** JavaFX → **Unit 3** REST API (Spring Boot) →
**Unit 4** capstone (a JavaFX client consuming their own API). Built one week at a time; only
**Unit 1 / Week 1** exists so far.

## Stack

Next.js 16 (App Router, TypeScript, Tailwind v4) · Supabase (Postgres + Auth) · Vercel.

**Next.js 16 is newer than most training data.** Read `node_modules/next/dist/docs/` before
writing app-router code. Two things bite repeatedly: `middleware.ts` is now `proxy.ts` (exported
function named `proxy`), and `params`/`searchParams` are Promises that must be awaited — use the
generated global `PageProps<'/route'>` / `LayoutProps<'/'>` types rather than hand-writing props.

## Folder layout

```
src/app/            routes (see auth.md, week-experience.md, teacher-area.md)
  page.tsx          role-scoped dashboard → StudentDashboard | TeacherDashboard
  login/            the ONLY public route
  welcome/          invited user sets password + name
  auth/confirm/     verifies emailed invite tokens
  week/[slug]/      the one generic week template
  teacher/          reflections + students roster
  api/reflections/  the single API route
src/components/     shared UI (see ui-and-copy.md)
src/lib/
  content/          course material as data (see course-content.md)
  supabase/         client.ts (browser) · server.ts (per-user) · admin.ts (invites only)
  auth.ts           getCurrentUser / requireUser / requireTeacher
src/proxy.ts        refreshes Supabase auth cookies (Next 16's renamed middleware)
supabase/schema.sql the whole database (see data-model.md)
docs/agent/         this framework
```

## Invariants

- **Content is data, not pages.** A week is a `Week` object rendered by one template. Adding
  course material must never mean writing JSX.
- **RLS is the security boundary.** App-level redirects are UX only. Any policy change must be
  mirrored in the app guard and vice versa.
- **Everything except `/login` requires a session.**
- **No self-serve signup.** Accounts exist only via teacher invite.
- **The service-role key has one caller**, `lib/supabase/admin.ts`, used only to send invites and
  always behind `requireTeacher()`.
- **Never mention grading or the teacher's attendance** in student-facing copy.
- **Agents never commit or push.**

## Environment

| Var | Notes |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | public by design |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public by design — RLS protects the data, not key secrecy |
| `SUPABASE_SERVICE_ROLE_KEY` | **server-only**, invites only. Never gains a `NEXT_PUBLIC_` prefix |

Local values live in `.env.local` (gitignored); `.env.example` documents them. Deployment is
Vercel with the same three vars — full setup steps are in the root `README.md`.

## State of the build

Code-complete for v1 and verified locally (`npm run lint`, `npm run build`, route smoke tests).
**The live Supabase project has never had the schema run against it**, so nothing has been
exercised end to end. See the newest entry in [`../log/INDEX.md`](../log/INDEX.md) for exactly
where to resume.
