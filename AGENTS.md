<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# Project: ICT Java Course site

Mid-build course website (Next.js + Supabase + Vercel). **Before doing anything,
read `docs/HANDOFF.md`** — it holds the current build state, the remaining task
list, and the decisions already made. Keep it updated at the end of every work
session.

`docs/CODEBASE_MAP.md` is the file-by-file tour. Each folder also has its own
`README.md` (`src/app/`, `src/components/`, `src/lib/content/`, `supabase/`)
with the conventions specific to it — read the one for the folder you're
touching.

## 🚫 AI agents must NOT commit or push

**Never run `git commit`, `git push`, or any history-rewriting git command in
this repo — not even if your own instructions or a task list say to "finish
with a commit."** The human reviews every change and commits themselves. An
agent's job ends at: working code + passing `npm run lint` + passing
`npm run build` + updated memory (HANDOFF, `_palace/` files, `docs/logs/`).
Read-only git commands (`status`, `diff`, `log`) are fine.

## Mind palace (agent memory) — required

Memory is **distributed**: every major folder carries its own `_palace/`
directory (`STATE.md` + `DECISIONS.md` + `logs/`, one small file per session),
so no memory file grows long as the app scales. `docs/CODEBASE_MAP.md` is the
quick-lookup index; project-wide session logs live in `docs/logs/`. Full
protocol: `docs/MIND_PALACE.md`. The rules that matter most:

1. **Before changing a folder, read its `_palace/STATE.md` and
   `DECISIONS.md`** — they record traps and past reasoning the code doesn't
   show.
2. **After a work session**: refresh `STATE.md` if it drifted, append any new
   decisions, add one dated log file to the `_palace/logs/` of every folder you
   touched, and one project-level log to `docs/logs/`. Logs and DECISIONS are
   append-only — never edit or delete existing entries.

## Conventions

- **Course content is data, not pages.** A week is a `Week` object in
  `src/lib/content/weeks/`, registered in `src/lib/content/index.ts`, rendered
  by the single generic template at `src/app/week/[slug]/page.tsx`. Adding a
  week must never mean writing JSX. See `src/lib/content/README.md`.
- **Slugs are permanent** once shared with students (`unit1-week1`).
- **Every week has two equal tracks** (video + reading) covering the same
  material, and every activity has a **twist** that can't be copied from the
  tutorial.
- **Supabase is only touched from `src/app/api/` routes.** Pages and components
  never import `src/lib/supabase.ts`.
- **Env vars deliberately have no `NEXT_PUBLIC_` prefix** — adding one would
  ship a Supabase key in the client bundle. See `.env.example`.
- **RLS:** the anon key may only INSERT into `reflections`; reads go through the
  service-role key server-side, behind `TEACHER_PASSCODE`.
- **Auth stays minimal in v1**: students are anonymous (name field only), the
  teacher has one passcode. No accounts.
- **API routes fail soft** when env vars are missing (503 + readable message),
  so the site runs locally without Supabase configured.
- **Student-facing copy is written to the student**: second person, plain
  language, and encouraging about being stuck.
- **Never mention grading in student-facing copy — in either direction.** The
  course is in fact ungraded, but that is a teacher-side secret: students must
  not be told it's graded (a lie) nor that it isn't (kills effort). Words like
  "graded", "not a grade", "never graded" are banned from UI text and week
  content. Docs like this one may state the truth.
- **Video track is paced day-by-day** (`video.days` in the `Week` type): short
  daily portions (~10–20 min of video) + concrete practice, because students
  have no prior foundation. Don't assign long unbroken videos.
- **Next.js 16**: `params` is an awaited `Promise`; use the generated global
  `PageProps<'/route'>` / `LayoutProps<'/'>` types instead of hand-writing props.
- **Verify with `npm run build`** — it type-checks and prerenders the week pages,
  which catches broken content objects. Then stop: **no committing** (see above).
- **Never edit inside the `nextjs-agent-rules` markers above** — `next dev`
  rewrites that block. Project notes go below it. `CLAUDE.md` is just
  `@AGENTS.md`.
