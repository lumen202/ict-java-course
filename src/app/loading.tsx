import { SkeletonPage } from "@/components/Skeleton";

// Root fallback: covers every route that doesn't define its own loading.tsx.
// Next wraps page.tsx (and nested segments) in a Suspense boundary with this as
// the fallback, so navigation is answered immediately even though every page
// here is server-rendered on demand.
export default function Loading() {
  return <SkeletonPage />;
}
