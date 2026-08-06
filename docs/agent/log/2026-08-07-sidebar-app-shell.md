# Sidebar app shell replaces the top nav

The owner: *"instead of this can't we have the sidebar, this looks ugly."* The top nav plus a
one-line footer read as a marketing site, not an app.

## What shipped

- `components/AppShell.tsx` (server) decides the frame: signed-in users get the sidebar,
  `/login` and `/register` get a bare column. It also **builds the nav list by role**, so a
  student's browser is never sent the teacher routes — absent, not CSS-hidden.
- `components/Sidebar.tsx` (client): fixed left rail from `md:` up, sticky top bar with a ☰ drawer
  below that. Brand top, name/role + Sign out bottom.
- Deleted `SiteHeader`, `SiteFooter`, `TeacherTabs`, and the teacher dashboard's duplicate
  "Add a student" / "All reflections" buttons — all superseded by the sidebar. Back links stay
  only where the sidebar doesn't lead (week page, register).

Teacher nav: Dashboard · Lessons · Students · Reflections. Student nav: Today.

## Bugs

- **BUG-002** — `startsWith` highlighting lit up both Reflections (`/teacher`) and Lessons
  (`/teacher/lessons`). Replaced with a longest-match rule.
- The drawer originally closed via `useEffect(() => setOpen(false), [pathname])`, which fails
  `react-hooks/set-state-in-effect` (the same rule that bit `WeekProgress` earlier). It now closes
  from each link's `onClick`.

## Watch out for

Don't add page-level buttons that duplicate a sidebar link — that's what made the dashboard look
cluttered in the first place.

## What's next

Unchanged from [`2026-08-07-class-list-and-day-release.md`](2026-08-07-class-list-and-day-release.md):
re-run `supabase/schema.sql` (the `allowed_students` / `course_state` tables were missing when the
owner first tried the Students page), flip "Allow new users to sign up" **on**, then test
add-student → register → release Day 1 → reflection → teacher view, and deploy.
