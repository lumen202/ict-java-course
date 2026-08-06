# Docs framework rebuilt on the `docs/agent/` model; dashboards split by role

Two threads in one session: the docs system was replaced, and the dashboard became role-scoped.

## Docs: from "mind palace" to `docs/agent/`

The previous system put a `_palace/` folder (STATE + DECISIONS + logs) inside every code folder,
plus a single `docs/CODEBASE_MAP.md`, `docs/MIND_PALACE.md`, and a `HANDOFF.md`. The owner
pointed at their other project, **BookOfUs** (`~/Desktop/BookOfUs`), whose framework is better,
and asked us to match it. Adopted wholesale:

- `docs/agent/INDEX.md` — the single entry point. Says explicitly: read this, then follow only
  what your task needs.
- `docs/agent/codebase-map/` — **one file per subsystem**, with an `INDEX.md` table carrying a
  Status column (`current` / `not yet built`). Living docs, edited in place.
- `docs/agent/log/` — immutable, one file per session, `INDEX.md` reverse-chronological.
- `docs/agent/bugs/` — in-repo bug tracker, `BUG-NNN` files, created lazily.

**Why subsystem beats folder** (the main flaw in what we had): auth spans `lib/supabase/`,
`lib/auth.ts`, `app/login/`, `src/proxy.ts` and `supabase/schema.sql`. Folder-scoped memory
shredded that story across five files; `codebase-map/auth.md` tells it once.

Deleted in the swap: every `_palace/` directory, `docs/MIND_PALACE.md`, `docs/CODEBASE_MAP.md`,
the four folder-level `README.md`s (their content moved into the subsystem docs), and
`docs/HANDOFF.md` — which the owner asked to remove because it duplicated the other docs and
went stale between sessions. Resume state now lives in this log's "What's next".

## Product changes in the same session

- **`/` is now role-scoped**: `app/page.tsx` switches on `user.role` between `StudentDashboard`
  (current-week card, curriculum, "how a week works") and `TeacherDashboard` (stat cards, invite
  shortcut, five newest reflections, curriculum). `CurriculumList` is shared.
- **The footer's teacher link is gone** — students shouldn't be nudged toward the teacher area at
  all. The header already gated it on role.

## Watch out for

- `Date.now()` in a server component's render trips `react-hooks/purity`. The teacher dashboard
  counts reflections with `select("id", { count: "exact", head: true })` instead.
- `docs/agent/` is the only doc tree now. If you find yourself wanting a new top-level doc file,
  it almost certainly belongs as a subsystem file or a log entry.

## Verification

`npm run lint` and `npm run build` clean. Route smoke tests still correct: `/` and
`/teacher/students` 307 → `/login?next=…`, and no "teacher view" string remains in the rendered
footer.

## What's next

Unchanged from the previous entry — nothing has touched the live database yet:

1. Run `supabase/schema.sql` in the SQL Editor (project `ytyxalitaerlnjqciaqd`).
2. Supabase dashboard: disable public signups; add `http://localhost:3000/auth/confirm` to
   Authentication → URL Configuration → Redirect URLs.
3. Create the teacher account (`jdiniega202@gmail.com`) under Authentication → Users, then promote
   it with the SQL in [`../codebase-map/data-model.md`](../codebase-map/data-model.md).
4. Test end to end: invite a student → accept the emailed link → set password → submit a
   reflection → read it as the teacher.
5. Deploy to Vercel (sign in **as lumen202**, or the private repo won't be listed), set the three
   env vars, add the deployed `/auth/confirm` to redirect URLs, repeat the test live.
6. Then write week 2 — the playlist videos for it are mapped in
   [`../codebase-map/course-content.md`](../codebase-map/course-content.md).
