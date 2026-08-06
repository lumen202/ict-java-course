# UI, Layout, and Copy Rules

## Shell

`app/layout.tsx` loads Geist (sans + mono) via `next/font`, sets the title template
`%s · Java Course Hub`, and wraps every page in `<SiteHeader>` / `<SiteFooter>`.

- `components/SiteHeader.tsx` — **async server component**: reads the session, shows Curriculum
  (signed in), Reflections (teachers only), the user's name and a Sign out form action, or a
  Sign in button when signed out. Sign-out is a `<form action={signOut}>`, so the header ships no
  client JS.
- `components/SiteFooter.tsx` — one line, no links (see
  [`teacher-area.md`](teacher-area.md) for why).
- `app/not-found.tsx` — custom 404; unknown week slugs land here.

## Styling

Tailwind v4 utility classes inline. Emerald is the accent, zinc the neutral, and every colour
carries a `dark:` variant. `globals.css` sets the light/dark background and foreground vars,
smooth scrolling and an emerald selection colour.

⚠️ `globals.css` originally hard-coded `font-family: Arial` from the scaffold, silently
overriding the Geist fonts the layout loads. It now points at `var(--font-geist-sans)`. Don't
reintroduce a literal font stack there.

## Dashboards

`app/page.tsx` is a thin switch on role → `StudentDashboard` or `TeacherDashboard`. Both use
`components/CurriculumList.tsx` (the four units, available weeks linked, unwritten ones shown
locked) so the curriculum renders identically for everyone; the student version additionally
shows a "Your current week" card and the "how a week works" reference block.

This is a **syllabus, not a landing page** — no hero, no marketing pitch. The people who can see
it are already in the class.

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
