# Routes

Next.js App Router. **This project is on Next.js 16** — read the bundled guides
in `node_modules/next/dist/docs/` before writing app-router code; conventions
differ from older versions.

| Path | Rendering | Purpose |
|---|---|---|
| `layout.tsx` | server | Root layout: fonts, title template, global `<SiteHeader>`/`<SiteFooter>`. |
| `page.tsx` | static | Home. Hero, course-arc cards, available weeks from `weeks[]`, roadmap timeline from `roadmap[]`. |
| `not-found.tsx` | static | Custom 404 — also where unknown week slugs land. |
| `week/[slug]/page.tsx` | SSG | The **generic** week template — renders any `Week`, embeds the video when `video.youtubeId` is set. `generateStaticParams()` prerenders every registered week; `generateMetadata()` sets per-week titles; unknown slugs call `notFound()`. |
| `teacher/page.tsx` | client | Passcode form, then the reflections list (newest first, filterable by week). |
| `api/reflections/route.ts` | dynamic | `POST` — student submits a reflection. Validates, then inserts with the anon key. |
| `api/teacher/reflections/route.ts` | dynamic | `POST` — checks `passcode` against `TEACHER_PASSCODE`, then reads all rows with the service-role key. |

## Conventions

- **Never add a page per week.** Course material goes in `src/lib/content/`; the
  `week/[slug]` template renders it. See `src/lib/content/README.md`.
- **Supabase only inside `api/`.** Pages and components never import
  `src/lib/supabase.ts` — that's what keeps the keys off the client.
- **API routes fail soft.** When env vars are missing, return `503` with a
  human-readable message rather than throwing, so the site still runs locally
  without Supabase configured.
- **Validate and bound every input** in the route (presence, type, length) before
  it reaches the database — the submit endpoint is public and unauthenticated.
- **Log the real error server-side, return a friendly one.** Never echo a
  database error message back to the browser.
- **Next 16 specifics:** `params` is a `Promise` and must be awaited, and
  `PageProps<'/week/[slug]'>` / `LayoutProps<'/'>` are globally available
  generated types — don't import them, and don't hand-write the props type.
