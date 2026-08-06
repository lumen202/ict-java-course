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

**`/teacher/students`** — `app/teacher/students/page.tsx`: the invite form plus the roster table
(name, email, role, **Active** vs **Invite pending** from `onboarded_at`, invited date). See
[`invites-onboarding.md`](invites-onboarding.md) for the invite mechanics.

`TeacherTabs.tsx` is the shared Reflections | Students sub-nav; each page passes its own `active`
key rather than reading the router.

## Discoverability rules

Students must never be nudged toward this area:

- `SiteFooter` has **no** teacher link (it had one; it was removed for exactly this reason).
- `SiteHeader` renders the Reflections link only when `role === "teacher"`.
- A student who types `/teacher` is redirected to `/`, silently.

## Deliberate gaps

- No edit/delete for reflections — remove rows in the Supabase dashboard if ever needed.
- The reflections read caps at 500 rows; fine for a class, paginate if it ever grows.
- No per-student drill-down page yet. The roster and the reflections list are separate views.
