# Lessons isolated per day, reflection reframed around the student

Follow-on to [`2026-08-07-class-list-and-day-release.md`](2026-08-07-class-list-and-day-release.md)
and [`2026-08-07-sidebar-app-shell.md`](2026-08-07-sidebar-app-shell.md).

## The product principle the owner stated

> "We need this to purely enhance learning of students, meaning I'm just supervisory — that's the
> whole point of creating this website."

Everything below follows from that. The site teaches; the teacher watches. Any copy that makes
the teacher the mechanism ("this is how I know what to explain next week") is wrong.

## Reflection rebuilt

- Three inputs now: **confidence** (`Not yet` / `Getting there` / `Solid`), *where did you get
  stuck and what did you try*, and *what will you redo*.
- On submit the student gets a **plan back**, chosen by their confidence: rebuild from a blank
  file, redo the specific day, cover the self-check and retry tomorrow, or stretch the twist and
  explain it to someone. Low confidence also surfaces the week's reading links.
- New nullable `reflections.confidence smallint` (1–3). The API leaves it null if absent, so a
  database that hasn't been migrated still accepts submissions.

## One lesson per page

- `/week/<slug>?day=N` renders a single day; no `?day` means the newest released one. Prev/next
  and a pill switcher move between released days only.
- The `<h1>` is the **day's focus**; the week is a small label. The old week banner read as
  inaccurate once lessons became the unit of work.
- Reading track and the week's build are `<details>`; self-check + reflection + mark-done appear
  only on the final day.

## Sidebar

Single **Lessons** entry with one child per released day (`Day N` + focus, truncated), the newest
marked with a dot. The "Today" row and the week-title row were both removed as redundant — the
days *are* the navigation. Child links are active-matched on `?day=`.

The group **collapses** (chevron, default open when you're inside it) and the list is
`max-h-72 overflow-y-auto`: it gains an entry per release, so left alone it would eventually
push everything else off the rail.

Student dashboard stripped to the Today card plus earlier weeks; the unit outline and
"how a day works" blocks were deleted as noise.

## Bugs fixed

- **Student name showed as `jaskatlas`** (the email prefix). `profiles.full_name` is maintained by
  the `sync_full_name` trigger, which wasn't installed when that account was created.
  `getCurrentUser()` now composes the name from `first_name`/`middle_name`/`last_name` before
  falling back to the email prefix — the app no longer depends on the trigger having run.
- **Class list showed "Not yet" for a student who had registered.** Status was read from
  `registered_at`, stamped by a trigger that may post-date the account. It's now derived by
  matching class-list emails against real `profiles` rows, with `registered_at` as a fallback.

## What's next

Same as the previous entry — the database still needs `supabase/schema.sql` re-run (it now also
adds `reflections.confidence`), plus the dashboard settings. Then: release Day 1, walk a student
through register → lesson → reflection, and deploy.
