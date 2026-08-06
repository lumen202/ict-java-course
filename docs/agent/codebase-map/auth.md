# Auth, Sessions, Route Gating

Supabase Auth, email + password only — no OAuth, no magic links, and **no signup route** (see
[`invites-onboarding.md`](invites-onboarding.md)). Two roles, `student` and `teacher`, stored in
`profiles.role`.

## Files

- `lib/supabase/client.ts` — browser client (`createBrowserClient`). Only for genuine client-side
  auth interactivity; most of the app doesn't need it.
- `lib/supabase/server.ts` — cookie-bound server client for Server Components, Server Actions and
  Route Handlers. Queries run **as the logged-in user**, so RLS applies. Its `setAll` is wrapped
  in try/catch because server components can read cookies but not write them.
- `lib/supabase/admin.ts` — service-role client, `server-only`, invites only. Never use it for
  course data.
- `lib/auth.ts` — the single place access is decided:
  - `getCurrentUser()` → `{ id, email, fullName, role }` or null.
  - `requireUser(returnTo)` → redirects to `/login?next=…` when signed out.
  - `requireTeacher(returnTo)` → also redirects non-teachers to `/`.
- `src/proxy.ts` (repo root of `src/`) — refreshes auth cookies on every request. Named `proxy`
  per the Next.js 16 rename of `middleware`. It deliberately contains **no route logic**; the
  Next 16 docs recommend keeping decisions out of the proxy, so gating lives in the pages.
- `app/login/` — `page.tsx` (the only public route; redirects away if already signed in),
  `LoginForm.tsx` (client, `useActionState`), `actions.ts` (`signIn`, `signOut`).

## Rules

- **Always `getUser()`, never `getSession()`** on the server. `getUser()` verifies the token with
  Supabase; session cookie contents are not trustworthy server-side.
- **Gate in the page, not the proxy** — `requireUser()` / `requireTeacher()` at the top of each
  server component.
- **Never echo raw auth errors** to the browser; they leak whether an account exists. `signIn`
  returns one generic "that email and password don't match" message.
- `?next=` is sanitized (`safeNext`) to same-site relative paths, so it can't become an open
  redirect.

## What's gated

| Route | Requirement |
|---|---|
| `/login` | public — the only one |
| `/auth/confirm` | public (validates a one-time token) |
| `/welcome` | signed in (session comes from the invite link) |
| `/`, `/week/[slug]` | `requireUser()` |
| `/teacher`, `/teacher/students` | `requireTeacher()` |
| `POST /api/reflections` | session checked in the handler; returns 401 otherwise |

## Consequence: nothing prerenders

`SiteHeader` reads the session, so every route is server-rendered on demand (`ƒ` in the build
output). `generateStaticParams()` still exists for week slugs but nothing is prerendered. If
static week pages are ever needed back, the header must stop reading the session on the server —
that's the single cause.
