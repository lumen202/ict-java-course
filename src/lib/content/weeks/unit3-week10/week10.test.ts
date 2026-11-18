import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { unit3Week10 } from "./index";
import { roadmap, weeks } from "../../index";
import * as S from "./snippets";
import * as C from "./commands";
import { CONTROLLER_D5 as W9_FINAL } from "../unit3-week9/snippets";
import { firstJsonFailure, parsePasted } from "../../../game/jsonChecks";
import type { JsonCheck, JsonCheckGame, JsonCheckTask, QuestGame, BossBattleGame } from "../../types";

/**
 * Week 10 rules that the corpus-wide integrity tests can't see. The Java the labs type is composed in
 * snippets.ts (and was compiled against Spring Boot 4.1.1 and a real MySQL 8.0 ledger when it was
 * written), so these guard its shape and what this week must never contain: a real password, wording
 * the course keeps out of student copy, an UPDATE or DELETE without a WHERE, a 204 read as JSON (in a
 * page and inside api.js), answers pinned to one student's own data, a staff page linked from a public
 * one, and a checkpoint that last stage's app already passes. Each guard is first proved able to fail, on
 * a planted bad value, so "nothing found" can't just mean "the pattern never matches".
 */

const everything = JSON.stringify(unit3Week10);
/** Everything a student reads: the captured example and previous-stage answers are real data from one ledger and are left out. */
const prose = JSON.stringify(unit3Week10, (key, value) => (key === "example" || key === "previousStage" ? undefined : value));
const days = unit3Week10.video.days;

