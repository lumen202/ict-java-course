# Next 16 verification, first docs layer, first push to GitHub

## What shipped

- Verified the week template against the bundled Next.js 16 docs: `params`-as-awaited-`Promise`
  is unchanged, but v16 generates global `PageProps<'/route'>` / `LayoutProps<'/'>` helpers, so
  the hand-written props type was replaced. **First successful `npm run lint` + `npm run build`.**
- Wrote the first documentation layer: root README (setup + deploy), a codebase map, folder-level
  READMEs, and a conventions section in `AGENTS.md`.

## Git

The repo had **no remote and a single scaffold commit** — all work to date was uncommitted. With
the owner's approval: committed as `b50dcf2`, created the **private** repo
`github.com/lumen202/ict-java-course`, and pushed `main`.

Repo-local git identity was set to lumen202 (GitHub noreply email); the global identity and the
active `gh` account (remsfacilitron) were restored afterwards. A later session made this
permanent — see `2026-08-07-invite-only-accounts-and-app-shell.md`'s note on per-repo credentials.

## Watch out for

`gh`'s credential helper only ever serves the **active** account, so a private repo owned by a
different account 404s rather than returning a permission error. That 404 is an auth symptom, not
a missing repo.
