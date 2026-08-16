// Deterministic, seeded shuffling for game choices.
//
// Why this exists: an audit found the correct answer sat at index 0 in 61 of
// 62 boss questions and 100% of quest checks — students could clear quizzes by
// pattern-matching the first button without reading. Shuffling at render time
// fixes every existing question at once without touching content, and a
// SEEDED shuffle (keyed by game id + question index) keeps the order stable
// across re-renders, re-queues (boss battles re-ask missed questions) and
// reloads — while still varying between questions and between games.

/** 32-bit string hash (FNV-1a). */
function hash(seed: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32 PRNG — tiny, deterministic, good enough for shuffling. */
function mulberry32(a: number): () => number {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher–Yates with a seeded PRNG — same seed, same order, every time. */
export function seededShuffle<T>(items: readonly T[], seedKey: string): T[] {
  const out = items.slice();
  const rand = mulberry32(hash(seedKey));
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Shuffle a multiple-choice question's options and remap its answer index.
 * Key by something stable and unique per question (e.g. `${gameId}:${qIndex}`).
 */
export function shuffledChoices(
  choices: readonly string[],
  answer: number,
  seedKey: string,
): { choices: string[]; answer: number } {
  const order = seededShuffle(
    choices.map((_, i) => i),
    seedKey,
  );
  return {
    choices: order.map((i) => choices[i]),
    answer: order.indexOf(answer),
  };
}
