# 2026-08-07 — login page, role scoping, passcode removed

**Who:** Claude (Opus 5) · **Scope:** `login/`, `teacher/`, `api/`, `week/[slug]`, `src/proxy.ts`

## What changed
- New `login/` route: page + client form (tabbed sign in / create account) +
  server actions. `?next=` is sanitized to same-site paths only.
- `teacher/page.tsx` rewritten: was a client passcode form calling an API;
  now a server component behind `requireTeacher()` reading rows under RLS.
  Week filter moved to the URL (`?week=`).
- `api/teacher/reflections/` **deleted**; `api/reflections` now requires a
  session and inserts `user_id` + the profile's name (body name field gone).
- Week page: reflection form only for signed-in users, else a sign-in CTA.
- Added `src/proxy.ts` for auth-cookie refresh.

## Why / decisions
- D2/D3/D4 superseded; D7–D9 recorded.

## Learned / traps for future agents
- **Next 16 renamed `middleware` → `proxy`** (`node_modules/next/dist/docs/
  01-app/03-api-reference/03-file-conventions/proxy.md`). A `middleware.ts`
  would be deprecated; the export must be named `proxy` (or default).
- Adding session reads to the global header made **every route dynamic** — the
  build output went from `○`/`●` to all `ƒ`. Expected, but don't be surprised.
- Verified by smoke test: `/teacher` → 307 to `/login?next=%2Fteacher`,
  unauthenticated POST → 401, week page shows the sign-in CTA.

## Left undone
- Nothing in this folder; end-to-end test needs the schema run (see supabase/).
