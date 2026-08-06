# BUG-002: Sidebar highlighted two nav items at once

- **Found:** 2026-08-07
- **Where:** `src/components/Sidebar.tsx` → `NavLinks`
- **Symptom:** On `/teacher/lessons`, both **Lessons** and **Reflections** rendered as the active
  item. The active test was `pathname.startsWith(item.href)`, and Reflections' href is `/teacher`,
  which is a prefix of every teacher route. Any nested route under a nav item's parent showed two
  highlights.
- **Status:** fixed (2026-08-07) — replaced with `activeHref()`, which collects every item whose
  href matches exactly or as a path prefix (`href + "/"`) and keeps the **longest** one. Only that
  item renders active.

## Note for future nav work

`startsWith` is nearly always wrong for nav highlighting once routes nest. Two traps it hides:
`/teacher` prefix-matching `/teacher/lessons`, and `/` prefix-matching literally everything
(which is why the old code special-cased `/` separately). The longest-match rule handles both
without special cases.
