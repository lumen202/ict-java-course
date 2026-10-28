import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { unit3Week8 } from "./index";
import { weeks } from "../../index";
import * as S from "./snippets";
import { firstJsonFailure, parsePasted } from "../../../game/jsonChecks";
import type { JsonCheckGame, JsonCheckTask, QuestGame, BossBattleGame } from "../../types";

/**
 * Week 8 rules that the corpus-wide integrity tests can't see: the Java the labs
 * type is composed in snippets.ts (and was compiled against Spring Boot 4.1.1
 * and a real MySQL 8.0 ledger when it was written), so these guard its shape and
 * the things this week must never contain: a real password, wording the course
 * keeps out of student copy, answers pinned to one student's own data, and a
 * checkpoint that last stage's app already passes. Each guard is first proved
 * able to fail, on a planted bad value, so "nothing found" can't just mean
 * "pattern never matches".
 */

const everything = JSON.stringify(unit3Week8);
/** Everything a student reads: the captured example and previous-stage answers are real data from one ledger and are left out. */
const prose = JSON.stringify(unit3Week8, (key, value) => (key === "example" || key === "previousStage" ? undefined : value));
const days = unit3Week8.video.days;

const PASSWORD_LINE = /spring\.datasource\.password=([^\\"\s]*)/g;
const BANNED = /\b(grade[sd]?|grading|attendance|absent|teacher|capstone|final project)\b/i;

type Block = { kind?: string; id: string; [k: string]: unknown };
const blocks = (): { day: string; b: Block }[] =>
  days.flatMap((d) => [d.warmupGame, ...(d.activities ?? []), d.game].filter(Boolean).map((b) => ({ day: d.day, b: b as unknown as Block })));

const checkpoints = days.flatMap((d) =>
  (d.activities ?? []).filter((a): a is JsonCheckGame => (a as { kind?: string }).kind === "json-check"),
);

describe("week 8: what must never appear", () => {
  test("the password guard can fail", () => {
    const planted = [..."x spring.datasource.password=hunter2 y".matchAll(PASSWORD_LINE)];
    assert.equal(planted[0]?.[1], "hunter2");
    assert.ok(BANNED.test("this is graded"));
    assert.ok(BANNED.test("ask the teacher"));
  });

  test("the only password a lesson shows is the placeholder", () => {
    const lines = [...everything.matchAll(PASSWORD_LINE)];
    assert.ok(lines.length >= 2, "the lessons should show the password line (as a placeholder) at least twice");
    for (const m of lines) assert.equal(m[1], "YOUR_MYSQL_PASSWORD", "a datasource password line other than the placeholder");
    assert.ok(S.PROPERTIES_FILE.includes("spring.datasource.password=YOUR_MYSQL_PASSWORD"));
  });

  test("student-facing copy never mentions grading, attendance, the teacher or the capstone", () => {
    const hit = BANNED.exec(everything);
    assert.equal(hit, null, `banned wording: ${hit?.[0]}`);
  });

  test("no turn-in prompt invites the password line", () => {
    // The wrong-password break asked students to paste "the line you changed",
    // which is their real password. Every prompt that collects text (a mission's
    // input, an activity's submit, an upload's steps) must steer away from it.
    const invites = /the line you changed|paste (the |your )?(whole )?(file )?application\.properties|paste (the |your )?password/i;
    assert.ok(invites.test("write the line you changed"), "the guard can see the old wording");
    assert.ok(invites.test("Paste your application.properties"));
    const prompts: string[] = [];
    for (const { b } of blocks()) {
      for (const m of (b.missions as { input?: string; task?: string }[] | undefined) ?? []) if (m.input) prompts.push(m.input);
      if (typeof b.submit === "string") prompts.push(b.submit);
      if (b.kind === "upload") prompts.push(...(b.steps as string[]), String(b.proves));
    }
    for (const d of days) {
      const steps = typeof d.practice === "string" ? [d.practice] : d.practice.steps;
      prompts.push(...steps);
    }
    assert.ok(prompts.length > 20);
    for (const p of prompts) assert.ok(!invites.test(p), `a prompt invites the password: ${p.slice(0, 100)}`);
    // the break-it table names the setting and writes the placeholder instead
    assert.ok(everything.includes("password=…(wrong)"), "the break-it table should tell students to write password=…(wrong)");
    // any prompt that mentions the file says never / not
    for (const p of prompts) {
      if (/application\.properties/.test(p)) assert.ok(/never|not |n't|close/i.test(p), `a prompt mentions application.properties without a warning: ${p.slice(0, 100)}`);
    }
  });
});

describe("week 8: the controller stages", () => {
  const stages = {
    D1A: S.CONTROLLER_D1A, D1: S.CONTROLLER_D1, D2A: S.CONTROLLER_D2A, D2: S.CONTROLLER_D2,
    D3A: S.CONTROLLER_D3A, D3: S.CONTROLLER_D3, D4A: S.CONTROLLER_D4A, D4: S.CONTROLLER_D4, D5: S.CONTROLLER_D5,
  };

  /** Problems with the balance of (), {} and text blocks in Java source. */
  const imbalance = (code: string): string[] => {
    const problems: string[] = [];
    for (const [open, close] of [["{", "}"], ["(", ")"]] as const) {
      const o = code.split(open).length - 1;
      const c = code.split(close).length - 1;
      if (o !== c) problems.push(`${open} ${o} vs ${close} ${c}`);
    }
    if ((code.match(/"""/g) ?? []).length % 2 !== 0) problems.push("unbalanced text block");
    return problems;
  };

  test("the balance check can fail", () => {
    assert.deepEqual(imbalance("class A { void f( ) { } }"), []);
    assert.deepEqual(imbalance("class A { void f( ) { }"), ["{ 2 vs } 1"]);
    assert.deepEqual(imbalance("void f( { }"), ["( 1 vs ) 0"]);
    assert.deepEqual(imbalance('x = """\n a\n'), ["unbalanced text block"]);
  });

  test("braces, brackets and text blocks balance in every stage and in RowsController", () => {
    for (const [name, code] of Object.entries({ ...stages, rows: S.ROWS_CONTROLLER_MODEL })) {
      assert.deepEqual(imbalance(code), [], name);
    }
  });

  test("every stage injects JdbcClient, and the Java snack list is gone from Day 2 on", () => {
    for (const [name, code] of Object.entries(stages)) {
      assert.ok(code.includes("import org.springframework.jdbc.core.simple.JdbcClient;"), `${name}: no JdbcClient import`);
      assert.ok(code.includes("public SnackController(JdbcClient jdbc)"), `${name}: no constructor injection`);
    }
    assert.ok(S.CONTROLLER_D1.includes("List.of(") && S.CONTROLLER_D1A.includes("List.of("), "Day 1 keeps the Java list for getSnack until Day 2");
    for (const name of ["D2A", "D2", "D3A", "D3", "D4A", "D4", "D5"] as const) {
      assert.ok(!stages[name].includes("List.of("), `${name}: a Java list of snacks is still there`);
      assert.ok(!stages[name].includes("for (Snack s : snacks)"), `${name}: still loops over the Java snacks`);
    }
  });

  test("the write day keeps the Java orders list for the board; the read day deletes it", () => {
    for (const code of [S.CONTROLLER_D3A, S.CONTROLLER_D3]) {
      assert.ok(code.includes("orders.add(order);"));
      assert.ok(code.includes("KeyHolder keys = new GeneratedKeyHolder();"));
      assert.ok(code.includes("new Order(newId,"));
    }
    for (const code of [S.CONTROLLER_D4A, S.CONTROLLER_D4, S.CONTROLLER_D5]) {
      for (const gone of ["orders.add", "new ArrayList", "List<Order> orders", "import java.util.ArrayList;"]) {
        assert.ok(!code.includes(gone), `a Day 4+ stage still contains ${gone}`);
      }
      assert.ok(code.includes("listOrders(null)"), "summary() must call the new listOrders(String)");
    }
    assert.ok(S.SUMMARY_D4_NO_DATE.includes("listOrders()") && !S.SUMMARY_D4_NO_DATE.includes("null"));
  });

  test("each Part 2 adds what it says, and later stages keep it", () => {
    assert.ok(S.CONTROLLER_D1.includes('"/api/sales"') && !S.CONTROLLER_D1A.includes('"/api/sales"'));
    for (const name of ["D1", "D2A", "D2", "D3A", "D3", "D4A", "D4", "D5"] as const) assert.ok(stages[name].includes('"/api/sales"'), `${name} lost /api/sales`);
    assert.ok(S.CONTROLLER_D2.includes("name LIKE ?") && S.CONTROLLER_D2.includes("sort must be price or name"));
    assert.ok(!S.CONTROLLER_D2A.includes("LIKE"));
    for (const name of ["D3", "D4A", "D4", "D5"] as const) {
      assert.ok(stages[name].includes("catch (DuplicateKeyException e)"), `${name} lost addSnack`);
      assert.ok(stages[name].includes("import org.springframework.dao.DuplicateKeyException;"), `${name}: no DuplicateKeyException import`);
    }
    assert.ok(!S.CONTROLLER_D3A.includes("addSnack"));
    // Day 4 Part 2: every SELECT that calculates a total uses the stored price, and Part 1's do not
    for (const name of ["D4", "D5"] as const) {
      const totals = stages[name].match(/AS total/g) ?? [];
      const paid = stages[name].match(/COALESCE\(sales\.price_paid, snacks\.price\) AS total/g) ?? [];
      assert.equal(totals.length, 3, `${name}: three SELECTs calculate a total (list, ?date= list, getOrder)`);
      assert.equal(paid.length, 3, `${name}: all three must use the stored price`);
      assert.ok(stages[name].includes("INSERT INTO sales (snack_id, sold_on, qty, price_paid) VALUES (?, CURRENT_DATE, ?, ?)"));
    }
    assert.ok(!S.CONTROLLER_D4A.includes("COALESCE") && !S.CONTROLLER_D4A.includes("price_paid"));
    assert.ok(S.CONTROLLER_D5.includes('"/api/special"') && !S.CONTROLLER_D4.includes('"/api/special"'));
    assert.ok(S.CONTROLLER_D5.includes("No special today"));
  });

  /** The text handed to jdbc.sql(…): everything up to the first .param/.query/.update after it. */
  const sqlArguments = (code: string): string[] => {
    const out: string[] = [];
    for (const m of code.matchAll(/jdbc\.sql\(/g)) {
      const rest = code.slice(m.index! + m[0].length);
      out.push(rest.split(/\n\s*\.(?:param|query|update)\(/)[0]);
    }
    return out;
  };

  test("no SQL in the finished controller glues a value in; only the deliberately glued lab snippets do", () => {
    const glued = (sql: string) => /"\s*\+|\+\s*"/.test(sql) || /\+\s*[a-z]/i.test(sql.replace(/"[^"]*"/g, ""));
    assert.ok(sqlArguments(S.FIND_GLUED).some(glued), "the glue guard must be able to see the glued /api/find");
    assert.ok(sqlArguments(S.SORT_GLUED).some(glued), "…and the glued ORDER BY");
    assert.ok(!sqlArguments(S.FIND_SAFE).some(glued));
    assert.ok(!sqlArguments(S.SORT_QMARK).some(glued));
    for (const [name, code] of Object.entries(stages)) {
      const found = sqlArguments(code);
      assert.ok(found.length >= 1, `${name}: the extractor found no SQL`);
      assert.ok(!found.some(glued), `${name}: SQL built with +`);
    }
    // the % marks of LIKE go on the VALUE, in .param, never in the SQL
    assert.ok(S.SEARCH_BRANCH.includes('.param("%" + name + "%")'));
  });

  test("the summary stays a Java loop: Unit 1 never taught SUM or GROUP BY", () => {
    const aggregate = /\b(SUM|COUNT|AVG|GROUP BY)\b/;
    assert.ok(aggregate.test("SELECT SUM(total) FROM x"));
    const sql = Object.values(stages).join("\n") + S.ROWS_CONTROLLER_MODEL;
    assert.ok(!aggregate.test(sql), "an aggregate crept into the Java");
  });
});

describe("week 8: the checkpoints", () => {
  test("every day has a Part 1 and a Part 2 checkpoint, and every task names an address or a console line", () => {
    assert.equal(checkpoints.length, 10);
    for (const d of days) {
      const own = (d.activities ?? []).filter((a) => (a as { kind?: string }).kind === "json-check");
      assert.equal(own.length, 2, `${d.day}: one checkpoint per part`);
    }
    for (const g of checkpoints) {
      for (const t of g.tasks) {
        assert.ok(t.url || t.command, `${g.id}: a task with neither an address nor a console line`);
        if (t.url) assert.ok(t.url.startsWith("localhost:8080/"), `${g.id}: ${t.url}`);
        if (t.command) assert.ok(t.command.endsWith(".then(copy)"), `${g.id}: command must end with .then(copy)`);
      }
    }
  });

  const students = /Banana cue|Turon|Kwek-kwek|Gulaman|Siopao|Pastillas|Taho/;

  test("checks are never pinned to rows a student's own Weeks 2-4 ledger decides", () => {
    // Kutsinta (id 90, price 10), the 2000-01-0x sales and Halo-halo are put there by lab steps;
    // everything else must be a shape. The Week 3 snacks (and Week 3 Day 5's Taho at id 7) must never be required.
    assert.ok(students.test('{"some":{"name":"Turon"}}'), "the guard can see a pinned name");
    assert.ok(students.test('{"some":{"name":"Taho"}}'), "…including Week 3 Day 5's Taho");
    const smallIds = /"snack_id":\s*[1-9]\b/;
    assert.ok(smallIds.test('{"some":{"snack_id":2}}'));
    for (const g of checkpoints) {
      for (const t of g.tasks) {
        const text = JSON.stringify([t.checks, t.url, t.command]);
        assert.ok(!students.test(text), `${g.id}: a task requires one of the student's own snacks`);
        assert.ok(!smallIds.test(text), `${g.id}: a task is pinned to a Week 3 snack id`);
      }
    }
  });

  test("numeric pins (min / exact) on per-student lists exist only where the list is filtered to an inserted row", () => {
    // min: 1 only says "not empty". Any other number (min: 7, exact: 3) says how many rows a student's own
    // ledger has, unless the address filters to a row a lab step inserted (?name=utsin, ?date=2000-01-02).
    const pinned = (c: { min?: number; exact?: number }) => (c.min !== undefined && c.min > 1) || (c.exact !== undefined && c.exact !== 0);
    const filtered = (t: JsonCheckTask) => /[?&](name|date)=/.test(t.url ?? "");
    assert.ok(pinned({ min: 7 }) && pinned({ exact: 3 }) && !pinned({ min: 1 }));
    let allowed = 0;
    for (const g of checkpoints) {
      for (const [i, t] of g.tasks.entries()) {
        for (const c of t.checks) {
          if (!pinned(c)) continue;
          assert.ok(filtered(t), `${g.id} #${i + 1}: a count pinned on a list that is not filtered to an inserted row`);
          allowed++;
        }
      }
    }
    assert.ok(allowed >= 3, "the filtered tasks (name search, two dates) are the ones allowed to pin");
    // in command tasks a pinned number must be about an inserted row too
    const cmdPins = checkpoints.flatMap((g) => g.tasks.filter((t) => t.command).flatMap((t) => t.checks.map((c) => ({ g: g.id, c, t }))));
    for (const { g, c, t } of cmdPins) {
      if (typeof c.equals === "number" && c.path && /rows|orders_on|rows_shown/.test(c.path)) {
        assert.ok(/utsin|2000-01-02|1999-12-31|Aling|OR /i.test(t.command ?? ""), `${g}: ${c.path} pinned in a command about ordinary rows`);
      }
    }
  });
});

describe("week 8: every checkpoint is failed by the previous stage's real app", () => {
  // Tasks that are meant to KEEP passing from one stage to the next ("the refusal still comes first"). Each
  // checkpoint must still hold at least one task that the stage before cannot pass, and the rest are listed here
  // by id and number with the reason, so a new regression task is a decision and not an accident.
  const regression: Record<string, string> = {
    "checkpoint-snacks-from-mysql#3": "/api/info is unchanged on purpose: it proves nothing was broken",
    "checkpoint-questions#2": "the 404 for an unknown snack was Week 7's promise and must survive the move",
    "checkpoint-questions#3": "maxPrice=12 works in Java (Day 1) and in SQL (Day 2): the move must not change the answer",
    "checkpoint-writes#2": "an unknown snack is still a 404 before anything is written",
    "checkpoint-writes#3": "qty 25 is still a 400 before anything is written",
    "checkpoint-ledger#3": "the 404 for an unknown order was Week 7's promise and must survive the move",
    "checkpoint-price-paid#4": "the summary follows the new totals by itself and must keep agreeing with the list",
  };
  const tasks = checkpoints.flatMap((g) => g.tasks.map((t, i) => ({ g, t, key: `${g.id}#${i + 1}` })));

  /** True when the previous stage's answer is REJECTED by the task's checks. */
  const rejects = (previous: string, t: JsonCheckTask) => {
    const parsed = parsePasted(previous);
    return !parsed.ok || firstJsonFailure(parsed.value, t.checks) !== null;
  };

  test("the guard can fail: a task's own correct answer is not rejected", () => {
    const t = tasks[0].t;
    assert.equal(rejects(t.example, t), false);
    assert.equal(rejects("[]", t), true);
    assert.equal(rejects("not json", t), true);
  });

  test("every task has captured previous-stage data unless it is a listed regression task", () => {
    const listed = new Set(Object.keys(regression));
    for (const { t, key } of tasks) {
      if (listed.has(key)) {
        assert.equal(t.previousStage, undefined, `${key}: listed as a regression task, so it must not carry previousStage`);
      } else {
        assert.ok(t.previousStage && t.previousStage.length > 0, `${key}: no previousStage captured from the stage before`);
      }
    }
    for (const key of listed) assert.ok(tasks.some((x) => x.key === key), `${key}: listed as a regression task but it doesn't exist`);
    for (const g of checkpoints) assert.ok(g.tasks.some((t) => t.previousStage), `${g.id}: every task is a regression task, so the stage before could clear the checkpoint`);
  });

  test("the previous stage's real answers are rejected by the checks", () => {
    for (const { t, key } of tasks) {
      if (t.previousStage === undefined) continue;
      assert.ok(rejects(t.previousStage, t), `${key}: the previous stage's app passes this task`);
      assert.notEqual(t.previousStage, t.example, `${key}: previousStage is the example`);
    }
  });
});

describe("week 8: copy that must be true for every student's ledger", () => {
  const ledgerSpecific = /\bsale_id = 1[0-9]\b|\bOrder 1[0-9]\b|\b(?:test )?id 1[12]\b|\b10 rows\b|\bone fewer\b|exactly like last week/i;

  test("no step asks for a sale number or row count that only one ledger has", () => {
    assert.ok(ledgerSpecific.test("DELETE FROM sales WHERE sale_id = 11;"));
    assert.ok(ledgerSpecific.test("The receipt says Order 12"));
    assert.ok(ledgerSpecific.test("it should be one fewer than"));
    const hit = ledgerSpecific.exec(prose);
    assert.equal(hit, null, `ledger-specific wording: ${hit?.[0]}`);
  });

  test("no DELETE is ever written against a sale number the student would have to guess", () => {
    assert.ok(/DELETE FROM sales WHERE sale_id/.test("DELETE FROM sales WHERE sale_id = 5;"));
    assert.ok(!/DELETE FROM sales WHERE sale_id/.test(prose));
    // every DELETE the week shows has a WHERE that only a test row satisfies
    for (const m of everything.matchAll(/DELETE FROM (\w+)([^;"\\]*)/g)) {
      assert.ok(/WHERE/.test(m[2]), `a DELETE without a WHERE: ${m[0]}`);
    }
  });

  test("the lab snack is a name no earlier week uses, and Taho only appears in the one warning about it", () => {
    const mine = /Kutsinta|Halo-halo/;
    for (const w of weeks) {
      if (w.slug === unit3Week8.slug) continue;
      assert.ok(!mine.test(JSON.stringify(w)), `${w.slug} already uses ${mine.exec(JSON.stringify(w))?.[0]}`);
    }
    const taho = [...everything.matchAll(/Taho/g)];
    assert.equal(taho.length, 1, "Taho should appear only in the warning that a Week 3 Taho is left alone");
    assert.ok(everything.includes("holds a Taho from Week 3"));
  });

  test("the day names in a day's copy are that day's own", () => {
    // Day 3 is Wednesday: the Week 7 placeOrder it builds on is "last week's", and Tuesday built getSnack.
    const day3 = JSON.stringify(days[2]);
    assert.ok(!day3.includes("Thursday's code"));
    assert.ok(!day3.includes("Wednesday's lines"));
    assert.ok(/Thursday's code|Wednesday's lines/.test("Thursday's code, Wednesday's lines"));
    assert.ok(!JSON.stringify(days[4]).includes("three things"), "Day 5's twist names two things now");
  });
});

describe("week 8: quiz answers don't cluster on one position", () => {
  // The lesson: hand-written choices put the right answer first, so a student who always clicks the first
  // button clears everything. Every quest check and boss question counts.
  const positions = (day: string) => {
    const all: number[] = [];
    for (const { day: d, b } of blocks()) {
      if (d !== day) continue;
      if (b.kind === "quest") for (const m of (b as unknown as QuestGame).missions) if (m.check) all.push(m.check.answer);
      if (b.kind === "boss-battle") for (const q of (b as unknown as BossBattleGame).questions) all.push(q.answer);
    }
    return all;
  };
  const worstShare = (list: number[]) => Math.max(...[0, 1, 2].map((i) => list.filter((x) => x === i).length)) / list.length;

  test("the measure can fail", () => {
    assert.equal(worstShare([0, 0, 0, 0, 1]), 0.8);
    assert.ok(worstShare([0, 1, 2, 0, 1, 2]) < 0.4);
  });

  test("no answer position carries more than half of a day's questions, or 40% of the week", () => {
    const week: number[] = [];
    for (const d of days) {
      const list = positions(d.day);
      week.push(...list);
      assert.ok(list.length >= 10, `${d.day}: too few questions to measure`);
      assert.ok(worstShare(list) <= 0.5, `${d.day}: one position holds ${Math.round(worstShare(list) * 100)}% of the answers`);
    }
    assert.ok(worstShare(week) <= 0.4, `the week: one position holds ${Math.round(worstShare(week) * 100)}%`);
  });
});