const PASSWORD_LINE = /spring\.datasource\.password=([^\\"\s]*)/g;
const BANNED = /\b(grade[sd]?|grading|attendance|absent|teacher|capstone|final project)\b/i;

type Block = { kind?: string; id: string; [k: string]: unknown };
const blocks = (): { day: string; b: Block }[] =>
  days.flatMap((d) => [d.warmupGame, ...(d.activities ?? []), d.game].filter(Boolean).map((b) => ({ day: d.day, b: b as unknown as Block })));

const checkpoints = days.flatMap((d) =>
  (d.activities ?? []).filter((a): a is JsonCheckGame => (a as { kind?: string }).kind === "json-check"),
);

describe("week 10: what must never appear", () => {
  test("the guards can fail", () => {
    const planted = [..."x spring.datasource.password=hunter2 y".matchAll(PASSWORD_LINE)];
    assert.equal(planted[0]?.[1], "hunter2");
    assert.ok(BANNED.test("this is graded"));
    assert.ok(BANNED.test("ask the teacher"));
    assert.ok(BANNED.test("the capstone"));
    assert.ok(BANNED.test("your attendance"));
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

  test("nothing outside this week's scope is taught: no Bean Validation, no advice class, no login, no JPA", () => {
    const outOfScope = /@Valid\b|@NotBlank|@RestControllerAdvice|@ControllerAdvice|@Entity|JpaRepository|CrudRepository|spring-security|SecurityFilterChain|\baxios\b|\bReact\b/;
    assert.ok(outOfScope.test("extends JpaRepository<Snack, Integer>") && outOfScope.test("@RestControllerAdvice"));
    // the video notes name these tools in order to say SKIP them: that sentence is the only place they may appear
    const outsideNotes = JSON.stringify(unit3Week10, (k, v) => (k === "watchNotes" || k === "note" ? undefined : v));
    assert.ok(!outOfScope.test(outsideNotes), `out of scope: ${outOfScope.exec(outsideNotes)?.[0]}`);
  });
});

describe("week 10: the controller stages", () => {
  const stages = {
    D1A: S.CONTROLLER_D1A, D1B: S.CONTROLLER_D1B, D1C: S.CONTROLLER_D1C, D1: S.CONTROLLER_D1,
    D3: S.CONTROLLER_D3, D4: S.CONTROLLER_D4, D5: S.CONTROLLER_D5,
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

  const everyJavaFile = {
    ...stages,
    SnackRepository: S.SNACK_REPOSITORY, OrderRepository: S.ORDER_REPOSITORY, SpecialRepository: S.SPECIAL_REPOSITORY, InfoRepository: S.INFO_REPOSITORY,
  };

  test("braces, brackets and text blocks balance in every stage and every repository", () => {
    for (const [name, code] of Object.entries(everyJavaFile)) assert.deepEqual(imbalance(code), [], name);
  });

  /** Every address and every sentence the app can answer with: nothing may be lost by a stage. */
  const mappings = (code: string) => new Set([...code.matchAll(/@(?:Get|Post|Put|Delete)Mapping\("([^"]+)"\)/g)].map((m) => m[0]));
  const sentences = (code: string) => new Set([...code.matchAll(/HttpStatus\.[A-Z_]+, ([^\n]+)/g)].map((m) => m[1].replace(/[);\s]+$/, "")));

  test("every stage keeps every address and every status sentence of Week 9's final controller", () => {
    const wantMappings = mappings(W9_FINAL);
    const wantSentences = sentences(W9_FINAL);
    assert.ok(wantMappings.size >= 17 && wantSentences.size >= 12, "the extractors found too little");
    for (const [name, code] of Object.entries(stages)) {
      const haveM = mappings(code);
      const haveS = sentences(code);
      for (const m of wantMappings) assert.ok(haveM.has(m), `${name} lost ${m}`);
      for (const s of wantSentences) assert.ok(haveS.has(s), `${name} lost the sentence ${s}`);
    }
    // the guard can fail
    assert.ok(!mappings(S.CONTROLLER_D1.replace('@GetMapping("/api/special")', '@GetMapping("/api/gone")')).has('@GetMapping("/api/special")'));
    assert.ok(!sentences(S.CONTROLLER_D1.replaceAll("No special today", "Nothing")).has('"No special today"'));
    assert.ok(wantSentences.has('"No special today"'), "the planted sentence is one the extractor reads");
  });

  test("each day adds what it says, in order, and later stages keep it", () => {
    const has = (name: keyof typeof stages, text: string) => stages[name].includes(text);
    const count = (name: keyof typeof stages, text: string) => stages[name].split(text).length - 1;
    // Day 1: the first version filters ONE path; then the endpoints; then every path; then the 409
    assert.equal(count("D1A", "available = TRUE"), 1, "the first version filters only the plain list");
    assert.equal(count("D1B", "available = TRUE"), 1);
    assert.ok(!has("D1A", "/available"));
    assert.ok(has("D1B", '@PutMapping("/api/snacks/{id}/available")') && has("D1B", '@GetMapping("/api/snacks/{id}/available")'));
    // six SELECTs that build the menu, plus the two that find today's special
    assert.equal(count("D1C", "available = TRUE"), 8);
    assert.equal(count("D1C", "snacks.available = TRUE"), 2);
    assert.ok(!has("D1C", "is not available"), "the 409 comes last");
    assert.ok(has("D1", 'HttpStatus.CONFLICT, "Snack " + snack.snack_id() + " is not available"'));
    // Day 3
    assert.ok(!has("D1", "/api/staff/snacks") && has("D3", '@GetMapping("/api/staff/snacks")'));
    // Day 4: no SQL in the controller; the SQL is in the repositories
    for (const n of ["D4", "D5"] as const) {
      assert.ok(!has(n, "jdbc"), `${n}: the controller still mentions jdbc`);
      assert.ok(!has(n, "JdbcClient") && !has(n, "SELECT ") && !has(n, "UPDATE ") && !has(n, "DELETE FROM"), `${n}: SQL left in the controller`);
      assert.ok(has(n, "private final SnackRepository snacks;") && has(n, "private final OrderRepository orders;") && has(n, "private final SpecialRepository specials;"));
    }
    for (const n of ["D1A", "D1B", "D1C", "D1", "D3"] as const) assert.ok(has(n, "jdbc.sql("), `${n}: the unsplit stages hold their SQL`);
    // Day 5: the info comes from a repository and never from a typed-in object
    assert.ok(has("D4", 'return new CanteenInfo("Aling Nena\'s Canteen", "7:00", "16:00");'));
    assert.ok(!has("D5", "7:00") && !has("D5", "16:00") && !has("D5", "Aling"), "typed hours left in the final controller");
    assert.ok(has("D5", "infos.find()") && has("D5", "No canteen info") && !has("D5", ".orElse(new CanteenInfo"));
    assert.ok(has("D5", S.indent(S.D5_FINAL_CONSTRUCTOR)) && has("D4", S.indent(S.D4_FINAL_CONSTRUCTOR)));
    assert.ok(!S.INFO_REPOSITORY.includes("7:00"), "the repository holds no typed hours either");
  });

  test("the menu's filter is in exactly the SELECTs that build the menu, never in the ones that read history or one snack", () => {
    // a SELECT that reads orders or sales (it JOINs or names sales) must not mention available
    const selects = (code: string) => [...code.matchAll(/"""\s*([\s\S]*?)"""|jdbc\.sql\("([^"]+)"\)/g)].map((m) => m[1] ?? m[2]);
    for (const [name, code] of Object.entries({ D1: S.CONTROLLER_D1, D3: S.CONTROLLER_D3, orderRepo: S.ORDER_REPOSITORY })) {
      const list = selects(code);
      assert.ok(list.length >= 5, `${name}: the extractor found too little SQL`);
      for (const sql of list.filter((x) => /\bsales\b/.test(x))) assert.ok(!/available/.test(sql), `${name}: history is filtered: ${sql.slice(0, 80)}`);
    }
    // getSnack's lookup by number is not filtered (staff must find a retired snack), in the unsplit and the split controller
    assert.ok(S.CONTROLLER_D1.includes('jdbc.sql("SELECT snack_id, name, price FROM snacks WHERE snack_id = ?")'));
    assert.ok(S.SNACK_REPOSITORY.includes('"SELECT snack_id, name, price FROM snacks WHERE snack_id = ?"'));
    // the six public SELECTs of the repository are all filtered; only listAll and findById and isAvailable read without
    const publicMethods = ["listAvailable", "searchAvailable", "listAvailableByPrice", "listAvailableByName", "listAvailableUpTo", "findAvailableNamed"];
    for (const m of publicMethods) {
      const at = S.SNACK_REPOSITORY.indexOf(`public List<Snack> ${m}(`);
      assert.ok(at >= 0, m);
      const body = S.SNACK_REPOSITORY.slice(at, S.SNACK_REPOSITORY.indexOf("\n    }", at));
      assert.ok(/available = TRUE/.test(body), `${m} has no available test`);
    }
    // planted: a lazy filter that leaves one path out is caught
    const lazy = S.SNACK_REPOSITORY.replace('WHERE name = ? AND available = TRUE', "WHERE name = ?");
    const body = lazy.slice(lazy.indexOf("public List<Snack> findAvailableNamed("), lazy.indexOf("\n    }", lazy.indexOf("public List<Snack> findAvailableNamed(")));
    assert.ok(!/available = TRUE/.test(body), "the guard can see a path with no filter");
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

  test("no SQL in any finished file glues a value in", () => {
    assert.ok(glued('"DELETE FROM sales WHERE sale_id = " + id'), "the glue guard can see glue");
    assert.ok(!glued('"DELETE FROM sales WHERE sale_id = ?"'));
    for (const [name, code] of Object.entries(everyJavaFile)) {
      const found = sqlArguments(code);
      if (name === "D4" || name === "D5") assert.equal(found.length, 0, `${name}: the controller holds SQL`);
      else assert.ok(found.length >= 1, `${name}: the extractor found too little SQL`);
      assert.ok(!found.some(glued), `${name}: SQL built with +`);
    }
  });

  /** Every UPDATE and DELETE statement inside jdbc.sql(…) must carry a WHERE. */
  const writesWithoutWhere = (code: string) =>
    sqlArguments(code).filter((sql) => /\b(UPDATE|DELETE\s+FROM)\b/.test(sql) && !/\bWHERE\b/.test(sql));

  test("every UPDATE and DELETE in every finished file has a WHERE", () => {
    assert.equal(writesWithoutWhere('x = jdbc.sql("DELETE FROM sales")\n    .update();').length, 1, "the WHERE guard can see a bare DELETE");
    assert.equal(writesWithoutWhere('x = jdbc.sql("UPDATE snacks SET available = ?")\n    .update();').length, 1, "…and a bare UPDATE");
    assert.equal(writesWithoutWhere('x = jdbc.sql("UPDATE snacks SET available = ? WHERE snack_id = ?")\n    .update();').length, 0);
    for (const [name, code] of Object.entries(everyJavaFile)) assert.deepEqual(writesWithoutWhere(code), [], `${name}: an UPDATE or DELETE without a WHERE`);
    const repoWrites = [S.SNACK_REPOSITORY, S.ORDER_REPOSITORY, S.SPECIAL_REPOSITORY].flatMap((c) => sqlArguments(c)).filter((sql) => /\b(UPDATE|DELETE\s+FROM)\b/.test(sql));
    assert.equal(repoWrites.length, 7, "the repositories hold seven writes between them");
    assert.equal(sqlArguments(S.CONTROLLER_D3).filter((sql) => /\b(UPDATE|DELETE\s+FROM)\b/.test(sql)).length, 7);
    // the lab-only broken variants are the only places allowed to be wrong, and only in the way they say
    assert.ok(S.SNACK_REPOSITORY_WRONG_COUNT.includes("return 1;") && !S.SNACK_REPOSITORY.includes("return 1;"));
  });

  test("the split changes no SQL and no order of checks: every statement of Day 3's controller is in a repository, and every endpoint throws the same sentences in the same order", () => {
    const norm = (t: string) => t.replace(/"""/g, " ").replace(/"\)\s*$/, "").replace(/"\s*\+\s*"/g, "").replace(/^\s*"|"\s*$/g, "").replace(/\s+/g, " ").trim();
    // jdbc.sql(sql) in listSnacks takes a variable, so its two statements are read from their `sql = "…";` assignments
    const literals = (code: string) => [...sqlArguments(code).filter((x) => /^\s*"/.test(x)), ...[...code.matchAll(/\bsql = ("[^"]+");/g)].map((m) => m[1])];
    const before = new Set(literals(S.CONTROLLER_D3).map(norm));
    const after = new Set([S.SNACK_REPOSITORY, S.ORDER_REPOSITORY, S.SPECIAL_REPOSITORY].flatMap((c) => literals(c)).map(norm));
    assert.ok(before.size >= 20 && after.size >= 20, "the SQL extractor found too little");
    // the one statement that changed shape: getAvailable read (snack_id, available) into a record; isAvailable reads one column
    const reshaped = new Set(["SELECT snack_id, available FROM snacks WHERE snack_id = ?"]);
    for (const sql of before) assert.ok(after.has(sql) || reshaped.has(sql), `Day 3's SQL was changed or lost in the split: ${sql}`);
    for (const sql of after) assert.ok(before.has(sql), `the split invented SQL: ${sql}`);
    // the guard can fail
    assert.ok(![...after].map((x) => x.replace("price <= ?", "price < ?")).every((x) => before.has(x)), "a changed comparison is caught");
    const perEndpoint = (code: string) => {
      const out = new Map<string, string[]>();
      for (const chunk of code.split(/(?=^    @(?:Get|Post|Put|Delete)Mapping)/m)) {
        const key = /^    (@(?:Get|Post|Put|Delete)Mapping\("[^"]+"\))/.exec(chunk)?.[1];
        if (key) out.set(key, [...chunk.matchAll(/HttpStatus\.[A-Z_]+, ([^\n]+)/g)].map((m) => m[0].replace(/[);\s]+$/, "")));
      }
      return out;
    };
    const was = perEndpoint(S.CONTROLLER_D3);
    const now = perEndpoint(S.CONTROLLER_D4);
    assert.ok(was.size >= 20, "the endpoint extractor found too little");
    assert.deepEqual([...now.keys()].sort(), [...was.keys()].sort(), "an endpoint was added or lost in the split");
    for (const [key, list] of was) assert.deepEqual(now.get(key), list, `${key}: its checks or their order changed in the split`);
    // the guard can fail: swapping the first two checks of addSnack changes the list
    const swapped = S.CONTROLLER_D4.replace('"snack_id must be 1 or more"', '"TEMP"').replace('"name must not be blank"', '"snack_id must be 1 or more"').replace('"TEMP"', '"name must not be blank"');
    assert.notDeepEqual(perEndpoint(swapped).get('@PostMapping("/api/snacks")'), was.get('@PostMapping("/api/snacks")'));
    // and the numbers the lessons quote about Week 9's special.js are the real ones
    const w9Special = S.SPECIAL_JS_OLD;
    assert.equal((w9Special.match(/\.json\(\)/g) ?? []).length, 3);
    assert.ok(prose.includes("response.json()  three times") && prose.includes("about 60 lines to about 40"));
    assert.ok(Math.abs(w9Special.split("\n").length - 60) <= 2 && Math.abs(S.SPECIAL_JS_D2.split("\n").length - 40) <= 2);
  });

  test("the repositories: every one is a @Repository with its import; the clinic's broken file lacks both", () => {
    for (const [name, code] of Object.entries({ snack: S.SNACK_REPOSITORY, order: S.ORDER_REPOSITORY, special: S.SPECIAL_REPOSITORY, info: S.INFO_REPOSITORY })) {
      assert.ok(code.startsWith("package com.example.canteen;"), `${name}: no package line`);
      assert.ok(code.includes("import org.springframework.stereotype.Repository;") && code.includes("\n@Repository\npublic class "), `${name}: not a @Repository`);
      assert.ok(code.includes("private final JdbcClient jdbc;") && /public \w+Repository\(JdbcClient jdbc\)/.test(code), `${name}: no constructor injection`);
    }
    assert.ok(!S.SNACK_REPOSITORY_NO_ANNOTATION.includes("@Repository") && !S.SNACK_REPOSITORY_NO_ANNOTATION.includes("stereotype"));
    assert.ok(S.SNACK_REPOSITORY_NO_ANNOTATION.includes("public class SnackRepository"), "only the annotation and its import were removed");
    assert.deepEqual(Object.keys(S.REPOSITORY_FILES), ["SnackRepository.java", "OrderRepository.java", "SpecialRepository.java"]);
  });

  test("the finished controller has a method for every one the lab hands out, and every handed-out method is in it", () => {
    for (const [name, method] of Object.entries(S.D4_METHODS)) {
      assert.ok(S.CONTROLLER_D4.includes(S.indent(method)), `${name} is handed out but missing from the finished controller`);
    }
    const handedOut = Object.values(S.D4_METHODS).filter((m) => /^@(Get|Post|Put|Delete)Mapping/.test(m)).length;
    assert.equal(handedOut, [...S.CONTROLLER_D4.matchAll(/^    @(?:Get|Post|Put|Delete)Mapping/gm)].length, "the controller has a mapping the lab does not hand out");
  });
});

describe("week 10: the pages", () => {
  /** The scripts of the pages that moved onto api.js. */
  const apiPages: Record<string, string> = {
    editSnack: S.EDIT_SNACK_JS_D2, special: S.SPECIAL_JS_D2, orders: S.ORDERS_JS_D2B, addSnack: S.ADD_SNACK_JS_API,
    staffD3: S.STAFF_JS_D3, staffD4: S.STAFF_JS_D4, index: S.INDEX_JS_D5, order: S.ORDER_JS_API,
  };
  const everyScript: Record<string, string> = { ...apiPages, apiJs: S.API_JS, apiJsA: S.API_JS_A, editSnackD1: S.EDIT_SNACK_JS_D1 };

  test("every page script is valid JavaScript, and every console line is a valid expression", () => {
    const broken = () => new Function("(((");
    assert.throws(broken, SyntaxError, "the syntax guard can fail");
    for (const [name, code] of Object.entries(everyScript)) assert.doesNotThrow(() => new Function(code), `${name}: syntax error`);
    let lines = 0;
    for (const [name, value] of Object.entries(C)) {
      if (typeof value === "string" && /^[A-Z_]+$/.test(name) && value.endsWith("copy)")) {
        assert.doesNotThrow(() => new Function("copy", `return ${value}`), `${name}: syntax error`);
        lines++;
      }
    }
    assert.ok(lines >= 20, "too few console lines found");
    for (const g of checkpoints) for (const t of g.tasks) if (t.command) assert.doesNotThrow(() => new Function("copy", `return ${t.command}`), `${g.id}: a command has a syntax error`);
    assert.doesNotThrow(() => new Function("copy", `return ${C.consolePut('"/api/x"', "{ a: 1 }")}`));
    assert.doesNotThrow(() => new Function("copy", `return ${C.orderThenCancel("8000")}`));
    assert.doesNotThrow(() => new Function("copy", `return ${C.HANDIN_COMMAND(517)}`));
    assert.doesNotThrow(() => new Function("copy", `return ${C.HANDIN_COMMAND("YOUR_NUMBER")}`));
    assert.doesNotThrow(() => new Function("apiGet", "apiSend", S.API_TRY_DELETE));
  });

  test("the pages that moved onto api.js never call fetch( themselves, and the helper is the only file that does", () => {
    for (const [name, code] of Object.entries(apiPages)) assert.ok(!/fetch\(/.test(code), `${name} still calls fetch(`);
    assert.ok(/fetch\(/.test(S.EDIT_SNACK_JS_D1) && /fetch\(/.test(S.ORDERS_CANCEL_ORDER_API) === false, "the guard can see a page that still fetches (Monday's edit page)");
    assert.equal((S.API_JS.match(/fetch\(/g) ?? []).length, 1, "api.js calls fetch exactly once, inside request()");
    for (const [name, code] of Object.entries(apiPages)) assert.ok(/apiGet\(|apiSend\(/.test(code), `${name} doesn't use the helper`);
    // every refactored page's HTML loads api.js before its own script
    const html: Record<string, [string, string]> = {
      "edit-snack": [S.EDIT_SNACK_HTML_D2, "edit-snack.js"], special: [S.SPECIAL_HTML_D2, "special.js"], orders: [S.ORDERS_HTML_D2B, "orders.js"],
      "add-snack": [S.ADD_SNACK_HTML_D2, "add-snack.js"], staff: [S.STAFF_HTML, "staff.js"], staffD4: [S.STAFF_HTML_D4, "staff.js"],
    };
    const apiFirst = (page: string, script: string) => page.indexOf('src="api.js"') >= 0 && page.indexOf('src="api.js"') < page.indexOf(`src="${script}"`);
    for (const [name, [page, script]] of Object.entries(html)) assert.ok(apiFirst(page, script), `${name}: api.js is not loaded first`);
    assert.ok(!apiFirst('<script src="edit-snack.js"></script>\n<script src="api.js"></script>', "edit-snack.js"), "the guard can see api.js loaded late");
    assert.ok(S.INDEX_API_SCRIPT_LINES.indexOf("api.js") < S.INDEX_API_SCRIPT_LINES.indexOf("index.js"));
    assert.ok(S.ORDER_SCRIPT_TAGS.indexOf("api.js") < S.ORDER_SCRIPT_TAGS.indexOf("order.js"));
    // Week 7's order.js POSTs /api/orders, so it is one of the pages that WRITE: no lesson may call it read-only
    assert.ok(/fetch\("\/api\/orders", \{\s*method: "POST"/.test(S.ORDER_SUBMIT_CALL_OLD), "Week 7's order.js really POSTs");
    assert.ok(!/order\.js[^.]{0,80}only READ|only READ[^.]{0,80}order\.js|the menu, the order form,? /i.test(prose), "a lesson calls order.js read-only");
  });

  /**
   * Does the code call .json() before it has decided about a 204? In api.js the decision is the first thing
   * readAnswer does. The lab's FIRST version (API_JS_A) is the one place that is allowed to be wrong: its
   * whole point is that the student watches it fail.
   */
  const readsJsonBefore204 = (code: string) => {
    const status = code.indexOf("response.status === 204");
    const json = code.indexOf(".json()");
    return json >= 0 && (status < 0 || json < status);
  };

  test("a 204 is never read as JSON: api.js decides by status first, and the only exception is the lab's first version", () => {
    assert.ok(readsJsonBefore204("fetch(p).then(response => response.json())"), "the guard can see the mistake");
    assert.ok(readsJsonBefore204("if (x) { return response.json(); } if (response.status === 204) { }"), "…and a late status check");
    assert.ok(!readsJsonBefore204("if (response.status === 204) { return null; } return response.json();"));
    assert.ok(!readsJsonBefore204(S.API_JS), "api.js reads JSON before it looks at the status");
    assert.ok(!readsJsonBefore204(S.API_JS_READ));
    assert.ok(readsJsonBefore204(S.API_JS_A), "the lab's first version is the one that fails on a 204 (that is its job)");
    assert.ok(S.API_JS_READ.includes("return null;"), "a 204 resolves with null");
    for (const [name, code] of Object.entries(apiPages)) assert.ok(!/\.json\(\)/.test(code), `${name}: a page reads JSON itself; only api.js does`);
    // nothing in a lab line reads JSON out of a DELETE's answer
    const deleteThenJson = /method: "DELETE" \}\)\.then\(\w+ => \w+\.json\(\)/;
    assert.ok(deleteThenJson.test('fetch("/x", { method: "DELETE" }).then(r => r.json())'), "the command guard can fail");
    // Week 9's own lines (re-exported for the Day 4 reruns) read the BODY of a DELETE the app REFUSES (a 409 has one): not a 204
    const fromWeek9 = new Set(["KUTSINTA_STAYS", "SNACK_WALL", "SNACK_LIFECYCLE", "CANCEL_ROUNDTRIP", "PUT_ORDER_ROUNDTRIP"]);
    for (const [name, value] of Object.entries(C)) if (typeof value === "string" && !fromWeek9.has(name)) assert.ok(!deleteThenJson.test(value), `${name}: a console line reads JSON from a DELETE`);
    for (const g of checkpoints) for (const t of g.tasks) assert.ok(!deleteThenJson.test(t.command ?? "") || t.command === C.SNACK_WALL, `${g.id}: a command reads JSON from a DELETE`);
  });

  test("every write through the helper that has a body sends it as JSON, and a page that handles errors writes Sorry: and the message", () => {
    for (const [name, code] of Object.entries(apiPages)) {
      for (const m of code.matchAll(/apiSend\("(?:POST|PUT)", [^,]+, /g)) assert.ok(m[0], name);
      if (/apiSend|apiGet/.test(code) && name !== "special" && name !== "index") assert.ok(/error\.message/.test(code), `${name}: errors never show the app's message`);
    }
    assert.ok(S.API_JS_PUBLIC.includes('"Content-Type": "application/json"') && S.API_JS_PUBLIC.includes("JSON.stringify(body)"));
    assert.ok(S.API_JS_PUBLIC.includes("if (body !== undefined)"), "a body is sent only when there is one");
  });

  test("no staff page is linked from any page, and no lab tells a student to link one", () => {
    const hrefs = (html: string) => [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
    const allHtml: Record<string, string> = {
      edit1: S.EDIT_SNACK_HTML_D1, edit2: S.EDIT_SNACK_HTML_D2, special2: S.SPECIAL_HTML_D2, orders2: S.ORDERS_HTML_D2B, add2: S.ADD_SNACK_HTML_D2,
      staff: S.STAFF_HTML, staff4: S.STAFF_HTML_D4,
    };
    for (const [name, html] of Object.entries(allHtml)) {
      for (const h of hrefs(html)) assert.ok(!/^(edit-snack|special|staff)\.html/.test(h), `${name} links to a staff page: ${h}`);
      for (const h of hrefs(html)) assert.match(h, /^(index|menu|order|orders|tables|ledger|add-snack)\.html$|^style\.css$/, `${name}: unknown link ${h}`);
    }
    assert.ok(hrefs('<a href="staff.html">').some((h) => /^(edit-snack|special|staff)\.html/.test(h)), "the guard can see a staff link");
    assert.ok(!/href="(edit-snack|special|staff)\.html/.test(prose), "a lab tells students to link a public page to a staff page");
    // the staff page's own rows link to the edit page (staff to staff), built in script, never in the HTML
    assert.ok(S.STAFF_JS_SHOW.includes("edit-snack.html?id=${snack.snack_id}"));
    // no public page's script gets a link to the staff page either
    for (const code of [S.INDEX_JS_D5, S.INDEX_API_SCRIPT_LINES, S.INDEX_HOURS_LINE]) assert.ok(!/staff\.html/.test(code));
  });

  test("the staff table's headings and cells agree, and every button is type=button", () => {
    assert.equal((S.STAFF_HTML.match(/<th>/g) ?? []).length, 5);
    assert.ok(S.STAFF_JS_SHOW.includes("tr.append(id, name, price, onMenu, actions);"));
    assert.equal((S.STAFF_JS_SHOW.match(/\.type = "button"/g) ?? []).length, 2);
    assert.ok(S.STAFF_JS_WRITES.includes("confirm(") && S.EDIT_SNACK_JS_REMOVE_API.includes("confirm("), "Remove asks first");
    // the dashboard asks the app for the list again after every write
    assert.equal((S.STAFF_JS_WRITES.match(/loadSnacks\(\);/g) ?? []).length, 2);
    assert.ok(S.STAFF_JS_ADD.includes("loadSnacks();"));
    assert.ok(S.STAFF_JS_D4.includes("loadSummary();") && S.STAFF_HTML_D4.includes('id="refresh"'));
  });
});

describe("week 10: the checkpoints", () => {
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
    assert.ok(pinnedCount({ min: 7 }) && pinnedCount({ exact: 3 }) && !pinnedCount({ min: 1 }) && !pinnedCount({ exact: 0 }));
    // numbers a check may equal: statuses, values a lab line itself puts there (qty 19), snack 90, and the six addresses one line asks
    const allowed = new Set([200, 201, 204, 400, 404, 409, 19, 90, 6]);
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

  test("a lazy implementation can't pass: the toggle, every-path and staff tasks carry the checks that catch it", () => {
    const task = (id: string, i: number) => checkpoints.find((g) => g.id === id)!.tasks[i];
    const has = (t: JsonCheckTask, path: string) => t.checks.some((c) => c.path === path && c.equals === true);
    // an UPDATE with no WHERE (every snack retired) fails others_unchanged / nothing_changed, on a real-shaped answer
    assert.ok(has(task("checkpoint-available", 0), "others_unchanged") && has(task("checkpoint-available", 2), "nothing_changed"));
    assert.ok(has(task("checkpoint-split", 1), "others_unchanged"));
    const lazyToggle = parsePasted(task("checkpoint-available", 0).example.replace('"others_unchanged":true', '"others_unchanged":false'));
    assert.ok(lazyToggle.ok && firstJsonFailure(lazyToggle.value, task("checkpoint-available", 0).checks) !== null, "a no-WHERE answer is rejected");
    const lazyMissing = parsePasted(task("checkpoint-available", 2).example.replace('"nothing_changed":true', '"nothing_changed":false'));
    assert.ok(lazyMissing.ok && firstJsonFailure(lazyMissing.value, task("checkpoint-available", 2).checks) !== null);
    // a filter missing from any one query path fails hidden_everywhere, on the real previous-stage answer
    const everyPath = task("checkpoint-available", 1);
    assert.ok(has(everyPath, "hidden_everywhere") && everyPath.checks.some((c) => c.path === "paths_checked" && c.equals === 6));
    const partial = parsePasted(JSON.stringify({ paths_checked: 6, still_shown_by: ["/api/snacks?name=Check"], hidden_everywhere: false, cleaned_up: true }));
    assert.ok(partial.ok && firstJsonFailure(partial.value, everyPath.checks) !== null);
    // history survives: a menu filter that also hides history fails orders_still_show_it
    // an error from one path is not "hidden": paths_failing must be empty, on a real-shaped answer
    assert.ok(everyPath.checks.some((c) => c.path === "paths_failing" && c.exact === 0));
    const broken = parsePasted(JSON.stringify({ paths_checked: 6, paths_failing: ["/api/snacks?sort=price"], still_shown_by: [], hidden_everywhere: false, cleaned_up: true }));
    assert.ok(broken.ok && firstJsonFailure(broken.value, everyPath.checks) !== null, "a path that answers an error is not accepted as hidden");
    // the special's filter is checked in BOTH SELECTs: GET must not show it, and a PUT must change nothing
    const hist = task("checkpoint-available", 4);
    assert.ok(has(hist, "special_hidden") && has(hist, "special_untouched") && has(hist, "has_special"));
    for (const flip of ["special_hidden", "special_untouched"]) {
      const bad = parsePasted(hist.example.replace(`"${flip}":true`, `"${flip}":false`));
      assert.ok(bad.ok && firstJsonFailure(bad.value, hist.checks) !== null, `${flip} false is rejected`);
    }
    assert.ok(has(task("checkpoint-available", 4), "orders_still_show_it") && has(task("checkpoint-available", 4), "sales_still_show_it"));
    // the staff list must not be the menu's list, and must not be the retired snacks only
    assert.ok(has(task("checkpoint-staff-list", 0), "staff_shows_it") && has(task("checkpoint-staff-list", 1), "staff_has_every_menu_snack"));
    assert.ok(has(task("checkpoint-staff-list", 0), "menu_keys_unchanged"));
  });

  test("Kutsinta is never left off the menu or removed: the commands that retire it put it back, in the same command", () => {
    const retiresKutsinta = (cmd: string) => /\/api\/snacks\/90\/available", \{ available: false \}/.test(cmd);
    // a put-back is either a literal PUT true after the retire, or a function that sends it (putBack) called after the retire
    const restoresAfter = (cmd: string) => {
      const off = cmd.search(/\/api\/snacks\/90\/available", \{ available: false \}/);
      if (off < 0) return false;
      const after = cmd.slice(off + 10);
      return /\{ available: true \}/.test(after) || (/const putBack = \(\) => send\("PUT", "\/api\/snacks\/90\/available", \{ available: true \}\)/.test(cmd) && /putBack\(\)/.test(after));
    };
    assert.ok(retiresKutsinta('send("PUT", "/api/snacks/90/available", { available: false })'));
    assert.ok(!restoresAfter('send("PUT", "/api/snacks/90/available", { available: false })'), "the guard can see a command that never puts it back");
    assert.ok(retiresKutsinta(C.HISTORY_SURVIVES) && restoresAfter(C.HISTORY_SURVIVES));
    // the put-back is sent when the line fails too, not only when it succeeds
    assert.ok(/putBack\(\)\.then\(\(\) => JSON\.stringify\(\{ error/.test(C.HISTORY_SURVIVES));
    assert.ok(restoresAfter(C.EDIT_AVAILABILITY_PAGE_COMMAND) || /send\("PUT", "\/api\/snacks\/90\/available", \{ available: true \}\)/.test(C.EDIT_AVAILABILITY_PAGE_COMMAND));
    // no command ever deletes snack 90, and no instruction anywhere takes it off the menu with SQL
    // the only DELETEs aimed at Kutsinta are the ones that expect the wall (409), and each looks for a sale first
    const deletesKutsinta = (cmd: string) => cmd.search(/\/api\/snacks\/90", \{ method: "DELETE"/);
    const looksForSaleFirst = (cmd: string) => {
      const at = deletesKutsinta(cmd);
      return at < 0 || (cmd.slice(0, at).includes("s.snack_id === 90") && cmd.slice(0, at).includes("/api/sales"));
    };
    assert.ok(!looksForSaleFirst('fetch("/api/snacks/90", { method: "DELETE" })'), "the guard can see a blind DELETE of Kutsinta");
    for (const [name, value] of Object.entries(C)) if (typeof value === "string") assert.ok(looksForSaleFirst(value), `${name}: deletes Kutsinta without checking it has a sale`);
    assert.ok(!/UPDATE snacks SET available = FALSE WHERE snack_id = 90/i.test(prose), "an instruction retires Kutsinta in SQL");
    assert.ok(!/DELETE FROM snacks WHERE snack_id = 90/i.test(prose), "an instruction removes Kutsinta");
  });
});

describe("week 10: every checkpoint is failed by the previous stage's real app", () => {
  // Tasks that are meant to carry NO previous-stage answer. They are the behaviour-preserving refactor of Day 4
  // (the repositories): a split changes nothing a browser can see, so the stage before gives the same answers.
  // Their proof is the lab's before-and-after run and the student's own project search for jdbc.sql, not a rejected
  // answer. Nothing else may be listed here, and every listed task must exist (a planted entry fails below).
  const refactorExceptions = new Set(["checkpoint-split#1", "checkpoint-split#2", "checkpoint-split#3", "checkpoint-split#4", "checkpoint-split#5", "checkpoint-split#6"]);
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

  test("every task has captured previous-stage data unless it is an allowlisted behaviour-preserving refactor, and the allowlist is exact", () => {
    const keys = new Set(tasks.map((x) => x.key));
    for (const k of refactorExceptions) assert.ok(keys.has(k), `${k}: allowlisted but no such task`);
    // planted: an extra entry would be caught as missing
    assert.ok(![...new Set([...refactorExceptions, "checkpoint-nothing#1"])].every((k) => keys.has(k)), "the allowlist check can fail");
    // planted: a task with no previousStage that is NOT listed is caught
    const unlistedWithout = (list: { key: string; t: { previousStage?: string } }[]) => list.filter((x) => x.t.previousStage === undefined && !refactorExceptions.has(x.key));
    assert.equal(unlistedWithout([{ key: "checkpoint-available#1", t: {} }]).length, 1);
    assert.deepEqual(unlistedWithout(tasks), [], "a task has no previous-stage answer and is not an allowlisted refactor");
    for (const { t, key } of tasks) {
      if (refactorExceptions.has(key)) assert.equal(t.previousStage, undefined, `${key}: allowlisted, so it must not carry previousStage`);
      else assert.ok(t.previousStage && t.previousStage.length > 0, `${key}: no previousStage captured from the stage before`);
    }
    // the exceptions are all in Day 4's first checkpoint, nowhere else
    for (const k of refactorExceptions) assert.ok(k.startsWith("checkpoint-split#"));
    assert.equal(tasks.length, 28, "the number of checkpoint tasks changed: update the log and the course-content map");
    assert.equal(tasks.filter((x) => !refactorExceptions.has(x.key)).length, 22);
  });

  test("the previous stage's real answers are rejected by the checks", () => {
    for (const { t, key } of tasks) {
      if (t.previousStage === undefined) continue;
      assert.ok(rejects(t.previousStage, t), `${key}: the previous stage's app passes this task`);
      assert.notEqual(t.previousStage, t.example, `${key}: previousStage is the example`);
    }
  });
});

describe("week 10: copy that must be true for every student's ledger", () => {
  const ledgerSpecific = /\b(?:the )?(?:six|seven|eight|nine|ten|eleven|twelve|thirteen) (?:snacks|sales|orders|rows)\b|\bsale_id = 1[0-9]\b|\bOrder 1[0-9]\b|\b(?:test )?id 1[12]\b|\b10 rows\b|\bone fewer\b|exactly like last week/i;

  test("no step asks for a sale number or row count that only one ledger has", () => {
    assert.ok(ledgerSpecific.test("DELETE FROM sales WHERE sale_id = 11;"));
    assert.ok(ledgerSpecific.test("The receipt says Order 12"));
    assert.ok(ledgerSpecific.test("each of the seven snacks") && ledgerSpecific.test("thirteen sales"), "the guard sees number words");
    const hit = ledgerSpecific.exec(prose);
    assert.equal(hit, null, `ledger-specific wording: ${hit?.[0]}`);
  });

  test("no statement without a WHERE is ever shown to students, except the described stories", () => {
    const bare = (text: string) =>
      [...text.matchAll(/(?:UPDATE\s+\w+\s+SET\s+[^;"\\]*|DELETE\s+FROM\s+\w+[^;"\\]*)/g)]
        .map((m) => m[0].trim())
        .filter((s) => !/\bWHERE\b/i.test(s));
    assert.deepEqual(bare("DELETE FROM snacks; and UPDATE snacks SET price = 1;"), ["DELETE FROM snacks", "UPDATE snacks SET price = 1"]);
    assert.deepEqual(bare("DELETE FROM sales WHERE qty = 7;"), []);
    // told as what a careless student or helper did, never instructed
    const stories = ["UPDATE snacks SET available = ?", "UPDATE supplies SET in_stock = FALSE", "DELETE FROM canteen_info"];
    const found = bare(prose);
    for (const s of found) assert.ok(stories.includes(s), `an unexpected statement without a WHERE: ${s}`);
    for (const s of stories) assert.ok(found.includes(s), `the story ${s} has gone: update the allowlist`);
    // each story sits in a patient, a gauntlet scenario or a helper's mistake
    for (const s of stories) {
      // every place the bare statement appears (not the same words followed by a WHERE) sits inside a story
      const places = [...prose.matchAll(new RegExp(s.replace(/[?]/g, "\\?") + "(?! WHERE)", "g"))].map((m) => m.index!);
      assert.ok(places.length >= 1, `${s} is not found`);
      for (const at of places) assert.ok(/Patient|helper|student|Kuya Jun|forgot|wrote|ran/i.test(prose.slice(Math.max(0, at - 300), at + 300)), `${s} is not framed as a story`);
    }
    // the one recovery statement is a WHERE written on purpose, and says so
    assert.equal(S.SQL_RESTORE_MENU, "UPDATE snacks SET available = TRUE WHERE snack_id > 0;");
    assert.ok(prose.includes("a WHERE written on purpose"));
    // every instructed DELETE aimed at a real table names its rows
    for (const m of prose.matchAll(/DELETE FROM (snacks|sales|specials|canteen_info)(?!_)([^;"\\]*);/g)) {
      assert.ok(/WHERE/i.test(m[2]) || stories.includes(`DELETE FROM ${m[1]}`), `an instructed DELETE without a WHERE: ${m[0]}`);
    }
  });

  test("every test row is made by a condition only it satisfies, and the practice numbers are exactly these", () => {
    assert.equal(S.SQL_CLEAN_CHECKS, "DELETE FROM snacks WHERE name LIKE 'Check %';");
    assert.equal(S.SQL_CLEAN_PRACTICE, "DELETE FROM snacks WHERE snack_id = 8000;");
    const eightK = new Set([...prose.matchAll(/(?<![:\d])8\d{3}\b/g)].map((m) => m[0]));
    for (const n of eightK) assert.ok(["8000", "8200", "8201", "8300", "8301"].includes(n), `an unexpected practice number: ${n}`);
    assert.ok(eightK.has("8000") && eightK.has("8200") && eightK.has("8300"));
    // every console line that makes a snack gives it a name that starts Check and a number well away from Week 3's and Week 8's
    for (const cmd of [C.AVAILABLE_ROUNDTRIP, C.AVAILABLE_EVERY_PATH, C.ORDER_REFUSED, C.STAFF_LIST_ROUNDTRIP, C.SPLIT_BATTERY, C.ADD_PAGE_COMMAND, C.STAFF_PAGE_COMMAND]) {
      assert.ok(/name: "Check " \+ id|"Check " \+ id/.test(cmd) && /20000 \+ Math\.floor/.test(cmd), "a line makes a snack without its own number and name");
      assert.ok(/method: "DELETE"/.test(cmd) || /press\(id, "Remove"\)/.test(cmd), "a line makes a snack and never removes it");
    }
    // a line that places an order cancels it in the same line
    for (const cmd of [C.ORDER_REFUSED, C.API_HELPER_COMMAND, C.STAFF_SUMMARY_PAGE_COMMAND]) assert.ok(/"\/api\/orders\/" \+ /.test(cmd) && /method: "DELETE"|"DELETE"/.test(cmd), "an order is placed and not cancelled");
    assert.ok(/cancelled_again/.test(C.orderThenCancel("8000")));
    // the page commands put the value back
    assert.ok(/available: true/.test(C.EDIT_AVAILABILITY_PAGE_COMMAND));
  });

  test("the hand-in uses the student's own number, never a pinned one", () => {
    const handIn = days[4].activities!.find((a) => (a as { kind?: string }).kind === "upload") as unknown as { steps: string[] };
    const text = handIn.steps.join("\n");
    assert.ok(text.includes("500 plus the day of the month you were born"));
    assert.ok(text.includes("YOUR_NUMBER") && !/const id = \d/.test(text), "the hand-in line has the student's number typed in");
    assert.ok(/new_order_refused_status/.test(C.HANDIN_COMMAND("YOUR_NUMBER")) && /available: true/.test(C.HANDIN_COMMAND("YOUR_NUMBER")));
  });

  test("the lab snack is the one Week 8 put there, no Week 3 snack is used, and Taho never appears", () => {
    assert.equal(S.LAB_SNACK, "Kutsinta");
    assert.equal(S.LAB_SNACK_ID, 90);
    assert.ok(!/Taho/.test(everything));
    assert.ok(everything.includes("Kutsinta"));
  });

  test("a day's copy never talks about a LATER weekday as if it had happened", () => {
    const names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const past = (text: string, name: string) => new RegExp(`${name}'s (code|lab|lines|mission|endpoint|method|first version|api\\.js|helper|filter|repositor|canteen_info|staff)|from ${name}|on ${name}[,.]? (you|we|the)`).test(text);
    assert.ok(past("Thursday's code", "Thursday"), "the guard can fail");
    for (const [i, d] of days.entries()) {
      const text = JSON.stringify(d);
      for (const later of names.slice(i + 1)) assert.ok(!past(text, later), `${d.day} mentions ${later} as if it were past`);
    }
  });
});

describe("week 10: quiz answers don't cluster on one position", () => {
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

describe("week 10: day shape", () => {
  test("five days, each with a warm-up, a labelled Part 1 lab and Part 2 lab, an error clinic, a make-your-own, a boss battle of 10 to 12 questions, and an exit ticket", () => {
    assert.deepEqual(days.map((d) => d.day), ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5"]);
    for (const d of days) {
      assert.ok(d.warmupGame, `${d.day}: no warm-up`);
      const ids = (d.activities ?? []).map((a) => a.id);
      assert.ok(ids.includes("real-lab") && ids.some((id) => id.startsWith("p2-lab")), `${d.day}: Part 1 or Part 2 lab missing`);
      assert.ok(ids.includes("error-clinic") && ids.includes("make-your-own"), `${d.day}: clinic or make-your-own missing`);
      const parts = (d.activities ?? []).map((a) => (a as { title?: string }).title ?? "");
      assert.ok(parts.some((t) => /Part 1 · Real lab/.test(t)) && parts.some((t) => /Part 2 · Lab/.test(t)), `${d.day}: labs are not labelled Part 1 and Part 2`);
      const boss = d.game as unknown as BossBattleGame;
      assert.equal(boss.kind, "boss-battle");
      assert.ok(boss.questions.length >= 10 && boss.questions.length <= 12, `${d.day}: ${boss.questions.length} boss questions`);
      const steps = typeof d.practice === "string" ? [d.practice] : d.practice.steps;
      assert.ok(steps.length >= 6, `${d.day}: exit ticket too short`);
    }
  });

  test("Day 4 has the gauntlet; Day 5 has no video, an audit and a hand-in; Days 1 to 4 each have a video with watch notes", () => {
    assert.ok((days[3].activities ?? []).some((a) => a.id === "week10-gauntlet"));
    assert.equal(days[4].videos.length, 0, "Day 5 has no video");
    const day5 = (days[4].activities ?? []).map((a) => a.id);
    assert.ok(day5.includes("self-audit") && day5.includes("screenshot-whole-week"));
    const audit = days[4].activities!.find((a) => a.id === "self-audit") as unknown as { steps: string[] };
    assert.ok(audit.steps.length >= 15 && audit.steps.length <= 18, `the audit has ${audit.steps.length} lines`);
    for (const d of days.slice(0, 4)) {
      assert.ok(d.videos.length >= 1, `${d.day}: no video`);
      for (const v of d.videos) {
        assert.match(v.youtubeId, /^[A-Za-z0-9_-]{11}$/);
        assert.match(v.length, /^\d+:\d\d$/);
        const text = typeof v.practice === "string" ? v.practice : v.practice?.intro ?? "";
        assert.ok(/\d+:\d\d/.test(text), `${d.day}: ${v.title}: the watch note names no minutes`);
        assert.ok(/skip|not|never|don't|stop/i.test(text), `${d.day}: ${v.title}: the watch note says nothing about what NOT to copy`);
      }
    }
  });

  test("the week's reading is official pages only", () => {
    assert.ok(unit3Week10.reading.length >= 10);
    for (const r of unit3Week10.reading) assert.match(r.url, /^https:\/\/(docs\.spring\.io|dev\.mysql\.com|developer\.mozilla\.org)\//, r.url);
  });
});

describe("week 10: it fits into the course", () => {
  test("it is registered after Week 9, and the roadmap no longer lists it but still lists Weeks 11-12", () => {
    const slugs = weeks.map((w) => w.slug);
    assert.ok(slugs.indexOf("unit3-week10") > slugs.indexOf("unit3-week9") && slugs.indexOf("unit3-week9") >= 0, "Week 10 must come after Week 9");
    assert.equal(slugs.filter((s) => s === "unit3-week10").length, 1);
    const items = roadmap.flatMap((r) => r.items);
    assert.ok(items.length >= 2);
    for (const item of items) assert.ok(!/^Week 10\b|Weeks 9–10|Weeks? 10 /.test(item), `the roadmap still lists Week 10: ${item}`);
    assert.ok(items.some((item) => /^Weeks 11–12 /.test(item)), "the roadmap should still name Weeks 11–12");
  });
});
