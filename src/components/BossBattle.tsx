"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { BossBattleGame } from "@/lib/content/types";
import { shuffledChoices } from "@/lib/game/shuffle";
import { GameModal } from "@/components/GameModal";
import { Stickman } from "@/components/Stickman";
import { useTurnIn } from "@/lib/game/useTurnIn";
import { useCombatFx } from "@/lib/game/useCombatFx";
import {
  MAX_HEARTS,
  bossHp as bossHpOf,
  currentQuestion,
  damageRatio,
  initCombat,
  markMissed,
  resolve,
  type CombatState,
} from "@/lib/game/combat";

// The day's boss battle. The lesson page shows a compact card; pressing
// "Enter the arena" opens the fight in a full-screen modal, so a long battle
// never depends on the page's height — the arena (boss, HP, hearts) stays
// pinned while the questions scroll under it.
//
// Closing the modal (✕ / Escape) PAUSES the battle — state is kept and the
// card offers "Return to the battle" — so there is no are-you-sure dialog.
//
// Each correct answer lands a hit; a wrong answer costs a heart AND sends the
// question back into the queue, so a win means every concept was eventually
// answered right — spaced retrieval practice wearing a dragon costume.
//
// The result auto-saves as a turn-in (item = game.id) so playing counts as
// work the teacher can see; replaying overwrites with the newer result.

/**
 * `finisher` is the held beat between the last answer and the result card.
 * Without it the card appeared the instant the final question was answered,
 * which made winning feel like the game had stopped rather than been won.
 */
type Phase = "intro" | "question" | "feedback" | "finisher" | "won" | "lost";

