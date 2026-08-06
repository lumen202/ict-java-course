# Components

Shared React components. Server components unless marked client.

| File | Kind | What it does |
|---|---|---|
| `SiteHeader.tsx` | server (async) | Sticky global nav. Reads the session, so it shows the user's name + Sign out, or a Sign in button. The Reflections link renders only for `role === "teacher"`. |
| `SiteFooter.tsx` | server | Global footer; carries the teacher link. Rendered in the root layout. |
| `VideoEmbed.tsx` | server | In-page YouTube player: lazy iframe on the privacy-enhanced `youtube-nocookie.com` host. Zero client JS. |
| `SelfCheck.tsx` | client | Renders `week.selfCheck` — each question's answer is hidden behind a reveal button. Purely local state, nothing is sent anywhere or recorded. |
| `ReflectionForm.tsx` | client | The end-of-week form. Takes `weekSlug` + `studentName`; POSTs to `/api/reflections`. No name field — identity comes from the account, so nobody can submit as someone else. Only rendered for signed-in students. |
| `WeekProgress.tsx` | client | `MarkWeekDone` (week page toggle) + `WeekDoneBadge` (home card chip). localStorage only (`jch-done:<slug>`) — a personal checklist, never sent to the teacher. Reads via `useSyncExternalStore` so SSR/hydration stay consistent. |

## Conventions

- **Server by default.** Only add `"use client"` when a component genuinely needs
  state, effects, or event handlers.
- **No Supabase imports here.** Components talk to the database only through
  `/api/*` routes — the keys are server-side and must stay that way.
- **Components take data, not slugs to look up.** `SelfCheck` receives the items
  to render; it doesn't call `getWeek()`. Page components do the content lookup.
- **Styling is Tailwind utility classes inline**, matching the pages. Emerald is
  the accent colour, zinc the neutral, and every colour has a `dark:` variant.
- **Error copy is written for a student**, not a developer: say what to do next,
  never surface a raw error string.
