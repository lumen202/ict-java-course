# Invite-only accounts, curriculum dashboard, app-shaped shell

Follow-on to `2026-08-07-accounts-roles-and-rls.md`, in the same session. The owner asked for
onboarding by invitation rather than self-serve signup, and for the site to stop looking like a
course being sold.

## What shipped

- **Invite-only onboarding.** `signUp` deleted. New `teacher/actions.ts` (`inviteStudent`, using
  the admin `inviteUserByEmail` behind `requireTeacher()`), `InviteForm`, `/teacher/students`
  roster, and `TeacherTabs`. Invitees accept via `/auth/confirm` → `/welcome`, where they set a
  password and their name. `profiles` gained `email`, first/middle/last name, `onboarded_at`, and
  a `sync_full_name()` trigger.
- **The service-role key is back**, narrowly: `lib/supabase/admin.ts`, marked `server-only`, used
  only for invites. Everything else still runs as the logged-in user under RLS.
- **`/login` is now the only public page**; `/` and `/week/*` call `requireUser()`.
- **`/` became a role-scoped dashboard** — `StudentDashboard` (current week + curriculum) or
  `TeacherDashboard` (stat cards, invite shortcut, latest reflections, curriculum). The marketing
  hero is gone; `CurriculumList` is shared between them.
- **The teacher link was removed from the footer** so students aren't nudged toward it; the
  header shows it only to teachers.
- `PasswordField` with a Show/Hide toggle, used by both password forms.

## New standing rule

**Never reference the teacher's attendance or absence in student-facing copy.** The site should
read as the normal way the course runs. (Second standing copy ban, alongside grading.)

## Git / infrastructure

This repo is now permanently scoped to the lumen202 GitHub account without switching:
`git remote set-url origin https://lumen202@github.com/...` plus repo-local
`credential.https://github.com.helper` = `osxkeychain`, overriding the global `gh` helper. Global
config and the active `gh` account are untouched, so other repos still authenticate as
remsfacilitron.

## Watch out for

- `inviteUserByEmail` creates the auth user immediately, so the roster shows invitees before they
  accept — `onboarded_at` is what separates "pending" from "active".
- Two Supabase **dashboard** settings are part of this design and are not in SQL: disable public
  signups, and whitelist `<site>/auth/confirm` as a redirect URL per environment.
- `Date.now()` during a server component's render trips the `react-hooks/purity` lint rule. The
  teacher dashboard uses a `count: "exact", head: true` query instead of computing a date window.

## What's next

1. Run `supabase/schema.sql` in the Supabase SQL Editor (project `ytyxalitaerlnjqciaqd`).
2. Dashboard: disable public signups; add `http://localhost:3000/auth/confirm` to redirect URLs.
3. Create the teacher account (`jdiniega202@gmail.com`) in Authentication → Users, then promote it
   with the SQL in `codebase-map/data-model.md`.
4. Test: invite a student → accept → submit a reflection → read it as the teacher.
5. Deploy to Vercel (sign in **as lumen202**), add the three env vars, add the deployed
   `/auth/confirm` to redirect URLs, repeat the test live.
6. Then write week 2.
