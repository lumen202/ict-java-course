import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { CANTEEN_API_JS } from "@/lib/game/canteenApi";

// Pins the fake to the REAL Week 7 app. Every expected status and message
// here was observed from a Spring Boot 4.1.1 build of the Week 7 controller
// (2026-10-11, spring.web.error.include-message=always) — curl for GETs, a
// headless-Chrome fetch() for the POSTs.

type Res = { status: number; body: unknown; allow?: string };
const canteenApi = new Function(`${CANTEEN_API_JS}; return canteenApi;`)() as (
  req: { method?: string; path: string; contentType?: string; body?: unknown },
  state: { orders: unknown[] },
) => Res;

const fresh = () => ({ orders: [] as unknown[] });
const json = "application/json";
const msg = (r: Res) => (r.body as { message?: string }).message;

describe("canteen API fake", () => {
  test("GET /api/snacks lists six; ?maxPrice=12 keeps Turon, Gulaman, Pastillas", () => {
    const all = canteenApi({ path: "/api/snacks" }, fresh());
    assert.equal(all.status, 200);
    assert.equal((all.body as unknown[]).length, 6);
    assert.deepEqual((all.body as unknown[])[1], { snack_id: 2, name: "Turon", price: 12 });
    const cheap = canteenApi({ path: "/api/snacks?maxPrice=12" }, fresh());
    assert.deepEqual((cheap.body as { name: string }[]).map((s) => s.name), ["Turon", "Gulaman", "Pastillas"]);
  });

  test("GET one: 200, 404 with the controller's message, 400 for a non-number", () => {
    assert.equal(canteenApi({ path: "/api/snacks/2" }, fresh()).status, 200);
    const missing = canteenApi({ path: "/api/snacks/99" }, fresh());
    assert.equal(missing.status, 404);
    assert.equal(msg(missing), "No snack with id 99");
    assert.equal((missing.body as { path: string }).path, "/api/snacks/99");
    assert.equal(canteenApi({ path: "/api/snacks/abc" }, fresh()).status, 400);
  });

  test("POST with the JSON header: 201 and the order, numbered from 1", () => {
    const state = fresh();
    const r = canteenApi({ method: "POST", path: "/api/orders", contentType: json, body: '{"snack_id":3,"qty":2}' }, state);
    assert.equal(r.status, 201);
    assert.deepEqual(r.body, { order_id: 1, snack_id: 3, name: "Kwek-kwek", qty: 2, total: 40 });
    const second = canteenApi({ method: "POST", path: "/api/orders", contentType: json, body: '{"snack_id":2,"qty":1}' }, state);
    assert.equal((second.body as { order_id: number }).order_id, 2);
    assert.equal((canteenApi({ path: "/api/orders" }, state).body as unknown[]).length, 2);
  });

  test("POST without the header is 415, naming text/plain like the browser's request", () => {
    const r = canteenApi({ method: "POST", path: "/api/orders", body: '{"snack_id":3,"qty":2}' }, fresh());
    assert.equal(r.status, 415);
    assert.equal(msg(r), "Content-Type 'text/plain;charset=UTF-8' is not supported.");
  });

  test("POST of an object without JSON.stringify is 400 'from Array value'", () => {
    const r = canteenApi({ method: "POST", path: "/api/orders", contentType: json, body: "[object Object]" }, fresh());
    assert.equal(r.status, 400);
    assert.match(msg(r) ?? "", /from Array value \(token `JsonToken.START_ARRAY`\)/);
  });

  test("a missing or misspelled key is 400 'Cannot map null into type int'", () => {
    for (const body of ['{"snackId":3,"qty":2}', '{"snack_id":3}']) {
      const r = canteenApi({ method: "POST", path: "/api/orders", contentType: json, body }, fresh());
      assert.equal(r.status, 400, body);
      assert.match(msg(r) ?? "", /Cannot map `null` into type `int`/, body);
    }
  });

  test("qty outside 1–20 is 400; an unknown snack is 404; qty as text is accepted", () => {
    const bad = canteenApi({ method: "POST", path: "/api/orders", contentType: json, body: '{"snack_id":3,"qty":0}' }, fresh());
    assert.equal(bad.status, 400);
    assert.equal(msg(bad), "qty must be from 1 to 20");
    const unknown = canteenApi({ method: "POST", path: "/api/orders", contentType: json, body: '{"snack_id":99,"qty":2}' }, fresh());
    assert.equal(unknown.status, 404);
    assert.equal(msg(unknown), "No snack with id 99");
    const text = canteenApi({ method: "POST", path: "/api/orders", contentType: json, body: '{"snack_id":3,"qty":"2"}' }, fresh());
    assert.equal(text.status, 201);
  });

  test("wrong method is 405 with Allow; broken JSON is 400", () => {
    const r = canteenApi({ method: "POST", path: "/api/snacks" }, fresh());
    assert.equal(r.status, 405);
    assert.equal(r.allow, "GET");
    assert.equal(msg(r), "Method 'POST' is not supported.");
    const unknown = canteenApi({ path: "/api/nothing" }, fresh());
    assert.equal(unknown.status, 404);
    assert.equal(msg(unknown), "No static resource api/nothing.");
    const broken = canteenApi({ method: "POST", path: "/api/orders", contentType: json, body: '{"snack_id":3,' }, fresh());
    assert.equal(broken.status, 400);
  });
});
