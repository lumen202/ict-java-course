import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { unit3Week9 } from "./index";
import { roadmap, weeks } from "../../index";
import * as S from "./snippets";
import * as C from "./commands";
import { CONTROLLER_D5 as W8_FINAL } from "../unit3-week8/snippets";
import { firstJsonFailure, parsePasted } from "../../../game/jsonChecks";
import type { JsonCheck, JsonCheckGame, JsonCheckTask, QuestGame, BossBattleGame } from "../../types";

/**
 * Week 9 rules that the corpus-wide integrity tests can't see: the Java the labs type is composed
 * in snippets.ts (and was compiled against Spring Boot 4.1.1 and a real MySQL 8.0 ledger when it
 * was written), so these guard its shape and the things this week must never contain: a real
 * password, wording the course keeps out of student copy, an UPDATE or DELETE without a WHERE, a
 * page that reads JSON from a 204, answers pinned to one student's own data, and a checkpoint that
 * last stage's app already passes. Each guard is first proved able to fail, on a planted bad value,
 * so "nothing found" can't just mean "pattern never matches".
 */

const everything = JSON.stringify(unit3Week9);
/** Everything a student reads: the captured example and previous-stage answers are real data from one ledger and are left out. */
const prose = JSON.stringify(unit3Week9, (key, value) => (key === "example" || key === "previousStage" ? undefined : value));
const days = unit3Week9.video.days;

