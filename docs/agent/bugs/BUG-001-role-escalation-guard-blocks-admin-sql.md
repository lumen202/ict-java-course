# BUG-001: Role-escalation guard blocked the SQL Editor, making the first teacher unappointable

- **Found:** 2026-08-07
- **Where:** `supabase/schema.sql` → `prevent_role_escalation()`
- **Symptom:** `update public.profiles set role = 'teacher' …` run from the Supabase SQL Editor
  raised `only teachers can change roles`. The guard called `is_teacher()`, which reads
  `auth.uid()`; in the SQL Editor there is no end-user JWT, so `auth.uid()` is null,
  `is_teacher()` returned false, and every role change was rejected — including the bootstrap
  one. Since there is deliberately no in-app way to become a teacher, nobody could ever become
  one.
- **Status:** fixed (2026-08-07) — the guard now only fires when `auth.uid() is not null`, so
  JWT-less connections (SQL Editor, service role, migrations) are allowed while a logged-in
  student still cannot promote themselves.

## Related trap found at the same time

The bug was masked because the owner's account had **no `profiles` row at all**: the account was
created in the dashboard *before* `handle_new_user()` existed, and that trigger only fires on
INSERT into `auth.users`. The UPDATE therefore matched zero rows and reported
`Success. No rows returned`, which reads like success. `getCurrentUser()` treats a missing profile
as `role: "student"`, so the app silently showed the student dashboard.

**For any account created before its trigger existed, upsert the profile rather than updating it.**
