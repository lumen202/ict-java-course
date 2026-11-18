// unit3-week10 — small builders so the day files read as data, not as plumbing.
//
// A multiple-choice question is written with its correct choice first, then the wrong ones;
// `place` puts the correct one at a position taken from a fixed rotation, so no day or week
// clusters its answers on one position (week10.test.ts measures it). The rotation is
// deterministic: the same content always renders the same way.

import type { GameQuestion, QuestMission } from "../../types";

const ROTATION = [1, 2, 0, 2, 0, 1, 0, 1, 2, 2, 1, 0, 1, 0, 2, 0, 2, 1];
let counter = 0;

/** Returns the choices with `correct` at the next rotation position, and that position as the answer index. */
export const place = (correct: string, wrongs: [string, string]): { choices: string[]; answer: number } => {
  const answer = ROTATION[counter++ % ROTATION.length];
  const choices = [...wrongs];
  choices.splice(answer, 0, correct);
  return { choices, answer };
};

/** A quest mission's multiple-choice check. */
export const mc = (question: string, correct: string, wrongs: [string, string], explain: string) => ({
  question,
  ...place(correct, wrongs),
  explain,
});

/** A boss-battle question. */
export const bq = (prompt: string, correct: string, wrongs: [string, string], explain: string): GameQuestion => ({
  prompt,
  ...place(correct, wrongs),
  explain,
});

/** A mission with a check (or, with none, a do-it step such as a compare block). */
export const mission = (task: string, hint: string, check?: ReturnType<typeof mc>, code?: string): QuestMission => ({
  task,
  ...(code ? { code } : {}),
  hint,
  ...(check ? { check } : {}),
});

/** A mission that clears by pasting something in. */
export const paste = (task: string, hint: string, input: string): QuestMission => ({ task, hint, input });
