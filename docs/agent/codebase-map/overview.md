# Project Overview

A private class app for an ICT Java course. Students sign in and work through the course one
**released day** at a time — videos, in-browser practice games, per-activity turn-ins, and a
short reflection; the teacher releases days, reads turn-ins and reflections to see who's stuck
on what, and manages the roster. It is a classroom tool, not a product being sold — there is no
marketing page and no open signup.

Course arc: **Unit 1** SQL + JDBC → **Unit 2** JavaFX → **Unit 3** REST API (Spring Boot) →
**Unit 4** capstone (a JavaFX client consuming their own API). Built one week at a time;
**Unit 1 weeks 1–2** exist so far.

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
  login/            public: sign in
  register/         public: self-registration, gated by the class list (see enrolment.md)
  welcome/          invited user sets password + name
  auth/confirm/     verifies emailed invite tokens (a page, not a route handler)
  lessons/          index of released days
  week/[slug]/      the one generic week template
  teacher/          dashboard · lessons (day release) · students · submissions · reflections
  api/              reflections/ + submissions/ — the two API routes
src/components/     shared UI incl. the game engines (see ui-and-copy.md, week-experience.md)
src/lib/
  content/          course material as data, one folder per week (see course-content.md)
  supabase/         client.ts (browser) · server.ts (per-user) · admin.ts (service-role)
  auth.ts           getCurrentUser / requireUser / requireTeacher
  release.ts        which days students can see (see lesson-release.md)
  minisql.ts        the in-browser SQL engine behind the practice games
  student-names.ts  display-name resolution for teacher views
src/proxy.ts        refreshes Supabase auth cookies (Next 16's renamed middleware)
supabase/schema.sql the whole database (see data-model.md)
docs/agent/         this framework
```

## Invariants

- **Content is data, not pages.** A week is a `Week` object rendered by one template. Adding
  course material must never mean writing JSX.
- **RLS is the security boundary.** App-level redirects are UX only. Any policy change must be
  mirrored in the app guard and vice versa.
- **Public routes are `/login`, `/register`, and `/auth/confirm`.** Everything else requires a
  session; `/teacher/**` requires `role === 'teacher'`.
- **No open signup.** An account can only be created for an email the teacher has put on the
  class list — via self-registration at `/register` or an emailed invite. The gate is the
  `handle_new_user()` trigger, not the UI.
- **The service-role key never leaves `lib/supabase/admin.ts`** and is never used to read course
  data. Its three callers: invite sending and `updateStudentName` (both behind
  `requireTeacher()`), and `register()`'s create-user path (public by design; the signup trigger
  enforces the class list).
- **Never mention grading or the teacher's attendance** in student-facing copy.
- **Agents never commit or push.**

## Environment

| Var | Notes |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | public by design |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public by design — RLS protects the data, not key secrecy |
| `SUPABASE_SERVICE_ROLE_KEY` | **server-only**, optional (see enrolment.md). Never gains a `NEXT_PUBLIC_` prefix |

Local values live in `.env.local` (gitignored); `.env.example` documents them. Deployment is
Vercel with the same three vars — full setup steps are in the root `README.md`.

## State of the build

Unit 1 weeks 1–2 are shipped: per-day content files, the practice-game layer (mini SQL engine,
Workbench sim, boss battles in modals), day-by-day release, per-activity turn-ins with teacher
hand-back, and role dashboards. Verified locally (`npm run lint`, `npm run build`). See the
newest entry in [`../log/INDEX.md`](../log/INDEX.md) for exactly where to resume and for
current deployment state.
