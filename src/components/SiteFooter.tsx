import Link from "next/link";

// Global footer. Server component — no state.
export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-8 text-sm text-zinc-500">
        <p>Java Course Hub — your weekly home base for the Java track.</p>
        <Link href="/teacher" className="hover:underline">
          Teacher view
        </Link>
      </div>
    </footer>
  );
}
