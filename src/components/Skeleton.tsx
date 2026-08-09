// Shared pieces for the route-level loading.tsx files.
//
// Every page in this app is server-rendered on demand (the shell reads the
// session), so a navigation always costs a round-trip. Without a fallback the
// browser sits on the old page and the click reads as "nothing happened" — a
// skeleton shaped roughly like the destination is what makes it feel answered.
//
// Deliberately coarse: these are a promise about the *shape* of what's coming,
// not a pixel copy. A skeleton that tries to match exactly goes stale the first
// time the real page changes.

export function SkeletonLine({ className = "" }: { className?: string }) {
  return <div className={`skeleton h-4 ${className}`} />;
}

/** Page title + subtitle, matching the `mx-auto max-w-7xl px-6 py-10` pages. */
export function SkeletonHeader() {
  return (
    <div className="mb-8">
      <SkeletonLine className="h-7 w-56" />
      <SkeletonLine className="mt-3 h-3.5 w-80 max-w-full" />
    </div>
  );
}

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="card p-5">
      <SkeletonLine className="w-40" />
      {Array.from({ length: lines }, (_, i) => (
        <SkeletonLine key={i} className={`mt-3 h-3 ${i === lines - 1 ? "w-2/3" : "w-full"}`} />
      ))}
    </div>
  );
}

/**
 * The default page fallback: header plus a few cards, inside the same wrapper
 * the real pages use so nothing jumps when the content swaps in.
 */
export function SkeletonPage({ cards = 3 }: { cards?: number }) {
  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-10" aria-busy="true">
      <span className="sr-only">Loading…</span>
      <SkeletonHeader />
      <div className="space-y-4">
        {Array.from({ length: cards }, (_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </main>
  );
}
