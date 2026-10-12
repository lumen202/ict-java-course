import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { weeks } from "./index";
import type { DayPlan, JsonCheck, JsonCheckTask, Week } from "./types";
import { firstJsonFailure, parsePasted } from "@/lib/game/jsonChecks";

/**
 * Structural checks over the whole authored corpus — the defects that are
 * invisible per-item and only exist across a day, a week, or the collection.
 *
 * `console-tasks.test.ts` proves every SQL task RUNS. This file proves the
 * content is well-formed in the ways the renderers and the turn-in system
 * silently depend on: ids that key persisted student work, typing templates
 * that actually contain a blank, choice indexes that point at a real choice,
 * and a correct-answer distribution that isn't guessable by position.
 *
 * None of this is checkable by reading one item, which is exactly why it needs
 * a test rather than an authoring rule.
 */

type Block = { kind?: string; id?: string; [k: string]: unknown };

/** Every id-bearing block on a day, in render order. */
function blocks(day: DayPlan): Block[] {
  const all = [day.warmupGame, day.warmup, ...(day.activities ?? []), day.game] as unknown as (
    | Block
    | undefined
  )[];
  return all.filter((b): b is Block => !!b);
}

/** Every multiple-choice question in the corpus, wherever it lives. */
function choiceSets(day: DayPlan): { where: string; choices: string[]; answer: number }[] {
  const out: { where: string; choices: string[]; answer: number }[] = [];
  for (const b of blocks(day)) {
    const id = b.id ?? "?";
    if (b.kind === "boss-battle") {
      for (const [i, q] of (b.questions as { choices: string[]; answer: number }[]).entries()) {
        out.push({ where: `${id} q${i + 1}`, choices: q.choices, answer: q.answer });
      }
    }
    if (b.kind === "quest") {
      for (const [i, m] of (
        b.missions as { check?: { choices: string[]; answer: number } }[]
      ).entries()) {
        if (m.check) out.push({ where: `${id} m${i + 1}`, choices: m.check.choices, answer: m.check.answer });
      }
    }
    if (b.kind === "sql-console") {
      for (const [i, t] of (
        b.tasks as { predict?: { choices: string[]; answer: number } }[]
      ).entries()) {
        if (t.predict) out.push({ where: `${id} t${i + 1}`, choices: t.predict.choices, answer: t.predict.answer });
      }
    }
  }
  return out;
}

function eachDay(fn: (week: Week, day: DayPlan, label: string) => void) {
  for (const week of weeks) {
    for (const day of week.video.days) fn(week, day, `${week.slug} · ${day.day}`);
  }
}

