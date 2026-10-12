import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { firstJsonFailure, parsePasted } from "@/lib/game/jsonChecks";
import type { JsonCheck } from "@/lib/content/types";

// The judge for json-check checkpoints. The JSON fixtures are real answers
// from a Spring Boot 4.1.1 build of the Week 7 controller (2026-10-11).

const SNACKS =
  '[{"snack_id":1,"name":"Banana cue","price":15},{"snack_id":2,"name":"Turon","price":12},{"snack_id":3,"name":"Kwek-kwek","price":20}]';
const NOT_FOUND =
  '{"timestamp":"2026-10-11T13:11:17.309Z","status":404,"error":"Not Found","message":"No snack with id 99","path":"/api/snacks/99"}';

const c = (check: Omit<JsonCheck, "message">): JsonCheck => ({ message: JSON.stringify(check), ...check });
const judge = (text: string, checks: JsonCheck[]) => {
  const parsed = parsePasted(text);
  assert.ok(parsed.ok, "fixture should parse");
  return firstJsonFailure(parsed.value, checks);
};

describe("parsePasted", () => {
  test("accepts Chrome's select-all, which includes the Pretty-print label", () => {
    const parsed = parsePasted(`Pretty-print\n${SNACKS}\n`);
    assert.ok(parsed.ok && Array.isArray(parsed.value) && parsed.value.length === 3);
  });

  test("a console copy that took the typed line and the Promise along uses the printed answer", () => {
    const pasted = `> fetch("/api/snacks/99").then(r => r.text()).then(t => { console.log(t); copy(t); })\n< Promise {<pending>}\n${NOT_FOUND}\n`;
    const parsed = parsePasted(pasted);
    assert.ok(parsed.ok && (parsed.value as { status: number }).status === 404);
  });

  test("a console line with a source link after it still parses; the command alone is named", () => {
    const linked = parsePasted(`${NOT_FOUND}   VM123:1`);
    assert.ok(linked.ok && (linked.value as { status: number }).status === 404);
    const command = parsePasted('fetch("/api/snacks/99").then(r => r.text()).then(t => { console.log(t); return t; }).then(copy)');
    assert.ok(!command.ok && /console line you typed/.test(command.message));
  });

  test("names an empty box, a Whitelabel page, non-JSON and a half copy differently", () => {
    const empty = parsePasted("   ");
    const whitelabel = parsePasted("Whitelabel Error Page\nThere was an unexpected error (type=Not Found, status=404).");
    const text = parsePasted("hello");
    const half = parsePasted('[{"snack_id":1,"name":"Banana cue"');
    assert.ok(!empty.ok && /empty/.test(empty.message));
    assert.ok(!whitelabel.ok && /Whitelabel/.test(whitelabel.message));
    assert.ok(!text.ok && /starts with \[ or \{/.test(text.message));
    assert.ok(!half.ok && /part of the JSON/.test(half.message));
  });
});

describe("firstJsonFailure", () => {
  test("reports the first failing check, in authored order", () => {
    const a = c({ is: "object" });
    const b = c({ min: 99 });
    assert.equal(judge(SNACKS, [a, b]), a);
    assert.equal(judge(SNACKS, [c({ is: "array" }), b]), b);
  });

  test("min and exact count array items, and fail on a non-array", () => {
    assert.equal(judge(SNACKS, [c({ exact: 3 }), c({ min: 2 })]), null);
    const exact = c({ exact: 6 });
    assert.equal(judge(SNACKS, [exact]), exact);
    const onObject = c({ min: 1 });
    assert.equal(judge(NOT_FOUND, [onObject]), onObject);
  });

  test("paths reach into arrays and objects, and a missing path fails", () => {
    assert.equal(judge(SNACKS, [c({ path: "1.name", equals: "Turon" })]), null);
    assert.equal(judge(NOT_FOUND, [c({ path: "status", equals: 404 })]), null);
    const missing = c({ path: "7.name", is: "string" });
    assert.equal(judge(SNACKS, [missing]), missing);
  });

  test("equals is strict: the number 12 is not the text \"12\"", () => {
    const strict = c({ path: "1.price", equals: 12 });
    assert.equal(judge(SNACKS, [strict]), null);
    assert.equal(judge(SNACKS.replace('"price":12', '"price":"12"'), [strict]), strict);
  });

  test("contains is case-insensitive and needs text", () => {
    assert.equal(judge(NOT_FOUND, [c({ path: "message", contains: "NO SNACK" })]), null);
    const onNumber = c({ path: "status", contains: "404" });
    assert.equal(judge(NOT_FOUND, [onNumber]), onNumber);
  });

  test("keys and types apply to every item — one camelCase row fails it", () => {
    const shape = c({ keys: ["snack_id", "name", "price"], types: { snack_id: "number", price: "number" } });
    assert.equal(judge(SNACKS, [shape]), null);
    assert.equal(judge(SNACKS.replace('"snack_id":2', '"snackId":2'), [shape]), shape);
    const empty = c({ keys: ["snack_id"] });
    assert.equal(judge("[]", [empty]), empty, "an empty list has no rows to show the keys");
  });

  test("some finds one matching item; everyAtMost holds for all", () => {
    assert.equal(judge(SNACKS, [c({ some: { name: "Turon", price: 12 } })]), null);
    const wrongPrice = c({ some: { name: "Turon", price: 15 } });
    assert.equal(judge(SNACKS, [wrongPrice]), wrongPrice);
    const cheap = c({ everyAtMost: { key: "price", max: 12 } });
    assert.equal(judge(SNACKS, [cheap]), cheap);
    assert.equal(judge('[{"price":12},{"price":8}]', [cheap]), null);
  });
});
