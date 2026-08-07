"use client";

import { useState } from "react";
import type { SqlConsoleGame } from "@/lib/content/types";
import { useFlowComplete } from "@/components/LessonFlow";
import { GameDoor, GameModal, GameModalHeader, GameModalBody } from "@/components/GameModal";
import {
  createState,
  cloneState,
  runBatch,
  statesEqual,
  resultsEqual,
  type MiniState,
  type BatchRun,
} from "@/lib/minisql";

// The in-page mini DB Fiddle: a real (tiny) MySQL engine runs whatever the
// student types and answers with a result grid or a genuine MySQL-style
// error. Tasks are judged by EFFECT — run the student's script, run the
// canonical solution against the same starting state, compare what happened —
// so any correct spelling clears the task, and "break it on purpose" tasks
// clear by hitting the same error the solution hits.
//
// The engine state persists across tasks (create a database in task 1, build
// a table inside it in task 2), which is what makes it feel like a server and
// not a quiz. Result auto-saves as a turn-in under the game's id.
//
// The lesson shows a door card; the console lives in the full-screen modal.
// Closing the modal pauses — server state is kept, the card offers "Continue".

type Phase = "intro" | "task" | "cleared" | "done";

export function SqlConsole({
  weekSlug,
  dayNumber,
  game,
}: {
  weekSlug: string;
  dayNumber: number;
  game: SqlConsoleGame;
}) {
  const total = game.tasks.length;
  const [phase, setPhase] = useState<Phase>("intro");
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState("");
  const [run, setRun] = useState<BatchRun | null>(null);
  const [matched, setMatched] = useState(false);
  const [missesThisTask, setMissesThisTask] = useState(0);
  const [firstTry, setFirstTry] = useState(0);
  const [saved, setSaved] = useState(false);
  // The engine is immutable-by-convention in React state: each run works on a
  // clone, which only replaces the live state when the task is cleared — so a
  // wrong run (a bad table, a stray insert) rolls back for free and the task
  // stays winnable.
  const [engine, setEngine] = useState<MiniState>(() => createState(game.setup));
  const flowComplete = useFlowComplete();

  const task = game.tasks[idx];
  const playing = phase === "task" || phase === "cleared";

  function start() {
    setEngine(createState(game.setup));
    setPhase("task");
    setIdx(0);
    setText("");
    setRun(null);
    setMatched(false);
    setMissesThisTask(0);
    setFirstTry(0);
    setSaved(false);
    setOpen(true);
  }

  function execute() {
    if (!task || !text.trim()) return;
    const work = cloneState(engine);
    const batch = runBatch(work, text);
    setRun(batch);

    // Judge by effect: same end state, same result (or same error) as the
    // solution applied to the same starting point.
    const solState = cloneState(engine);
    const sol = runBatch(solState, task.solution);
    const ok = sol.error
      ? batch.error?.code === sol.error.code && statesEqual(work, solState)
      : !batch.error && statesEqual(work, solState) && resultsEqual(batch.result, sol.result);

    if (ok) {
      setEngine(work);
      if (missesThisTask === 0) setFirstTry((n) => n + 1);
      setMatched(true);
      setPhase("cleared");
    } else {
      setMissesThisTask((n) => n + 1);
    }
  }

  function next() {
    setText("");
    setRun(null);
    setMatched(false);
    setMissesThisTask(0);
    if (idx + 1 >= total) {
      setPhase("done");
      flowComplete(game.id);
      const finalSummary = `${game.title} — ran all ${total} tasks on the mini server, ${firstTry}/${total} on the first run.`;
      fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weekSlug, dayNumber, item: game.id, content: finalSummary }),
      })
        .then((r) => setSaved(r.ok))
        .catch(() => setSaved(false));
    } else {
      setIdx(idx + 1);
      setPhase("task");
    }
  }

  return (
    <>
      <GameDoor
        tone="indigo"
        emoji="🖥️"
        title={game.title}
        intro={game.intro}
        meta={`${total} tasks on a real (tiny) MySQL — nothing here can break · turns in automatically`}
        status={
          playing && !open
            ? `⏸ Paused at task ${idx + 1}/${total} — the server kept your work.`
            : phase === "done"
              ? `🏆 Completed — ${firstTry}/${total} on the first run.${saved ? " ✓ Turned in." : ""}`
              : null
        }
        buttonLabel={
          playing ? "▶ Continue" : phase === "done" ? "Run it all again" : "▶ Open the console"
        }
        onEnter={() => (playing ? setOpen(true) : start())}
      />

      <GameModal open={open} onClose={() => setOpen(false)} label={game.title}>
        <GameModalHeader
          title={game.title}
          right={playing ? `Task ${idx + 1}/${total}` : undefined}
        />
        <GameModalBody>
          {playing && task && (
            <div>
              <div className="rounded-xl border border-indigo-200/80 dark:border-indigo-900 bg-indigo-50/60 dark:bg-zinc-900/40 p-3">
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                  Your task
                </p>
                <p className="mt-1 text-sm font-medium leading-relaxed">{task.goal}</p>
              </div>

              {/* The console itself */}
              <div className="mt-3 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950 shadow-inner">
                <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-1.5">
                  <p className="font-mono text-[11px] text-zinc-400">
                    mini-mysql
                    {engine.current ? ` · using ${engine.current}` : " · no database selected"}
                    {!engine.safeUpdates ? " · safe updates OFF" : ""}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setEngine(createState(game.setup));
                      setRun(null);
                    }}
                    className="font-mono text-[11px] text-zinc-500 transition-colors hover:text-zinc-300"
                    title="Wipe the server back to how this game started"
                  >
                    ↺ reset server
                  </button>
                </div>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                      e.preventDefault();
                      if (phase === "task") execute();
                    }
                  }}
                  rows={3}
                  spellCheck={false}
                  autoCapitalize="off"
                  placeholder="Type SQL here, end with ; — then Run"
                  aria-label="SQL editor"
                  className="block w-full resize-y bg-transparent p-3 font-mono text-sm text-emerald-300 placeholder:text-zinc-600 focus:outline-none"
                />
                <div className="flex items-center justify-between border-t border-zinc-800 px-3 py-2">
                  <p className="text-[11px] text-zinc-500">Ctrl+Enter runs too</p>
                  <button
                    type="button"
                    onClick={execute}
                    disabled={phase !== "task"}
                    className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white transition-colors hover:bg-emerald-500 disabled:opacity-40"
                  >
                    ⚡ Run
                  </button>
                </div>

                {/* Output panel — one line per statement, like Workbench */}
                {run && (
                  <div className="border-t border-zinc-800 px-3 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                      Output
                    </p>
                    <ul className="mt-1 space-y-1">
                      {run.outputs.map((o, i) => (
                        <li key={i} className="flex gap-2 font-mono text-xs leading-relaxed">
                          <span aria-hidden="true">{o.ok ? "🟢" : "🔴"}</span>
                          <span className={o.ok ? "text-zinc-300" : "text-red-400"}>
                            <span className="text-zinc-500">{shorten(o.sql)} — </span>
                            {o.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Result grid */}
                {run?.result && (
                  <div className="border-t border-zinc-800 p-3">
                    <div className="overflow-x-auto rounded-lg border border-zinc-800">
                      <table className="w-full text-left font-mono text-xs">
                        <thead>
                          <tr className="border-b border-zinc-800 text-zinc-400">
                            {run.result.columns.map((c, i) => (
                              <th key={i} className="px-2.5 py-1.5 font-semibold">
                                {c}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="text-zinc-200">
                          {run.result.rows.length === 0 ? (
                            <tr>
                              <td
                                colSpan={run.result.columns.length}
                                className="px-2.5 py-1.5 italic text-zinc-500"
                              >
                                (no rows)
                              </td>
                            </tr>
                          ) : (
                            run.result.rows.map((r, i) => (
                              <tr key={i} className="border-b border-zinc-800/60 last:border-0">
                                {r.map((cell, j) => (
                                  <td key={j} className="px-2.5 py-1.5">
                                    {cell === null ? (
                                      <span className="italic text-zinc-500">NULL</span>
                                    ) : (
                                      cell
                                    )}
                                  </td>
                                ))}
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Feedback */}
              {phase === "task" && run && !matched && (
                <div className="mt-3 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-zinc-900/40 p-3">
                  <p className="text-sm leading-relaxed">
                    {run.error
                      ? "Read the red line — MySQL is pointing at what to fix. Adjust and run again."
                      : "It ran — but that's not quite what the task asks for. Compare what came back with the goal, adjust, and run again."}
                  </p>
                  {missesThisTask >= 2 && task.hint && (
                    <p className="mt-2 text-sm leading-relaxed">
                      💡 <span className="font-medium">Hint:</span> {task.hint}
                    </p>
                  )}
                </div>
              )}

              {phase === "cleared" && (
                <div className="mt-3 rounded-xl border border-emerald-300 dark:border-emerald-900 bg-emerald-50/70 dark:bg-emerald-950/30 p-3">
                  <p className="text-sm font-semibold">
                    ✅ Exactly right — the server did what you meant.
                  </p>
                  {task.explain && <p className="mt-1 text-sm leading-relaxed">{task.explain}</p>}
                  <div className="mt-3 text-center">
                    <button type="button" onClick={next} className="btn-primary">
                      {idx + 1 >= total ? "Finish 🏁" : "Next task →"}
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
                {total} tasks, run on a real server — your commands, your results.
              </p>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {firstTry}/{total} on the first run. Everything you just did works
                letter-for-letter in Workbench and DB Fiddle.
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                <button type="button" onClick={start} className="btn-primary">
                  Run it all again
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

function shorten(sql: string): string {
  const oneLine = sql.replace(/\s+/g, " ").trim();
  return oneLine.length > 48 ? `${oneLine.slice(0, 45)}…` : oneLine;
}
