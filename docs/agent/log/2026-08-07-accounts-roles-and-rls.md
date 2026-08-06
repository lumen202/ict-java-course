# Accounts and role-scoped RLS (the anonymous model is gone)

The owner reversed the v1 "no accounts" decision in favour of real logins with role scoping.
This entry covers the auth foundation; the invite-only layer arrived later the same day in
`2026-08-07-invite-only-accounts-and-app-shell.md`.

## What shipped

- `@supabase/ssr` installed. New `lib/supabase/client.ts` (browser) and `server.ts` (cookie-bound,
  per-user), plus `lib/auth.ts` (`getCurrentUser` / `requireUser` / `requireTeacher`).
  `lib/supabase.ts` (anon + service-role helpers) deleted.
- `src/proxy.ts` — auth-cookie refresh. **Next.js 16 renamed `middleware` to `proxy`**; the
  exported function must be named `proxy`. A `middleware.ts` would use a deprecated convention.
- **Schema**: `profiles` (with the `user_role` enum), `is_teacher()`, a role-escalation guard
  trigger, and `handle_new_user()`. `reflections` gained `user_id` and indexes; the
  anonymous-insert policy was replaced by student-owns-own / teacher-reads-all.
- `/login` with server actions; `/teacher` rewritten from a client passcode form into a
  server component behind `requireTeacher()`, reading rows under RLS. `TEACHER_PASSCODE` and
  `api/teacher/reflections` deleted.
- Reflection submit now requires a session and takes the student's name from their profile, not
  the request body.

## Decisions reversed (deliberately)

| Was | Now | Why |
|---|---|---|
| No accounts in v1 | Accounts with roles | owner's call |
| No `NEXT_PUBLIC_` env vars | URL + anon key **must** be public | Supabase Auth runs in the browser; RLS, not key secrecy, is the boundary |
| Supabase only from API routes | Server components query directly | every query runs as the logged-in user |
| Static/SSG pages | Everything dynamic | the global header reads the session |

## Verification

Smoke-tested: `/teacher` → 307 to `/login?next=%2Fteacher`, unauthenticated POST → 401, week page
showed the sign-in CTA (later replaced by a hard gate).