describe("content integrity", () => {
  test("every block id is unique within its day and matches the turn-in key format", () => {
    eachDay((_w, day, label) => {
      const seen = new Set<string>();
      for (const b of blocks(day)) {
        if (!b.id) continue;
        assert.match(b.id, /^[a-z0-9-]{1,40}$/, `${label}: id "${b.id}" can't key a turn-in`);
        assert.ok(!seen.has(b.id), `${label}: duplicate id "${b.id}" — the two would share a turn-in`);
        seen.add(b.id);
      }
    });
  });

  test("every choice index points at a choice that exists", () => {
    eachDay((_w, day, label) => {
      for (const { where, choices, answer } of choiceSets(day)) {
        assert.ok(
          Number.isInteger(answer) && answer >= 0 && answer < choices.length,
          `${label} · ${where}: answer ${answer} is outside 0..${choices.length - 1}`,
        );
        assert.ok(choices.length >= 2, `${label} · ${where}: needs at least two choices`);
      }
    });
  });

  test("no day's questions are answerable by always picking the same position", () => {
    // The corpus-wide version of this was a real defect once: 61 of 62 boss
    // answers sat at index 0, so the quiz measured position, not knowledge.
    // `lib/game/shuffle.ts` now shuffles at render time, which fixes it for
    // good — this guards the authored data anyway, because a day that is 100%
    // one position is a signal the author stopped thinking, not just a
    // shuffling problem.
    // Weeks 1-2 predate the shuffle and are frozen by the teacher's scope
    // (2026-09-03) — the render-time shuffle makes them harmless in the app,
    // and this list is the visible record of the debt rather than a silent skip.
    const legacySkew = new Set(["unit1-week1 · Day 4"]);
    eachDay((_w, day, label) => {
      if (legacySkew.has(label)) return;
      const answers = choiceSets(day).map((c) => c.answer);
      if (answers.length < 6) return;
      for (const position of new Set(answers)) {
        const share = answers.filter((a) => a === position).length / answers.length;
        assert.ok(
          share < 0.9,
          `${label}: ${Math.round(share * 100)}% of ${answers.length} answers sit at index ${position}`,
        );
      }
    });
  });

  test("every typing round has a blank to type, with balanced braces", () => {
    eachDay((_w, day, label) => {
      for (const b of blocks(day)) {
        if (b.kind !== "typing") continue;
        for (const [i, r] of (b.rounds as { template: string }[]).entries()) {
          const opens = (r.template.match(/\{/g) ?? []).length;
          const closes = (r.template.match(/\}/g) ?? []).length;
          assert.equal(
            opens,
            closes,
            `${label} · ${b.id} round ${i + 1}: ${opens} "{" vs ${closes} "}" — an unbalanced template renders as literal text`,
          );
          assert.ok(opens > 0, `${label} · ${b.id} round ${i + 1}: no blank, so there is nothing to type`);
          // `{` and `}` ARE the blank markers (TypingGame.parseTemplate), so a
          // literal Java block brace inside a template silently becomes part of
          // a blank — balanced counts don't catch it. Java rounds must be
          // written without block braces.
          for (const blank of r.template.split(/\{([^}]*)\}/).filter((_, n) => n % 2 === 1)) {
            assert.ok(
              !blank.includes("{"),
              `${label} · ${b.id} round ${i + 1}: blank "${blank.slice(0, 40)}" contains a literal brace — it will mis-parse`,
            );
          }
        }
      }
    });
  });

  test("order-game distractors are never also correct lines", () => {
    eachDay((_w, day, label) => {
      for (const b of blocks(day)) {
        if (b.kind !== "order") continue;
        for (const [i, r] of (b.rounds as { lines: string[]; distractors?: string[] }[]).entries()) {
          assert.ok(r.lines.length >= 2, `${label} · ${b.id} round ${i + 1}: needs at least two lines`);
          for (const d of r.distractors ?? []) {
            assert.ok(
              !r.lines.includes(d),
              `${label} · ${b.id} round ${i + 1}: "${d}" is both required and forbidden`,
            );
          }
        }
      }
    });
  });

  test("every html-sandbox task can fail, says why, and has a stuck exit", () => {
    // firstFailure([]) is null, so a task with no checks clears on the first
    // click — a checkpoint that checks nothing. And the failing check's
    // message IS the feedback, and the solution IS the stuck exit (BUG-015).
    eachDay((_w, day, label) => {
      for (const b of blocks(day)) {
        if (b.kind !== "html-sandbox") continue;
        const scripted = b.script !== undefined;
        const tasks = b.tasks as { checks: { selector?: string; message: string }[]; solution: string; actions?: unknown[] }[];
        for (const [i, t] of tasks.entries()) {
          const where = `${label} · ${b.id} task ${i + 1}`;
          assert.ok(t.checks.length > 0, `${where}: no checks, so it clears without looking at the page`);
          assert.ok(t.solution.trim().length > 0, `${where}: empty solution — the stuck exit would reveal nothing`);
          // Only a script page runs, so only it can be acted on or print.
          assert.ok(scripted || !t.actions, `${where}: actions on a game with no script editor are never performed`);
          for (const c of t.checks as {
            selector?: string;
            log?: string;
            message: string;
            exact?: number;
            text?: string;
            textNot?: string;
            attr?: unknown;
            css?: unknown;
            cssNot?: unknown;
          }[]) {
            assert.ok(
              (c.selector === undefined) !== (c.log === undefined),
              `${where}: a check needs exactly one of selector or log (${c.message})`,
            );
            assert.ok(scripted || c.log === undefined, `${where}: a log check on a game with no script editor can never pass`);
            const s = c as { source?: boolean; css?: unknown; cssNot?: unknown };
            assert.ok(!s.source || (scripted && s.css === undefined && s.cssNot === undefined), `${where}: a source check needs a script game and can't read computed styles`);
            assert.ok(c.message.trim().length > 0, `${where}: check "${c.selector ?? c.log}" has no message to show when it fails`);
            // exact: 0 returns before any filter is read (htmlChecks.ts), so a
            // filter beside it is silently ignored. Put the filter in the selector.
            if (c.exact === 0) {
              assert.ok(
                c.text === undefined && c.textNot === undefined && c.attr === undefined && c.css === undefined && c.cssNot === undefined,
                `${where}: check "${c.selector}" combines exact: 0 with a filter, which is never applied`,
              );
            }
          }
        }
      }
    });
  });

  test("from Unit 2 on, every quest mission and checkpoint task has a hint", () => {
    // The hint renders only when authored, so a missing one silently removes
    // the only self-serve help on that step — and the teacher asked for every
    // step to have one (2026-09-27): the class is beginners, and a confused
    // student otherwise waits for the teacher.
    eachDay((week, day, label) => {
      if (!week.slug.startsWith("unit1-")) {
        for (const b of blocks(day)) {
          const parts =
            b.kind === "quest" ? (b.missions as { hint?: string }[]) :
            b.kind === "html-sandbox" || b.kind === "json-check" ? (b.tasks as { hint?: string }[]) : [];
          for (const [i, p] of parts.entries()) {
            assert.ok(p.hint?.trim(), `${label} · ${b.id} #${i + 1}: no hint`);
          }
        }
      }
    });
  });

  test("every json-check task can be cleared by a correct app, and fails an empty answer", () => {
    // `example` is a real answer captured from a correct Spring Boot build. If
    // its own checks reject it, no student can clear the task; if "[]" and
    // "{}" pass, the task checks nothing.
    eachDay((_w, day, label) => {
      for (const b of blocks(day)) {
        if (b.kind !== "json-check") continue;
        for (const [i, t] of (b.tasks as JsonCheckTask[]).entries()) {
          const where = `${label} · ${b.id} task ${i + 1}`;
          assert.ok(t.checks.length > 0, `${where}: no checks`);
          assert.ok(t.solution.trim().length > 0, `${where}: empty solution — the stuck exit would reveal nothing`);
          for (const ch of t.checks as JsonCheck[]) {
            assert.ok(ch.message.trim().length > 0, `${where}: a check has no message`);
          }
          const parsed = parsePasted(t.example);
          assert.ok(parsed.ok, `${where}: example is not JSON`);
          const failed = parsed.ok ? firstJsonFailure(parsed.value, t.checks) : null;
          assert.equal(failed, null, `${where}: the correct example fails "${failed?.message}"`);
          for (const empty of [[], {}]) {
            assert.notEqual(firstJsonFailure(empty, t.checks), null, `${where}: ${JSON.stringify(empty)} passes every check`);
          }
        }
      }
    });
  });

  test("an html-sandbox's editor is labelled with the file its starter asks for", () => {
    // The starter tells the student which file to paste; the editor header and
    // the teacher's turn-in name it too. Before this rule every checkpoint said
    // index.html while asking for menu.html or tables.html.
    eachDay((_w, day, label) => {
      for (const b of blocks(day)) {
        if (b.kind !== "html-sandbox") continue;
        const asked = /paste your whole (\S+\.html)/i.exec(b.starter as string)?.[1];
        if (!asked) continue;
        assert.equal((b.fileName as string | undefined) ?? "index.html", asked, `${label} · ${b.id}: editor label vs starter`);
      }
    });
  });

  test("a script checkpoint's editor is labelled with the file its starter asks for", () => {
    // Same rule for the JavaScript editor — and it matters more here, because
    // the label is also the file name the page's <script src> must name for
    // the code to load at all (sandboxPage.ts).
    eachDay((_w, day, label) => {
      for (const b of blocks(day)) {
        if (b.kind !== "html-sandbox" || b.script === undefined) continue;
        const asked = /paste your whole (\S+\.js)\b/i.exec(b.script as string)?.[1];
        if (!asked) continue;
        assert.equal((b.scriptFile as string | undefined) ?? "script.js", asked, `${label} · ${b.id}: script label vs starter`);
      }
    });
  });

  test("every activity a student can be graded on can be turned in", () => {
    // A plain DayActivity with no `submit` renders a card with no turn-in box,
    // so the teacher's "N of M" never counts it and the student's progress
    // gate has nothing to unlock on.
    eachDay((_w, day, label) => {
      for (const b of blocks(day)) {
        if (b.kind !== undefined) continue; // games carry their own turn-in
        assert.ok(
          typeof b.submit === "string" && b.submit.length > 0,
          `${label} · ${b.id}: a plain activity with no submit text has no turn-in box`,
        );
      }
    });
  });
});
