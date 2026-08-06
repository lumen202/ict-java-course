# Codebase map

The **index**: a file-by-file tour so you can find things without reading the
code. For setup and deployment see the root [`README.md`](../README.md); for
current build state see [`HANDOFF.md`](HANDOFF.md); for per-folder memory
(state, decisions, session logs) see the `_palace/` directory inside each
folder — protocol in [`MIND_PALACE.md`](MIND_PALACE.md).

| Area | How it works | Memory |
|---|---|---|
| `src/app/` | [README](../src/app/README.md) | [`_palace/`](../src/app/_palace/STATE.md) |
| `src/components/` | [README](../src/components/README.md) | [`_palace/`](../src/components/_palace/STATE.md) |
| `src/lib/` | [README](../src/lib/content/README.md) | [`_palace/`](../src/lib/_palace/STATE.md) |
| `supabase/` | [README](../supabase/README.md) | [`_palace/`](../supabase/_palace/STATE.md) |
| `docs/` | [MIND_PALACE.md](MIND_PALACE.md) | [`_palace/`](_palace/STATE.md) |
| whole project | this file | [`logs/`](logs/) — one file per session |

## The one thing to understand first

**Weeks are data.** A week page is not a page you write — it is a `Week` object
rendered by a single generic template. Adding week 2 means adding one content
file and one line in a registry. If you find yourself writing JSX to add course
material, stop: that's the wrong layer.

```
src/lib/content/weeks/unit1-week1.ts   ← the material (text, links, questions)
        │
        ├─ registered in src/lib/content/index.ts  →  weeks[]
        │                                                │
        │                                                ├─ home page lists it
        │                                                └─ generateStaticParams
        │                                                     prerenders it
        └─ rendered by src/app/week/[slug]/page.tsx    ← the layout, written once
```

## Request flows

**Signing in**

```
/login → server action (signIn/signUp) → Supabase Auth → cookies set
                                          ↳ signup trigger creates profiles row
                                            (role = student)
src/proxy.ts refreshes those cookies on every later request
```

**Student submits a reflection**

```
ReflectionForm (client)  →  POST /api/reflections  →  server client (the
                                                      student's own token)
                                                      → INSERT with user_id
                                                        (RLS: user_id = auth.uid())
```

**Teacher reads reflections**

```
/teacher (server)  →  requireTeacher() redirects non-teachers
                   →  SELECT reflections as the teacher's own user
                      (RLS: is_teacher() returns everyone's rows)
```

Access is enforced twice on purpose: the app-level redirect is UX, and the RLS
policy is the real boundary — a student hitting `/teacher` directly is bounced,
and even if they weren't, the query would return only their own rows.

## Files

### `src/lib/content/` — the course material

| File | What it is |
|---|---|
| `types.ts` | The `Week` type and its parts (`Activity`, `ReadingItem`, `SelfCheckItem`). The shape of every week. |
| `weeks/unit1-week1.ts` | Week 1 content: SQL intro. One file per week. |
| `index.ts` | `weeks[]` (display order), `roadmap[]` (future weeks shown as "coming soon"), `getWeek(slug)`. |

See [`src/lib/content/README.md`](../src/lib/content/README.md) — how to add a week.

### `src/app/` — routes

| Path | Type | What it does |
|---|---|---|
| `layout.tsx` | server | Root layout: fonts, title template, global `SiteHeader`/`SiteFooter`. |
| `page.tsx` | server | Home: hero, course-arc cards, "how a week works", available weeks from `weeks[]`, roadmap timeline. |
| `not-found.tsx` | server | Custom 404; unknown week slugs land here. |
| `week/[slug]/page.tsx` | server | The generic week template. Renders `video.days` as day cards with embedded players. Reflection form for signed-in students, sign-in CTA otherwise. |
| `login/` | server + client | `page.tsx`, `LoginForm.tsx` (tabbed sign in / create account), `actions.ts` (`signIn`, `signUp`, `signOut`). |
| `teacher/page.tsx` | server | Teacher-only reflections list (`requireTeacher()`), read under RLS. `WeekFilter.tsx` is the `?week=` select. |
| `api/reflections/route.ts` | route | `POST` — signed-in student submits; inserts `user_id` + profile name. |

`src/proxy.ts` (root, Next 16's renamed `middleware`) refreshes auth cookies.

See [`src/app/README.md`](../src/app/README.md).

### `src/components/`

| File | What it is |
|---|---|
| `SiteHeader.tsx` / `SiteFooter.tsx` | Server. Global chrome, rendered in the root layout. |
| `VideoEmbed.tsx` | Server. In-page YouTube player — lazy iframe, `youtube-nocookie.com`, zero client JS. |
| `SelfCheck.tsx` | Client. Questions with answers hidden behind a reveal button. Nothing is recorded. |
| `ReflectionForm.tsx` | Client. Posts to `/api/reflections`, handles success and error states. |
| `WeekProgress.tsx` | Client. `MarkWeekDone` + `WeekDoneBadge` — localStorage-only personal checklist (`jch-done:<slug>`), never sent to the teacher. |

See [`src/components/README.md`](../src/components/README.md).

### `src/lib/`

| File | What it is |
|---|---|
| `supabase/server.ts` | Cookie-bound server client — server components, route handlers, server actions. Runs as the logged-in user. |
| `supabase/client.ts` | Browser client for client components (auth). |
| `auth.ts` | `getCurrentUser()`, `requireUser()`, `requireTeacher()`. The only place access is decided. |

### `supabase/`

| File | What it is |
|---|---|
| `schema.sql` | `profiles` (+ `user_role` enum, signup trigger, role-escalation guard) and `reflections` (+ `user_id`), with role-based RLS. Run once in the SQL Editor; idempotent. |

See [`supabase/README.md`](../supabase/README.md).

## Gotchas

- **Next.js is v16.** Its conventions differ from older training data. Bundled
  docs are in `node_modules/next/dist/docs/` — read the relevant guide before
  writing app-router code. Notably: `params` is a `Promise` and must be awaited,
  and `PageProps<'/week/[slug]'>` / `LayoutProps<'/'>` are global helper types
  generated by `next dev` / `next build` (no import needed).
- **The `nextjs-agent-rules` block in `AGENTS.md` is auto-managed.** Never edit
  between its markers; `next dev` rewrites it. Add project notes below it.
  `CLAUDE.md` is just `@AGENTS.md`.
- **Env vars have no `NEXT_PUBLIC_` prefix on purpose.** Adding one would ship a
  Supabase key in the client bundle.
- **Slugs are permanent** once shared with students.
