# DECISIONS — `docs/` (append-only)

- **D1** — Division of labor: CODEBASE_MAP = where (index) · folder README =
  how (timeless) · `_palace/STATE` = what now · `_palace/DECISIONS` = why ·
  logs = what happened · HANDOFF = what next. Don't duplicate across layers —
  link.
- **D2** — **AI agents must never `git commit` or `git push`** (user directive,
  2026-08-07). Verification ends at lint + build; the human reviews and
  commits. Recorded in `AGENTS.md` as the authoritative statement.
- **D3** — Memory is distributed per folder (`_palace/` next to the code) with
  one small log file per session, instead of central per-area .md files whose
  journals grow unboundedly. Rationale: as the app scales, single files get too
  long for agents to read cheaply; CODEBASE_MAP stays the quick index.
  (Supersedes the short-lived `docs/mind-palace/` room files from earlier on
  2026-08-07.)
- **D4** — `AGENTS.md`'s `nextjs-agent-rules` block is auto-managed by
  `next dev`; never edit inside the markers. `CLAUDE.md` is just `@AGENTS.md`.
