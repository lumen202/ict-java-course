# Agent Framework — Start Here

Read this file first, then follow only the links relevant to your task. Nothing else in
`docs/agent/` should be read in full up front — each subsystem doc is small and self-contained on
purpose, so a session touching the week page never has to load the invite flow's doc to get
oriented. Efficiency here is deliberate: this repo gains a week of course content at a time and
is meant to accumulate history for years; an agent re-reading everything each session would waste
tokens and increase the odds of drifting on stale details.

## Where to look

| Need | Go to |
|---|---|
| Orient on the project / stack / folder layout / invariants | [`codebase-map/INDEX.md`](codebase-map/INDEX.md) → [`overview.md`](codebase-map/overview.md) |
| Understand a specific subsystem (schema, auth, invites, content model, week page, teacher area, UI) | [`codebase-map/INDEX.md`](codebase-map/INDEX.md) — find the row, open only that file |
| See what past sessions did and why, before starting new work | [`log/INDEX.md`](log/INDEX.md) — skim the table, open only relevant entries |
| Check for known issues in an area before touching it | [`bugs/INDEX.md`](bugs/INDEX.md) |
| Add a week of course material | [`codebase-map/course-content.md`](codebase-map/course-content.md) |
| Human setup, env vars, deployment | [`../../README.md`](../../README.md) |

## Rules for keeping this cheap to use

1. **One topic per file.** Never grow a file into a catch-all. If a doc would need a heading for
   an unrelated topic, it should be a new file.
2. **Indexes are tables, not prose.** Every `INDEX.md` here reads in one shot without opening the
   entries it points to.
3. **Log entries are immutable, one per session/milestone.** Never edit an old entry to add new
   information — write a new entry that references the old one if needed.
4. **Codebase-map files are living, not append-only.** They describe *current* state — edit in
   place when a subsystem changes; don't accumulate outdated variants.
5. **Bug files are created lazily.** No placeholders; `bugs/INDEX.md` may stay empty.
6. **There is no HANDOFF file.** One existed for a day and was deleted — it duplicated these docs
   and went stale. Resume state lives in the newest log entry's "What's next" section.

## Non-negotiables (breaking these is never "just a style choice")

- **AI agents never `git commit` or `git push`.** Work ends at passing `npm run lint`,
  `npm run build`, and updated docs. The human reviews and commits.
- **RLS is the security boundary**, not the app's redirects. Change a policy and the app guard
  together — see [`codebase-map/data-model.md`](codebase-map/data-model.md).
- **Course content is data, not pages.** Adding a week must never mean writing JSX.
- **Student-facing copy never mentions grading** (in either direction) **or the teacher's
  attendance.** See [`codebase-map/ui-and-copy.md`](codebase-map/ui-and-copy.md).
- **The service-role key never leaves `lib/supabase/admin.ts`** (invites, registration's
  create-user path, roster name fixes). Everything else runs as the logged-in user.
- **Next.js 16**: read `node_modules/next/dist/docs/` before writing app-router code. `middleware`
  is now `proxy`; `params`/`searchParams` are Promises.
