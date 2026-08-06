// Global footer. Deliberately has no link to the teacher area — students
// shouldn't be prompted to go poking at it. Teachers reach it from the header,
// which only renders those links for role === "teacher".
export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-6 py-8 text-sm text-zinc-500">
        <p>Java Course Hub — our Java lessons, week by week.</p>
      </div>
    </footer>
  );
}
