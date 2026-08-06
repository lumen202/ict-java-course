import Link from "next/link";

// Consistent "up one level" link for inner pages. Deliberately a real Link to a
// known destination rather than router.back(): browser history can point
// anywhere (a redirect, an external referrer, a form post), whereas "up" is
// always meaningful. The browser's own Back button still does what it does.
export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
    >
      <span aria-hidden="true">←</span>
      {label}
    </Link>
  );
}
