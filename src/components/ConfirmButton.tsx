"use client";

import { createPortal } from "react-dom";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

// Submit button that asks first. Deleting a turn-in throws away a student's
// work and makes them redo it, and removing a student can delete their account
// outright, so neither should ever be one stray click. The form itself stays a
// server component calling a server action — only the confirmation needs the
// client.
//
// The ask is an in-app dialog, not `window.confirm`: the native one is drawn by
// the browser in the operating system's own style, which lands in the middle of
// this page looking like it escaped from another program. (This is the ONLY
// are-you-sure in the app, and it's teacher-side. The student-facing games
// deliberately have none — closing a game pauses it, so nothing needs
// confirming.)
export function ConfirmButton({
  message,
  className,
  confirmLabel = "Yes, delete",
  children,
}: {
  /** Headline; anything after a blank line becomes the smaller detail text. */
  message: string;
  className?: string;
  confirmLabel?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // `true` only after hydration — createPortal needs a real document, and the
  // server render must not produce one.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  const [title, ...rest] = message.split("\n\n");
  const detail = rest.join("\n\n").trim();

  function confirm() {
    setOpen(false);
    // The dialog is portaled out of the form, so submit the form the trigger
    // still belongs to.
    triggerRef.current?.form?.requestSubmit();
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={className}
        onClick={() => setOpen(true)}
      >
        {children}
      </button>

      {mounted &&
        open &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <button
              type="button"
              aria-label="Cancel"
              tabIndex={-1}
              onClick={() => setOpen(false)}
              className="absolute inset-0 cursor-default bg-zinc-950/70 backdrop-blur-sm"
            />

            <div className="card relative w-full max-w-md p-6 shadow-[0_30px_80px_-20px_rgb(0_0_0/0.7)]">
              <p className="text-base font-semibold">{title}</p>
              {detail && (
                <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {detail}
                </p>
              )}

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  autoFocus
                  onClick={() => setOpen(false)}
                  className="btn-ghost text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirm}
                  className="inline-flex items-center justify-center rounded-xl bg-linear-to-b from-red-500 to-red-600 px-4 py-2 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.2),0_4px_14px_-4px_rgb(220_38_38/0.55)] transition-all hover:from-red-400 hover:to-red-500 active:scale-[0.98]"
                >
                  {confirmLabel}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
