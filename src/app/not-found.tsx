import Link from "next/link";

// Shown for any unknown URL, including week slugs that don't exist (the week
// page calls notFound() for unregistered slugs).
export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-start justify-center px-6 py-20">
      <p className="font-mono text-sm text-emerald-700 dark:text-emerald-400">404</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">
        That page doesn&apos;t exist (yet?)
      </h1>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400 leading-relaxed">
        If you followed a link to a week, it may not be published yet — weeks
        open up one at a time. Check the course map for what&apos;s available now.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-md bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
      >
        ← Back to the course map
      </Link>
    </main>
  );
}
