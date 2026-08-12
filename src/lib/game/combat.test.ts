import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  MAX_HEARTS,
  initCombat,
  currentQuestion,
  bossHp,
  markMissed,
  resolve,
  damageRatio,
} from "./combat";

/**
 * Tests for the boss battle's rules: pure functions, previously spread across
 * three useState setters in an event handler where the only way to check them
 * was to play the game. Pinned here so the pedagogy (wrong answers re-queue,
 * a first-try hit only counts if the question was never missed, a queue
 * emptied by the winning answer beats a simultaneous last-heart loss) can't
 * drift silently the next time the component is touched.
 *
 * Run: npm test
 */

describe("initCombat", () => {
  test("starts with a full queue, full hearts, and no hits", () => {
    const s = initCombat(3);
    assert.deepEqual(s.queue, [0, 1, 2]);
    assert.equal(s.hearts, MAX_HEARTS);
    assert.equal(s.missed.size, 0);
    assert.equal(s.firstTryHits, 0);
  });

  test("bossHp is the remaining queue length", () => {
    const s = initCombat(4);
    assert.equal(bossHp(s), 4);
  });
});

describe("resolve — a correct answer", () => {
  test("removes the question from the queue and lands a hit", () => {
    const s = initCombat(2);
    const r = resolve(s, true);
    assert.equal(r.hit, true);
    assert.deepEqual(r.next.queue, [1]);
    assert.equal(r.next.hearts, MAX_HEARTS);
  });

  test("counts as a first-try hit when the question was never missed", () => {
    const s = initCombat(1);
    const r = resolve(s, true);
    assert.equal(r.next.firstTryHits, 1);
  });

  test("does not count as a first-try hit once the question has been missed", () => {
    let s = initCombat(1);
    s = markMissed(s);
    const r = resolve(s, true);
    assert.equal(r.next.firstTryHits, 0);
  });

  test("emptying the queue on the final correct answer is a win, even at 1 heart", () => {
    let s = initCombat(1);
    s = resolve(s, false).next; // 4 hearts left, question re-queued
    s = resolve(s, false).next; // 3
    s = resolve(s, false).next; // 2
    s = resolve(s, false).next; // 1 heart left, still fighting
    const r = resolve(s, true); // the only question, answered correctly
    assert.equal(r.outcome, "won");
    assert.equal(r.next.hearts, 1);
  });
});

describe("resolve — a wrong answer", () => {
  test("costs a heart and sends the question to the back of the queue", () => {
    const s = initCombat(2);
    const r = resolve(s, false);
    assert.equal(r.hit, false);
    assert.equal(r.next.hearts, MAX_HEARTS - 1);
    assert.deepEqual(r.next.queue, [1, 0]);
  });

  test("losing the last heart on a still-nonempty queue is a loss", () => {
    let s = initCombat(2);
    for (let i = 0; i < MAX_HEARTS - 1; i++) s = resolve(s, false).next;
    const r = resolve(s, false);
    assert.equal(r.next.hearts, 0);
    assert.equal(r.outcome, "lost");
  });
});

describe("resolve — an empty queue", () => {
  test("is idempotent: already won, answering again changes nothing", () => {
    let s = initCombat(1);
    s = resolve(s, true).next;
    assert.equal(bossHp(s), 0);
    const r = resolve(s, true);
    assert.equal(r.outcome, "won");
    assert.equal(r.hit, false);
    assert.deepEqual(r.next, s);
  });
});

describe("markMissed", () => {
  test("marks the current question and is idempotent on repeat calls", () => {
    let s = initCombat(1);
    s = markMissed(s);
    assert.equal(s.missed.has(0), true);
    const again = markMissed(s);
    assert.equal(again, s); // same reference: no-op when already missed
  });

  test("does nothing once the queue is empty", () => {
    let s = initCombat(1);
    s = resolve(s, true).next;
    const after = markMissed(s);
    assert.equal(after, s);
  });
});

describe("currentQuestion", () => {
  test("is the head of the queue, and undefined once it's empty", () => {
    let s = initCombat(2);
    assert.equal(currentQuestion(s), 0);
    s = resolve(s, true).next;
    assert.equal(currentQuestion(s), 1);
    s = resolve(s, true).next;
    assert.equal(currentQuestion(s), undefined);
  });
});

describe("damageRatio", () => {
  test("is 0 at full hearts and 1 at zero hearts", () => {
    const full = initCombat(1);
    assert.equal(damageRatio(full), 0);
    const zeroHearts = { ...full, hearts: 0 };
    assert.equal(damageRatio(zeroHearts), 1);
  });

  test("is clamped to [0, 1] even outside the normal hearts range", () => {
    const over = { ...initCombat(1), hearts: MAX_HEARTS + 3 };
    assert.equal(damageRatio(over), 0);
  });
});
