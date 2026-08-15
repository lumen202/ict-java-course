"use client";

// Mirrors a client-side failure to the server so a teacher can actually read
// it — see supabase/schema.sql's client_error_logs and
// src/app/api/client-errors/route.ts. A student who hits "can't upload" has
// no reason to open devtools and wouldn't recognise the error if they did;
// this makes that error visible on /teacher/submissions instead.
//
// Fire-and-forget on purpose: a caller's own error handling must not depend
// on this succeeding, so it's never awaited and never throws. Losing a log
// entry is fine; blocking or breaking the UI over one is not.
//
// Scoped to UploadTurnIn.tsx today, deliberately not a global window.onerror
// handler — the upload path is the one that's actually gone wrong for a real
// student, and a blanket handler risks logging browser-extension noise as if
// it were the app's own fault. If another surface needs the same visibility
// later, route it through this same function rather than a fresh
// console.error — a second path that doesn't call it is invisible here, the
// same trap that once left self-registered students permanently "pending".
export function reportClientError(
  context: string,
  error: unknown,
  extra?: { weekSlug?: string; dayNumber?: number },
) {
  console.error(context, error);

  const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error);

  void fetch("/api/client-errors", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ context, message, ...extra }),
    // Keeps the request alive past a navigation — the common case right
    // after an error is the student giving up and clicking away.
    keepalive: true,
  }).catch(() => {});
}
