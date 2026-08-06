import Link from "next/link";

// Global sticky header. Server component — no state. Rendered once in the
// root layout, so every page gets the same chrome for free.
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span
            aria-hidden="true"
            className="grid h-7 w-7 place-items-center rounded-md bg-emerald-600 font-mono text-sm font-bold text-white"
          >
            ☕
          </span>
          Java Course Hub
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <Link
            href="/"
            className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Weeks
          </Link>
          <Link
            href="/teacher"
            className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Teacher
          </Link>
        </nav>
      </div>
    </header>
  );
}
