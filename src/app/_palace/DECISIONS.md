# DECISIONS — `src/app/` (append-only)

- **D1** — Weeks never get their own page files; the `[slug]` template renders
  all of them from data. Adding course material must not mean writing JSX.
- **D2** — ~~Supabase imports only under `api/`.~~ Superseded by D7.
- **D3** — ~~Teacher passcode in the POST body.~~ Superseded by D7: accounts
  replaced the passcode entirely.
- **D4** — ~~API routes fail soft (503) when env vars are missing.~~ Superseded
  by D9: without env vars the app can't authenticate at all.
- **D7** (2026-08-07, supersedes D2/D3) — Real auth: Supabase Auth with
  email+password, roles in `profiles.role`. Server components read Supabase
  directly via `@/lib/supabase/server`; access decisions go through
  `@/lib/auth` (`requireUser`/`requireTeacher`). App-level redirects are UX;
  **RLS in the database is the actual boundary** — both must be kept in sync.
- **D8** — Auth checks live in pages, not in `proxy.ts`. The Next 16 docs
  recommend keeping logic out of the proxy; it only refreshes session cookies
  (server components can read cookies but not write them).
- **D9** — Consequence of the global signed-in header: every route is
  server-rendered on demand. `generateStaticParams()` still exists for week
  slugs but nothing prerenders. If prerendering is ever needed back, the header
  must stop reading the session on the server.
- **D5** — Next.js 16: `params` is an awaited `Promise`; always use the
  generated global `PageProps<'/route'>` / `LayoutProps<'/'>` types (also for
  `generateMetadata`). Bundled docs: `node_modules/next/dist/docs/`.
- **D6** — Global chrome (header/footer) renders in the layout, not per page;
  pages must not add their own site footer.
