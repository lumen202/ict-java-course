"use client";

import { useState } from "react";
import type { TypingGame as TypingGameData } from "@/lib/content/types";
import { useTurnIn } from "@/lib/game/useTurnIn";
import { answersMatch } from "@/lib/game/answerMatch";
import { GameDoor, GameModal, GameModalHeader, GameModalBody } from "@/components/GameModal";

// Fill-in-the-blank SQL typing game. Each round shows a goal in words and the
// command with holes in it; the student types the missing pieces. Later rounds
// are one big blank — the whole command from memory. Typing is the point:
// watching a video builds recognition, typing builds recall.
//
// Matching is forgiving (case-insensitive, extra spaces collapsed) but honest —
// a missing semicolon is a miss, because it's a miss in Workbench too.
//
// The lesson shows a door card; play happens in the full-screen modal.
// Closing the modal pauses — state is kept, the card offers "Continue".

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

// What counts as the same command lives in @/lib/game/answerMatch, so it can be
// tested without a DOM — see BUG-021, where a stricter rule here made a correct
// answer unpassable.

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
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const [typed, setTyped] = useState<string[]>([]);
  const [wrongBlanks, setWrongBlanks] = useState<Set<number>>(new Set());
  const [missedThisRound, setMissedThisRound] = useState(false);
  const [firstTry, setFirstTry] = useState(0);
  const { submit, saved } = useTurnIn({ weekSlug, dayNumber, item: game.id });

  const round = game.rounds[idx];
  const segments = round ? parseTemplate(round.template) : [];
  const blanks = segments.filter((s): s is { blank: string; bi: number } => "blank" in s);
  const playing = phase === "round" || phase === "cleared";

  function start() {
    setPhase("round");
    setIdx(0);
    setTyped([]);
    setWrongBlanks(new Set());
    setMissedThisRound(false);
    setFirstTry(0);
    setOpen(true);
  }

  function check(e: React.FormEvent) {
    e.preventDefault();
    const wrong = new Set<number>();
    blanks.forEach((b, i) => {
      if (!answersMatch(typed[i] ?? "", b.blank)) wrong.add(i);
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
      const hits = firstTry;
      void submit({ content: `${game.title} — typed all ${total} commands, ${hits}/${total} right on the first try.` });
    } else {
      setIdx(idx + 1);
      setPhase("round");
    }
  }

  // The full, correct command — shown once the round is cleared.
  const solved = segments.map((s) => ("blank" in s ? s.blank : s.text)).join("");

  return (
    <>
      <GameDoor
        tone="teal"
        emoji="⌨️"
        title={game.title}
        intro={game.intro}
        meta={`${total} commands · your result turns in automatically`}
        status={
          playing && !open
            ? `⏸ Paused at ${idx + 1}/${total} — your keyboard misses you.`
            : phase === "done"
              ? `🏆 Completed — ${firstTry}/${total} right on the first try.${saved ? " ✓ Turned in." : ""}`
              : null
        }
        buttonLabel={playing ? "▶ Continue" : phase === "done" ? "Type them again" : "▶ Start typing"}
        onEnter={() => (playing ? setOpen(true) : start())}
      />

      <GameModal open={open} onClose={() => setOpen(false)} label={game.title}>
        <GameModalHeader
          title={game.title}
          right={playing ? `${idx + 1}/${total}` : undefined}
        />
        <GameModalBody>
          {playing && round && (
            <div>
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
                <div className="mt-3 rounded-xl border border-teal-200 dark:border-teal-900 bg-teal-50/60 dark:bg-teal-950/30 p-3">
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
            <div className="text-center">
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
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                <button type="button" onClick={start} className="btn-primary">
                  Type them again
                </button>
                <button type="button" onClick={() => setOpen(false)} className="btn-ghost">
                  Back to the lesson
                </button>
              </div>
              <p className="mt-3 text-xs text-zinc-500" aria-live="polite">
                {saved
                  ? "✓ Result turned in — replaying updates it."
                  : "Result will be turned in automatically when saving succeeds."}
              </p>
            </div>
          )}
        </GameModalBody>
      </GameModal>
    </>
  );
}
