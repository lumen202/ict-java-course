# Mind palace protocol

The project's long-term memory for AI agents (and humans). It is **distributed**:
every major code folder carries its own `_palace/` directory, so memory lives
next to the code it describes and no single file ever grows long enough to be
expensive to read. [`CODEBASE_MAP.md`](CODEBASE_MAP.md) is the index — use it to
find things; use the palace to understand them.

## Structure

Every palace has the same shape:

```
<folder>/_palace/
  STATE.md        # current snapshot of the folder — short, rewritten in place
  DECISIONS.md    # numbered decisions & gotchas — append new, never delete
  logs/
    YYYY-MM-DD--<slug>.md   # one file per work session that touched this folder
```

Palaces today (add one when a new major folder appears, and index it in
CODEBASE_MAP):

| Folder | Palace |
|---|---|
| `src/app/` | [`src/app/_palace/`](../src/app/_palace/STATE.md) |
| `src/components/` | [`src/components/_palace/`](../src/components/_palace/STATE.md) |
| `src/lib/` | [`src/lib/_palace/`](../src/lib/_palace/STATE.md) |
| `supabase/` | [`supabase/_palace/`](../supabase/_palace/STATE.md) |
| `docs/` | [`docs/_palace/`](_palace/STATE.md) |

Project-wide session logs (the whole session, across folders) live in
[`docs/logs/`](logs/) with the same file naming. This is the "context is never
lost" layer: every session leaves a permanent record even after
`docs/HANDOFF.md` is rewritten.

> `_palace/` under `src/app/` is safe: the App Router treats `_`-prefixed
> folders as private and never routes them.

## The three files

- **`STATE.md`** — what's true *now*. Short (aim < 1 screen). Rewritten in
  place whenever it drifts from reality. Optimized so an agent can read it
  instead of re-deriving the folder from code.
- **`DECISIONS.md`** — the *why*. Numbered entries (`D1`, `D2`, …) so logs and
  other docs can reference them. Append-only; if a decision is reversed, add a
  new entry that says so and links back — don't edit the old one.
- **`logs/`** — the *history*. One small file per session, append-only, never
  edited after the session ends. A log that's wrong gets corrected by a later
  log, not rewritten.

## Log file format

Name: `YYYY-MM-DD--short-slug.md` (add `-2`, `-3` if one day has several
sessions touching the same folder).

```markdown
# 2026-08-07 — <one-line summary>

**Who:** <model/agent> · **Scope:** <files or area touched>

## What changed
- Concrete bullet points with file paths.

## Why / decisions
- Reference DECISIONS.md entries (D3) or record the reasoning inline.

## Learned / traps for future agents
- Anything a future agent must not trip over.

## Left undone
- Or "Nothing".
```

## Rules for agents

1. **Read before you touch.** Before changing a folder: its `STATE.md` +
   `DECISIONS.md`. Skim recent `logs/` only if state/decisions leave questions.
2. **Record after you work.** End of session, for every folder you changed:
   refresh its `STATE.md` if drifted, append any new `DECISIONS.md` entries,
   add one log file to its `logs/`. Then add **one** project-level log to
   `docs/logs/` summarizing the session.
3. **Append-only means append-only** for `DECISIONS.md` and all `logs/`.
4. **Keep STATE short.** If STATE is growing, its detail belongs in the folder
   `README.md` (timeless how-it-works) or a decision entry — not in STATE.
5. **This does not replace `docs/HANDOFF.md`** — HANDOFF is the single resume
   point ("what next"); it may be rewritten. Palaces and logs are permanent.

## Division of labor (don't duplicate — link)

| Layer | Question it answers |
|---|---|
| `docs/CODEBASE_MAP.md` | *Where* is a thing? (quick index) |
| folder `README.md` | *How* does this area work? (timeless) |
| `_palace/STATE.md` | What's the *current* state here? |
| `_palace/DECISIONS.md` | *Why* is it this way? |
| `_palace/logs/`, `docs/logs/` | *What happened*, session by session? |
| `docs/HANDOFF.md` | What's *next*? |
