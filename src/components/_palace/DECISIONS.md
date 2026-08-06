# DECISIONS — `src/components/` (append-only)

- **D1** — Server components by default; `"use client"` only for
  state/effects/handlers.
- **D2** — No Supabase imports here, ever. Components talk to the DB only via
  `/api/*` routes.
- **D3** — Components take data, not slugs to look up (`SelfCheck` receives
  items; pages call `getWeek()`).
- **D4** — Week progress is **localStorage-only** (key `jch-done:<slug>`): the
  student's personal checklist, never teacher-visible, so it doesn't violate
  the no-accounts decision. Fails silently when storage is blocked.
- **D5** — localStorage is read via `useSyncExternalStore` (server snapshot
  `false`), NOT setState-in-useEffect: the `react-hooks/set-state-in-effect`
  lint rule rejects the effect pattern, and the store approach avoids
  hydration mismatches by design.
- **D6** — `VideoEmbed` ships zero JS: plain `loading="lazy"` iframe on the
  privacy-enhanced host. No thumbnail facade — that would need client state
  plus an `<img>` from `i.ytimg.com`, which trips `@next/next/no-img-element`.
- **D7** — Error copy is written for students: say what to do next, never
  surface raw error strings.
