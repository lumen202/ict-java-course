# Full docs audit: codebase map re-synced to code, README rewritten

**Date:** 2026-08-07 · previous entry:
[`2026-08-07-dashboard-release-leak-and-practice-block-restyle.md`](2026-08-07-dashboard-release-leak-and-practice-block-restyle.md)

## What shipped

Docs-only session (no `src/` changes). The teacher asked for "the md" to be updated — meaning
the GitHub-facing `README.md`, which they now also want to work as a portfolio piece. Before
rewriting it, every codebase-map doc was audited claim-by-claim against the working tree
(three parallel read-only audits), and the drift fixed in place:

1. **`README.md` rewritten.** Now leads with what the app is and a "what's interesting under
   the hood" section (mini MySQL engine, eight game engines, content-as-data, day release,
   RLS/trigger-gated enrolment), then setup/deploy. Two outright errors fixed: **setup step 4
   told the reader to turn signup OFF, which would break `/register`** (the trigger is the
   gate; signup stays on, confirm-email off), and "Adding a week" still showed the deleted
   single-file `unit1-week2.ts` shape instead of the per-day folder.

2. **Stale invariants updated** in `AGENTS.md`, `docs/agent/INDEX.md`, and `overview.md`: the
   public routes are `/login` + `/register` + `/auth/confirm` (not "`/login` only"); "no
   self-serve signup" became "no open signup" (class-list-gated self-registration exists); the
   service-role key now has **three** callers (invites, `register()`'s create-user path,
   `updateStudentName`), not one.

3. **Codebase-map drift fixed** across all subsystem files, biggest items:
   - `week-experience.md` was three sessions stale: it said only BossBattle used `GameModal`
     (all eight games do), that closing a boss fight confirms-and-resets (it pauses), and
     that the submissions upsert key lacked `item`.
   - `teacher-area.md`: dashboard quick actions (removed), "no per-student drill-down"
     (there is one), week links carrying `?day=` (they don't).
   - `overview.md`: "only Week 1 exists", pre-`/register` folder layout, "schema never run".
   - `auth.md`: dead `SiteHeader` reference (now `AppShell`), gate table missing five routes.
   - `enrolment.md`: `auth/confirm` listed as a route handler (it's a page), admin-client
     scope, Remove-button predicate.
   - `data-model.md`: "RLS on both tables" (five), missing `confidence` column,
     `is_email_allowed()`, profiles policies, the `prevent_role_escalation` null-uid exemption.
   - `course-content.md`: "every day opens with row-hunt" / "real-lab and cheat-sheet every
     day" (Day 5s differ), console command list missing SHOW TABLES / DESC, roadmap mapping
     now defers to `content/index.ts`.
   - `codebase-map/INDEX.md`: Week 2 no longer "not yet built".

## Watch out for

- `src/lib/minisql.ts` contains a literal NUL byte — `grep`/`rg` skip it as binary without
  `-a`. Recorded in `course-content.md`; a search coming back empty there proves nothing.
- The audits surfaced two *behaviors* (not doc bugs) worth knowing: releasing a day of an
  earlier week silently moves the whole class back to that week, and at `current_day = 0`
  the release list has no "Take back" affordance. Both now documented in
  `lesson-release.md` — if either is unwanted, that's future app work, not docs work.
- `week-experience.md` had drifted three sessions behind because game work updated
  `course-content.md` only. When touching games, update **both** files.

## What's next

- Resume point remains **Week 3 content authoring** (joins, per `roadmap[]`).
- For the portfolio angle: the README would benefit from screenshots (login, a lesson day
  with the timeline, the SQL console, a boss battle, the teacher release list) — needs a
  human to capture them, or a session with the app running.
