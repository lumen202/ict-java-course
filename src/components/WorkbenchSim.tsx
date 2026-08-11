"use client";

import { useState } from "react";
import type { WorkbenchSimGame } from "@/lib/content/types";
import { useTurnIn } from "@/lib/game/useTurnIn";
import { GameDoor, GameModal, GameModalHeader, GameModalBody } from "@/components/GameModal";

// A clickable mock of MySQL Workbench. Each mission names something to click
// — the refresh icon, the right lightning bolt, the Output panel — and the
// student clears it by clicking the real place in a fake window. Wrong clicks
// explain what WAS clicked, so even mistakes teach the layout. This builds
// tool familiarity before (or without) the real install; the real-Workbench
// quests then feel like coming home. Result auto-saves as a turn-in.
//
// The lesson shows a door card; play happens in the full-screen modal.
// Closing the modal pauses — state is kept, the card offers "Continue".

type Phase = "intro" | "mission" | "feedback" | "done";

/** What each hotspot is, for wrong-click feedback. */
const HOTSPOT_NAMES: Record<string, string> = {
  "run-all": "the run-everything lightning bolt — it runs every statement in the editor",
  "run-cursor": "the run-under-cursor bolt — it runs only the statement your cursor is on",
  "schemas-refresh": "the SCHEMAS refresh icon — it re-reads the list from the server",
  "output-panel": "the Output panel — MySQL's replies (green or red) land there",
  "result-grid": "the result grid — the rows a SELECT returns appear there",
  editor: "the query editor — where you type SQL",
};

function hotspotName(id: string): string {
  if (id.startsWith("schema:")) {
    return `the ${id.slice(7)} schema in the SCHEMAS panel`;
  }
  return HOTSPOT_NAMES[id] ?? "part of the window";
}

