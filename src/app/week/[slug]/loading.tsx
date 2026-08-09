import { SkeletonLine, SkeletonCard } from "@/components/Skeleton";

// The lesson page is the one people move around in most — day to day from the
// sidebar — so it gets a fallback shaped like a day rather than the generic
// one: heading, the video block, then the activity cards.
export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10 lg:px-10" aria-busy="true">
      <span className="sr-only">Loading the lesson…</span>

      <SkeletonLine className="h-3 w-32" />
      <SkeletonLine className="mt-3 h-8 w-72 max-w-full" />
      <SkeletonLine className="mt-3 h-3.5 w-96 max-w-full" />

      {/* Video: a 16:9 block, so the page doesn't jump when the player lands. */}
      <div className="skeleton mt-8 aspect-video w-full rounded-2xl" />

      <div className="mt-8 space-y-4">
        <SkeletonCard lines={4} />
        <SkeletonCard lines={2} />
      </div>
    </main>
  );
}
