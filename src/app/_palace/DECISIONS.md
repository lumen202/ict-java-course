# DECISIONS — `src/app/` (append-only)

- **D1** — Weeks never get their own page files; the `[slug]` template renders
  all of them from data. Adding course material must not mean writing JSX.
- **D2** — Supabase imports are allowed **only** under `api/`. Pages and
  components go through the API routes.
- **D3** — Teacher passcode travels in the POST body, not a cookie/session:
  v1 auth is deliberately minimal; reloading `/teacher` re-asks the passcode.
- **D4** — API routes fail soft (503 + human-readable message) when env vars
  are missing, so the site runs locally without Supabase.
- **D5** — Next.js 16: `params` is an awaited `Promise`; always use the
  generated global `PageProps<'/route'>` / `LayoutProps<'/'>` types (also for
  `generateMetadata`). Bundled docs: `node_modules/next/dist/docs/`.
- **D6** — Global chrome (header/footer) renders in the layout, not per page;
  pages must not add their own site footer.
