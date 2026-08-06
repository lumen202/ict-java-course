# Supabase

Two tables and a role system. Course content lives in `src/lib/content/`, not
here — the database only stores accounts and reflections.

## Applying the schema

`schema.sql` is not run by any tooling. Apply it by hand: Supabase dashboard →
**SQL Editor → New query** → paste → **Run**. Every statement is idempotent
(`if not exists`, `create or replace`, `drop policy if exists`), so re-running
after an edit is safe.

## Tables

**`profiles`** — one row per auth user, created automatically by the
`on_auth_user_created` trigger.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK, FK → `auth.users(id)`, cascade delete |
| `created_at` | timestamptz | |
| `full_name` | text | from signup metadata; shown to the teacher |
| `role` | `user_role` enum | `student` (default) or `teacher` |

**`reflections`**

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `created_at` | timestamptz | teacher view sorts on it |
| `user_id` | uuid | FK → `auth.users`, who wrote it |
| `week_slug` | text | e.g. `unit1-week1` |
| `student_name` | text | name snapshot at submit time |
| `hardest_part` | text | required |
| `want_explained` | text | nullable |

## Security model

RLS is on for both tables and is the real security boundary — the app's
redirects are only UX.

- Students may `INSERT` a reflection only with `user_id = auth.uid()`, and may
  `SELECT` only their own rows.
- Teachers may `SELECT` everything, via the `is_teacher()` helper.
- `is_teacher()` is `SECURITY DEFINER` **on purpose**: reading your own role
  through `profiles`' own policies would recurse infinitely.
- A trigger blocks role self-promotion — changing `role` raises unless the
  caller is already a teacher.
- **No service-role key is used anywhere.** Every query runs as the logged-in
  user. That's why the anon key can safely be `NEXT_PUBLIC_`.

## Making someone a teacher

Everyone signs up as a student; there is no in-app way to become a teacher (a
self-serve teacher signup would expose every student's reflections). After the
teacher has created their account, run once in the SQL Editor:

```sql
update public.profiles
set role = 'teacher'
where id = (select id from auth.users where email = 'jdiniega202@gmail.com');
```

Verify:

```sql
select u.email, p.role from public.profiles p join auth.users u on u.id = p.id;
```

## Changing the schema

Add statements in a re-runnable form and run them in the SQL Editor. Keep this
file the single source of truth so a fresh project can be built from it alone —
if you change something in the dashboard, mirror it here in the same commit.
