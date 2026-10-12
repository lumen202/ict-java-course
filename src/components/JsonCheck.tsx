"use client";

import { useEffect, useRef, useState } from "react";
import type { JsonCheck as Check, JsonCheckGame } from "@/lib/content/types";
import { useTurnIn } from "@/lib/game/useTurnIn";
import { firstJsonFailure, parsePasted } from "@/lib/game/jsonChecks";
import { GameDoor, GameModal, GameModalHeader, GameModalBody } from "@/components/GameModal";

// The API weeks' checkpoint. The student's Java runs on their own machine, so
// this site can't run it — but it can judge what it ANSWERED: they open an
// address of their running app (or run a fetch in the console), copy the JSON
// and paste it here, and each task checks its shape and values
// (lib/game/jsonChecks.ts). "Your snacks have no price" is about THEIR app.
//
// Unlike html-sandbox, each task has its own paste box: every task asks about a
// different address. Closing the modal pauses (pastes are kept).
//
// STUCK EXIT (BUG-015): after ASSIST_AFTER misses the task's `solution` — the
// Java to fix — can be revealed. Never the JSON: pasting the right JSON would
// prove nothing about their app.

type Phase = "intro" | "task" | "cleared" | "done";

const ASSIST_AFTER = 4;
/** Turn-ins cap at 20,000 characters (api/submissions); leave room for the summary. */
const MAX_PASTES_IN_TURN_IN = 15000;

