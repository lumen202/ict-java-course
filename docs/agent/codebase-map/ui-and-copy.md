# UI, Layout, and Copy Rules

## Shell

`app/layout.tsx` loads Geist (sans + mono) via `next/font`, sets the title template
`%s · Java Course Hub`, and delegates the frame to `<AppShell>`.

- `components/AppShell.tsx` — **server component**. Reads the session and decides the frame:
  signed-in users get the sidebar, signed-out pages (`/login`, `/register`) get a bare column and
  carry their own branding. It also builds the nav list, so **a student's browser never receives
  the teacher routes** — role filtering happens before render, not in CSS.
- `components/Sidebar.tsx` — client (needs `usePathname` and the mobile drawer toggle). Fixed
  left rail on `md:` and up; below that a sticky top bar with a ☰ drawer. Brand at the top, the
  user card (avatar initials, name/role) and Sign out at the bottom (a `<form action={signOut}>`).
  - **The rail is dark in both themes** (`bg-zinc-950` + the emerald `railGlow`) — it carries the
    brand identity, matching the login page's brand panel. Everything inside styles against dark
    (`white/5` surfaces, `white/10` borders); don't add `dark:` variants there.
  - **Whole-rail collapse**: the « / » buttons shrink it to an icon-only strip
    (`jch-rail-collapsed` in localStorage, same `useSyncExternalStore` pattern as the groups).
    The content column is `flex-1`, so it widens automatically. In collapsed mode the avatar
    button *expands* the rail — it must never sign out directly.
  - **Active state uses longest-match, not `startsWith`** — `activeHref()`. A plain prefix test
    lights up both "Reflections" (`/teacher`) and "Lessons" (`/teacher/lessons`) at once; that
    was a real bug.
  - **Groups collapse** (chevron toggle, default open inside that section) and their child list
    is `max-h-72 overflow-y-auto`. The student's Lessons group gains an entry per released day,
    so without both it would grow without bound and push the rest of the rail off-screen.
  - Child links are matched on `?day=`, since they share a pathname.
  - The drawer closes from each link's `onClick`, not an effect watching the pathname —
    setState-in-effect is rejected by the `react-hooks` lint rules.
- `components/BackLink.tsx` — "up one level" link for pages the sidebar doesn't cover (week page,
  register). A real `Link` to a known destination rather than `router.back()`, since history can
  point anywhere.
- `app/not-found.tsx` — custom 404; unknown week slugs land here.

There is no top nav, no footer, and no teacher tab strip — the sidebar replaced all three. Don't
add per-page action buttons that duplicate a sidebar link.

## Styling

Tailwind v4 utility classes inline, **plus a small design system in `globals.css`**
(`@layer components`): `.card`, `.card-accent`, `.btn-primary`, `.btn-ghost`, `.input`, `.chip`,
`.section-label`. Repeated shapes must use these classes — that's what lets the whole site change
look in one file. Emerald is the accent (gradients `emerald-500→teal-600` for brand tiles and
primary buttons), zinc the neutral, and every colour outside the dark sidebar carries a `dark:`
variant. The body has fixed radial emerald/teal glows behind everything; `globals.css` also sets
the light/dark vars, smooth scrolling and the emerald selection colour.

Main containers are wide so collapsing the sidebar visibly frees space: teacher pages
`max-w-7xl`, dashboards/lists `max-w-5xl`, the lesson page `max-w-4xl` (reading width).

⚠️ `globals.css` originally hard-coded `font-family: Arial` from the scaffold, silently
overriding the Geist fonts the layout loads. It now points at `var(--font-geist-sans)`. Don't
reintroduce a literal font stack there.

## Dashboards

`app/page.tsx` is a thin switch on role → `StudentDashboard` or `TeacherDashboard`.

- **Student**: one **Today** card (the released day's focus), then `components/UnitOutline.tsx` —
  four quiet rows, one per unit, marking where the class is. It deliberately does **not** list
  locked weeks: a wall of 🔒 rows is noise that invites skimming ahead. Then earlier weeks, then
  "how a day works".
- **Teacher**: stat cards, a "Class is on …" card linking to the release control, the newest
  reflections, and `components/CurriculumList.tsx` (the full unit/week breakdown, which is still
  useful when reviewing).

This is a **workspace, not a landing page** — no hero, no marketing pitch. Everyone who can see
it is already in the class.

## Copy rules (both are standing bans)

1. **Never mention grading, in either direction.** The course genuinely isn't graded, but that is
   a teacher-side fact: telling students it's graded would be a lie, and telling them it isn't
   kills effort. Banned words in UI text and week content: "graded", "not a grade", "never
   graded". Internal docs like this one may state the truth.
2. **Never reference the teacher's attendance or absence.** No "when I can't be there", "in
   person", "self-paced because…". The site should read as the normal way the course runs.

Before shipping student-facing text:
`grep -rniE "grade|not a grade|in person|i'm there" src/` — `grade_level` (a SQL column in week 1's
content) is the only expected hit.

Other copy conventions: second person, plain language, encouraging about being stuck, and error
messages that say what to do next rather than surfacing raw error strings.

## Accessibility notes

`PasswordField` (used by the sign-in and set-password forms) pairs its Show/Hide toggle with
`aria-pressed` and an `aria-label`, and wires the label with `useId()`. Decorative emoji carry
`aria-hidden="true"`.
