# STATE — `supabase/` (2026-08-07)

Protocol: [`docs/MIND_PALACE.md`](../../docs/MIND_PALACE.md) · How-it-works: [`../README.md`](../README.md)

- **Two tables.** `profiles` (id → auth.users, full_name, `role` enum
  student|teacher) and `reflections` (+ `user_id` FK, indexed on user_id and
  week_slug).
- **Auth-based RLS.** Students insert/read only their own rows
  (`user_id = auth.uid()`); teachers read everything via `is_teacher()`
  (SECURITY DEFINER, to avoid policy recursion). A BEFORE UPDATE trigger blocks
  role self-promotion. `handle_new_user()` auto-creates a profile on signup.
- **No service-role key in use anywhere.** Every query runs as the logged-in
  user.
- **Project exists** (`ytyxalitaerlnjqciaqd`), created 2026-08-07, but the
  **schema has NOT been run yet** and no account has been created, so nothing
  has been exercised end to end.
- Teacher account to promote after signup: `jdiniega202@gmail.com` (SQL snippet
  at the bottom of `schema.sql`).
