// The boss battle's rules, as pure functions.
//
// No React, no DOM, no fetch — give it a state and an answer, get the next
// state back. That separation is the point: the fight has real rules (a wrong
// answer requeues the question, first-try hits only count if the question was
// never missed, the battle can end two different ways) and those rules were
// previously spread across three `useState` setters in an event handler, where
// the only way to check them was to play the game.
//
// The pedagogy lives here too, and it is deliberate:
//
//   A wrong answer sends the question BACK INTO THE QUEUE rather than
//   discarding it. So a win means every concept was eventually answered
//   correctly — spaced retrieval practice wearing a dragon costume. Losing
//   costs a heart, not progress.

export const MAX_HEARTS = 5;

export type CombatState = {
  /** Indices of questions still to answer, in order. Length is the boss's HP. */
  queue: number[];
  hearts: number;
  /** Questions answered wrong at least once — they can't earn a first-try hit. */
  missed: Set<number>;
  firstTryHits: number;
};

export type CombatOutcome = "fighting" | "won" | "lost";

/** What one answer did, for the UI to animate and narrate. */
export type CombatResolution = {
  next: CombatState;
  /** True when the student hit the boss; false when the boss hit back. */
  hit: boolean;
  outcome: CombatOutcome;
};

export function initCombat(questionCount: number): CombatState {
  return {
    queue: Array.from({ length: questionCount }, (_, i) => i),
    hearts: MAX_HEARTS,
    missed: new Set(),
    firstTryHits: 0,
  };
}

/** The question being asked, or undefined once the queue is empty. */
export function currentQuestion(state: CombatState): number | undefined {
  return state.queue[0];
}

/** Boss HP is simply how much of the queue is left — one hit per question. */
export function bossHp(state: CombatState): number {
  return state.queue.length;
}

/**
 * Mark the current question as missed. Called the moment a wrong choice is
 * made, which is *before* `resolve` runs — the student sees the explanation
 * first and only then advances. Splitting it this way is what lets a wrong
 * answer show its teaching text without immediately costing the turn.
 */
export function markMissed(state: CombatState): CombatState {
  const index = currentQuestion(state);
  if (index === undefined || state.missed.has(index)) return state;
  return { ...state, missed: new Set(state.missed).add(index) };
}

/**
 * Advance the fight by one answered question.
 *
 * Order matters in the outcome check: a queue emptied by the final correct
 * answer is a win even if it was the last heart, because the student did in
 * fact finish. Checking hearts first would snatch a loss out of a completed
 * battle.
 */
export function resolve(state: CombatState, correct: boolean): CombatResolution {
  const index = currentQuestion(state);
  if (index === undefined) {
    return { next: state, hit: false, outcome: "won" };
  }

  const queue = correct ? state.queue.slice(1) : [...state.queue.slice(1), index];
  const hearts = correct ? state.hearts : state.hearts - 1;
  const firstTryHits =
    correct && !state.missed.has(index) ? state.firstTryHits + 1 : state.firstTryHits;

  const next: CombatState = { ...state, queue, hearts, firstTryHits };
  const outcome: CombatOutcome =
    queue.length === 0 ? "won" : hearts <= 0 ? "lost" : "fighting";

  return { next, hit: correct, outcome };
}

/**
 * How beaten up the student's fighter looks, 0 (untouched) to 1 (one heart
 * from out). Drives the stickman's damage pose — see components/Stickman.tsx.
 */
export function damageRatio(state: CombatState): number {
  return Math.min(1, Math.max(0, (MAX_HEARTS - state.hearts) / MAX_HEARTS));
}
