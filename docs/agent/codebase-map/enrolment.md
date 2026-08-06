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

## Files

| Path | Role |
|---|---|
| `app/register/` | public self-registration — `page.tsx`, `RegisterForm.tsx`, `actions.ts` |
| `app/teacher/students/page.tsx` | class list + accounts tables |
| `app/teacher/AddStudentForm.tsx` | add an email, optionally email an invite |
| `app/teacher/RemoveStudentButton.tsx` | offered only for people who haven't registered |
| `app/teacher/actions.ts` | `addStudent`, `removeStudent` |
| `app/auth/confirm/route.ts` | verifies emailed tokens → `/welcome` |
| `app/welcome/` | invited user sets password + name, stamps `onboarded_at` |
| `lib/supabase/admin.ts` | service-role client, **only** for `inviteUserByEmail` |

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
account that already exists, which is why the Remove button is hidden once
`registered_at` is set. Delete real accounts in the Supabase dashboard.

## The invite email template must be edited, or invite links break

Supabase's **default** invite template uses `{{ .ConfirmationURL }}`, which routes through
Supabase's own `/auth/v1/verify` and hands the session back in the URL **fragment**
(`#access_token=…`). Fragments never reach the server, so `/auth/confirm` receives no token and
redirects to `/login?error=invalid-link`.

Fix it in **Authentication → Email Templates → Invite user**, replacing the link with:

```
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite&next=/welcome
```

`/auth/confirm` also accepts `?code=` (the PKCE flow) as a fallback, but `token_hash` is the
shape to aim for. Until the template is changed, tell students to ignore the email and register
at `/register` — the class list is what grants access, so nothing is blocked by this.

## Supabase dashboard settings this depends on

- **Allow new users to sign up: ON.** Counter-intuitive, but the trigger is the
  gate; turning this off would break `/register` for allowlisted students too.
- **Confirm email: OFF** — otherwise `/register` leaves students waiting on mail
  that may never arrive.
- **Redirect URLs** must include `<site>/auth/confirm` for invite links to work.
