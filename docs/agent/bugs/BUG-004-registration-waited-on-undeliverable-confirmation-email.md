# BUG-004: Registration told students to check an email that never arrived

- **Found:** 2026-08-07
- **Where:** `src/app/register/actions.ts`
- **Symptom:** Completing the registration form showed "Account created. Check your email to
  confirm it, then sign in." — but the project's built-in SMTP wasn't delivering, so the account
  could never be confirmed and the student was stuck. `supabase.auth.signUp()` returns
  `data.session === null` whenever the project's "Confirm email" setting is on, and the code
  treated that as a normal outcome.
- **Status:** fixed (2026-08-07) — `register()` now prefers
  `admin.auth.admin.createUser({ email_confirm: true })`, which creates the account already
  verified without sending anything, then signs the student in with `signInWithPassword`. The
  plain `signUp()` path remains as a fallback when no service-role key is configured, and its
  no-session branch now names the actual cause instead of pointing at an inbox.

## Note

The class-list gate is unaffected: `createUser` still inserts into `auth.users`, so
`handle_new_user()` fires and rolls back the insert for an unlisted email.

Related: this is the third problem in one session caused by assuming Supabase email works
(see BUG-003, and the invite-email rate limiting noted in
`docs/agent/codebase-map/enrolment.md`). **Design enrolment so email is never on the critical
path.**
