"use client";

import { useFormStatus } from "react-dom";

// A submit button that says what it's doing while the Server Action runs.
//
// Server Actions that end in redirect() are the worst offenders for feeling
// broken: the click does nothing visible until the whole round-trip finishes
// and the new page renders. useFormStatus is the only way to know — it reads
// the pending state of the nearest enclosing <form>, which is why this has to
// be a separate client component from the form itself.
export function PendingButton({
  children,
  pendingLabel,
  className,
  title,
}: {
  children: React.ReactNode;
  /** Replaces the label while the action runs. Keep it a verb: "Switching…". */
  pendingLabel: string;
  className?: string;
  title?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className={className} title={title}>
      {pending ? (
        <span className="inline-flex items-center gap-1.5">
          <Spinner />
          {pendingLabel}
        </span>
      ) : (
        children
      )}
    </button>
  );
}

/** Inline spinner sized to the surrounding text. */
export function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-3 w-3 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70"
    />
  );
}
