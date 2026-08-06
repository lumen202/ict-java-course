# STATE — `supabase/` (2026-08-07)

Protocol: [`docs/MIND_PALACE.md`](../../docs/MIND_PALACE.md) · How-it-works: [`../README.md`](../README.md)

- One table: `reflections` (id, created_at, week_slug, student_name,
  hardest_part, want_explained). RLS on; single policy: `anon` may INSERT only.
- `schema.sql` applied **by hand** in the Supabase SQL Editor — no migration
  tooling. Idempotent; safe to re-run.
- **The Supabase project itself does not exist yet.** Nothing DB-touching has
  been exercised end to end — standing it up is step 1 in `docs/HANDOFF.md`.
