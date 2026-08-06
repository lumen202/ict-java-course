"use client";

import { useState } from "react";
import type { BossBattleGame } from "@/lib/content/types";
import { useFlowComplete } from "@/components/LessonFlow";

// The day's boss battle: an always-dark arena where the boss looms over an
// animated HP bar. Each correct answer lands a hit (shake + damage flash); a
// wrong answer costs a heart AND sends the question back into the queue, so a
// win means every concept was eventually answered right — spaced retrieval
// practice wearing a dragon costume.
//
// The result auto-saves as a turn-in (item = game.id) so playing counts as
// work the teacher can see; replaying overwrites with the newer result.

type Phase = "intro" | "question" | "feedback" | "won" | "lost";

const MAX_HEARTS = 5;

export function BossBattle({
  weekSlug,
  dayNumber,
  game,
}: {
  weekSlug: string;
  dayNumber: number;
  game: BossBattleGame;
}) {
  const total = game.questions.length;
  const [phase, setPhase] = useState<Phase>("intro");
  const [queue, setQueue] = useState<number[]>(() => game.questions.map((_, i) => i));
  const [hearts, setHearts] = useState(MAX_HEARTS);
  const [firstTryHits, setFirstTryHits] = useState(0);
  const [missed, setMissed] = useState<Set<number>>(new Set());
  const [picked, setPicked] = useState<number | null>(null);
  const [fx, setFx] = useState(0); // increments to retrigger animations
  const [saved, setSaved] = useState(false);
  const flowComplete = useFlowComplete();

  const currentIndex = queue[0];
  const current = currentIndex !== undefined ? game.questions[currentIndex] : null;
  const bossHp = queue.length;
  const inBattle = phase === "question" || phase === "feedback";
  const lastHit = phase === "feedback" && picked === current?.answer;

  function start() {
    setQueue(game.questions.map((_, i) => i));
    setHearts(MAX_HEARTS);
    setFirstTryHits(0);
    setMissed(new Set());
    setPicked(null);
    setSaved(false);
    setPhase("question");
  }

  function choose(i: number) {
    if (phase !== "question" || current === null) return;
    setPicked(i);
    setFx((n) => n + 1);
    setPhase("feedback");
    if (i !== current.answer && !missed.has(currentIndex)) {
      setMissed((m) => new Set(m).add(currentIndex));
    }
  }

  function advance() {
    if (current === null || picked === null) return;
    const correct = picked === current.answer;
    const nextQueue = correct ? queue.slice(1) : [...queue.slice(1), currentIndex];
    const nextHearts = correct ? hearts : hearts - 1;
    const nextFirstTry =
      correct && !missed.has(currentIndex) ? firstTryHits + 1 : firstTryHits;
    setFirstTryHits(nextFirstTry);

    setPicked(null);
    setQueue(nextQueue);
    setHearts(nextHearts);

    if (nextQueue.length === 0) {
      finish("won", nextHearts, nextFirstTry);
    } else if (nextHearts <= 0) {
      finish("lost", 0, nextFirstTry);
    } else {
      setPhase("question");
    }
  }

  function finish(outcome: "won" | "lost", heartsLeft: number, hits: number) {
    setPhase(outcome);
    // Any finished battle unlocks the next step — a loss retries here, but
    // never hard-blocks a struggling student from the rest of the day.
    flowComplete(game.id);
    const summary =
      `${game.title} — ${outcome === "won" ? `defeated ${game.boss.name}` : `defeated by ${game.boss.name}`}: ` +
      `${hits}/${total} first-try hits, ${heartsLeft} heart${heartsLeft === 1 ? "" : "s"} left.`;
    fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weekSlug, dayNumber, item: game.id, content: summary }),
    })
      .then((r) => setSaved(r.ok))
      .catch(() => setSaved(false));
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-violet-800/60 shadow-[0_16px_40px_-20px_rgb(124_58_237/0.5)]">
      {/* The arena — always dark, whatever the theme. */}
      <div
        className="relative bg-zinc-950 p-5 text-white"
        style={{
          backgroundImage:
            "radial-gradient(30rem 16rem at 50% 0%, rgb(124 58 237 / 0.3), transparent 65%), radial-gradient(20rem 12rem at 10% 100%, rgb(217 70 239 / 0.15), transparent 60%)",
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-bold tracking-wide">{game.title}</p>
          {inBattle && (
            <p className="text-xs font-medium text-violet-300">
              {total - bossHp}/{total} hits landed
            </p>
          )}
        </div>

        {phase === "intro" && (
          <div className="mt-4 text-center">
            <p className="text-8xl drop-shadow-[0_0_24px_rgb(168_85_247/0.6)]" aria-hidden="true">
              {game.boss.emoji}
            </p>
            <p className="mt-2 text-lg font-extrabold tracking-tight">{game.boss.name}</p>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-zinc-300">
              {game.intro}
            </p>
            <p className="mt-3 text-xs text-zinc-400">
              Right answer → the boss takes a hit. Wrong answer → you lose a heart
              and the question returns. Bring it to 0 HP before your{" "}
              {MAX_HEARTS} hearts run out.
            </p>
            <button type="button" onClick={start} className="btn-primary mt-5">
              ⚔️ Enter the arena
            </button>
          </div>
        )}

        {inBattle && (
          <div className="mt-4">
            {/* Boss + HP bar */}
            <div className="text-center">
              <div className="relative inline-block">
                <p
                  key={fx}
                  className={`text-7xl drop-shadow-[0_0_20px_rgb(168_85_247/0.55)] ${
                    phase === "feedback" ? (lastHit ? "anim-hit" : "anim-loom") : ""
                  }`}
                  aria-hidden="true"
                >
                  {game.boss.emoji}
                </p>
                {phase === "feedback" && (
                  <span
                    key={`dmg-${fx}`}
                    aria-hidden="true"
                    className="anim-float absolute -right-8 top-0 text-2xl font-black"
                  >
                    {lastHit ? "💥" : "💢"}
                  </span>
                )}
              </div>
              <div className="mx-auto mt-2 max-w-xs">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                  <span>{game.boss.name}</span>
                  <span>
                    {bossHp}/{total} HP
                  </span>
                </div>
                <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-rose-500 to-red-600 transition-all duration-500"
                    style={{ width: `${(bossHp / total) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Player hearts */}
            <p className="mt-3 text-center text-sm tracking-widest" aria-label={`${hearts} of ${MAX_HEARTS} hearts left`}>
              {"❤️".repeat(Math.max(hearts, 0))}
              {"🖤".repeat(Math.max(MAX_HEARTS - hearts, 0))}
            </p>
          </div>
        )}

        {(phase === "won" || phase === "lost") && (
          <div className="mt-4 text-center">
            <p className="text-8xl" aria-hidden="true">
              {phase === "won" ? "🏆" : game.boss.emoji}
            </p>
            {phase === "won" && (
              <p className="mt-1 text-2xl" aria-hidden="true">
                🎉 ⭐ 🎉
              </p>
            )}
            <p className="mt-2 text-lg font-extrabold tracking-tight">
              {phase === "won"
                ? `${game.boss.name} is defeated!`
                : `${game.boss.name} wins this round…`}
            </p>
            <p className="mt-1 text-sm text-zinc-300">
              {firstTryHits}/{total} first-try hits
              {phase === "won" ? ` · ${hearts} heart${hearts === 1 ? "" : "s"} left` : ""}.
              {phase === "lost" && " Every hero loses to the boss once — go again."}
            </p>
            <button type="button" onClick={start} className="btn-primary mt-4">
              {phase === "won" ? "⚔️ Rematch for a perfect run" : "⚔️ Rematch"}
            </button>
            <p className="mt-3 text-xs text-zinc-500" aria-live="polite">
              {saved
                ? "✓ Result turned in — replaying updates it."
                : "Result will be turned in automatically when saving succeeds."}
            </p>
          </div>
        )}
      </div>

      {/* Question panel — normal surface below the arena. */}
      {inBattle && current && (
        <div className="border-t border-violet-800/40 bg-white/90 p-5 backdrop-blur-sm dark:bg-zinc-900/90">
          <p className="text-sm font-medium leading-relaxed">{current.prompt}</p>
          {current.code && (
            <pre className="mt-2 overflow-x-auto rounded-xl bg-zinc-900/[0.06] dark:bg-white/10 p-3 font-mono text-xs whitespace-pre-wrap break-words">
              {current.code}
            </pre>
          )}
          <div className="mt-3 grid gap-2">
            {current.choices.map((c, i) => {
              const isAnswer = i === current.answer;
              const isPicked = picked === i;
              const showState = phase === "feedback" && (isAnswer || isPicked);
              return (
                <button
                  key={c}
                  type="button"
                  disabled={phase === "feedback"}
                  onClick={() => choose(i)}
                  className={`rounded-xl border p-3 text-left text-sm leading-relaxed transition-colors disabled:pointer-events-none ${
                    showState && isAnswer
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40"
                      : showState
                        ? "border-red-400 bg-red-50 dark:bg-red-950/30"
                        : "border-zinc-300 bg-white/70 hover:border-violet-400 dark:border-zinc-700 dark:bg-zinc-900/40 dark:hover:border-violet-500"
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>

          {phase === "feedback" && picked !== null && (
            <div className="mt-3 rounded-xl border border-violet-200 dark:border-violet-900 bg-violet-50/60 dark:bg-violet-950/30 p-3">
              <p className="text-sm font-semibold">
                {lastHit
                  ? `🗡️ Direct hit! ${game.boss.name} staggers.`
                  : `💢 ${game.boss.name} strikes back — you lose a heart. This one returns later!`}
              </p>
              <p className="mt-1 text-sm leading-relaxed">{current.explain}</p>
              <div className="mt-3 text-center">
                <button type="button" onClick={advance} className="btn-primary">
                  {queue.length === 1 && lastHit ? "Land the final blow" : "Next →"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
