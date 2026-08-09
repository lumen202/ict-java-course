# BUG-007: Self-registered students counted as unaccepted invites forever

- **Found:** 2026-08-10 (spotted on the demo's teacher dashboard, but it affects the real class)
- **Where:** `profiles.onboarded_at` (written in `supabase/schema.sql`), read by
  `src/app/TeacherDashboard.tsx`
- **Symptom:** the dashboard's first two tiles read **"0 Students set up"** and **"4 Invites
  pending"** for a class of four students who all had working accounts. Any number of registered
  students showed as 0.
- **Status:** fixed (2026-08-10) — `handle_new_user()` now stamps `onboarded_at` when the new
  auth user has a password, plus a backfill for existing accounts.

## Cause

`onboarded_at` was only ever written in one place: `app/welcome/actions.ts`, the page an
**invited** person lands on to choose a password. Self-registration at `/register` creates the
account through `admin.createUser()` (or `signUp()`), neither of which goes anywhere near
`/welcome` — so the column stayed null.

The dashboard reads `!onboarded_at` as "invited, hasn't accepted", so the *primary* enrolment
path produced students who were permanently pending. The demo made it obvious only because all
of its accounts arrive that way at once.

## Fix

Having a password is the thing the column was always trying to describe, and the signup trigger
can see it directly:

```sql
case when coalesce(new.encrypted_password, '') <> '' then now() end
```

`inviteUserByEmail` creates a user with no password, so an unaccepted invite still reads null and
`/welcome` still stamps it — the invite semantics are unchanged. A backfill applies the same test
to existing rows.

## Watch out for

- Don't reintroduce a second definition of "set up". The trigger and the backfill make the same
  test; anything reading `onboarded_at` should mean exactly "can sign in".
- `/welcome/page.tsx` redirects away when `onboarded_at` is set. That's still correct — someone
  with a password has no business on the set-a-password page — but it does mean the stamp now
  closes `/welcome` for self-registered users too, which is the intended behaviour.
