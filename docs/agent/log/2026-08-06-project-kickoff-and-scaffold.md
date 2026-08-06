# Project kickoff: scaffold, content model, first week

The starting session (before the current docs framework existed). Created the Next.js scaffold
(TS, Tailwind v4, App Router, `src/` layout) and the core of what became v1.

## What shipped

- `src/lib/content/` — the `Week` type, Week 1 (SQL intro), and the `weeks[]`/`roadmap[]` registry.
  The "content is data, not pages" convention dates from here.
- `supabase/schema.sql` — a `reflections` table with an anonymous-insert RLS policy.
- `src/lib/supabase.ts` — anon + service-role helpers, null-safe when env vars were missing.
- `src/app/api/reflections/` and `src/app/api/teacher/reflections/` — submit and passcode-gated read.
- `SelfCheck` and `ReflectionForm` components, and the generic week page.

## Watch out for

Nothing was ever compiled this session — `npm run build` had not been run, and the home and
teacher pages didn't exist yet. A handoff note written here later turned out to be stale, because
a follow-up session added those pages without updating it. That mismatch is what eventually
motivated deleting handoff files entirely in favour of these logs.
