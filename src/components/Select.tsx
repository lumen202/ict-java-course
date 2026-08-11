"use client";

import { useEffect, useRef, useState } from "react";

export type SelectOption = { value: string; label: string };

// Replaces the browser's native <select> popup, which renders in OS chrome no
// CSS can reach — plain, system-styled, and visibly foreign against the
// rest of the app's rounded, backdrop-blurred, emerald-accented UI. A real
// hidden <input type="hidden"> carries the value, so this still participates
// in native form submission exactly like a <select> would — a GET form's
// query string (the day picker) or FormData read by a Server Action (the
// per-student unlock form) — only the popup's presentation is custom.
export function Select({
  name,
  options,
  value: controlledValue,
  defaultValue,
  onChange,
  ariaLabel,
  className = "",
  maxWidthClassName = "max-w-xs",
}: {
  /** Omit for a controlled picker (pass `value`/`onChange`) that isn't part of a form. */
  name?: string;
  options: SelectOption[];
  /** Controlled mode: parent owns the value, e.g. to navigate on change. */
  value?: string;
  /** Uncontrolled mode (the default): starting value, read from the form on submit. */
  defaultValue?: string;
  onChange?: (value: string) => void;
  ariaLabel?: string;
  className?: string;
  /**
   * Caps the closed trigger's width so a long label truncates instead of
   * stretching the layout — `truncate` only clips text once its box has a
   * bound, and `w-auto` alone gives it none. A dedicated prop rather than
   * folding into `className`: two width utilities in one class string race
   * for the same CSS layer, and which one wins isn't something to rely on.
   * Pass a wider value (e.g. "max-w-full sm:max-w-xl") for pickers with long
   * option text.
   */
  maxWidthClassName?: string;
}) {
  const [internalValue, setInternalValue] = useState(
    defaultValue ?? controlledValue ?? options[0]?.value ?? "",
  );
  const value = controlledValue ?? internalValue;
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(0, options.findIndex((o) => o.value === value)),
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selected = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    listRef.current?.focus();
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  function choose(i: number) {
    const next = options[i].value;
    if (controlledValue === undefined) setInternalValue(next);
    setActiveIndex(i);
    setOpen(false);
    buttonRef.current?.focus();
    onChange?.(next);
  }

  return (
    <div ref={rootRef} className="relative inline-block">
      <input type="hidden" name={name} value={value} />
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className={`input flex items-center justify-between gap-2 text-left ${maxWidthClassName} ${className}`}
      >
        <span className="truncate">{selected?.label}</span>
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M5.5 7.5l4.5 4.5 4.5-4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open && (
        <ul
          ref={listRef}
          role="listbox"
          tabIndex={-1}
          aria-label={ariaLabel}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActiveIndex((i) => Math.min(options.length - 1, i + 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveIndex((i) => Math.max(0, i - 1));
            } else if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              choose(activeIndex);
            } else if (e.key === "Escape") {
              e.preventDefault();
              setOpen(false);
              buttonRef.current?.focus();
            }
          }}
          className="absolute z-20 mt-1.5 max-h-64 w-full min-w-max overflow-auto rounded-xl border border-zinc-200/90 bg-white/95 p-1 shadow-[0_1px_2px_rgb(0_0_0/0.03),0_16px_40px_-14px_rgb(0_0_0/0.25)] backdrop-blur-sm focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/95"
        >
          {options.map((o, i) => (
            <li
              key={o.value}
              role="option"
              aria-selected={o.value === value}
              onMouseEnter={() => setActiveIndex(i)}
              onClick={() => choose(i)}
              className={`cursor-pointer rounded-lg px-3 py-2 text-sm transition-colors ${
                i === activeIndex
                  ? "bg-emerald-500/15 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300"
                  : "text-zinc-700 dark:text-zinc-300"
              } ${o.value === value ? "font-semibold" : ""}`}
            >
              {o.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
