import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { createState, cloneState, runBatch } from "../minisql";
import { weeks } from "./index";
import type { DayPlan, SqlConsoleGame } from "./types";

/**
 * Every authored `sql-console` task, run against the real engine exactly the
 * way `components/SqlConsole.tsx` runs it: clone the state, run the task's
 * `solution`, commit, move to the next task.
 *
 * This exists because a console task is a fixture, not copy. The engine is a
 * subset of MySQL (`lib/minisql.ts`), so a task authored against real MySQL
 * can be reviewed, committed and shipped while being unrunnable — and a
 * student meets that as a task nothing can clear. A scratch script run once
 * at authoring time proves only that day; this proves the whole corpus on
 * every `npm test`, including after the engine changes underneath it.
 *
 * A task whose solution is *meant* to fail (the "break it on purpose" labs)
 * always says so somewhere the student can read it — the code, or the words
 * "break"/"error"/"refuse". That is how the task tells a student what to
 * expect, so it is also how it tells this test. A task that errors without
 * announcing it is the real defect: nothing on screen says the red line was
 * the destination.
 */

/** Does the task tell the student, anywhere, that this one is meant to fail? */
const ANNOUNCES_FAILURE = /\b1\d{3}\b|error|break|refus|bounce|reject|complain/i;

function consoles(day: DayPlan): SqlConsoleGame[] {
  const blocks = [day.warmupGame, ...(day.activities ?? []), day.game];
  return blocks.filter(
    (b): b is SqlConsoleGame => !!b && "kind" in b && b.kind === "sql-console",
  );
}

describe("authored console tasks run on the real engine", () => {
  for (const week of weeks) {
    for (const day of week.video.days) {
      for (const game of consoles(day)) {
        test(`${week.slug} · ${day.day} · ${game.id}`, () => {
          let engine = createState(game.setup);
          game.tasks.forEach((task, i) => {
            const where = `${game.id} task ${i + 1}: ${task.goal.slice(0, 60)}…`;
            const work = cloneState(engine);
            const batch = runBatch(work, task.solution);
            if (batch.error && !ANNOUNCES_FAILURE.test(JSON.stringify(task))) {
              assert.fail(`${where}\n  solution failed: ${batch.error.message}`);
            }
            engine = work;
          });
        });
      }
    }
  }
});
