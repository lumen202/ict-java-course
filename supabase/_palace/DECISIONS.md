# DECISIONS — `supabase/` (append-only)

- **D1** — ~~Reads happen only via the service-role key, behind
  `TEACHER_PASSCODE`.~~ Superseded by D5 (2026-08-07).
- **D2** — ~~Env vars have no `NEXT_PUBLIC_` prefix.~~ Superseded by D6.
- **D5** (supersedes D1) — Access control is **role-based RLS** on the
  logged-in user's own token. `TEACHER_PASSCODE` and the service-role key are
  gone. Teacher-ness lives in `profiles.role`, granted only by hand in SQL —
  there is deliberately no in-app path to becoming a teacher, since that would
  expose every student's reflections.
- **D6** (supersedes D2) — The URL and anon key **must** be `NEXT_PUBLIC_`:
  Supabase Auth runs in the browser. This is safe precisely because RLS, not
  key secrecy, is the security boundary. The service-role key must still never
  appear client-side — the app simply no longer uses one.
- **D7** — `is_teacher()` is SECURITY DEFINER on purpose: a policy on
  `profiles` that reads `profiles` would recurse. Don't "fix" it.
- **D3** — `schema.sql` is the single source of truth: any change made in the
  dashboard must be mirrored here in the same commit, so a fresh project can be
  rebuilt from this file alone.
- **D4** — Accepted v1 gaps: no rate limiting on the public insert; 500-row
  read cap on the teacher fetch; no edit/delete UI (use the dashboard).
