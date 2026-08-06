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

**Student submits a reflection**

```
ReflectionForm (client)  →  POST /api/reflections  →  anon Supabase client
                                                       → INSERT into reflections
                                                         (RLS allows insert only)
```

**Teacher reads reflections**

```
/teacher (client)  →  POST /api/teacher/reflections  →  passcode checked against
                                                        TEACHER_PASSCODE
                                                        → service-role client
                                                          → SELECT (bypasses RLS)
```

Both API routes fail soft: if the Supabase env vars are missing they return 503
with a readable message instead of crashing, so the site still renders during
local development without keys.

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
| `week/[slug]/page.tsx` | server | The generic week template. Embeds the video when `video.youtubeId` is set. `generateStaticParams()` prerenders every registered week; `generateMetadata()` sets per-week titles; unknown slugs `notFound()`. |
| `teacher/page.tsx` | client | Passcode form → reflections list, newest first, filterable by week. |
| `api/reflections/route.ts` | route | `POST` — validates and inserts a student reflection (anon key). |
| `api/teacher/reflections/route.ts` | route | `POST` — checks passcode, returns all reflections (service-role key). |

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
| `supabase.ts` | `getAnonClient()` (student writes) and `getServiceClient()` (teacher reads). Both return `null` when env vars are missing — callers must handle it. |

### `supabase/`

| File | What it is |
|---|---|
| `schema.sql` | The `reflections` table and its RLS policy. Run once in the Supabase SQL Editor. |

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