/** Long enough to read as a finishing move, short enough not to be a wait. */
const FINISHER_MS = 2000;

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
  // Choices are shuffled per question (seeded by game id + index, so the
  // order is stable across re-renders and re-queues) — authored content had
  // the right answer at index 0 often enough to be pattern-matched.
  const questions = useMemo(
    () =>
      game.questions.map((q, i) => ({
        ...q,
        ...shuffledChoices(q.choices, q.answer, `${game.id}:${i}`),
      })),
    [game],
  );
  const [phase, setPhase] = useState<Phase>("intro");
  const [open, setOpen] = useState(false);
  // The rules live in lib/game/combat.ts — this component only renders them.
  const [combat, setCombat] = useState<CombatState>(() => initCombat(total));
  const [picked, setPicked] = useState<number | null>(null);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const { submit, saved } = useTurnIn({ weekSlug, dayNumber, item: game.id });
  const fx = useCombatFx();

  const currentIndex = currentQuestion(combat);
  const current = currentIndex !== undefined ? questions[currentIndex] : null;
  const bossHp = bossHpOf(combat);
  const hearts = combat.hearts;
  const answering = phase === "question" || phase === "feedback";
  const finished = phase === "won" || phase === "lost";
  // The arena stays on screen through the finisher AND the result — the loser
  // is left lying where they fell, so the outcome is something you can see
  // rather than only read on a card. The question list underneath does not.
  const inBattle = answering || phase === "finisher" || finished;

  /** Where each fighter rests once it's over. */
  const heroPose = phase === "won" ? "victory" : phase === "lost" ? "down" : null;
  const lastHit = phase === "feedback" && picked === current?.answer;

  // The body scrolls; without this, a long question leaves the NEXT one
  // opened mid-scroll with its prompt hidden above the fold.
  const bodyRef = useRef<HTMLDivElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  // Cleared on unmount so a battle closed mid-finisher can't set state on a
  // component that's gone.
  const finisherTimer = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (finisherTimer.current) clearTimeout(finisherTimer.current);
    },
    [],
  );
  useEffect(() => {
    if (phase === "question") bodyRef.current?.scrollTo({ top: 0 });
    if (phase === "feedback") {
      feedbackRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [phase, currentIndex]);

  function start() {
    setCombat(initCombat(total));
    setPicked(null);
    fx.clear();
    setPhase("question");
    setOpen(true);
  }

  function choose(i: number) {
    if (phase !== "question" || current === null) return;
    const correct = i === current.answer;
    setPicked(i);
    // Swing now, resolve on "continue": the student reads the explanation
    // while the blow is still on screen.
    fx.play(correct ? "player-attacks" : "boss-attacks");
    setPhase("feedback");
    if (!correct) setCombat(markMissed);
  }

  function advance() {
    if (current === null || picked === null) return;
    const { next, outcome } = resolve(combat, picked === current.answer);

    setPicked(null);
    setCombat(next);

    if (outcome === "fighting") {
      fx.clear();
      setPhase("question");
      return;
    }

    // Hold the last blow before the result card. Under reduced motion there
    // is no blow to watch, so the pause would be a plain delay — skip
    // straight to the result rather than making that viewer wait for an
    // animation they were never shown.
    fx.play(outcome === "won" ? "player-finishes" : "boss-finishes");
    setPhase("finisher");
    finisherTimer.current = window.setTimeout(
      () => finish(outcome, next.hearts, next.firstTryHits),
      fx.stillness ? 0 : FINISHER_MS,
    );
  }

  function finish(outcome: "won" | "lost", heartsLeft: number, hits: number) {
    setPhase(outcome);
    setLastResult(
      outcome === "won"
        ? `🏆 You defeated ${game.boss.name} — ${hits}/${total} first-try hits.`
        : `${game.boss.emoji} ${game.boss.name} won that round — ${hits}/${total} first-try hits.`,
    );
    // Any finished battle unlocks the next step — a loss retries here, but
    // never hard-blocks a struggling student from the rest of the day.
    // (useTurnIn unlocks before it saves, for the same reason.)
    void submit({
      content:
        `${game.title} — ${outcome === "won" ? `defeated ${game.boss.name}` : `defeated by ${game.boss.name}`}: ` +
        `${hits}/${total} first-try hits, ${heartsLeft} heart${heartsLeft === 1 ? "" : "s"} left.`,
    });
  }

  return (
    <>
      {/* Card on the lesson timeline — the door to the arena. */}
      <div className="rounded-2xl border border-violet-300/80 bg-linear-to-br from-violet-50/95 to-fuchsia-50/60 dark:border-violet-800/80 dark:from-violet-950/40 dark:to-fuchsia-950/20 p-5 text-center">
        <p className="text-sm font-semibold">{game.title}</p>
        <p className="mt-3 text-6xl" aria-hidden="true">
          {game.boss.emoji}
        </p>
        <p className="mt-2 text-base font-extrabold tracking-tight">{game.boss.name}</p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          {game.intro}
        </p>
        <p className="mt-2 text-xs text-zinc-500">
          {total} questions · {MAX_HEARTS} hearts · a wrong answer sends the
          question back for later
        </p>
        {inBattle && !open && (
          <p className="mx-auto mt-3 max-w-md rounded-xl border border-violet-200 dark:border-violet-900 bg-white/70 dark:bg-zinc-900/40 p-2.5 text-sm font-medium">
            ⚔️ Battle paused — {total - bossHp}/{total} hits landed,{" "}
            {hearts} heart{hearts === 1 ? "" : "s"} left. The {game.boss.name}{" "}
            is waiting.
          </p>
        )}
        {!inBattle && lastResult && (
          <p className="mx-auto mt-3 max-w-md rounded-xl border border-violet-200 dark:border-violet-900 bg-white/70 dark:bg-zinc-900/40 p-2.5 text-sm font-medium">
            {lastResult}
          </p>
        )}
        <button
          type="button"
          onClick={() => (inBattle ? setOpen(true) : start())}
          className="btn-primary mt-4"
        >
          {inBattle
            ? "⚔️ Return to the battle"
            : lastResult
              ? "⚔️ Fight again"
              : "⚔️ Enter the arena"}
        </button>
      </div>

      <GameModal open={open} onClose={() => setOpen(false)} label={game.title}>
        {/* Arena — pinned, always dark whatever the theme. */}
        <div
          className="relative shrink-0 bg-zinc-950 p-5 text-white"
          style={{
            backgroundImage:
              "radial-gradient(30rem 16rem at 50% 0%, rgb(124 58 237 / 0.35), transparent 65%), radial-gradient(20rem 12rem at 10% 100%, rgb(217 70 239 / 0.18), transparent 60%)",
          }}
        >
          {/* One white blink across the arena on the finishing blow. Sits
              above the fighters but below nothing else, and is pointer-inert
              so it can never eat a click during the beat. */}
          {phase === "finisher" && (
            <span
              key={`flash-${fx.tick}`}
              aria-hidden="true"
              className="anim-arena-flash pointer-events-none absolute inset-0 z-10 bg-white"
            />
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 pr-10">
            <p className="text-sm font-bold tracking-wide">{game.title}</p>
            {inBattle && (
              <p className="text-xs font-medium text-violet-300">
                {total - bossHp}/{total} hits landed
              </p>
            )}
          </div>

          {inBattle && (
            <div className="mt-3 text-center">
              {/* The stage: student on the left, boss on the right, facing
                  each other. A flex row inside the SAME fixed band the boss
                  alone used to occupy — the arena must not grow, or a long
                  battle starts depending on page height again, which the
                  modal exists to prevent. */}
              <div className="flex items-end justify-center gap-4 sm:gap-8">
                <div className="relative">
                  <Stickman
                    key={`me-${fx.tick}`}
                    pose={
                      heroPose ??
                      (phase === "feedback" ? (lastHit ? "attack" : "hurt") : "idle")
                    }
                    damage={damageRatio(combat)}
                    className={`h-16 w-14 sm:h-20 sm:w-16 ${
                      fx.move === "player-finishes"
                        ? "anim-finisher"
                        : fx.move === "boss-finishes"
                          ? "anim-hero-defeat"
                          : fx.move === "player-attacks"
                            ? "anim-lunge"
                            : fx.move === "boss-attacks"
                              ? "anim-recoil anim-flash"
                              : "anim-idle"
                    }`}
                  />
                  {/* The finishing sweep — a blade arc thrown clear across
                      the arena, only on the blow that ends it. */}
                  {fx.move === "player-finishes" && (
                    <span
                      key={`wave-${fx.tick}`}
                      aria-hidden="true"
                      className="anim-sword-wave pointer-events-none absolute -top-2 left-6 h-16 w-16 rounded-full border-r-[6px] border-t-[6px] border-emerald-100"
                    />
                  )}
                  {/* The swing's trail, thrown from the sword hand toward the
                      boss. Only on a hit — a miss has nothing to trail. */}
                  {fx.move === "player-attacks" && (
                    <span
                      key={`slash-${fx.tick}`}
                      aria-hidden="true"
                      className="anim-slash pointer-events-none absolute right-0 top-4 h-8 w-8 rounded-full border-r-4 border-t-4 border-emerald-200"
                    />
                  )}
                  {phase === "feedback" && !lastHit && (
                    <span
                      key={`ouch-${fx.tick}`}
                      aria-hidden="true"
                      className="anim-float absolute -top-1 -right-2 text-2xl font-black"
                    >
                      💢
                    </span>
                  )}
                </div>

                <div className="relative">
                  {/* The boss's glow, as a painted-once radial gradient BEHIND
                      the emoji rather than a `drop-shadow` on or around it.
                      A filter anywhere in the ancestor chain forces the whole
                      filtered subtree to re-rasterize whenever a descendant
                      transforms — so a shadow on the wrapper costs as much
                      per frame as one on the sprite itself. A sibling
                      gradient is outside that chain and paints once. */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(168_85_247/0.45),transparent_70%)]"
                  />
                  {/* Emoji face whichever way their platform draws them, so the
                      boss is flipped to look back at the student. On a system
                      that already draws it facing left this reads as facing
                      away — cosmetic, and preferable to both of them staring
                      the same direction. */}
                  <p
                    key={`boss-${fx.tick}`}
                    className={`text-5xl sm:text-6xl ${
                      // Beaten: toppled onto its side, greyed and dimmed —
                      // a static transform, so nothing animates while the
                      // result card is being read.
                      phase === "won"
                        ? "-scale-x-100 translate-y-3 rotate-90 opacity-40 grayscale"
                        : phase === "lost"
                          ? "-scale-x-100 scale-125"
                          : fx.move === "player-finishes"
                            ? "anim-boss-defeat"
                            : fx.move === "boss-finishes"
                              ? "anim-boss-triumph"
                              : fx.move === "player-attacks"
                                ? "-scale-x-100 anim-hit anim-flash"
                                : fx.move === "boss-attacks"
                                  ? "-scale-x-100 anim-lunge-back"
                                  : "anim-idle-boss"
                    }`}
                    aria-hidden="true"
                  >
                    {game.boss.emoji}
                  </p>
                  {phase === "feedback" && lastHit && (
                    <span
                      key={`dmg-${fx.tick}`}
                      aria-hidden="true"
                      className="anim-float absolute -top-1 -right-4 text-2xl font-black"
                    >
                      💥
                    </span>
                  )}
                </div>
              </div>
              <div className="mx-auto mt-1 max-w-xs">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                  <span>{game.boss.name}</span>
                  <span>
                    {bossHp}/{total} HP
                  </span>
                </div>
                {/* Segmented rather than a smooth bar: one notch per question,
                    so a landed hit is a discrete chunk disappearing — the way
                    a health bar reads in a 2D game — instead of a width
                    quietly interpolating. It also makes the remaining count
                    countable at a glance. */}
                <div
                  className="mt-1 flex gap-0.5"
                  role="img"
                  aria-label={`${bossHp} of ${total} boss health remaining`}
                >
                  {Array.from({ length: total }, (_, i) => (
                    <span
                      key={i}
                      className={`h-2.5 flex-1 transition-colors duration-200 ${
                        i < bossHp
                          ? "bg-linear-to-b from-rose-400 to-red-600"
                          : "bg-white/10"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p
                className="mt-2 text-sm tracking-widest"
                aria-label={`${hearts} of ${MAX_HEARTS} hearts left`}
              >
                {"❤️".repeat(Math.max(hearts, 0))}
                {"🖤".repeat(Math.max(MAX_HEARTS - hearts, 0))}
              </p>
            </div>
          )}
        </div>

        {/* Questions — the only part that scrolls. */}
        {answering && current && (
          <div ref={bodyRef} className="min-h-0 flex-1 overflow-y-auto bg-white p-5 dark:bg-zinc-900">
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
              <div
                ref={feedbackRef}
                className="mt-3 rounded-xl border border-violet-200 dark:border-violet-900 bg-violet-50/60 dark:bg-violet-950/30 p-3"
              >
                <p className="text-sm font-semibold">
                  {lastHit
                    ? `🗡️ Direct hit! ${game.boss.name} staggers.`
                    : `💢 ${game.boss.name} strikes back — you lose a heart. This one returns later!`}
                </p>
                <p className="mt-1 text-sm leading-relaxed">{current.explain}</p>
                <div className="mt-3 text-center">
                  <button type="button" onClick={advance} className="btn-primary">
                    {bossHp === 1 && lastHit ? "Land the final blow" : "Next →"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {finished && (
          <div className="min-h-0 flex-1 overflow-y-auto bg-white p-6 text-center dark:bg-zinc-900">
            <p className="text-7xl" aria-hidden="true">
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
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {combat.firstTryHits}/{total} first-try hits
              {phase === "won" ? ` · ${hearts} heart${hearts === 1 ? "" : "s"} left` : ""}.
              {phase === "lost" && " Every hero loses to the boss once — go again."}
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <button type="button" onClick={start} className="btn-primary">
                {phase === "won" ? "⚔️ Rematch for a perfect run" : "⚔️ Rematch"}
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
      </GameModal>
    </>
  );
}
