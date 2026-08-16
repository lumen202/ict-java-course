"use client";

import { useState } from "react";
import type { SqlConsoleGame } from "@/lib/content/types";
import { useTurnIn } from "@/lib/game/useTurnIn";
import { shuffledChoices, seededShuffle } from "@/lib/game/shuffle";
import { toParsonsFragments, assembleFragments } from "@/lib/game/sqlParsons";
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
// A task may carry `predict` (PRIMM): a commit-before-run question shown above
// the editor. Run stays disabled until the student picks a choice; the pick is
// revealed right or wrong and then the run proceeds either way — a wrong guess
// costs nothing, the run itself is the teacher. Picks persist across modal
// close/open (pause, never reset) and are tallied into the turn-in summary.
//
// STUCK EXIT (BUG-015). Hints fade to nothing on each console's final
// compose-from-scratch tasks, and a required step has no skip — so a student who
// couldn't compose one had no way forward except asking the teacher, which the
// whole platform exists to avoid. After ASSIST_AFTER failed runs the task offers
// a fallback, and every task has one:
//   - a solution that splits into 2+ clauses becomes a Parsons puzzle — assemble
//     the statement from mixed-up fragments. This is Ericson's intra-problem
//     adaptation: make the problem easier rather than answer it. Falling back
//     this way preserves posttest performance while keeping students working,
//     where simply showing the answer collapses time-on-task (some finish by
//     copying in under two minutes) and bottom-out hints get skipped straight to
//     on 82-89% of steps.
//   - a solution too atomic to split (`SHOW TABLES;`) reveals the command
//     instead; there is no composition left to protect, only keyword recall.
// Assembling fills the editor but never clears the task — the student still runs
// it, so clearing always goes through the same judged-by-effect path. Assisted
// tasks are counted and reported in the turn-in rather than blocking anything.
//
// The lesson shows a door card; the console lives in the full-screen modal.
// Closing the modal pauses — server state is kept, the card offers "Continue".

type Phase = "intro" | "task" | "cleared" | "done";

