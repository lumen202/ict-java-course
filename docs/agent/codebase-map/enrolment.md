# Enrolment — the class list, registration, and invites

Nobody can create an account unless the teacher has put their email on the
**class list** (`allowed_students`). From there they can arrive two ways, and
both end in the same place.

```
teacher /teacher/students → addStudent → row in allowed_students
   │
   ├── (a) student goes to /register themselves ──────────────┐
   │       name + email + password → supabase.auth.signUp     │
   │                                                          ├─→ handle_new_user()
   └── (b) teacher also ticks "Email them an invite link"      │    checks the class
           → admin.inviteUserByEmail → emailed link            │    list, creates the
           → /auth/confirm (verifyOtp) → /welcome              │    profile, stamps
             (set password + confirm name)                     │    registered_at
                                                               ┘
```

**The database is the gate, not the UI.** `handle_new_user()` raises
`email not on the class list` when the address isn't in `allowed_students`,
which aborts the signup transaction. That holds even if someone calls the
Supabase auth API directly, so the open `/register` page is safe.

One exemption: if no teacher exists yet, the first account is allowed through
(bootstrap). After that, everyone needs to be on the list.

`addStudent` also stores the optional first/last name on the class-list row;
`handle_new_user()` falls back to those when the signup itself carries no name,
so an invited student's roster name survives even a bare registration.

## Files

| Path | Role |
|---|---|
| `app/register/` | public self-registration — `page.tsx`, `RegisterForm.tsx`, `actions.ts` |
| `app/teacher/students/page.tsx` | class list + accounts tables |
| `app/teacher/AddStudentForm.tsx` | add an email, optionally email an invite |
| `app/teacher/RemoveStudentButton.tsx` | offered only for people without an account |
| `app/teacher/EditableName.tsx` | inline name editing on the roster → `updateStudentName` |
| `app/teacher/actions.ts` | enrolment actions `addStudent`, `removeStudent`, `updateStudentName` (the file also holds the non-enrolment actions `releaseDay`, `undoRelease`, `deleteSubmission`, `resetStudentDay`) |
| `app/auth/confirm/` | a **page** (+ `HashSession.tsx`) verifying emailed tokens → `/welcome` |
| `app/welcome/` | invited user sets password + name, stamps `onboarded_at` |
| `lib/supabase/admin.ts` | service-role client — `inviteUserByEmail`, `register()`'s `createUser`, and `updateStudentName`'s profile/auth writes |

## The register link carries the email

`addStudent` returns a `registerUrl` of `<origin>/register?email=<their address>`, and the form
renders it with a **Copy link** button and an "Open it ↗". That link is the primary handover
mechanism — the teacher pastes it into whatever channel the class actually uses.

`/register` prefills the email field from that query param but leaves it **editable**: someone may
arrive without the link, or with a typo'd one, and must be able to fix it. Registration is still
matched on the submitted address against `allowed_students`, never on the query param — the URL is
a convenience, not a credential.

Why `/register` asks for the email at all when the teacher already typed it: the page is public
and anonymous, so the address is the only thing tying an arriving stranger to a class-list row.

## Registration never waits on email

`register()` prefers the **admin** path: `admin.createUser({ email_confirm: true })` creates the
account already verified, then `signInWithPassword` establishes the session and the student lands
in the app. Nothing is emailed and the project's "Confirm email" setting can't strand anyone.

The class-list check still applies — `createUser` inserts into `auth.users`, which fires
`handle_new_user()`, which raises for an unlisted email and rolls the whole thing back.

Without `SUPABASE_SERVICE_ROLE_KEY` it falls back to plain `signUp()`, which *is* subject to
"Confirm email"; if that returns no session the student is told to ask the teacher to switch the
setting off. Prefer having the key set.

## Email is optional, by design

`SUPABASE_SERVICE_ROLE_KEY` may be absent — `createAdminClient()` returns null
and `addStudent` reports "no invite email was sent … they can register at
/register" instead of failing. Same when Supabase's built-in SMTP rate-limits
(a handful of emails per hour on the free tier, which a class would blow through
immediately). **Treat email as a nicety; the class list is the real mechanism.**

If reliable invite mail is ever needed, configure custom SMTP in Supabase →
Project Settings → Auth → SMTP.

## Removing someone

`removeStudent` only deletes the class-list row — it does **not** disable an
account that already exists, which is why the Remove button is hidden once the
row has an account (a `registered_at` stamp *or* a matching `profiles` email —
the stamp alone can lag for accounts created before the current trigger).
Delete real accounts in the Supabase dashboard.

## Invite links: three shapes, all handled

`app/auth/confirm/` is a **page**, not a route handler, because one of the three link shapes can
only be read in the browser:

| Link carries | Where it comes from | Handled by |
|---|---|---|
| `?token_hash=…&type=…` | a template using `{{ .TokenHash }}` | server: `verifyOtp` |
| `?code=…` | the PKCE flow | server: `exchangeCodeForSession` |
| `#access_token=…&refresh_token=…` | **Supabase's default template**, via its own `/auth/v1/verify` | client: `HashSession.tsx` |

The third one is the trap: a URL fragment is never sent to the server, so a route handler sees an
empty request and dead-ends at `/login?error=invalid-link`. `HashSession` reads
`window.location.hash`, calls `setSession()`, then does a **full page replace** (not
`router.push`) so the server components re-render with the new auth cookies.

Because of that fallback, **no email-template editing is required**. If you want the tidier link
anyway, set **Authentication → Email Templates → Invite user** to:

```
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite&next=/welcome
```

And if the email never arrives at all, nothing is blocked — the student registers at `/register`,
since the class list is what grants access.

## Supabase dashboard settings this depends on

- **Allow new users to sign up: ON.** Counter-intuitive, but the trigger is the
  gate; turning this off would break `/register` for allowlisted students too.
- **Confirm email: OFF** — otherwise `/register` leaves students waiting on mail
  that may never arrive.
- **Redirect URLs** must include `<site>/auth/confirm` for invite links to work.