export function JsonCheck({
  weekSlug,
  dayNumber,
  game,
}: {
  weekSlug: string;
  dayNumber: number;
  game: JsonCheckGame;
}) {
  const total = game.tasks.length;
  const [phase, setPhase] = useState<Phase>("intro");
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const [pastes, setPastes] = useState<string[]>(() => game.tasks.map(() => ""));
  const [failure, setFailure] = useState<Pick<Check, "message"> | null>(null);
  const [misses, setMisses] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [firstTry, setFirstTry] = useState(0);
  const [assisted, setAssisted] = useState(0);
  const verdictRef = useRef<HTMLDivElement>(null);
  const { submit, saved, onPaste } = useTurnIn({ weekSlug, dayNumber, item: game.id });

  const task = game.tasks[idx];
  const playing = phase === "task" || phase === "cleared";

  useEffect(() => {
    if (failure || phase === "cleared") {
      verdictRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [failure, misses, phase]);

  function start() {
    setPhase("task");
    setIdx(0);
    setPastes(game.tasks.map(() => ""));
    setFailure(null);
    setMisses(0);
    setRevealed(false);
    setFirstTry(0);
    setAssisted(0);
    setOpen(true);
  }

  function check() {
    if (phase !== "task") return;
    const parsed = parsePasted(pastes[idx]);
    const failed = parsed.ok ? firstJsonFailure(parsed.value, task.checks) : { message: parsed.message };
    if (failed) {
      setFailure(failed);
      setMisses((n) => n + 1);
      return;
    }
    setFailure(null);
    if (misses === 0) setFirstTry((n) => n + 1);
    setPhase("cleared");
  }

  function next() {
    setFailure(null);
    setMisses(0);
    setRevealed(false);
    if (idx + 1 >= total) {
      setPhase("done");
      const body = game.tasks
        .map((t, i) => `--- ${t.url ?? `checkpoint ${i + 1}`} ---\n${pastes[i].trim()}`)
        .join("\n\n");
      const clipped =
        body.length > MAX_PASTES_IN_TURN_IN
          ? `${body.slice(0, MAX_PASTES_IN_TURN_IN)}\n…trimmed: the answers were ${body.length} characters`
          : body;
      const summary = `${game.title} — passed all ${total} checkpoints, ${firstTry}/${total} on the first check.${assisted > 0 ? ` Revealed the fix on ${assisted}.` : ""}`;
      void submit({ content: `${summary}\n\n${clipped}` });
    } else {
      setIdx(idx + 1);
      setPhase("task");
    }
  }

  return (
    <>
      <GameDoor
        tone="teal"
        emoji="🧪"
        title={game.title}
        intro={game.intro}
        meta={`${total} checkpoints · paste what your app answered · checked automatically · turns in automatically`}
        status={
          playing && !open
            ? `⏸ Paused at checkpoint ${idx + 1}/${total} — your pastes are kept.`
            : phase === "done"
              ? `🏆 Completed — ${firstTry}/${total} on the first check.${saved ? " ✓ Turned in." : ""}`
              : null
        }
        buttonLabel={playing ? "▶ Continue" : phase === "done" ? "Start again" : "▶ Open the checker"}
        onEnter={() => (playing ? setOpen(true) : start())}
      />

      <GameModal open={open} onClose={() => setOpen(false)} label={game.title}>
        <GameModalHeader title={game.title} right={playing ? `Checkpoint ${idx + 1}/${total}` : undefined} />
        <GameModalBody>
          {playing && task && (
            <div>
              <div className="rounded-xl border border-teal-200/80 dark:border-teal-900 bg-teal-50/60 dark:bg-zinc-900/40 p-3">
                <p className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">
                  Checkpoint
                </p>
                <p className="mt-1 text-sm font-medium leading-relaxed">{task.goal}</p>
                {task.url && (
                  <p className="mt-2 inline-block rounded-md bg-zinc-950 px-2 py-1 font-mono text-xs text-emerald-300">
                    {task.url}
                  </p>
                )}
                {task.command && (
                  <div className="mt-2">
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      Type this into the console (F12 → Console) on a page at localhost:8080 and press Enter. It copies your
                      app&apos;s answer for you: then click the box below and press Ctrl+V.
                    </p>
                    <pre className="mt-1 overflow-x-auto whitespace-pre-wrap break-all rounded-md bg-zinc-950 px-2 py-1.5 font-mono text-xs text-amber-200">
                      {task.command}
                    </pre>
                  </div>
                )}
              </div>

              <div className="mt-3 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950 shadow-inner">
                <div className="border-b border-zinc-800 px-3 py-1.5">
                  <p className="font-mono text-[11px] text-zinc-400">paste what your app answered</p>
                </div>
                <textarea
                  value={pastes[idx]}
                  onChange={(e) => {
                    const value = e.target.value;
                    setPastes((p) => p.map((old, i) => (i === idx ? value : old)));
                  }}
                  onPaste={onPaste}
                  onKeyDown={(e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                      e.preventDefault();
                      check();
                    }
                  }}
                  rows={10}
                  spellCheck={false}
                  autoCapitalize="off"
                  aria-label="Paste the JSON your app answered"
                  placeholder={'[{"snack_id":1, …}]'}
                  className="block min-h-[12rem] w-full resize-y bg-transparent p-3 font-mono text-xs leading-relaxed text-emerald-300 focus:outline-none"
                />
              </div>

              <div className="mt-3 flex items-center justify-between">
                <p className="text-[11px] text-zinc-500">Ctrl+Enter checks too</p>
                <button
                  type="button"
                  onClick={check}
                  disabled={phase !== "task"}
                  className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white transition-colors hover:bg-emerald-500 disabled:opacity-40"
                >
                  ✔ Check the answer
                </button>
              </div>

              {phase === "task" && failure && (
                <div ref={verdictRef} className="mt-3 rounded-xl border border-teal-200 dark:border-teal-900 bg-teal-50/50 dark:bg-zinc-900/40 p-3">
                  <p className="text-sm font-semibold">Not yet:</p>
                  <p className="mt-1 text-sm leading-relaxed">{failure.message}</p>
                  {misses >= 2 && task.hint && (
                    <p className="mt-2 text-sm leading-relaxed">
                      💡 <span className="font-medium">Hint:</span> {task.hint}
                    </p>
                  )}
                  {misses >= ASSIST_AFTER && !revealed && (
                    <div className="mt-3 border-t border-teal-200 pt-3 dark:border-teal-900">
                      <button
                        type="button"
                        onClick={() => {
                          setRevealed(true);
                          setAssisted((n) => n + 1);
                        }}
                        className="rounded-lg border border-teal-300 bg-white/80 px-3 py-1.5 text-sm font-medium transition-colors hover:border-teal-500 hover:bg-teal-50 dark:border-teal-800 dark:bg-zinc-900/60 dark:hover:bg-teal-950/30"
                      >
                        🔑 Stuck? Show me the Java
                      </button>
                    </div>
                  )}
                  {revealed && (
                    <div className="mt-3 border-t border-teal-200 pt-3 dark:border-teal-900">
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        Compare this with your code in VS Code, fix yours, restart the app, then open the address again and paste the new answer:
                      </p>
                      <pre className="mt-1.5 overflow-x-auto rounded-lg bg-zinc-950 p-2.5 font-mono text-xs text-emerald-300">
                        {task.solution}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {phase === "cleared" && (
                <div ref={verdictRef} className="mt-3 rounded-xl border border-emerald-300 dark:border-emerald-900 bg-emerald-50/70 dark:bg-emerald-950/30 p-3">
                  <p className="text-sm font-semibold">✅ Your app answered right.</p>
                  {task.explain && <p className="mt-1 text-sm leading-relaxed">{task.explain}</p>}
                  <div className="mt-3 text-center">
                    <button type="button" onClick={next} className="btn-primary">
                      {idx + 1 >= total ? "Finish 🏁" : "Next checkpoint →"}
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
              <p className="mt-3 text-base font-semibold">All {total} checkpoints passed — by your own app.</p>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {firstTry}/{total} on the first check.
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                <button type="button" onClick={start} className="btn-primary">
                  Start again
                </button>
                <button type="button" onClick={() => setOpen(false)} className="btn-ghost">
                  Back to the lesson
                </button>
              </div>
              <p className="mt-3 text-xs text-zinc-500" aria-live="polite">
                {saved
                  ? "✓ Result and your app's answers turned in — replaying updates it."
                  : "Result will be turned in automatically when saving succeeds."}
              </p>
            </div>
          )}
        </GameModalBody>
      </GameModal>
    </>
  );
}