/** Failed runs on one task before the assemble/reveal fallback is offered. */
const ASSIST_AFTER = 4;

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
  // The engine is immutable-by-convention in React state: each run works on a
  // clone, which only replaces the live state when the task is cleared — so a
  // wrong run (a bad table, a stray insert) rolls back for free and the task
  // stays winnable.
  const [engine, setEngine] = useState<MiniState>(() => createState(game.setup));
  // Prediction picks, keyed by task index (value = index into the SHUFFLED
  // choices). Never cleared between tasks or on modal close — only a full
  // replay resets it — so an answered prediction stays answered.
  const [predictPicks, setPredictPicks] = useState<Record<number, number>>({});
  // Stuck-exit state. `assembling` is the open puzzle; `placed` are indices into
  // the shuffled fragments; `assisted` counts tasks where the fallback was used,
  // which is reported but never blocks (an exit that is recorded, not refused).
  const [assembling, setAssembling] = useState(false);
  const [placed, setPlaced] = useState<number[]>([]);
  const [assisted, setAssisted] = useState<Set<number>>(new Set());
  const { submit, saved, onPaste } = useTurnIn({ weekSlug, dayNumber, item: game.id });

  const task = game.tasks[idx];
  const playing = phase === "task" || phase === "cleared";

  // The task's solution as orderable fragments, shuffled stably per task.
  const fragments = task ? toParsonsFragments(task.solution) : [];
  const canAssemble = fragments.length >= 2;
  const shuffledFragments = canAssemble
    ? seededShuffle(
        fragments.map((_, i) => i),
        `${game.id}:parsons:${idx}`,
      )
    : [];
  // Offered only once the student has genuinely tried — never before.
  const stuck = missesThisTask >= ASSIST_AFTER;
  const builtSql = assembleFragments(placed.map((f) => fragments[f]));
  const builtRight = placed.length === fragments.length && builtSql === assembleFragments(fragments);
  // Shuffled per task, seeded, so the order is stable across re-renders and
  // modal close/open — the pick index stays meaningful.
  const predict = task?.predict
    ? shuffledChoices(task.predict.choices, task.predict.answer, `${game.id}:${idx}`)
    : null;
  const pick = predictPicks[idx];
  const mustPredict = predict !== null && pick === undefined;

  /** How the predictions went, for the turn-in summary. */
  function predictTally(): { right: number; asked: number } {
    let right = 0;
    let asked = 0;
    game.tasks.forEach((t, i) => {
      if (!t.predict) return;
      asked++;
      const p = predictPicks[i];
      if (p === undefined) return;
      const sh = shuffledChoices(t.predict.choices, t.predict.answer, `${game.id}:${i}`);
      if (p === sh.answer) right++;
    });
    return { right, asked };
  }

  function start() {
    setEngine(createState(game.setup));
    setPhase("task");
    setIdx(0);
    setText("");
    setRun(null);
    setMatched(false);
    setMissesThisTask(0);
    setFirstTry(0);
    setPredictPicks({});
    setAssembling(false);
    setPlaced([]);
    setAssisted(new Set());
    setOpen(true);
  }

  /** Take the fallback: mark the task assisted and open the puzzle (or reveal). */
  function assist() {
    setAssisted((a) => new Set(a).add(idx));
    if (canAssemble) {
      setAssembling(true);
      setPlaced([]);
    } else {
      // Nothing to assemble — hand over the statement itself.
      setText(task.solution);
    }
  }

  /** Move the assembled statement into the editor; the student still runs it. */
  function useAssembled() {
    setText(builtSql);
    setAssembling(false);
    setPlaced([]);
  }

  function execute() {
    if (!task || !text.trim() || mustPredict) return;
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
    setAssembling(false);
    setPlaced([]);
    if (idx + 1 >= total) {
      setPhase("done");
      const { right, asked } = predictTally();
      const finalSummary = `${game.title} — ran all ${total} tasks on the mini server, ${firstTry}/${total} on the first run.${asked > 0 ? ` Predictions: ${right}/${asked} right before running.` : ""}${assisted.size > 0 ? ` Assembled ${assisted.size} from mixed-up pieces after getting stuck.` : ""}`;
      void submit({ content: finalSummary });
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

              {/* Commit-before-run prediction (PRIMM) */}
              {task.predict && predict && (
                <div className="mt-3 rounded-xl border border-amber-200/80 dark:border-amber-900 bg-amber-50/60 dark:bg-zinc-900/40 p-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                    Before you run — make a call
                  </p>
                  <p className="mt-1 text-sm font-medium leading-relaxed">{task.predict.question}</p>
                  {pick === undefined ? (
                    <ul className="mt-2 space-y-1">
                      {predict.choices.map((choice, i) => (
                        <li key={i}>
                          <button
                            type="button"
                            onClick={() => setPredictPicks((p) => ({ ...p, [idx]: i }))}
                            className="w-full rounded-lg border border-amber-300 dark:border-amber-800 bg-white/80 dark:bg-zinc-900/60 px-2.5 py-1.5 text-left text-sm leading-relaxed transition-colors hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                          >
                            {choice}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="mt-2 text-sm leading-relaxed">
                      <p className="font-semibold">
                        {pick === predict.answer
                          ? "✅ That's the call the server will make."
                          : "Not this time — here's what to expect:"}
                      </p>
                      <p className="mt-1">
                        Expect: <span className="font-medium">{predict.choices[predict.answer]}</span>
                      </p>
                      {task.predict.explain && (
                        <p className="mt-1">{task.predict.explain}</p>
                      )}
                      <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                        Either way, now run it and watch the server prove it.
                      </p>
                    </div>
                  )}
                </div>
              )}

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
                  onPaste={onPaste}
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
                  <p className="text-[11px] text-zinc-500">
                    {mustPredict ? "Pick your prediction first — then Run unlocks" : "Ctrl+Enter runs too"}
                  </p>
                  <button
                    type="button"
                    onClick={execute}
                    disabled={phase !== "task" || mustPredict}
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
                  {/* The stuck exit — offered quietly, only after real attempts,
                      and never the fastest route, so it doesn't become the
                      default path for students who could have finished. */}
                  {stuck && !assembling && !assisted.has(idx) && (
                    <div className="mt-3 border-t border-indigo-200 pt-3 dark:border-indigo-900">
                      <button
                        type="button"
                        onClick={assist}
                        className="rounded-lg border border-indigo-300 bg-white/80 px-3 py-1.5 text-sm font-medium transition-colors hover:border-indigo-500 hover:bg-indigo-50 dark:border-indigo-800 dark:bg-zinc-900/60 dark:hover:bg-indigo-950/30"
                      >
                        {canAssemble
                          ? "🧩 Stuck? Build it from pieces instead"
                          : "🔑 Stuck? Show me the command"}
                      </button>
                      <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                        {canAssemble
                          ? "You'll put the statement together from mixed-up parts, then run it yourself."
                          : "This one is a single command — there's nothing to take apart."}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Parsons fallback: assemble the statement from its own clauses. */}
              {assembling && (
                <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50/70 p-3 dark:border-amber-900 dark:bg-zinc-900/40">
                  <p className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                    Build it from pieces
                  </p>
                  <p className="mt-1 text-sm leading-relaxed">
                    Click the parts in the order they belong. Click a placed part to take it back out.
                  </p>

                  <div className="mt-2 min-h-[2.5rem] rounded-lg border border-amber-300 bg-white/70 p-2 dark:border-amber-800 dark:bg-zinc-950/60">
                    {placed.length === 0 ? (
                      <p className="text-xs italic text-zinc-500">Your statement will appear here…</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {placed.map((f, pos) => (
                          <button
                            key={`${f}-${pos}`}
                            type="button"
                            onClick={() => setPlaced(placed.filter((_, p) => p !== pos))}
                            className="rounded-md bg-amber-200 px-2 py-1 font-mono text-xs text-zinc-900 transition-colors hover:bg-amber-300 dark:bg-amber-900/70 dark:text-amber-50"
                          >
                            {fragments[f]}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {shuffledFragments
                      .filter((f) => !placed.includes(f))
                      .map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setPlaced([...placed, f])}
                          className="rounded-md border border-amber-300 bg-white px-2 py-1 font-mono text-xs transition-colors hover:border-amber-500 hover:bg-amber-100 dark:border-amber-800 dark:bg-zinc-900 dark:hover:bg-amber-950/40"
                        >
                          {fragments[f]}
                        </button>
                      ))}
                  </div>

                  {placed.length === fragments.length && (
                    <div className="mt-3">
                      {builtRight ? (
                        <>
                          <p className="text-sm font-semibold">
                            ✅ That&apos;s the statement — now run it yourself and watch what it does.
                          </p>
                          <button type="button" onClick={useAssembled} className="btn-primary mt-2">
                            Put it in the editor →
                          </button>
                        </>
                      ) : (
                        <p className="text-sm leading-relaxed">
                          Not that order yet. SQL reads in a fixed sequence — what has to be named
                          before it can be filtered or sorted? Take a part back out and try again.
                        </p>
                      )}
                    </div>
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
