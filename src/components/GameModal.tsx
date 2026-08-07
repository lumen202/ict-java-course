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
// Clicking the backdrop deliberately does NOT close it, and closing (✕ or
// Escape) must always mean PAUSE, never reset: the game keeps its state and
// its door card offers "continue". That contract is what lets us have no
// are-you-sure dialog at all — closing is always safe.
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

const DOOR_TONES = {
  violet:
    "border-violet-300/80 from-violet-50/95 to-fuchsia-50/60 dark:border-violet-800/80 dark:from-violet-950/40 dark:to-fuchsia-950/20",
  teal: "border-teal-300/80 from-teal-50/95 to-emerald-50/60 dark:border-teal-800/80 dark:from-teal-950/40 dark:to-emerald-950/20",
  indigo:
    "border-indigo-300/80 from-indigo-50/95 to-blue-50/60 dark:border-indigo-800/80 dark:from-indigo-950/40 dark:to-blue-950/20",
  slate:
    "border-slate-300/80 from-slate-50/95 to-zinc-50/60 dark:border-slate-700/80 dark:from-slate-900/60 dark:to-zinc-900/40",
  rose: "border-rose-300/80 from-rose-50/95 to-pink-50/60 dark:border-rose-800/80 dark:from-rose-950/40 dark:to-pink-950/20",
  amber:
    "border-amber-300/80 from-amber-50/95 to-orange-50/60 dark:border-amber-800/80 dark:from-amber-950/40 dark:to-orange-950/20",
  sky: "border-sky-300/80 from-sky-50/95 to-cyan-50/60 dark:border-sky-800/80 dark:from-sky-950/40 dark:to-cyan-950/20",
} as const;

export type DoorTone = keyof typeof DOOR_TONES;

/**
 * The compact card a game shows on the lesson timeline — the door to its
 * modal. Shows the pitch (or, mid-game, the live status) and one button.
 */
export function GameDoor({
  tone,
  emoji,
  title,
  intro,
  meta,
  status,
  buttonLabel,
  onEnter,
}: {
  tone: DoorTone;
  emoji: string;
  title: string;
  intro: string;
  /** Small line under the intro: "6 rounds · results turn in automatically". */
  meta?: string;
  /** Live status once started/finished — replaces nothing, shown highlighted. */
  status?: string | null;
  buttonLabel: string;
  onEnter: () => void;
}) {
  return (
    <div className={`rounded-2xl border bg-linear-to-br p-5 text-center ${DOOR_TONES[tone]}`}>
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-3 text-6xl" aria-hidden="true">
        {emoji}
      </p>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        {intro}
      </p>
      {meta && <p className="mt-2 text-xs text-zinc-500">{meta}</p>}
      {status && (
        <p className="mx-auto mt-3 max-w-md rounded-xl border border-zinc-300/70 dark:border-zinc-700 bg-white/70 dark:bg-zinc-900/40 p-2.5 text-sm font-medium">
          {status}
        </p>
      )}
      <button type="button" onClick={onEnter} className="btn-primary mt-4">
        {buttonLabel}
      </button>
    </div>
  );
}

/** Pinned dark header strip inside the modal: title left, progress right. */
export function GameModalHeader({
  title,
  right,
}: {
  title: string;
  right?: string;
}) {
  return (
    <div className="shrink-0 bg-zinc-950 p-4 pr-12 text-white">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-bold tracking-wide">{title}</p>
        {right && <p className="text-xs font-medium text-zinc-400">{right}</p>}
      </div>
    </div>
  );
}

/** The scrollable body under the header. */
export function GameModalBody({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-white p-5 dark:bg-zinc-900">{children}</div>
  );
}
