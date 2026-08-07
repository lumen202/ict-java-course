"use client";

import { useState } from "react";
import type { RowHuntGame } from "@/lib/content/types";
import { useFlowComplete } from "@/components/LessonFlow";
import { GameDoor, GameModal, GameModalHeader, GameModalBody } from "@/components/GameModal";

// "You are the database": a table on screen, a query in plain words, and the
// student answers by clicking the rows that match. After each round the same
// query is revealed as real SQL — so by the time they meet the syntax, they've
// already run it with their own hands. Result auto-saves as a turn-in.
//
// The lesson shows a door card; play happens in the full-screen modal.
// Closing the modal pauses — state is kept, the card offers "Continue".

type Phase = "intro" | "round" | "feedback" | "done";

export function RowHunt({
  weekSlug,
  dayNumber,
  game,
}: {
  weekSlug: string;
  dayNumber: number;
  game: RowHuntGame;
}) {
  const total = game.rounds.length;
  const [phase, setPhase] = useState<Phase>("intro");
  const [open, setOpen] = useState(false);
  const [roundIdx, setRoundIdx] = useState(0);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [firstTry, setFirstTry] = useState(0);
  const [triedThisRound, setTriedThisRound] = useState(false);
  const [lastCorrect, setLastCorrect] = useState(false);
  const [saved, setSaved] = useState(false);
  const flowComplete = useFlowComplete();

  const round = game.rounds[roundIdx];
  const matchSet = new Set(round?.matches ?? []);
  const playing = phase === "round" || phase === "feedback";

  function start() {
    setPhase("round");
    setRoundIdx(0);
    setSelected(new Set());
    setFirstTry(0);
    setTriedThisRound(false);
    setSaved(false);
    setOpen(true);
  }

  function toggle(i: number) {
    if (phase !== "round") return;
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  function check() {
    const correct =
      selected.size === matchSet.size && [...selected].every((i) => matchSet.has(i));
    setLastCorrect(correct);
    if (correct && !triedThisRound) setFirstTry((n) => n + 1);
    if (!correct) setTriedThisRound(true);
    setPhase("feedback");
  }

  function next() {
    if (!lastCorrect) {
      // Retry the same round with a clean selection.
      setSelected(new Set());
      setPhase("round");
      return;
    }
    const isLast = roundIdx + 1 >= total;
    if (isLast) {
      setPhase("done");
      flowComplete(game.id);
      const hits = firstTry;
      const summary = `${game.title} — completed all ${total} rounds, ${hits}/${total} right on the first click.`;
      fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weekSlug, dayNumber, item: game.id, content: summary }),
      })
        .then((r) => setSaved(r.ok))
        .catch(() => setSaved(false));
    } else {
      setRoundIdx(roundIdx + 1);
      setSelected(new Set());
      setTriedThisRound(false);
      setPhase("round");
    }
  }

  return (
    <>
      <GameDoor
        tone="violet"
        emoji="🕹️"
        title={game.title}
        intro={game.intro}
        meta={`${total} rounds · your result turns in automatically`}
        status={
          playing && !open
            ? `⏸ Paused at round ${roundIdx + 1}/${total} — jump back in.`
            : phase === "done"
              ? `🏆 Completed — ${firstTry}/${total} right on the first click.${saved ? " ✓ Turned in." : ""}`
              : null
        }
        buttonLabel={playing ? "▶ Continue" : phase === "done" ? "Play again" : "▶ Play"}
        onEnter={() => (playing ? setOpen(true) : start())}
      />

      <GameModal open={open} onClose={() => setOpen(false)} label={game.title}>
        <GameModalHeader
          title={game.title}
          right={playing ? `Round ${roundIdx + 1}/${total}` : undefined}
        />
        <GameModalBody>
          {playing && round && (
            <div>
              <p className="text-sm font-medium leading-relaxed">{round.question}</p>

              <div className="mt-3 overflow-x-auto rounded-xl border border-violet-200/80 dark:border-violet-900 bg-white/70 dark:bg-zinc-900/40">
                <table className="w-full text-left text-xs sm:text-sm">
                  <caption className="sr-only">{game.tableName}</caption>
                  <thead>
                    <tr className="border-b border-violet-200/80 dark:border-violet-900 font-mono text-[11px] uppercase tracking-wide text-zinc-500">
                      {game.columns.map((c) => (
                        <th key={c} className="px-3 py-2 font-semibold">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {game.rows.map((row, i) => {
                      const isSelected = selected.has(i);
                      const isMatch = matchSet.has(i);
                      const reveal = phase === "feedback";
                      return (
                        <tr
                          key={i}
                          onClick={() => toggle(i)}
                          aria-selected={isSelected}
                          className={`cursor-pointer border-b border-zinc-100 dark:border-zinc-800 last:border-0 transition-colors ${
                            reveal && isMatch
                              ? "bg-emerald-100/80 dark:bg-emerald-950/50"
                              : reveal && isSelected && !isMatch
                                ? "bg-red-100/80 dark:bg-red-950/40"
                                : isSelected
                                  ? "bg-violet-200/60 dark:bg-violet-900/40"
                                  : "hover:bg-violet-100/60 dark:hover:bg-violet-950/30"
                          }`}
                        >
                          {row.map((cell, j) => (
                            <td key={j} className="px-3 py-2">
                              {j === 0 && (
                                <span aria-hidden="true" className="mr-1.5">
                                  {isSelected ? "☑" : "☐"}
                                </span>
                              )}
                              {cell}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {phase === "round" && (
                <div className="mt-3 flex flex-col items-center gap-2 text-center">
                  <button type="button" onClick={check} className="btn-primary">
                    Run my query ▶
                  </button>
                  <p className="text-xs text-zinc-500">
                    Click rows to select them, then run. If NO rows match, run
                    with nothing selected.
                  </p>
                </div>
              )}

              {phase === "feedback" && (
                <div className="mt-3 rounded-xl border border-violet-200 dark:border-violet-900 bg-violet-50/60 dark:bg-violet-950/30 p-3">
                  <p className="text-sm font-semibold">
                    {lastCorrect
                      ? "✅ Exactly right — that's the result set."
                      : "❌ Not quite — the green rows are the ones that match. Look at why, then try again."}
                  </p>
                  {lastCorrect && round.sql && (
                    <pre className="mt-2 overflow-x-auto rounded-lg bg-zinc-900/[0.06] dark:bg-white/10 p-3 font-mono text-xs whitespace-pre-wrap break-words">
                      {round.sql}
                    </pre>
                  )}
                  {lastCorrect && round.explain && (
                    <p className="mt-2 text-sm leading-relaxed">{round.explain}</p>
                  )}
                  <div className="mt-3 text-center">
                    <button type="button" onClick={next} className="btn-primary">
                      {lastCorrect
                        ? roundIdx + 1 >= total
                          ? "Finish"
                          : "Next round →"
                        : "Try again"}
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
                You just ran {total} queries — with your eyes.
              </p>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {firstTry}/{total} right on the first click. From tomorrow, MySQL
                does the scanning for you — millions of rows, no sweat.
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                <button type="button" onClick={start} className="btn-primary">
                  Play again
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
