# STATE — `src/components/` (2026-08-07)

Protocol: [`docs/MIND_PALACE.md`](../../../docs/MIND_PALACE.md) · How-it-works: [`../README.md`](../README.md)

| Component | Kind | Role |
|---|---|---|
| `SiteHeader.tsx` | server | Sticky global nav (brand, Weeks, Teacher) |
| `SiteFooter.tsx` | server | Global footer, carries the teacher link |
| `VideoEmbed.tsx` | server | Lazy `youtube-nocookie.com` iframe, aspect-video, zero client JS |
| `SelfCheck.tsx` | client | Hidden-answer self-check questions |
| `ReflectionForm.tsx` | client | Posts to `/api/reflections` |
| `WeekProgress.tsx` | client | `MarkWeekDone` (week page) + `WeekDoneBadge` (home), localStorage via `useSyncExternalStore` |
