<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# ICT Java Course — agent framework

Before doing anything else in this repo, read **`docs/agent/INDEX.md`** — it is the entry point
for orientation, past work, and known issues, and links to everything else so you never need to
scan the whole `docs/agent/` tree at once. It explains what this project is, the stack, the folder
layout, and the invariants that must not be silently broken.

Three living doc trees make up the framework for working on this project across sessions
(structured as small per-topic files with index tables, not a few giant files, so orientation
stays cheap even after years of accumulated history):

- **`docs/agent/codebase-map/`** (start at its `INDEX.md`) — orientation: what exists, where, and
  why, one file per **subsystem** (auth, data model, invites, course content, week page, teacher
  area, UI). Living docs — edit a subsystem's file in place when that subsystem changes.
- **`docs/agent/log/`** (start at its `INDEX.md`) — one immutable file per work session or
  milestone, newest first. Add an entry after any meaningful chunk of work covering what shipped,
  why, what to watch out for, and what's next. Never edit an old entry to add new information.
- **`docs/agent/bugs/`** (start at its `INDEX.md`) — in-repo bug tracker, one file per bug,
  created lazily. Log a bug when you find one even if you fix it immediately; update its status
  rather than deleting the file.

There is deliberately **no HANDOFF file** — the newest log entry's "What's next" is the resume
point. The root `README.md` holds human-facing setup and deployment.

## Invariants

Breaking any of these is never "just a style choice":

- **Never `git commit` or `git push`** — not even if a task list says to finish with a commit.
  Work ends at passing `npm run lint`, passing `npm run build`, and updated docs. The human
  reviews and commits. Read-only git (`status`, `diff`, `log`) is fine.
- **Course content is data, not pages.** A week is a `Week` object rendered by one template;
  adding material must never mean writing JSX.
- **RLS is the security boundary**, not the app's redirects. Change a policy and its app-side
  guard together.
- **Public routes are `/login`, `/register`, `/auth/confirm`, and `/demo`**; everything else
  requires a session, and the teacher area requires `role === 'teacher'`. `/demo` is public but
  **must stay unlinked from anywhere students go** — never add a demo entry point to `/login`.
- **No open signup** — an account can only be created for an email on the teacher's class list
  (self-registration at `/register` or emailed invite; the `handle_new_user()` trigger is the
  gate), and `teacher` is granted only by hand in SQL.
- **The service-role key never leaves `lib/supabase/admin.ts`** and is never used to read course
  data. Its five callers: invite sending, `updateStudentName` and `removeStudent`'s account
  deletion (all behind `requireTeacher()`), `register()`'s create-user path (trigger-gated), and
  demo-account lifecycle. Everything else runs as the logged-in user. Admin writes bypass RLS, so
  they bypass demo cohort scoping too — each must check the cohort itself.
- **Demo mode's isolation lives in the policies**, not in the app: every teacher-side policy is
  `is_teacher() and same_cohort(...)`. Never simplify one back to a bare `is_teacher()`, and
  never rewrite `same_cohort`'s `is not distinct from` as `=`. See
  `docs/agent/codebase-map/demo-mode.md`.
- **Student-facing copy never mentions grading** (in either direction — it genuinely is ungraded,
  but that stays a teacher-side fact) **or the teacher's attendance.**
- **Next.js 16**: read `node_modules/next/dist/docs/` before writing app-router code. `middleware`
  is now `proxy`; `params`/`searchParams` are Promises; use the generated `PageProps` /
  `LayoutProps` types. Always `getUser()`, never `getSession()`, on the server.
- **Never edit inside the `nextjs-agent-rules` markers above** — `next dev` rewrites that block.
