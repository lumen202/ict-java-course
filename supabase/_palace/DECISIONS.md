# DECISIONS — `supabase/` (append-only)

- **D1** — Reads happen only via the service-role key, server-side, behind
  `TEACHER_PASSCODE`. The anon key cannot SELECT.
- **D2** — Env vars have no `NEXT_PUBLIC_` prefix; adding one would leak a key
  into the client bundle.
- **D3** — `schema.sql` is the single source of truth: any change made in the
  dashboard must be mirrored here in the same commit, so a fresh project can be
  rebuilt from this file alone.
- **D4** — Accepted v1 gaps: no rate limiting on the public insert; 500-row
  read cap on the teacher fetch; no edit/delete UI (use the dashboard).
