"use client";

import { useState } from "react";
import type { OrderGame as OrderGameData } from "@/lib/content/types";
import { useTurnIn } from "@/lib/game/useTurnIn";
import { GameDoor, GameModal, GameModalHeader, GameModalBody } from "@/components/GameModal";

// Arrange-the-lines: shuffled SQL statements (or the lines of one statement)
// are clicked into the right order. Click a line in the pool to place it;
// click a placed line to send it back. Teaches sequence and structure — a
// .sql file's order, a query's clause order — which no fill-in-the-blank can.
// Result auto-saves as a turn-in under the game's id.
//
// The lesson shows a door card; play happens in the full-screen modal.
// Closing the modal pauses — state is kept, the card offers "Continue".

type Phase = "intro" | "round" | "cleared" | "done";

function shuffled(n: number): number[] {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  // Never hand out the already-solved order.
  return n > 1 && a.every((v, i) => v === i) ? shuffled(n) : a;
}

export function OrderGame({
  weekSlug,
  dayNumber,
  game,
}: {
  weekSlug: string;
  dayNumber: number;
  game: OrderGameData;
}) {
  const total = game.rounds.length;
  const [phase, setPhase] = useState<Phase>("intro");
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const [pool, setPool] = useState<number[]>([]);
  const [placed, setPlaced] = useState<number[]>([]);
  const [wrongAt, setWrongAt] = useState<Set<number>>(new Set());
  const [checked, setChecked] = useState(false);
  const [missedThisRound, setMissedThisRound] = useState(false);
  const [firstTry, setFirstTry] = useState(0);
  const { submit, saved } = useTurnIn({ weekSlug, dayNumber, item: game.id });

  const round = game.rounds[idx];
  const playing = phase === "round" || phase === "cleared";

  function initRound(i: number) {
    setIdx(i);
    setPool(shuffled(game.rounds[i].lines.length));
    setPlaced([]);
    setWrongAt(new Set());
    setChecked(false);
    setMissedThisRound(false);
    setPhase("round");
  }

  function start() {
    setFirstTry(0);
    initRound(0);
    setOpen(true);
  }

  function place(line: number) {
    setPool((p) => p.filter((x) => x !== line));
    setPlaced((p) => [...p, line]);
    setWrongAt(new Set());
    setChecked(false);
  }

  function unplace(line: number) {
    setPlaced((p) => p.filter((x) => x !== line));
    setPool((p) => [...p, line]);
    setWrongAt(new Set());
    setChecked(false);
  }

  function check() {
    const wrong = new Set<number>();
    placed.forEach((line, pos) => {
      if (line !== pos) wrong.add(pos);
    });
    if (wrong.size === 0) {
      if (!missedThisRound) setFirstTry((n) => n + 1);
      setPhase("cleared");
    } else {
      setWrongAt(wrong);
      setChecked(true);
      setMissedThisRound(true);
    }
  }

  function next() {
    if (idx + 1 >= total) {
      setPhase("done");
      void submit({ content: `${game.title} — assembled all ${total} rounds, ${firstTry}/${total} right on the first try.` });
    } else {
      initRound(idx + 1);
    }
  }

  return (
    <>
      <GameDoor
        tone="rose"
        emoji="🧩"
        title={game.title}
        intro={game.intro}
        meta={`${total} builds · your result turns in automatically`}
        status={
          playing && !open
            ? `⏸ Paused at round ${idx + 1}/${total} — the pieces are waiting.`
            : phase === "done"
              ? `🏆 Completed — ${firstTry}/${total} right on the first try.${saved ? " ✓ Turned in." : ""}`
              : null
        }
        buttonLabel={playing ? "▶ Continue" : phase === "done" ? "Build them again" : "▶ Start building"}
        onEnter={() => (playing ? setOpen(true) : start())}
      />

      <GameModal open={open} onClose={() => setOpen(false)} label={game.title}>
        <GameModalHeader
          title={game.title}
          right={playing ? `Round ${idx + 1}/${total}` : undefined}
        />
        <GameModalBody>
          {playing && round && (
            <div>
              <p className="text-sm font-medium leading-relaxed">{round.prompt}</p>

              {/* Where the lines go */}
              <div className="mt-3 rounded-xl border border-rose-200/80 dark:border-rose-900 bg-rose-50/40 dark:bg-zinc-900/40 p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  Your build{phase === "round" ? " — click a placed line to take it back out" : ""}
                </p>
                {placed.length === 0 ? (
                  <p className="mt-2 font-mono text-xs italic text-zinc-400 dark:text-zinc-600">
                    (empty — place the first line)
                  </p>
                ) : (
                  <ol className="mt-2 space-y-1">
                    {placed.map((line, pos) => (
                      <li key={line}>
                        <button
                          type="button"
                          disabled={phase !== "round"}
                          onClick={() => unplace(line)}
                          className={`w-full rounded-lg border px-2.5 py-1.5 text-left font-mono text-xs leading-relaxed whitespace-pre-wrap transition-colors disabled:pointer-events-none ${
                            checked && wrongAt.has(pos)
                              ? "border-red-400 bg-red-50 dark:bg-red-950/30"
                              : checked || phase === "cleared"
                                ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30"
                                : "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-rose-400"
                          }`}
                        >
                          <span className="mr-2 select-none text-zinc-400">{pos + 1}</span>
                          {round.lines[line]}
                        </button>
                      </li>
                    ))}
                  </ol>
                )}
              </div>

              {/* The pool */}
              {phase === "round" && pool.length > 0 && (
                <div className="mt-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    Pieces — click to place
                  </p>
                  <ul className="mt-2 space-y-1">
                    {pool.map((line) => (
                      <li key={line}>
                        <button
                          type="button"
                          onClick={() => place(line)}
                          className="w-full rounded-lg border border-dashed border-rose-300 dark:border-rose-800 bg-white/80 dark:bg-zinc-900/60 px-2.5 py-1.5 text-left font-mono text-xs leading-relaxed whitespace-pre-wrap transition-colors hover:border-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        >
                          {round.lines[line]}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {phase === "round" && pool.length === 0 && (
                <div className="mt-3 text-center">
                  <button type="button" onClick={check} className="btn-primary">
                    Run it ▶
                  </button>
                  {checked && wrongAt.size > 0 && (
                    <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                      The red lines are in the wrong place — click them out and
                      rebuild. Think about what each line NEEDS before it can run.
                    </p>
                  )}
                </div>
              )}

              {phase === "cleared" && (
                <div className="mt-3 rounded-xl border border-emerald-300 dark:border-emerald-900 bg-emerald-50/70 dark:bg-emerald-950/30 p-3">
                  <p className="text-sm font-semibold">✅ Runs top to bottom, no errors.</p>
                  {round.explain && <p className="mt-1 text-sm leading-relaxed">{round.explain}</p>}
                  <div className="mt-3 text-center">
                    <button type="button" onClick={next} className="btn-primary">
                      {idx + 1 >= total ? "Finish 🏁" : "Next round →"}
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
                {total} builds, assembled in the right order.
              </p>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {firstTry}/{total} right on the first try. Order is half of SQL —
                files run top to bottom, and clauses have their places.
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                <button type="button" onClick={start} className="btn-primary">
                  Build them again
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
