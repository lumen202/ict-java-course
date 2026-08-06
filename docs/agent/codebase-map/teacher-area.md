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
list** table (email, editable name, Registered / Not yet, added date, Remove) and an **Accounts**
table. See [`enrolment.md`](enrolment.md) for the mechanics.

- **Names are editable inline** (`EditableName.tsx` → `updateStudentName`). Names are optional
  when adding someone, and students mistype their own, so the teacher needs to fix what everyone
  sees. The action writes the class list via RLS *and* the account's profile + auth metadata via
  the admin client — RLS lets a teacher read all profiles but update only their own.
- **Registration status comes from auth**, not from `registered_at`. That stamp and
  `profiles.email` are trigger-written, so an account created before the current trigger version
  showed "Not yet" forever. The page unions profile emails with
  `admin.auth.admin.listUsers()` and falls back to the stamp when there's no admin key.

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