const PASSWORD_LINE = /spring\.datasource\.password=([^\\"\s]*)/g;
const BANNED = /\b(grade[sd]?|grading|attendance|absent|teacher|capstone|final project)\b/i;

type Block = { kind?: string; id: string; [k: string]: unknown };
const blocks = (): { day: string; b: Block }[] =>
  days.flatMap((d) => [d.warmupGame, ...(d.activities ?? []), d.game].filter(Boolean).map((b) => ({ day: d.day, b: b as unknown as Block })));

const checkpoints = days.flatMap((d) =>
  (d.activities ?? []).filter((a): a is JsonCheckGame => (a as { kind?: string }).kind === "json-check"),
);

describe("week 9: what must never appear", () => {
  test("the guards can fail", () => {
    const planted = [..."x spring.datasource.password=hunter2 y".matchAll(PASSWORD_LINE)];
    assert.equal(planted[0]?.[1], "hunter2");
    assert.ok(BANNED.test("this is graded"));
    assert.ok(BANNED.test("ask the teacher"));
    assert.ok(BANNED.test("the capstone"));
  });

  test("no password line is shown except the placeholder", () => {
    for (const m of everything.matchAll(PASSWORD_LINE)) assert.equal(m[1], "YOUR_MYSQL_PASSWORD", "a datasource password line other than the placeholder");
  });

  test("student-facing copy never mentions grading, attendance, the teacher or the capstone", () => {
    const hit = BANNED.exec(everything);
    assert.equal(hit, null, `banned wording: ${hit?.[0]}`);
  });

  test("no turn-in prompt invites application.properties or the password", () => {
    const invites = /the line you changed|paste (the |your )?(whole )?(file )?application\.properties|paste (the |your )?password/i;
    assert.ok(invites.test("Paste your application.properties"));
    const prompts: string[] = [];
    for (const { b } of blocks()) {
      for (const m of (b.missions as { input?: string }[] | undefined) ?? []) if (m.input) prompts.push(m.input);
      if (typeof b.submit === "string") prompts.push(b.submit);
      if (b.kind === "upload") prompts.push(...(b.steps as string[]), String(b.proves));
    }
    for (const d of days) {
      const steps = typeof d.practice === "string" ? [d.practice] : d.practice.steps;
      prompts.push(...steps);
    }
    assert.ok(prompts.length > 20);
    for (const p of prompts) assert.ok(!invites.test(p), `a prompt invites the password: ${p.slice(0, 100)}`);
    for (const p of prompts) {
      if (/application\.properties/.test(p)) assert.ok(/never|not |n't|close/i.test(p), `a prompt mentions application.properties without a warning: ${p.slice(0, 100)}`);
    }
  });
});

describe("week 9: the controller stages", () => {
  const stages = {
    D1A: S.CONTROLLER_D1A, D1: S.CONTROLLER_D1, D2: S.CONTROLLER_D2, D3A: S.CONTROLLER_D3A,
    D3: S.CONTROLLER_D3, D4A: S.CONTROLLER_D4A, D4: S.CONTROLLER_D4, D5: S.CONTROLLER_D5,
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

  test("braces, brackets and text blocks balance in every stage", () => {
    for (const [name, code] of Object.entries(stages)) assert.deepEqual(imbalance(code), [], name);
  });

  test("every stage keeps every line of Week 8's final controller (no address, status or key is lost)", () => {
    const w8 = W8_FINAL.split("\n").filter((l) => l.trim() && !l.startsWith("import") && l !== "}");
    assert.ok(w8.length > 150);
    for (const [name, code] of Object.entries(stages)) {
      const have = new Set(code.split("\n"));
      for (const line of w8) assert.ok(have.has(line), `${name} lost a Week 8 line: ${line}`);
    }
    // the imports Week 8 had are all still there
    for (const line of W8_FINAL.split("\n").filter((l) => l.startsWith("import"))) {
      for (const [name, code] of Object.entries(stages)) assert.ok(code.includes(line), `${name} lost ${line}`);
    }
    // and the guard can fail
    assert.ok(!new Set(S.CONTROLLER_D1.replace('"/api/special"', '"/api/gone"').split("\n")).has(w8.find((l) => l.includes('"/api/special"'))!));
  });

  test("each day adds what it says, in order, and later stages keep it", () => {
    const has = (name: keyof typeof stages, text: string) => stages[name].includes(text);
    // Day 1: the first version never reads the count
    assert.ok(has("D1A", '@PutMapping("/api/snacks/{id}")') && !has("D1A", "int changed"));
    for (const n of ["D1", "D2", "D3A", "D3", "D4A", "D4", "D5"] as const) assert.ok(has(n, "int changed = jdbc.sql(\"UPDATE snacks SET name = ?, price = ? WHERE snack_id = ?\")"), `${n}: updateSnack lost its count`);
    // Day 2
    assert.ok(!has("D1", '@PutMapping("/api/orders/{id}")'));
    for (const n of ["D2", "D3A", "D3", "D4A", "D4", "D5"] as const) {
      assert.ok(has(n, "UPDATE sales SET qty = ? WHERE sale_id = ? AND snack_id IS NOT NULL"), `${n}: updateOrder lost its guard`);
      assert.ok(has(n, "return getOrder(id);"));
    }
    assert.ok(!S.CONTROLLER_D2_NO_GUARD.includes("IS NOT NULL"), "the lab-only controller really has no guard");
    assert.ok(!S.UPDATE_ORDER_NO_GUARD.includes("IS NOT NULL") && S.UPDATE_ORDER.includes("IS NOT NULL"), "the lab-only variant must differ from the finished method");
    // Day 3: first version has no removed count
    assert.ok(has("D3A", '@DeleteMapping("/api/orders/{id}")') && !has("D3A", "int removed") && has("D3", "int removed = jdbc.sql"));
    assert.ok(!has("D2", "@DeleteMapping"));
    // Day 4: no catch until the finished version
    assert.ok(has("D4A", '@DeleteMapping("/api/snacks/{id}")') && !has("D4A", "DataIntegrityViolationException"));
    assert.ok(has("D4", "catch (DataIntegrityViolationException e)") && has("D4", "HttpStatus.CONFLICT, \"Snack \" + id + \" is used by a sale or a special\""));
    assert.ok(has("D4", S.IMPORT_INTEGRITY) && has("D5", S.IMPORT_INTEGRITY) && !has("D4A", S.IMPORT_INTEGRITY));
    // Day 5
    assert.ok(!has("D4", '@PutMapping("/api/special")'));
    assert.ok(has("D5", '@PutMapping("/api/special")') && has("D5", '@DeleteMapping("/api/special")') && has("D5", "special_price must be from 1 to 1000"));
    // every finished delete answers 204 through the annotation, and the controller has three of them
    assert.equal((S.CONTROLLER_D5.match(/@ResponseStatus\(HttpStatus\.NO_CONTENT\)/g) ?? []).length, 3);
    for (const n of ["D1", "D2", "D3", "D4", "D5"] as const) assert.ok(has(n, S.IMPORT_PUT), `${n}: no PutMapping import`);
    for (const n of ["D3A", "D3", "D4A", "D4", "D5"] as const) assert.ok(has(n, S.IMPORT_DELETE), `${n}: no DeleteMapping import`);
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
  const glued = (sql: string) => /"\s*\+|\+\s*"/.test(sql) || /\+\s*[a-z]/i.test(sql.replace(/"[^"]*"/g, ""));

  test("no SQL in a finished controller glues a value in", () => {
    assert.ok(glued('"DELETE FROM sales WHERE sale_id = " + id'), "the glue guard can see glue");
    assert.ok(!glued('"DELETE FROM sales WHERE sale_id = ?"'));
    for (const [name, code] of Object.entries(stages)) {
      const found = sqlArguments(code);
      assert.ok(found.length >= 12, `${name}: the extractor found too little SQL`);
      assert.ok(!found.some(glued), `${name}: SQL built with +`);
    }
  });

  /** Every UPDATE and DELETE statement inside jdbc.sql(…) must carry a WHERE. */
  const writesWithoutWhere = (code: string) =>
    sqlArguments(code).filter((sql) => /\b(UPDATE|DELETE\s+FROM)\b/.test(sql) && !/\bWHERE\b/.test(sql));

  test("every UPDATE and DELETE in a finished controller has a WHERE", () => {
    assert.equal(writesWithoutWhere('x = jdbc.sql("DELETE FROM sales")\n    .update();').length, 1, "the WHERE guard can see a bare DELETE");
    assert.equal(writesWithoutWhere('x = jdbc.sql("UPDATE snacks SET name = ?, price = ?")\n    .update();').length, 1, "…and a bare UPDATE");
    assert.equal(writesWithoutWhere('x = jdbc.sql("DELETE FROM sales WHERE sale_id = ?")\n    .update();').length, 0);
    for (const [name, code] of Object.entries(stages)) {
      assert.deepEqual(writesWithoutWhere(code), [], `${name}: an UPDATE or DELETE without a WHERE`);
      const writes = sqlArguments(code).filter((sql) => /\b(UPDATE|DELETE\s+FROM)\b/.test(sql));
      assert.ok(writes.length >= 1, `${name}: the extractor found no UPDATE or DELETE`);
    }
    assert.equal(sqlArguments(S.CONTROLLER_D5).filter((sql) => /\b(UPDATE|DELETE\s+FROM)\b/.test(sql)).length, 6);
  });

  test("no statement without a WHERE is ever shown to students, except the practice copy and described stories", () => {
    const bare = (text: string) =>
      [...text.matchAll(/(?:UPDATE\s+\w+\s+SET\s+[^;"\\]*|DELETE\s+FROM\s+\w+[^;"\\]*)/g)]
        .map((m) => m[0].trim())
        .filter((s) => !/\bWHERE\b/i.test(s));
    assert.deepEqual(bare("DELETE FROM snacks; and UPDATE snacks SET price = 1;"), ["DELETE FROM snacks", "UPDATE snacks SET price = 1"]);
    assert.deepEqual(bare("DELETE FROM sales WHERE qty = 7;"), []);
    const found = bare(prose);
    for (const s of found) {
      // the one statement written to be RUN without a WHERE, on the copy table
      if (/^DELETE FROM sales_practice$/.test(s)) continue;
      // stories and the explained special_id > 0 are told, never instructed: only these exact shapes
      assert.ok(
        ["DELETE FROM sales", "UPDATE snacks SET name = ?, price = ?", "DELETE FROM specials", "UPDATE supplies SET price = 9"].includes(s),
        `an unexpected statement without a WHERE: ${s}`,
      );
    }
    // the practice copy is the only table a student is told to empty
    assert.ok(found.includes("DELETE FROM sales_practice"));
    // and that exact bare statement is always accompanied by the warning to read the table name
    assert.ok(prose.includes("Read the table name after FROM"));
    // every instructed DELETE aimed at the real tables names its rows
    for (const m of prose.matchAll(/DELETE FROM (snacks|sales|specials)(?!_)([^;"\\]*);/g)) {
      assert.ok(/WHERE/i.test(m[2]), `an instructed DELETE without a WHERE: ${m[0]}`);
    }
  });
});

describe("week 9: the pages", () => {
  const pages: Record<string, string> = {
    editSnack: S.EDIT_SNACK_JS, editSnackD4: S.EDIT_SNACK_JS_D4, ordersD2: S.ORDERS_JS_D2, ordersD3: S.ORDERS_JS_D3, special: S.SPECIAL_JS,
  };

  test("every page script is valid JavaScript, and every console line is a valid expression", () => {
    const broken = () => new Function("(((");
    assert.throws(broken, SyntaxError, "the syntax guard can fail");
    for (const [name, code] of Object.entries(pages)) assert.doesNotThrow(() => new Function(code), `${name}: syntax error`);
    for (const [name, value] of Object.entries(C)) {
      if (typeof value === "string" && /^[A-Z_]+$/.test(name) && value.endsWith("copy)")) {
        assert.doesNotThrow(() => new Function("copy", `return ${value}`), `${name}: syntax error`);
      }
    }
    for (const g of checkpoints) for (const t of g.tasks) if (t.command) assert.doesNotThrow(() => new Function("copy", `return ${t.command}`), `${g.id}: a command has a syntax error`);
    assert.doesNotThrow(() => new Function("copy", `return ${C.consolePut('"/api/x"', "{ a: 1 }")}`));
    assert.doesNotThrow(() => new Function("copy", `return ${C.consoleDelete('"/api/x"')}`));
  });

  /** In a DELETE's handler, nothing may call .json() on the response before the 204 check. */
  const readsJsonBefore204 = (code: string) => {
    const at = code.indexOf("method: \"DELETE\"");
    if (at < 0) return false;
    const rest = code.slice(at);
    const status = rest.indexOf("response.status === 204");
    const json = rest.indexOf("response.json()");
    return status < 0 || (json >= 0 && json < status);
  };

  test("a 204 is never read as JSON: every DELETE handler checks the status first", () => {
    assert.ok(readsJsonBefore204('fetch(u, { method: "DELETE" }).then(response => response.json()).then(d => d)'), "the guard can see the mistake");
    assert.ok(!readsJsonBefore204('fetch(u, { method: "DELETE" }).then(response => { if (response.status === 204) { } else { response.json(); } })'));
    for (const [name, code] of [["cancelOrder", S.ORDERS_CANCEL_ORDER], ["remove snack", S.EDIT_SNACK_JS_REMOVE], ["remove special", S.SPECIAL_JS_REMOVE]]) {
      assert.ok(!readsJsonBefore204(code), `${name} reads JSON before checking for a 204`);
      assert.ok(code.includes("confirm("), `${name} asks first`);
    }
  });

  test("every PUT from a page sends JSON with its Content-Type, and every page checks response.ok or status", () => {
    for (const [name, code] of Object.entries(pages)) {
      const puts = (code.match(/method: "PUT"/g) ?? []).length;
      const withHeader = (code.match(/method: "PUT",\s*headers: \{ "Content-Type": "application\/json" \}/g) ?? []).length;
      assert.equal(puts, withHeader, `${name}: a PUT without a JSON Content-Type`);
      assert.ok(/response\.ok|response\.status/.test(code), `${name}: never looks at the status`);
    }
  });

  test("the orders board draws six columns after Day 3 and five after Day 2, matching its headings", () => {
    assert.ok(S.ORDERS_JS_D2.includes("tr.append(id, name, qty, total, change);") && !S.ORDERS_JS_D2.includes("cancel"));
    assert.ok(S.ORDERS_JS_D3.includes("tr.append(id, name, qty, total, change, cancel);"));
    assert.equal((S.ORDERS_HTML_D2.match(/<th>/g) ?? []).length, 5);
    assert.equal((S.ORDERS_HTML_D3.match(/<th>/g) ?? []).length, 6);
    assert.ok(S.ORDERS_HTML_D2.includes('<p id="message"></p>'));
    // the Week 7 summary line, list loader, refresh button and find form are all still in the final script
    for (const keep of ["function loadOrders()", 'fetch("/api/summary")', 'document.getElementById("refresh")', 'document.getElementById("find-form")']) {
      assert.ok(S.ORDERS_JS_D3.includes(keep), `orders.js lost ${keep}`);
    }
  });

  test("no Week 9 page puts a link to a staff page (edit-snack, special) anywhere, and none tells a student to", () => {
    const hrefs = (html: string) => [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
    const allHtml = { orders2: S.ORDERS_HTML_D2, orders3: S.ORDERS_HTML_D3, edit: S.EDIT_SNACK_HTML, editD4: S.EDIT_SNACK_HTML_D4, special: S.SPECIAL_HTML };
    for (const [name, html] of Object.entries(allHtml)) {
      for (const h of hrefs(html)) assert.ok(!/^(edit-snack|special)\.html/.test(h), `${name} links to a staff page: ${h}`);
      for (const h of hrefs(html)) assert.match(h, /^(index|menu|order|orders|tables|ledger|add-snack)\.html$|^style\.css$/, `${name}: unknown link ${h}`);
    }
    assert.ok(hrefs('<a href="edit-snack.html?id=1">').some((h) => /^(edit-snack|special)\.html/.test(h)), "the guard can see a staff link");
    assert.ok(!/href="(edit-snack|special)\.html/.test(prose), "a lab tells students to link a public page to a staff page");
  });
});

describe("week 9: the checkpoints", () => {
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
    assert.ok(checkpoints.flatMap((g) => g.tasks).length >= 25);
  });

  const students = /Banana cue|Turon|Kwek-kwek|Gulaman|Siopao|Pastillas|Taho/;

  test("checks are never pinned to rows a student's own Weeks 2-4 ledger decides", () => {
    assert.ok(students.test('{"some":{"name":"Turon"}}'));
    assert.ok(students.test('{"some":{"name":"Taho"}}'));
    // a check pinned to a small snack number, in its real shape: { path: "snack_id", equals: 2 } or { some: { snack_id: 2 } }
    const smallIdPinned = (c: JsonCheck) =>
      (!!c.path && /snack_id$/.test(c.path) && typeof c.equals === "number" && c.equals < 10) ||
      (typeof c.some?.snack_id === "number" && c.some.snack_id < 10);
    const smallIdInAddress = /snacks\/[1-9]\b/;
    assert.ok(smallIdPinned({ path: "snack_id", equals: 2, message: "m" }) && smallIdPinned({ some: { snack_id: 2 }, message: "m" }), "the guard sees real-shaped pins");
    assert.ok(!smallIdPinned({ path: "snack_id", equals: 90, message: "m" }));
    assert.ok(smallIdInAddress.test("localhost:8080/api/snacks/2") && !smallIdInAddress.test("localhost:8080/api/snacks/99999"));
    for (const g of checkpoints) {
      for (const t of g.tasks) {
        const text = JSON.stringify([t.checks, t.url, t.command]);
        assert.ok(!students.test(text), `${g.id}: a task requires one of the student's own snacks`);
        assert.ok(!t.checks.some(smallIdPinned), `${g.id}: a task is pinned to a Week 3 snack id`);
        assert.ok(!smallIdInAddress.test(`${t.url ?? ""} ${t.command ?? ""}`), `${g.id}: an address or command names a Week 3 snack`);
      }
    }
  });

  test("no check pins a count, a sale number or an order number that only one ledger has", () => {
    const pinnedCount = (c: { min?: number; exact?: number }) => (c.min !== undefined && c.min > 1) || (c.exact !== undefined && c.exact !== 0);
    assert.ok(pinnedCount({ min: 7 }) && pinnedCount({ exact: 3 }) && !pinnedCount({ min: 1 }));
    // numbers a check may equal: statuses, and values the lab itself puts there (qty 19, price 21, snack 90)
    const allowed = new Set([200, 201, 204, 400, 404, 409, 19, 21, 90]);
    const numberPinned = (c: { path?: string; equals?: unknown }) => typeof c.equals === "number" && !allowed.has(c.equals);
    assert.ok(numberPinned({ path: "order_id", equals: 12 }) && !numberPinned({ path: "status", equals: 404 }));
    const idKeys = /(^|\.)(order_id|sale_id|id)$/;
    for (const g of checkpoints) {
      for (const [i, t] of g.tasks.entries()) {
        for (const c of t.checks) {
          assert.ok(!pinnedCount(c), `${g.id} #${i + 1}: a count pinned on a list`);
          assert.ok(!numberPinned(c), `${g.id} #${i + 1}: a number nobody put there is pinned: ${c.equals}`);
          assert.ok(!(c.path && idKeys.test(c.path) && c.equals !== undefined), `${g.id} #${i + 1}: an id is pinned`);
        }
      }
    }
  });
});

describe("week 9: every checkpoint is failed by the previous stage's real app", () => {
  // Tasks that are meant to KEEP passing from one stage to the next. Week 9 has none: every task is
  // failed by the app before its feature (Week 8's final app for the new endpoints, a lab's first
  // version for the 404 and 409 tasks, the page without the control for the Part 2 tasks).
  const regression: Record<string, string> = {};
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
      if (listed.has(key)) assert.equal(t.previousStage, undefined, `${key}: listed as a regression task, so it must not carry previousStage`);
      else assert.ok(t.previousStage && t.previousStage.length > 0, `${key}: no previousStage captured from the stage before`);
    }
    for (const g of checkpoints) assert.ok(g.tasks.some((t) => t.previousStage), `${g.id}: every task is a regression task`);
    assert.equal(tasks.length, 26, "the number of checkpoint tasks changed: update the review notes");
  });

  test("the previous stage's real answers are rejected by the checks", () => {
    for (const { t, key } of tasks) {
      if (t.previousStage === undefined) continue;
      assert.ok(rejects(t.previousStage, t), `${key}: the previous stage's app passes this task`);
      assert.notEqual(t.previousStage, t.example, `${key}: previousStage is the example`);
    }
  });
});

describe("week 9: copy that must be true for every student's ledger", () => {
  const ledgerSpecific = /\bsale_id = 1[0-9]\b|\bOrder 1[0-9]\b|\b(?:test )?id 1[12]\b|\b10 rows\b|\bone fewer\b|exactly like last week/i;

  test("no step asks for a sale number or row count that only one ledger has", () => {
    assert.ok(ledgerSpecific.test("DELETE FROM sales WHERE sale_id = 11;"));
    assert.ok(ledgerSpecific.test("The receipt says Order 12"));
    assert.ok(ledgerSpecific.test("it should be one fewer than"));
    const hit = ledgerSpecific.exec(prose);
    assert.equal(hit, null, `ledger-specific wording: ${hit?.[0]}`);
  });

  test("no UPDATE or DELETE is ever written against a sale number the student would have to guess", () => {
    const guessed = /(?:UPDATE|DELETE FROM) sales[^;"\\]*WHERE sale_id = \d/;
    assert.ok(guessed.test("DELETE FROM sales WHERE sale_id = 5;") && guessed.test("UPDATE sales SET qty = 3 WHERE sale_id = 5"));
    assert.ok(!guessed.test("UPDATE sales SET qty = 3 WHERE sale_id = THE_SALE_ID;"));
    assert.ok(!guessed.test(prose), `a statement names a sale number: ${guessed.exec(prose)?.[0]}`);
    // every DELETE the week shows has a WHERE, except the practice copy and the one described story (checked below)
    const bareOk = (statement: string, framing: string) =>
      /^DELETE FROM sales_practice$/.test(statement.trim()) || (/^DELETE FROM sales$/.test(statement.trim()) && /Patient|student|wrote/i.test(framing));
    assert.ok(!bareOk("DELETE FROM sales", "Run this now"), "the allowlist can fail: a bare DELETE with no story around it");
    assert.ok(!bareOk("DELETE FROM snacks", "a student wrote"));
    const strings: string[] = [];
    JSON.stringify(unit3Week9, (k, v) => { if (typeof v === "string" && k !== "example" && k !== "previousStage") strings.push(v); return v; });
    let seen = 0;
    for (const text of strings) {
      for (const m of text.matchAll(/DELETE FROM (\w+)([^;"\\]*)/g)) {
        if (/WHERE/.test(m[2])) continue;
        if (m[1] === "sales_practice" || (m[1] === "sales" && m[2].trim() === "")) {
          assert.ok(bareOk(m[0], text), `a bare DELETE without a practice-copy or story framing: ${text.slice(0, 120)}`);
          seen++;
          continue;
        }
        assert.fail(`a DELETE without a WHERE: ${m[0]}`);
      }
    }
    assert.ok(seen >= 3, "the practice copy's bare DELETE and the story should both be found");
  });

  test("every test row is made by a condition only it satisfies: qty 19, the Check and Renamed names, and the practice snacks 8000 to 8103", () => {
    assert.equal(S.SQL_CLEAN_TEST_ORDERS, "DELETE FROM sales WHERE snack_id = 90 AND qty = 19;");
    assert.equal(S.SQL_CLEAN_CHECKS, "DELETE FROM snacks WHERE name LIKE 'Check %' OR name LIKE 'Renamed %';");
    // the practice snack numbers the week names are exactly these (each lab step says to pick another if one is taken)
    const eightK = new Set([...prose.matchAll(/(?<![:\d])8\d{3}\b/g)].map((m) => m[0]));
    for (const n of eightK) assert.ok(["8000", "8010", "8100", "8101", "8102", "8103"].includes(n), `an unexpected practice number: ${n}`);
    assert.ok(eightK.has("8000") && eightK.has("8100") && eightK.has("8103"));
    // the week's console lines only ever create snacks named Check…, and numbers well away from Week 3 and from Week 8's 90 to 95
    assert.ok(/name: "Check " \+ id/.test(C.SNACK_LIFECYCLE) && /name: "Check " \+ id/.test(C.SNACK_WALL));
    assert.ok(/20000 \+ Math\.floor/.test(C.SNACK_LIFECYCLE));
    // a command that changes data puts the value back, or removes what it made
    assert.ok(/send\("PUT", "\/api\/orders\/" \+ sale\.sale_id, \{ qty: sale\.qty \}\)/.test(C.HISTORY_PRICE_KEPT));
    // the special commands mark the newest special 777 and then remove exactly that one, leaving no 777 behind
    for (const cmd of [C.SPECIAL_PUT_ROUNDTRIP, C.SPECIAL_REMOVE_ROUNDTRIP]) {
      assert.ok(/special_price: 777/.test(cmd) && /method: "DELETE"/.test(cmd), "a special command marks the newest special and removes it");
    }
    assert.ok(/special_price: before\.special_price/.test(C.SPECIAL_PAGE_COMMAND), "the page command puts the old price back")
  });

  test("the lab snack is the one Week 8 put there, no Week 3 snack is used, and Taho never appears", () => {
    assert.equal(S.LAB_SNACK, "Kutsinta");
    assert.equal(S.LAB_SNACK_ID, 90);
    assert.ok(!/Taho/.test(everything));
    assert.ok(!/Halo-halo/.test(everything), "Halo-halo is Week 8's Day 3 snack, not a lab snack of this week");
    assert.ok(everything.includes("Kutsinta"));
  });

  test("a day's copy never talks about a LATER weekday as if it had happened", () => {
    const names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const past = (text: string, name: string) => new RegExp(`${name}'s (code|lab|lines|mission|endpoint|method|first version|updateSnack|updateOrder|cancelOrder|deleteSnack|DELETE|PUT)|from ${name}|on ${name}[,.]? (you|we|the)`).test(text);
    assert.ok(past("Thursday's code", "Thursday"), "the guard can fail");
    for (const [i, d] of days.entries()) {
      const text = JSON.stringify(d);
      for (const later of names.slice(i + 1)) assert.ok(!past(text, later), `${d.day} mentions ${later} as if it were past`);
    }
  });
});

describe("week 9: quiz answers don't cluster on one position", () => {
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

describe("week 9: it fits into the course", () => {
  test("it is registered after Week 8, and the roadmap no longer lists it", () => {
    const slugs = weeks.map((w) => w.slug);
    assert.ok(slugs.indexOf("unit3-week9") > slugs.indexOf("unit3-week8") && slugs.indexOf("unit3-week8") >= 0, "Week 9 must come after Week 8");
    assert.equal(slugs.filter((s) => s === "unit3-week9").length, 1);
    const items = roadmap.flatMap((r) => r.items);
    assert.ok(items.length >= 2);
    for (const item of items) assert.ok(!/\bWeeks? 9\b|Weeks 9–10/.test(item), `the roadmap still lists Week 9: ${item}`);
    // Week 10 has shipped too (see unit3-week10/week10.test.ts): the roadmap names only what is still to come.
    for (const item of items) assert.ok(!/^Week 10 /.test(item), `the roadmap still lists Week 10: ${item}`);
    assert.ok(items.some((item) => /^Weeks 11–12 /.test(item)), "the roadmap should still name Weeks 11–12");
  });
});
