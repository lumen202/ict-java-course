# Data Model — Schema, Roles, RLS

Everything lives in `supabase/schema.sql`, applied by hand in the Supabase SQL Editor (no
migration tooling). Every statement is idempotent — `create table if not exists`,
`create or replace`, `drop policy if exists`, `add column if not exists` — so re-running after an
edit is safe and is the intended workflow.

## Tables

**`profiles`** — one row per auth user, created automatically by the `on_auth_user_created`
trigger. Because that trigger fires when an *invite* is sent (invites create the auth user
immediately), invited people appear on the teacher's roster before they've accepted.

| Column | Notes |
|---|---|
| `id` | PK, FK → `auth.users(id)`, cascade delete |
| `created_at` | doubles as "invited on" |
| `email` | copied from `auth.users` so the roster can show it without an admin query |
| `first_name` / `middle_name` / `last_name` | middle optional |
| `full_name` | **derived** by the `sync_full_name()` trigger — never write it directly |
| `role` | `user_role` enum: `student` (default) or `teacher` |
| `onboarded_at` | null = invited but hasn't set a password yet |

**`reflections`** — `id`, `created_at`, `user_id` (FK → auth.users), `week_slug`, `student_name`
(name snapshot at submit time), `hardest_part`, `want_explained` (nullable). Indexed on `user_id`
and `week_slug`.

## Security model

RLS is on for both tables and is the real boundary; the app's redirects are only UX.

- Students may `INSERT` a reflection only with `user_id = auth.uid()`, and `SELECT` only their own.
- Teachers may `SELECT` everything, via `is_teacher()`.
- `is_teacher()` is **`SECURITY DEFINER` on purpose** — a policy on `profiles` that reads
  `profiles` would recurse infinitely. Don't "fix" it.
- `prevent_role_escalation()` (BEFORE UPDATE on profiles) raises if `role` changes and the caller
  isn't already a teacher. So promotion is a deliberate manual step, not something a student can
  do to themselves.
- Nothing in the app bypasses RLS except invite sending — see
  [`invites-onboarding.md`](invites-onboarding.md).

## Making someone a teacher

There is deliberately no in-app path (a self-serve teacher role would expose every student's
reflections). After the person has an account:

```sql
update public.profiles
set role = 'teacher'
where id = (select id from auth.users where email = 'jdiniega202@gmail.com');
```

Verify with `select u.email, p.role from public.profiles p join auth.users u on u.id = p.id;`

## Dashboard settings that are part of this design (not in SQL)

- **Authentication → Providers → Email:** "Allow new users to sign up" **off**. Without this the
  Supabase API still permits self-registration even though the app has no signup form.
- **Authentication → URL Configuration → Redirect URLs:** must include `<site>/auth/confirm` for
  every environment (localhost and the deployed URL), or invite links bounce.

## Changing the schema

Add statements in re-runnable form and run them in the SQL Editor. `schema.sql` must stay
sufficient to rebuild a fresh project from scratch — if you change something in the dashboard,
mirror it in the file in the same change.
