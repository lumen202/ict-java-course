# Supabase

One table, one policy. The database stores only student reflections — course
content lives in `src/lib/content/`, not here.

## Applying the schema

`schema.sql` is not run by any tooling. Apply it by hand: Supabase dashboard →
**SQL Editor → New query** → paste → **Run**. It is idempotent
(`create table if not exists`), so re-running it is safe.

## The `reflections` table

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | primary key, auto-generated |
| `created_at` | timestamptz | defaults to `now()`; the teacher view sorts on it |
| `week_slug` | text | which week, e.g. `unit1-week1` |
| `student_name` | text | typed by the student — no accounts, no verification |
| `hardest_part` | text | required |
| `want_explained` | text | nullable |

## Security model

Row-level security is **on**, with exactly one policy: the `anon` role may
`INSERT` and nothing else. So the anon key — the only one used for student
submissions — cannot read anyone's reflections, even though it is used from a
public endpoint.

The teacher view reads with the **service-role key**, which bypasses RLS and is
used only in `src/app/api/teacher/reflections/route.ts`, behind a
`TEACHER_PASSCODE` check. That key must never appear in client code or in a
`NEXT_PUBLIC_` env var.

## Changing the schema

Add new statements to `schema.sql` in a form that can be re-run safely
(`if not exists`, `create or replace`), then run the new statements in the SQL
Editor. Keep this file as the single source of truth so a fresh Supabase project
can be set up from it alone — if you change the table in the dashboard, mirror
it here in the same commit.
