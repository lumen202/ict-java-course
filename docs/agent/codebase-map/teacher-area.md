# Teacher Area

Everything a teacher needs, and nothing a student is ever pointed at. Access is enforced twice:
`requireTeacher()` redirects in the app, and the RLS policies mean that even a student who
reached the query would get only their own rows.

## Surfaces

**`/` for teachers** — `app/TeacherDashboard.tsx` (chosen by `app/page.tsx` on `user.role`):
four stat cards (students set up, invites pending, total reflections, weeks published), quick
actions (**Invite a student**, **All reflections**), the five newest reflections, then the same
curriculum students see. Counts come from RLS-scoped queries; the total uses
`select("id", { count: "exact", head: true })` so no rows are transferred.

**`/teacher`** — `app/teacher/page.tsx`, the full reflections list, newest first, capped at 500.
`WeekFilter.tsx` is a client `<select>` that pushes `?week=…`, so a filtered view is linkable and
survives a refresh.

**`/teacher/students`** — `app/teacher/students/page.tsx`: the add-a-student form, the **class
list** table (email, name, Registered / Not yet, added date, Remove) and an **Accounts** table.
See [`enrolment.md`](enrolment.md) for the mechanics.

**`/teacher/lessons`** — `app/teacher/lessons/page.tsx`: releases the day the class is on. See
[`lesson-release.md`](lesson-release.md).

Navigation is the sidebar only — the old `TeacherTabs` strip and the dashboard's duplicate
"Add a student" / "All reflections" buttons were removed once the sidebar carried those links.

## Discoverability rules

Students must never be nudged toward this area:

- `AppShell` builds the sidebar list on the **server**, so a student's browser is never sent the
  teacher routes at all — not hidden with CSS, absent.
- A student who types `/teacher` is redirected to `/`, silently.

## Deliberate gaps

- No edit/delete for reflections — remove rows in the Supabase dashboard if ever needed.
- The reflections read caps at 500 rows; fine for a class, paginate if it ever grows.
- No per-student drill-down page yet. The roster and the reflections list are separate views.
