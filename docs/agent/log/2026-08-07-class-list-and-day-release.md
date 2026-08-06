# Class list enrolment, day-by-day lesson release

Supersedes the invite-only model from
[`2026-08-07-invite-only-accounts-and-app-shell.md`](2026-08-07-invite-only-accounts-and-app-shell.md).

## Enrolment is now a class list, not an invite

The owner's model: *"I add their emails and those emails are the ones who can register."* So
`allowed_students` is the gate, and email is optional on top of it.

- New table + `is_email_allowed()`. `handle_new_user()` now **raises** when the email isn't on the
  list, which aborts the signup — so the gate lives in the database, not the UI, and the public
  `/register` page is safe. First account is exempt (bootstrap).
- `/register` — public self-registration: name, email, password. Rejected addresses get "That
  email isn't on the class list yet."
- `/teacher/students` — add-a-student form with an **optional** "Email them an invite link"
  checkbox, plus the class-list table (with Remove for people who haven't registered) and the
  accounts table.
- Invite email support was deleted and then restored the same session when the owner asked for
  both. `createAdminClient()` now returns null instead of throwing when the service-role key is
  absent, so emailing degrades to "they can register at /register" rather than failing.

**Supabase settings flipped:** "Allow new users to sign up" must now be **ON** (previously off) —
the trigger is the gate. "Confirm email" stays off.

## Lesson release

*"Students should see the lesson for that day, not the whole week."*

- `course_state` — one row (`current_week_slug`, `current_day`), teacher-writable, readable by any
  signed-in user.
- `lib/release.ts` — `releasedDayCount()`: earlier weeks fully open, current week open to
  `current_day`, later weeks closed. Teachers bypass it entirely so they can review ahead.
- `/teacher/lessons` (new tab, first in the sub-nav) — shows what the class is on, a week + day
  selector, and every day's focus line so the teacher can see what they're about to release.
- Week page shows released days only; today's is highlighted "you're here", the rest is a
  one-line note that more opens later.
- Student dashboard rebuilt around a single **Today** card. The locked-week bullet list is gone —
  the owner found it distracting — replaced by `UnitOutline`, four quiet rows with no per-week
  locks.

## Also

- `BackLink` component; back navigation was missing on every inner page after the tabs landed.
- Teacher dashboard gained a "Class is on …" card linking to the release control.

## Follow-ups in the same session

- Adding a student now returns a copyable `<origin>/register?email=…` link, shown with a Copy
  button — when no email is sent, the teacher needs something to hand over, not a bare path.
- `/register` prefills the email from that param (still editable), so students don't retype the
  exact address their access is keyed on.

## Watch out for

- **Schema changes need re-running.** The owner hit
  `Could not find the table 'public.allowed_students' in the schema cache` because the new tables
  hadn't been applied yet. `supabase/schema.sql` is idempotent — re-run the whole file after any
  change to it.
- `current_day` is 1-based; array indices are 0-based. Both `currentLesson()` and the week page
  clamp. Don't add a third convention.
- Don't reorder `weeks[]` — "earlier/later week" is decided by array position.

## What's next

1. Re-run `supabase/schema.sql` (adds `allowed_students`, `course_state`, updates
   `handle_new_user` and `prevent_role_escalation`).
2. Supabase dashboard: "Allow new users to sign up" **ON**, "Confirm email" **OFF**, redirect URL
   `<site>/auth/confirm`.
3. Test: add a student → they register at `/register` → release Day 1 → confirm they see only
   Day 1 → submit a reflection → read it as teacher.
4. Deploy to Vercel (sign in as lumen202) with the three env vars.
5. Then write week 2 — playlist mapping is in
   [`../codebase-map/course-content.md`](../codebase-map/course-content.md).
