"use client";

import { useState } from "react";
import type { TypingGame as TypingGameData } from "@/lib/content/types";
import { useFlowComplete } from "@/components/LessonFlow";

// Fill-in-the-blank SQL typing game. Each round shows a goal in words and the
// command with holes in it; the student types the missing pieces. Later rounds
// are one big blank — the whole command from memory. Typing is the point:
// watching a video builds recognition, typing builds recall.
//
// Matching is forgiving (case-insensitive, extra spaces collapsed) but honest —
// a missing semicolon is a miss, because it's a miss in Workbench too.

type Phase = "intro" | "round" | "cleared" | "done";

type Segment = { text: string } | { blank: string; bi: number };

/** "CREATE {DATABASE} school;" → [text "CREATE ", blank#0 "DATABASE", text " school;"] */
function parseTemplate(template: string): Segment[] {
  const segments: Segment[] = [];
  let bi = 0;
  template.split(/\{([^}]*)\}/).forEach((part, i) => {
    if (i % 2 === 1) segments.push({ blank: part, bi: bi++ });
    else if (part.length > 0) segments.push({ text: part });
  });
  return segments;
}

function normalize(s: string): string {
  return s.trim().replace(/\s+/g, " ").toLowerCase();
}

export function TypingGame({
  weekSlug,
  dayNumber,
  game,
}: {
  weekSlug: string;
  dayNumber: number;
  game: TypingGameData;
}) {
  const total = game.rounds.length;
  const [phase, setPhase] = useState<Phase>("intro");
  const [idx, setIdx] = useState(0);
  const [typed, setTyped] = useState<string[]>([]);
  const [wrongBlanks, setWrongBlanks] = useState<Set<number>>(new Set());
  const [missedThisRound, setMissedThisRound] = useState(false);
  const [firstTry, setFirstTry] = useState(0);
  const [saved, setSaved] = useState(false);
  const flowComplete = useFlowComplete();

  const round = game.rounds[idx];
  const segments = round ? parseTemplate(round.template) : [];
  const blanks = segments.filter((s): s is { blank: string; bi: number } => "blank" in s);

  function start() {
    setPhase("round");
    setIdx(0);
    setTyped([]);
    setWrongBlanks(new Set());
    setMissedThisRound(false);
    setFirstTry(0);
    setSaved(false);
  }

  function check(e: React.FormEvent) {
    e.preventDefault();
    const wrong = new Set<number>();
    blanks.forEach((b, i) => {
      if (normalize(typed[i] ?? "") !== normalize(b.blank)) wrong.add(i);
    });
    if (wrong.size === 0) {
      if (!missedThisRound) setFirstTry((n) => n + 1);
      setWrongBlanks(new Set());
      setPhase("cleared");
    } else {
      setWrongBlanks(wrong);
      setMissedThisRound(true);
    }
  }

  function next() {
    setTyped([]);
    setWrongBlanks(new Set());
    setMissedThisRound(false);
    if (idx + 1 >= total) {
      setPhase("done");
      flowComplete(game.id);
      const hits = firstTry;
      const summary = `${game.title} — typed all ${total} commands, ${hits}/${total} right on the first try.`;
      fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weekSlug, dayNumber, item: game.id, content: summary }),
      })
        .then((r) => setSaved(r.ok))
        .catch(() => setSaved(false));
    } else {
      setIdx(idx + 1);
      setPhase("round");
    }
  }

  // The full, correct command — shown once the round is cleared.
  const solved = segments.map((s) => ("blank" in s ? s.blank : s.text)).join("");

  return (
    <div className="rounded-2xl border border-teal-300/80 bg-linear-to-br from-teal-50/95 to-emerald-50/60 dark:border-teal-800/80 dark:from-teal-950/40 dark:to-emerald-950/20 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold">{game.title}</p>
        {phase !== "intro" && phase !== "done" && (
          <p className="text-xs font-medium text-zinc-500">
            {idx + 1}/{total}
          </p>
        )}
      </div>

      {phase === "intro" && (
        <div className="mt-3 text-center">
          <p className="text-center text-6xl" aria-hidden="true">
            ⌨️
          </p>
          <p className="mt-3 text-sm leading-relaxed">{game.intro}</p>
          <button type="button" onClick={start} className="btn-primary mt-4">
            ▶ Start typing
          </button>
        </div>
      )}

      {(phase === "round" || phase === "cleared") && round && (
        <div className="mt-4">
          <p className="text-sm font-medium leading-relaxed">{round.prompt}</p>

          {phase === "round" && (
            <form onSubmit={check}>
              <div className="mt-3 flex flex-wrap items-center gap-y-2 rounded-xl bg-zinc-900/[0.06] dark:bg-white/10 p-3 font-mono text-sm">
                {segments.map((s, si) => {
                  if ("text" in s) {
                    return (
                      <span key={si} className="whitespace-pre-wrap">
                        {s.text}
                      </span>
                    );
                  }
                  const { bi } = s;
                  return (
                    <input
                      key={si}
                      value={typed[bi] ?? ""}
                      onChange={(e) =>
                        setTyped((t) => {
                          const nextTyped = [...t];
                          nextTyped[bi] = e.target.value;
                          return nextTyped;
                        })
                      }
                      autoComplete="off"
                      autoCapitalize="off"
                      spellCheck={false}
                      aria-label={`Missing part ${bi + 1}`}
                      style={{ width: `${Math.max(6, s.blank.length + 2)}ch` }}
                      className={`mx-1 rounded-lg border bg-white/90 dark:bg-zinc-900/90 px-2 py-1 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40 ${
                        wrongBlanks.has(bi)
                          ? "border-red-400 text-red-700 dark:text-red-400"
                          : "border-teal-300 dark:border-teal-800"
                      }`}
                    />
                  );
                })}
              </div>
              {wrongBlanks.size > 0 && (
                <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                  The red box isn&apos;t right yet — check the spelling, and don&apos;t
                  forget SQL statements end with a semicolon.
                </p>
              )}
              <div className="mt-3 text-center">
                <button type="submit" className="btn-primary">
                  Run ▶
                </button>
              </div>
            </form>
          )}

          {phase === "cleared" && (
            <div className="mt-3 rounded-xl border border-teal-200 dark:border-teal-900 bg-white/70 dark:bg-zinc-900/40 p-3">
              <p className="text-sm font-semibold">✅ Query OK</p>
              <pre className="mt-2 overflow-x-auto rounded-lg bg-emerald-50 dark:bg-emerald-950/40 p-3 font-mono text-xs whitespace-pre-wrap break-words">
                {solved}
              </pre>
              {round.explain && (
                <p className="mt-2 text-sm leading-relaxed">{round.explain}</p>
              )}
              <div className="mt-3 text-center">
                <button type="button" onClick={next} className="btn-primary">
                  {idx + 1 >= total ? "Finish 🏁" : "Next →"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {phase === "done" && (
        <div className="mt-3 text-center">
          <p className="text-6xl" aria-hidden="true">
            🏆
          </p>
          <p className="mt-3 text-base font-semibold">
            {total} commands, typed with your own hands.
          </p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {firstTry}/{total} right on the first try. This is exactly what your
            fingers will do in Workbench — now without looking anything up.
          </p>
          <button type="button" onClick={start} className="btn-ghost mt-4">
            Type them again
          </button>
          <p className="mt-3 text-xs text-zinc-500" aria-live="polite">
            {saved
              ? "✓ Result turned in — replaying updates it."
              : "Result will be turned in automatically when saving succeeds."}
          </p>
        </div>
      )}
    </div>
  );
}
