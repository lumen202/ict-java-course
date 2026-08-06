"use client";

import { useState } from "react";
import Link from "next/link";

type Status = "idle" | "sending" | "done" | "error";
type Confidence = 1 | 2 | 3;

export type HelpLink = { label: string; url: string };

// End-of-week self-check. Its first job is the student's own learning: naming
// what you can do, where you stuck, and what you'll do about it is the part
// that makes the week stick — and on submit they get concrete next steps back
// rather than a promise that someone will explain it later.
//
// The teacher reads these to supervise (who's stuck, on what), not as a queue
// of things to re-teach. Copy here should never imply "wait for the teacher".

const LEVELS: { value: Confidence; label: string; hint: string }[] = [
  { value: 1, label: "Not yet", hint: "I couldn't finish it on my own" },
  { value: 2, label: "Getting there", hint: "It works, but I'd struggle to redo it" },
  { value: 3, label: "Solid", hint: "I could do it again from scratch" },
];

const ADVICE: Record<Confidence, { title: string; steps: string[] }> = {
  1: {
    title: "Here's your plan for getting unstuck",
    steps: [
      "Go back to the day you got stuck on and redo just that day's practice — don't restart the week.",
      "Try the reading track for the same material; a second explanation often lands where the first didn't.",
      "Retype the example instead of copying it, and read each error message out loud before fixing it.",
    ],
  },
  2: {
    title: "You're closer than you think",
    steps: [
      "Delete your work and rebuild it from a blank file. If you can do it twice, you know it.",
      "Cover the answers on the self-check above and try them again tomorrow, not today.",
      "Write one sentence explaining the hardest step to yourself — if you can't, that's the bit to redo.",
    ],
  },
  3: {
    title: "Nice — push it further",
    steps: [
      "Change the twist: add another column or another query and predict the result before running it.",
      "Explain this week's idea to a classmate. Teaching it is the fastest way to find your own gaps.",
      "Peek at the next unit in the outline so you know what this is building toward.",
    ],
  },
};

export function ReflectionForm({
  weekSlug,
  studentName,
  helpLinks = [],
}: {
  weekSlug: string;
  studentName: string;
  helpLinks?: HelpLink[];
}) {
  const [confidence, setConfidence] = useState<Confidence | null>(null);
  const [stuck, setStuck] = useState("");
  const [next, setNext] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!confidence) {
      setStatus("error");
      setMessage("Pick where you're at first.");
      return;
    }
    setStatus("sending");
    setMessage("");
    try {
      const res = await fetch("/api/reflections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekSlug,
          confidence,
          hardestPart: stuck,
          wantExplained: next,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong — try again.");
        return;
      }
      setStatus("done");
    } catch {
      setStatus("error");
      setMessage("Couldn't reach the server — check your connection and try again.");
    }
  }

  if (status === "done" && confidence) {
    const advice = ADVICE[confidence];
    return (
      <div className="card-accent p-5">
        <p className="font-semibold">{advice.title}</p>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed">
          {advice.steps.map((s) => (
            <li key={s} className="flex gap-2">
              <span aria-hidden="true">→</span>
              <span>{s}</span>
            </li>
          ))}
        </ul>
        {helpLinks.length > 0 && confidence < 3 && (
          <div className="mt-4 border-t border-emerald-200 dark:border-emerald-900 pt-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
              Start here
            </p>
            <ul className="mt-2 space-y-1">
              {helpLinks.map((l) => (
                <li key={l.url}>
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    {l.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        <p className="mt-4 text-xs text-zinc-600 dark:text-zinc-400">
          Saved to your record, {studentName}.
        </p>
      </div>
    );
  }

  const inputCls =
    "input";

  return (
    <form onSubmit={submit} className="space-y-5">
      <fieldset>
        <legend className="text-sm font-medium mb-2">
          Could you do this week&apos;s work again on your own?
        </legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {LEVELS.map((l) => (
            <button
              key={l.value}
              type="button"
              onClick={() => setConfidence(l.value)}
              aria-pressed={confidence === l.value}
              className={`rounded-xl border p-3 text-left transition-all ${
                confidence === l.value
                  ? "border-emerald-500 bg-emerald-50 shadow-[0_4px_14px_-6px_rgb(16_185_129/0.5)] dark:bg-emerald-950/40"
                  : "border-zinc-200 bg-white/60 hover:border-emerald-400 dark:border-zinc-800 dark:bg-zinc-900/40"
              }`}
            >
              <span className="block text-sm font-medium">{l.label}</span>
              <span className="block text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {l.hint}
              </span>
            </button>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="rf-stuck" className="block text-sm font-medium mb-1">
          Where did you get stuck, and what did you try?
        </label>
        <textarea
          id="rf-stuck"
          value={stuck}
          onChange={(e) => setStuck(e.target.value)}
          required
          maxLength={2000}
          rows={3}
          className={inputCls}
          placeholder="Naming it precisely is half of fixing it — 'the INSERT kept failing until I quoted the text' beats 'it was hard'."
        />
      </div>

      <div>
        <label htmlFor="rf-next" className="block text-sm font-medium mb-1">
          What will you redo or practise before next week? (optional)
        </label>
        <textarea
          id="rf-next"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          maxLength={2000}
          rows={2}
          className={inputCls}
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {message}{" "}
          {message.includes("sign in") && (
            <Link href="/login" className="underline">
              Sign in
            </Link>
          )}
        </p>
      )}

      <button type="submit" disabled={status === "sending"} className="btn-primary">
        {status === "sending" ? "Saving…" : "Save and see my next steps"}
      </button>
    </form>
  );
}
