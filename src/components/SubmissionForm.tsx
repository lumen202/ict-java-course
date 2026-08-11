"use client";

import { useState } from "react";
import { useTurnIn } from "@/lib/game/useTurnIn";

type Status = "idle" | "saving" | "saved" | "error";

// The day's turn-in box. Every lesson day ends here: the student pastes their
// SQL, answers, or exit ticket, and it lands on the teacher's desk under their
// name. Resubmitting overwrites — revising your answer is a feature, so the
// box stays editable after saving.
export function SubmissionForm({
  weekSlug,
  dayNumber,
  item = "day",
  label = "Your work goes here",
  placeholder = "-- Paste today's SQL and type your answers here.\n-- Comments (lines starting with --) are welcome: tell me what each part does.",
  rows = 8,
  initialContent,
  turnedInAt,
}: {
  weekSlug: string;
  dayNumber: number;
  /** Which box this is: "day" for the closing turn-in, or an activity id. */
  item?: string;
  label?: string;
  placeholder?: string;
  rows?: number;
  initialContent: string;
  turnedInAt: string | null;
}) {
  const [content, setContent] = useState(initialContent);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [savedOnce, setSavedOnce] = useState(Boolean(turnedInAt));
  const { submit: handIn, onPaste } = useTurnIn({ weekSlug, dayNumber, item });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setMessage("");
    const { ok, error } = await handIn({ content });
    if (!ok) {
      setStatus("error");
      setMessage(error ?? "Couldn't reach the server — check your connection and try again.");
      return;
    }
    setStatus("saved");
    setSavedOnce(true);
  }

  return (
    <form onSubmit={submit}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label htmlFor={`submission-${dayNumber}-${item}`} className="text-sm font-semibold">
          {label}
        </label>
        {savedOnce && (
          <span className="chip bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            ✓ Turned in
          </span>
        )}
      </div>
      <textarea
        id={`submission-${dayNumber}-${item}`}
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          if (status === "saved") setStatus("idle");
        }}
        onPaste={onPaste}
        required
        maxLength={20000}
        rows={rows}
        className="input mt-2 font-mono text-xs leading-relaxed"
        placeholder={placeholder}
      />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button type="submit" disabled={status === "saving"} className="btn-primary">
          {status === "saving"
            ? "Sending…"
            : savedOnce
              ? "Update my work"
              : "Turn in today's work"}
        </button>
        {status === "saved" && (
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
            Got it — your work is in. You can update it any time.
          </p>
        )}
        {status === "error" && (
          <p className="text-sm text-red-600 dark:text-red-400">{message}</p>
        )}
      </div>
      {item === "day" && (
        <p className="mt-3 text-xs text-zinc-500 leading-relaxed">
          Your teacher reads every one of these. It doesn&apos;t need to be perfect —
          it needs to be yours. Stuck halfway? Turn in what you have and say where
          it stopped working.
        </p>
      )}
    </form>
  );
}
