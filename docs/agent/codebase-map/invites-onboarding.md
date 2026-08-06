# Invite-Only Onboarding

Students cannot sign themselves up. They send the teacher their email out of band; the teacher
invites them from `/teacher/students`; the emailed link brings them to a page where they set
their own password and confirm their name.

## The flow

```
teacher /teacher/students → inviteStudent action → admin.auth.admin.inviteUserByEmail
                                                    ↳ auth user created immediately
                                                    ↳ handle_new_user() trigger creates the
                                                      profiles row (role=student,
                                                      onboarded_at = null → "Invite pending")
student clicks the emailed link
   → /auth/confirm?token_hash=…&type=invite&next=/welcome   (verifyOtp → session cookie)
   → /welcome    (set password + first/middle/last name → stamps onboarded_at)
   → /
```

## Files

- `app/teacher/actions.ts` — `inviteStudent`. Calls `requireTeacher()` **first**, so the admin
  client is unreachable to a student even by replaying the action. Optional first/last name is
  passed as user metadata and picked up by the signup trigger, so the roster shows a name before
  the student accepts.
- `app/teacher/InviteForm.tsx` — client form; resets itself on success.
- `app/auth/confirm/route.ts` — verifies the token (`verifyOtp`), then redirects to `next`
  (default `/welcome`). Bad or expired links → `/login?error=invalid-link|expired-link`, which the
  login page renders as a human explanation.
- `app/welcome/` — `page.tsx` (redirects out if there's no session or the person is already
  onboarded) + `WelcomeForm.tsx` + `actions.ts` (`completeSignup`: `updateUser({password})`, then
  the profile update, then `onboarded_at`).

## Constraints to respect

- The invite `redirectTo` must be `<origin>/auth/confirm?next=/welcome`, and that URL must be
  whitelisted in Supabase → Authentication → URL Configuration → Redirect URLs, per environment.
- Public signup must stay disabled in the Supabase dashboard; the app having no signup form is
  not sufficient on its own.
- `completeSignup` runs as the invited user, so RLS covers the profile write and the
  role-escalation trigger prevents them granting themselves `teacher`.
- The first teacher can't be invited by anyone — bootstrap that account in the Supabase dashboard
  and promote it with SQL (see [`data-model.md`](data-model.md)).

## Not built yet

Password reset. It would need its own callback handling (`type=recovery` already flows through
`/auth/confirm`, but there's no "forgot password" entry point or set-new-password page distinct
from `/welcome`, which refuses already-onboarded users). Deliberately omitted until needed.