export function WorkbenchSim({
  weekSlug,
  dayNumber,
  game,
}: {
  weekSlug: string;
  dayNumber: number;
  game: WorkbenchSimGame;
}) {
  const total = game.steps.length;
  const [phase, setPhase] = useState<Phase>("intro");
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const [wrong, setWrong] = useState<string | null>(null);
  const [wrongCount, setWrongCount] = useState(0);
  const [missedThisStep, setMissedThisStep] = useState(false);
  const [firstTry, setFirstTry] = useState(0);
  const { submit, saved } = useTurnIn({ weekSlug, dayNumber, item: game.id });

  const step = game.steps[idx];
  const playing = phase === "mission" || phase === "feedback";

  function start() {
    setPhase("mission");
    setIdx(0);
    setWrong(null);
    setWrongCount(0);
    setMissedThisStep(false);
    setFirstTry(0);
    setOpen(true);
  }

  function click(target: string) {
    if (phase !== "mission" || !step) return;
    if (target === step.target) {
      if (!missedThisStep) setFirstTry((n) => n + 1);
      setWrong(null);
      setPhase("feedback");
    } else {
      setMissedThisStep(true);
      setWrongCount((n) => n + 1);
      setWrong(target);
    }
  }

  function next() {
    setWrong(null);
    setWrongCount(0);
    setMissedThisStep(false);
    if (idx + 1 >= total) {
      setPhase("done");
      void submit({ content: `${game.title} — completed all ${total} missions, ${firstTry}/${total} on the first click.` });
    } else {
      setIdx(idx + 1);
      setPhase("mission");
    }
  }

  return (
    <>
      <GameDoor
        tone="slate"
        emoji="🧑‍🚀"
        title={game.title}
        intro={game.intro}
        meta={`${total} missions · your result turns in automatically`}
        status={
          playing && !open
            ? `⏸ Paused at mission ${idx + 1}/${total} — the cockpit is still warm.`
            : phase === "done"
              ? `🏆 Completed — ${firstTry}/${total} on the first click.${saved ? " ✓ Turned in." : ""}`
              : null
        }
        buttonLabel={playing ? "▶ Continue" : phase === "done" ? "Fly it again" : "▶ Open the cockpit"}
        onEnter={() => (playing ? setOpen(true) : start())}
      />

      <GameModal open={open} onClose={() => setOpen(false)} label={game.title}>
        <GameModalHeader
          title={game.title}
          right={playing ? `Mission ${idx + 1}/${total}` : undefined}
        />
        <GameModalBody>
          {playing && step && (
            <div>
              <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-zinc-900/40 p-3">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Your mission
                </p>
                <p className="mt-1 text-sm font-medium leading-relaxed">{step.task}</p>
              </div>

              {/* The fake Workbench window */}
              <div className="mt-3 overflow-hidden rounded-xl border border-zinc-400/60 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 shadow-md">
                {/* Title bar */}
                <div className="flex items-center gap-2 border-b border-zinc-300 dark:border-zinc-700 bg-zinc-200 dark:bg-zinc-800 px-3 py-1.5">
                  <span className="flex gap-1.5" aria-hidden="true">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </span>
                  <p className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                    MySQL Workbench — Local instance
                  </p>
                </div>

                {/* Toolbar */}
                <div className="flex items-center gap-1.5 border-b border-zinc-300 dark:border-zinc-700 px-3 py-1.5">
                  <SimButton
                    onClick={() => click("run-all")}
                    title="Execute all statements in the editor"
                  >
                    ⚡
                  </SimButton>
                  <SimButton
                    onClick={() => click("run-cursor")}
                    title="Execute the statement under the keyboard cursor"
                  >
                    ⚡<span className="ml-0.5 text-[10px]">▮</span>
                  </SimButton>
                </div>

                <div className="flex">
                  {/* SCHEMAS panel */}
                  <div className="w-32 shrink-0 border-r border-zinc-300 dark:border-zinc-700 p-2 sm:w-40">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                        Schemas
                      </p>
                      <SimButton
                        onClick={() => click("schemas-refresh")}
                        title="Refresh the schema list"
                      >
                        🔄
                      </SimButton>
                    </div>
                    <ul className="mt-1.5 space-y-0.5">
                      {(step.schemas ?? ["sys"]).map((s) => (
                        <li key={s}>
                          <button
                            type="button"
                            onClick={() => click(`schema:${s}`)}
                            className="w-full rounded px-1.5 py-0.5 text-left font-mono text-xs text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-sky-100 dark:hover:bg-sky-950/50"
                          >
                            ▸ {s}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Editor + result + output */}
                  <div className="min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => click("editor")}
                      aria-label="Query editor"
                      className="block min-h-16 w-full cursor-pointer bg-white dark:bg-zinc-950 p-2.5 text-left align-top font-mono text-xs leading-relaxed text-sky-900 dark:text-sky-300 whitespace-pre-wrap transition-colors hover:bg-sky-50/60 dark:hover:bg-sky-950/30"
                    >
                      {step.editor ?? ""}
                    </button>

                    {step.result && (
                      <button
                        type="button"
                        onClick={() => click("result-grid")}
                        aria-label="Result grid"
                        className="block w-full cursor-pointer border-t border-zinc-300 dark:border-zinc-700 p-2 text-left transition-colors hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30"
                      >
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                          Result grid
                        </p>
                        <div className="mt-1 overflow-x-auto">
                          <table className="w-full text-left font-mono text-[11px]">
                            <thead>
                              <tr className="text-zinc-500">
                                {step.result.columns.map((col) => (
                                  <th
                                    key={col}
                                    className="border border-zinc-200 dark:border-zinc-700 px-1.5 py-0.5 font-semibold"
                                  >
                                    {col}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="text-zinc-700 dark:text-zinc-300">
                              {step.result.rows.map((r, i) => (
                                <tr key={i}>
                                  {r.map((cell, j) => (
                                    <td
                                      key={j}
                                      className="border border-zinc-200 dark:border-zinc-700 px-1.5 py-0.5"
                                    >
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => click("output-panel")}
                      aria-label="Output panel"
                      className="block w-full cursor-pointer border-t border-zinc-300 dark:border-zinc-700 p-2 text-left transition-colors hover:bg-amber-50/60 dark:hover:bg-amber-950/20"
                    >
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                        Output
                      </p>
                      <ul className="mt-1 space-y-0.5">
                        {(step.output ?? []).map((o, i) => (
                          <li key={i} className="flex gap-1.5 font-mono text-[11px] leading-relaxed">
                            <span aria-hidden="true">{o.ok ? "🟢" : "🔴"}</span>
                            <span
                              className={o.ok ? "text-zinc-600 dark:text-zinc-400" : "text-red-500"}
                            >
                              {o.text}
                            </span>
                          </li>
                        ))}
                        {(step.output ?? []).length === 0 && (
                          <li className="font-mono text-[11px] italic text-zinc-400 dark:text-zinc-600">
                            (nothing yet)
                          </li>
                        )}
                      </ul>
                    </button>
                  </div>
                </div>
              </div>

              {/* Wrong-click feedback */}
              {phase === "mission" && wrong && (
                <div className="mt-3 rounded-xl border border-amber-300 dark:border-amber-900 bg-amber-50/70 dark:bg-amber-950/30 p-3">
                  <p className="text-sm leading-relaxed">
                    That&apos;s {hotspotName(wrong)}. Good to know — but not what this
                    mission asks. Read it again and look around the window.
                  </p>
                  {wrongCount >= 2 && step.hint && (
                    <p className="mt-1.5 text-sm leading-relaxed">
                      💡 <span className="font-medium">Hint:</span> {step.hint}
                    </p>
                  )}
                </div>
              )}

              {phase === "feedback" && (
                <div className="mt-3 rounded-xl border border-emerald-300 dark:border-emerald-900 bg-emerald-50/70 dark:bg-emerald-950/30 p-3">
                  <p className="text-sm font-semibold">✅ Found it.</p>
                  <p className="mt-1 text-sm leading-relaxed">{step.explain}</p>
                  <div className="mt-3 text-center">
                    <button type="button" onClick={next} className="btn-primary">
                      {idx + 1 >= total ? "Finish 🏁" : "Next mission →"}
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
                You know your way around the cockpit.
              </p>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {firstTry}/{total} missions on the first click. The real Workbench
                has these exact controls in these exact places.
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                <button type="button" onClick={start} className="btn-primary">
                  Fly it again
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

function SimButton({
  onClick,
  title,
  children,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="grid h-6 min-w-6 place-items-center rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-1 text-xs transition-colors hover:bg-sky-100 dark:hover:bg-sky-950/50"
    >
      {children}
    </button>
  );
}
