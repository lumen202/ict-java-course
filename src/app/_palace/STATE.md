# STATE — `src/app/` (2026-08-07)

Protocol: [`docs/MIND_PALACE.md`](../../../docs/MIND_PALACE.md) · How-it-works: [`../README.md`](../README.md)

- **Layout** (`layout.tsx`): Geist fonts, title template `%s · Java Course Hub`,
  global `<SiteHeader>` (async, reads session) / `<SiteFooter>`.
- **Home** (`page.tsx`): hero → 4-unit course-arc cards → "how a week works" →
  available week cards → roadmap timeline. Driven by `weeks[]`/`roadmap[]`.
- **Week template** (`week/[slug]/page.tsx`): renders `video.days` as day cards
  with embedded players + practice; self-check; then either the reflection form
  (signed-in) or a sign-in prompt; ends with `<MarkWeekDone>`.
- **Login** (`login/`): `page.tsx` (redirects if already signed in) +
  `LoginForm.tsx` (tabbed sign-in/sign-up, `useActionState`) + `actions.ts`
  (`signIn`, `signUp`, `signOut` server actions, `?next=` sanitized).
- **Teacher** (`teacher/page.tsx`): server component, `requireTeacher()`, reads
  reflections directly under RLS; `WeekFilter.tsx` pushes `?week=`.
- **API**: only `api/reflections` remains — POST as the signed-in student.
  (`api/teacher/reflections` deleted with the passcode.)
- **404** (`not-found.tsx`): custom; unknown week slugs land here.
- **`src/proxy.ts`**: refreshes Supabase auth cookies each request (Next 16
  renamed `middleware` → `proxy`).
- **Everything is dynamic** (`ƒ`) since the header reads the session — no page
  prerenders anymore, including week pages. Accepted trade-off.
- **Copy rule**: no grading mentions anywhere student-facing, either direction.
