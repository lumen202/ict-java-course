"use client";

import { createPortal } from "react-dom";
import { useEffect, useSyncExternalStore } from "react";

// Full-screen shell for a mini-game, so a long game (a 12-question battle, a
// table plus rounds) doesn't depend on how tall the lesson page is. The panel
// is capped at the viewport and scrolls internally, so the game's own header
// (boss, HP, hearts) can stay pinned while the questions move.
//
// Rendered through a portal to document.body: several cards in the lesson use
// backdrop-blur, and a blurred ancestor becomes the containing block for
// `fixed` children — which would trap the overlay inside the card.
//
// Clicking the backdrop deliberately does NOT close it. Losing a battle to a
// stray click would be worse than one extra press on ✕.
export function GameModal({
  open,
  onClose,
  label,
  children,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  children: React.ReactNode;
}) {
  // `true` only after hydration — createPortal needs a real document, and the
  // server render must not produce one. useSyncExternalStore rather than
  // setState-in-an-effect, which the react-hooks lint rules reject.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
    >
      <div aria-hidden="true" className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm" />
      <div className="relative flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-violet-800/60 shadow-[0_30px_80px_-20px_rgb(0_0_0/0.7)]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full border border-white/15 bg-black/40 text-sm text-zinc-300 transition-colors hover:bg-black/70 hover:text-white"
        >
          ✕
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
}
