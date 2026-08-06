# Bug Tracker — Index

Deliberately in-repo instead of GitHub Issues, so it stays greppable by agents and travels with
the code. One file per bug, created lazily — don't pre-create placeholders. This table may stay
empty for long stretches; that's fine.

| ID | Title | Status | File |
|---|---|---|---|
| — | none open | — | — |

**To file a bug:** create `BUG-NNN-short-slug.md` here (sequential ID, never reused, even for
invalidated bugs) with:

```
# BUG-NNN: Short title
- **Found:** YYYY-MM-DD
- **Where:** file/path or feature area
- **Symptom:** what goes wrong, concretely (inputs -> bad output)
- **Status:** open | fixed (YYYY-MM-DD) — one-line resolution if fixed
```

Then add a row to the table above. Never delete a bug file after fixing — update its `Status`
line and leave it as a record.

Bugs found *and fixed inside the same session* still get filed: the record of the trap is worth
more than the tidiness. Two examples worth knowing about are recorded in the log rather than
here, because they predate this tracker — the scaffold's `globals.css` Arial override, and
`react-hooks/set-state-in-effect` rejecting a localStorage read
(both in [`../log/2026-08-07-site-shell-video-embed-and-progress.md`](../log/2026-08-07-site-shell-video-embed-and-progress.md)).
