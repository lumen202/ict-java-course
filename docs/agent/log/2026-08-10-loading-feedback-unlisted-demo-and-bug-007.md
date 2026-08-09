# 2026-08-10 — Loading feedback everywhere, the demo moved to an unlisted route, BUG-007

Follow-on from
[`2026-08-10-demo-mode-cohort-isolation.md`](2026-08-10-demo-mode-cohort-isolation.md), driven by
two things spotted while trying the demo.

## 1. Navigation looked like nothing happened

Every route here is server-rendered on demand (the shell reads the session), so a click always
costs a round-trip and the browser sat on the old page in the meantime. The demo's role switch
was the worst case — a Server Action ending in `redirect()`, with no visible response at all.

Three layers, matched to the three ways a navigation starts:

- **`loading.tsx`** — `app/loading.tsx` covers every route; `app/week/[slug]/loading.tsx` is
  shaped like a lesson (heading, 16:9 video block, activity cards) because that's where students
  move around most. `components/Skeleton.tsx` holds the shared pieces, deliberately coarse: a
  promise about the shape, not a pixel copy that goes stale.
- **`components/PendingButton.tsx`** — `useFormStatus` for Server Actions, which `loading.tsx`
  can't help with at all. Wired into the demo switch/exit, release/take-back, and sign out.
  `AddStudentForm` and `EditableName` already had their own; they were left alone.
- **`useLinkStatus`** in the sidebar — a dot on the link you clicked. The `.link-hint` CSS
  reserves its space always and delays the fade 150ms, so a fast navigation shows nothing rather
  than a flicker. Also honours `prefers-reduced-motion`.

## 2. BUG-007 — every self-registered student read as a pending invite

The demo's teacher dashboard said "0 Students set up · 4 Invites pending" with four working
accounts. `onboarded_at` was written in exactly one place — `app/welcome/actions.ts`, the
*invited* person's set-a-password page — so self-registration, the primary path, left it null
forever. **This was live on the real class too.**

Fixed in `handle_new_user()`: `onboarded_at` is stamped when the new auth user has a password
(`new.encrypted_password <> ''`), which is what the column always meant. Invites still create a
passwordless user, so their semantics are unchanged. A third backfill applies the same test to
existing rows. See [`../bugs/BUG-007-...`](../bugs/BUG-007-self-registered-students-counted-as-pending-invites.md).

## 3. The demo is no longer offered to students

The button on `/login` was wrong: the class would have been shown a sandbox they could mistake
for their course, and pressing it mid-lesson would have dropped their session. Moved to `/demo` —
public, `noindex`, and **linked from nowhere in the app**. The URL is the handout.

- `DEMO_KEY` (new, optional): when set, only `/demo?key=<value>` resolves; anything else 404s.
  Meant for the deployment the class actually uses.
- Failures 404 rather than explaining themselves — the page shouldn't confirm it exists to
  someone guessing.
- Someone already signed in for real gets a "this would sign you out" card instead of the button.

`app/login/DemoButton.tsx` → `app/demo/StartDemoForm.tsx`.

## Watch out for

- **Never add a demo entry point back to `/login`.** It's now an invariant in `AGENTS.md`.
- `loading.tsx` can't cover work done in the **root layout** — `AppShell` reads the session
  there, and per the Next 16 docs a layout's runtime data blocks navigation. That's why the
  sidebar hint exists as well; don't delete one assuming the other covers it.
- The lesson skeleton hard-codes the week page's `max-w-5xl px-6 py-10` wrapper. If that wrapper
  changes, the skeleton jumps on swap.

## What's next

Unchanged from the previous entry, minus the screenshot item being easier now:

- **Verify against a live database** — none of this has been exercised end-to-end yet.
- Rate limiting on `startDemo` (still the only unbounded account-creating path).
- A fuller progress state for `startDemo` if the button label doesn't feel like enough — it
  creates five accounts and seeds them, and it's by far the slowest action in the app.
