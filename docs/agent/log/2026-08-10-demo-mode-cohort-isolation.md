# 2026-08-10 — Demo mode: a public "try it" classroom, isolated by cohort

## Why

The project is worth showing to people who will never be on the class list —
and the teacher side is half of it, so a read-only student tour would have hidden
the release control, the roster and the turned-in work. The requirement was a
demo that shows both roles without any risk to the real class's data.

## What shipped

**A one-click demo.** `Explore the demo` on `/login` builds a private classroom:
five throwaway accounts (a demo teacher, the visitor's student, three seeded
classmates), week 1 released to day 3, days 1–2 already turned in, plus
reflections. The visitor lands as the student and switches to the teacher with a
button in a persistent banner. Exiting deletes the whole thing.

**Cohort isolation, enforced in SQL.** A uuid on `profiles.demo_cohort`, and
every teacher-side policy rewritten from `is_teacher()` to
`is_teacher() and same_cohort(...)`. `same_cohort` compares the two profiles'
cohorts with `is not distinct from`, so null = null is true and the real teacher
keeps seeing exactly what they saw before, while a demo teacher sees only their
own cohort. `allowed_students` is scoped the same way, and its `with check`
makes a non-null cohort writable only by the service-role key — which is what
stops the new `demo_role` column being a route to the teacher role.

**`demo_course_state`.** A separate table keyed by cohort, rather than a nullable
column on `course_state` — that table's singleton constraint is load-bearing for
the real class. `course_state`'s update policy now also demands
`my_cohort() is null`.

**Seeding runs as the demo students.** `seedCohort` signs each seeded classmate
in with an anon-key client and inserts their own rows, so the seeded work has to
satisfy the same policies a real turn-in does. The service-role key is used only
for account lifecycle: creating the users, the class-list rows that get them past
the signup trigger, and deleting all of it again.

### Files

New: `lib/demo.ts`, `app/demo/actions.ts`, `app/login/DemoButton.tsx`,
`components/DemoBanner.tsx`, `docs/agent/codebase-map/demo-mode.md`.
Changed: `supabase/schema.sql`, `lib/auth.ts`, `lib/release.ts`,
`app/teacher/actions.ts`, `app/login/page.tsx`, `components/AppShell.tsx`,
`.env.example`, `README.md`, and the codebase-map docs.

## Decisions worth keeping

- **The admin client gained a fourth caller**, deliberately, and it's documented
  as account lifecycle only. Because it bypasses RLS it also bypasses the cohort
  scoping — so `updateStudentName` (the one admin write that takes an
  attacker-chosen email) now compares `cohortFromEmail(email)` against the
  caller's own cohort. **Any future admin write needs the same guard.**
- **`getCurrentUser` is now `cache()`d.** `getCourseState()` has to know whether
  the session is a demo, and that would otherwise have added a profile lookup to
  every render that already did one.
- **Emails are never sent from a demo.** `addStudent` forces `sendEmail` off for
  a demo teacher; otherwise the project's SMTP would sit behind an anonymous
  button.
- **Cleanup is on-demand, not cron.** Starting a demo is the only thing that
  creates a cohort, so it's also the moment to sweep expired ones (24h TTL, hard
  cap of 60 live cohorts). Exit tears down immediately.

## Watch out for

- **Never rewrite `same_cohort`'s `is not distinct from` as `=`.** Null = null
  would stop being true and the real teacher would instantly stop seeing real
  students. This is the single most dangerous edit in the new SQL.
- A demo teacher **can** add an arbitrary email to their own class list, which is
  a real (cohort-scoped, ≤24h) registration grant. Fine as it stands; don't
  "improve" it into something that writes a null cohort.
- The delta pasted into Supabase must define `reflections.user_id` before the
  policy that references it — re-running all of `supabase/schema.sql` is the
  supported path and gets the ordering right.
- Demo accounts are ordinary rows to the rest of the app. Only the banner and
  `getCourseState()` branch on `demoCohort`; keep it that way.

## What's next

- **Verify against a live database.** The schema delta and the flow have not been
  exercised end-to-end yet — start a demo, switch roles, release a day, confirm
  from the real teacher account that none of it is visible, then exit and confirm
  the cohort is gone.
- Screenshots of the demo for `README.md` (the hero-shot placeholder is still
  there, and the demo is now the easiest way to stage them).
- Rate limiting on `startDemo` — five accounts per press is a real cost, and
  `rate-limiting.md` in the codebase map is still "not yet built".
