<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

@~/Desktop/Unified-Brain/brain/core/AGENTS.md

---

# ICT Java Course — agent framework

Before doing anything else in this repo, in this order:

1. Read **`docs/agent/INDEX.md`** — it is the entry point for orientation, past work, and known
   issues, and links to everything else so you never need to scan the whole `docs/agent/` tree at
   once. It explains what this project is, the stack, the folder layout, and the invariants that
   must not be silently broken.
2. Before any non-trivial change, call **`mcp__brain__brain_recall`** with a plain sentence
   describing what you are about to do (not keywords), and say in one line what came back. The
   brain's standing kernel is injected automatically by the `SessionStart` hook in
   `.claude/settings.json` — recall is the part that is per-task and is *not* automatic. A
   `PreToolUse` gate on `Edit`/`Write` enforces this once per session; it fails open and stops
   after two denials, so if the brain is unreachable, say so and keep working.

### How the brain and `docs/agent/` fit together

These are two systems with overlapping vocabulary. Where they give opposed instructions, this
section governs:

- **`docs/agent/` is this project's entry store — the brain does not get a second one.** There is
  no `docs/brain/` here, deliberately. Brain-shaped entries go into `docs/agent/log/` and
  `docs/agent/bugs/` under those folders' existing conventions.
- **`docs/agent/` is NOT the brain's raw-entry layer.** The imported `core/AGENTS.md` says never
  to read, grep, or list raw entry files. That prohibition covers the brain's own
  `brain/projects/` corpus only. `docs/agent/` is meant to be read, and step 1 above requires it.
- **Logging bar:** the project rule ("add a log entry after any meaningful chunk of work") governs
  `docs/agent/log/`, which is a session log and which the brain explicitly does not treat as a
  brain entry. The brain's Rule 1 (write only on *surprise* + statable *mechanism*) governs
  whether a distillable entry is *additionally* worth writing. Neither rule suppresses the other.
- **Entries never ship.** This repository is public, but `/docs/agent/` and `/.claude/` are both
  gitignored, so nothing written there is published. That is a blind spot, not a safe harbour:
  no history to purge, but equally no secret scanner or commit hook ever positioned to see it,
  and the brain's sanitize gates run inside the brain repo rather than here. Never write a
  credential, key, or connection string into an entry — name the env var and where it is read
  from instead.

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
