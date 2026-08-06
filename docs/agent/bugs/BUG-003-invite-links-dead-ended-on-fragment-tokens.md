# BUG-003: Invite links dead-ended because the token arrives in the URL fragment

- **Found:** 2026-08-07
- **Where:** `src/app/auth/confirm/`
- **Symptom:** Clicking the link in a Supabase invite email always landed on
  `/login?error=invalid-link`. `/auth/confirm` was a route handler reading `token_hash` / `type`
  from the query string, but Supabase's **default** invite template
  (`{{ .ConfirmationURL }}`) routes through Supabase's own `/auth/v1/verify`, which redirects back
  with the session in the URL **fragment** (`#access_token=…&refresh_token=…`). Fragments are
  never transmitted to the server, so the handler saw an empty request every time.
- **Status:** fixed (2026-08-07) — `/auth/confirm` is now a page that handles all three shapes:
  `token_hash` and `code` on the server, and a client component (`HashSession.tsx`) that reads
  the fragment, calls `setSession()`, and does a full page replace so server components re-render
  with the new cookies.

## Notes for future auth work

- A first fix attempt only added `?code=` support and told the owner to edit the email template.
  That was still broken for the default template — the real problem was the transport, not the
  parameter name. **Check where the token physically travels before adding parameter handling.**
- The redirect after `setSession()` must be `window.location.replace`, not `router.push`: the
  auth cookies are new and every server component needs a fresh render.
- This path is now optional anyway — enrolment works without email, via the class list at
  `/register`. See `docs/agent/codebase-map/enrolment.md`.
