# Routes

Next.js App Router. **This project is on Next.js 16** — read the bundled guides
in `node_modules/next/dist/docs/` before writing app-router code; conventions
differ from older versions (notably `middleware` → `proxy`).

| Path | Rendering | Purpose |
|---|---|---|
| `layout.tsx` | server | Root layout: fonts, title template, global `<SiteHeader>`/`<SiteFooter>`. |
| `page.tsx` | server | Home. Hero, course-arc cards, available weeks from `weeks[]`, roadmap timeline. |
| `not-found.tsx` | server | Custom 404 — also where unknown week slugs land. |
| `login/page.tsx` | server | Sign in / create account. Redirects away if already signed in. |
| `login/LoginForm.tsx` | client | Tabbed sign-in/sign-up form driven by `useActionState`. |
| `login/actions.ts` | server actions | `signIn`, `signUp`, `signOut`. |
| `week/[slug]/page.tsx` | server | The **generic** week template — renders any `Week`, embeds the day-by-day video plan. Shows the reflection form to signed-in students, a sign-in prompt to everyone else. |
| `teacher/page.tsx` | server | Reflections list. Teacher-only via `requireTeacher()`; reads rows directly (RLS returns other people's rows only to teachers). |
| `teacher/WeekFilter.tsx` | client | Week `<select>` that pushes `?week=…`. |
| `api/reflections/route.ts` | dynamic | `POST` — a signed-in student submits. Inserts as *their* user, so RLS enforces ownership. |

`src/proxy.ts` (project root, not in `app/`) refreshes Supabase auth cookies on
every request. It exists only because server components can read cookies but
can't write them.

## Auth model

- **Anyone** can read course material — weeks are public.
- **Students** (role `student`, the signup default) submit reflections and can
  read only their own.
- **Teachers** (role `teacher`, granted by hand in SQL) read everyone's.

Enforced in two places on purpose: `src/lib/auth.ts` redirects in the app, and
RLS policies in `supabase/schema.sql` enforce it in the database. The app-level
check is UX; the database check is the actual security boundary.

## Conventions

- **Never add a page per week.** Course material goes in `src/lib/content/`; the
  `week/[slug]` template renders it. See `src/lib/content/README.md`.
- **Always `getUser()`, never `getSession()`** on the server — `getUser()`
  verifies the token with Supabase; session cookie contents aren't trustworthy.
- **Use `createClient()` from `@/lib/supabase/server`** in server components,
  route handlers, and server actions, so queries run as the logged-in user and
  RLS applies. There is no service-role client anymore.
- **Validate and bound every input** in route handlers (presence, type, length)
  before it reaches the database.
- **Log the real error server-side, return a friendly one.** Never echo a
  database or auth error to the browser — auth errors in particular leak whether
  an account exists.
- **Next 16 specifics:** `params`/`searchParams` are `Promise`s and must be
  awaited; `PageProps<'/route'>` / `LayoutProps<'/'>` are generated global types
  — don't import or hand-write them.
- **Everything is dynamic now.** The header reads the session, so no page
  prerenders. That's the accepted cost of a global signed-in header.
