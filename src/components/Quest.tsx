"use client";

import { useState } from "react";
import type { QuestGame } from "@/lib/content/types";
import { useFlowComplete } from "@/components/LessonFlow";

// A quest: real work broken into missions shown ONE at a time. Each mission is
// a couple of sentences — do the thing, then clear it with a quick check
// (retry until right) or by pasting your result. Built so a student who
// struggles with long instruction lists never sees one.
//
// The result (checks cleared + anything typed) auto-saves as a turn-in under
// the quest's id, and finishing signals the lesson flow.

type Phase = "intro" | "mission" | "cleared" | "done";

export function Quest({
  weekSlug,
  dayNumber,
  game,
}: {
  weekSlug: string;
  dayNumber: number;
  game: QuestGame;
}) {
  const total = game.missions.length;
  const [phase, setPhase] = useState<Phase>("intro");
  const [idx, setIdx] = useState(0);
  const [wrong, setWrong] = useState<Set<number>>(new Set());
  const [firstTry, setFirstTry] = useState(0);
  const [inputs, setInputs] = useState<Record<number, string>>({});
  const [saved, setSaved] = useState(false);
  const flowComplete = useFlowComplete();

  const mission = game.missions[idx];
  const checksTotal = game.missions.filter((m) => m.check).length;

  function start() {
    setPhase("mission");
    setIdx(0);
    setWrong(new Set());
    setFirstTry(0);
    setInputs({});
    setSaved(false);
  }

  function pick(i: number) {
    if (!mission.check || phase !== "mission") return;
    if (i === mission.check.answer) {
      if (wrong.size === 0) setFirstTry((n) => n + 1);
      setPhase("cleared");
    } else {
      setWrong((w) => new Set(w).add(i));
    }
  }

  function clearManual() {
    if (mission.input && !(inputs[idx] ?? "").trim()) return;
    setPhase("cleared");
  }

  function next(finalFirstTry: number) {
    setWrong(new Set());
    if (idx + 1 >= total) {
      setPhase("done");
      flowComplete(game.id);
      const typed = game.missions
        .map((m, i) => (m.input && inputs[i]?.trim() ? `[${m.input}]\n${inputs[i].trim()}` : null))
        .filter(Boolean)
        .join("\n\n");
      const summary =
        `${game.title} — all ${total} missions cleared` +
        (checksTotal > 0 ? `, ${finalFirstTry}/${checksTotal} checks right on the first try.` : ".") +
        (typed ? `\n\n${typed}` : "");
      fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weekSlug, dayNumber, item: game.id, content: summary }),
      })
        .then((r) => setSaved(r.ok))
        .catch(() => setSaved(false));
    } else {
      setIdx(idx + 1);
      setPhase("mission");
    }
  }

  return (
    <div className="rounded-2xl border border-amber-300/80 bg-linear-to-br from-amber-50/95 to-orange-50/60 dark:border-amber-800/80 dark:from-amber-950/40 dark:to-orange-950/20 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold">{game.title}</p>
        {phase !== "intro" && phase !== "done" && (
          <p className="text-xs font-medium text-zinc-500">
            Mission {idx + 1}/{total}
          </p>
        )}
      </div>

      {/* Progress bar — visible momentum is half the motivation. */}
      {phase !== "intro" && (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-amber-200/60 dark:bg-amber-900/40">
          <div
            className="h-full rounded-full bg-linear-to-r from-amber-500 to-orange-500 transition-all duration-300"
            style={{
              width: `${((phase === "done" ? total : idx + (phase === "cleared" ? 1 : 0)) / total) * 100}%`,
            }}
          />
        </div>
      )}

      {phase === "intro" && (
        <div className="mt-3 text-center">
          <p className="text-center text-6xl" aria-hidden="true">
            🗺️
          </p>
          <p className="mt-3 text-sm leading-relaxed">{game.intro}</p>
          <button type="button" onClick={start} className="btn-primary mt-4">
            ▶ Start mission 1
          </button>
        </div>
      )}

      {(phase === "mission" || phase === "cleared") && mission && (
        <div className="mt-4">
          <p className="text-sm font-medium leading-relaxed">{mission.task}</p>
          {mission.code && (
            <pre className="mt-2 overflow-x-auto rounded-xl bg-zinc-900/[0.06] dark:bg-white/10 p-3 font-mono text-xs whitespace-pre-wrap break-words">
              {mission.code}
            </pre>
          )}

          {phase === "mission" && mission.check && (
            <div className="mt-3">
              <p className="text-sm font-medium">{mission.check.question}</p>
              <div className="mt-2 grid gap-2">
                {mission.check.choices.map((c, i) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => pick(i)}
                    className={`rounded-xl border p-3 text-left text-sm leading-relaxed transition-colors ${
                      wrong.has(i)
                        ? "border-red-400 bg-red-50 dark:bg-red-950/30 opacity-60"
                        : "border-zinc-300 bg-white/70 hover:border-amber-400 dark:border-zinc-700 dark:bg-zinc-900/40 dark:hover:border-amber-500"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              {wrong.size > 0 && (
                <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                  Not that one — look again at what you just did, then try another.
                </p>
              )}
            </div>
          )}

          {phase === "mission" && mission.input && (
            <div className="mt-3">
              <label htmlFor={`quest-${game.id}-${idx}`} className="text-sm font-medium">
                {mission.input}
              </label>
              <textarea
                id={`quest-${game.id}-${idx}`}
                value={inputs[idx] ?? ""}
                onChange={(e) => setInputs((v) => ({ ...v, [idx]: e.target.value }))}
                rows={5}
                maxLength={5000}
                className="input mt-2 font-mono text-xs leading-relaxed"
              />
              <div className="mt-2 text-center">
                <button
                  type="button"
                  onClick={clearManual}
                  disabled={!(inputs[idx] ?? "").trim()}
                  className="btn-primary"
                >
                  Mission complete ✓
                </button>
              </div>
            </div>
          )}

          {phase === "mission" && !mission.check && !mission.input && (
            <div className="mt-3 text-center">
              <button type="button" onClick={clearManual} className="btn-primary">
                Mission complete ✓
              </button>
            </div>
          )}

          {phase === "cleared" && (
            <div className="mt-3 rounded-xl border border-amber-200 dark:border-amber-900 bg-white/70 dark:bg-zinc-900/40 p-3">
              <p className="text-sm font-semibold">✅ Mission cleared!</p>
              {mission.check && (
                <p className="mt-1 text-sm leading-relaxed">{mission.check.explain}</p>
              )}
              <div className="mt-3 text-center">
                <button
                  type="button"
                  onClick={() => next(firstTry)}
                  className="btn-primary"
                >
                  {idx + 1 >= total ? "Finish the quest 🏁" : `Mission ${idx + 2} →`}
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
          <p className="mt-3 text-base font-semibold">Quest complete!</p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            All {total} missions cleared
            {checksTotal > 0 ? ` — ${firstTry}/${checksTotal} checks right on the first try` : ""}.
          </p>
          <button type="button" onClick={start} className="btn-ghost mt-4">
            Replay quest
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
