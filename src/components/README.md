# Components

Shared React components. Both are **client components** (`"use client"`) because
they hold interactive state; everything else in the app is a server component.

| File | What it does |
|---|---|
| `SelfCheck.tsx` | Renders `week.selfCheck` — each question's answer is hidden behind a reveal button. Purely local state, nothing is sent anywhere or recorded. |
| `ReflectionForm.tsx` | The end-of-week form. Takes `weekSlug`, POSTs to `/api/reflections`, shows success and error states. |

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
