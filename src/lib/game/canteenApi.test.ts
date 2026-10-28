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

  // Observed on a real Spring Boot 4.1.1 build, 2026-10-28 (curl; the build's
  // controller is Week 7 Day 5's SnackController with getOrder and summary).
  test("GET /api/summary adds up the orders: zeros when empty, then count and sales", () => {
    const state = fresh();
    const empty = canteenApi({ path: "/api/summary" }, state);
    assert.equal(empty.status, 200);
    assert.deepEqual(empty.body, { total_orders: 0, total_sales: 0 });
    canteenApi({ method: "POST", path: "/api/orders", contentType: json, body: '{"snack_id":3,"qty":2}' }, state);
    canteenApi({ method: "POST", path: "/api/orders", contentType: json, body: '{"snack_id":2,"qty":1}' }, state);
    assert.deepEqual(canteenApi({ path: "/api/summary" }, state).body, { total_orders: 2, total_sales: 52 });
  });

  test("GET /api/summary answers from seeded orders too", () => {
    const state = {
      orders: [
        { order_id: 1, snack_id: 3, name: "Kwek-kwek", qty: 2, total: 40 },
        { order_id: 2, snack_id: 2, name: "Turon", qty: 1, total: 12 },
        { order_id: 3, snack_id: 5, name: "Siopao", qty: 2, total: 50 },
      ],
    };
    assert.deepEqual(canteenApi({ path: "/api/summary" }, state).body, { total_orders: 3, total_sales: 102 });
  });

  test("GET /api/orders/{id}: the order, or 404 with the controller's message", () => {
    const state = fresh();
    canteenApi({ method: "POST", path: "/api/orders", contentType: json, body: '{"snack_id":3,"qty":2}' }, state);
    canteenApi({ method: "POST", path: "/api/orders", contentType: json, body: '{"snack_id":2,"qty":1}' }, state);
    const two = canteenApi({ path: "/api/orders/2" }, state);
    assert.equal(two.status, 200);
    assert.deepEqual(two.body, { order_id: 2, snack_id: 2, name: "Turon", qty: 1, total: 12 });
    for (const id of ["99", "0", "-1"]) {
      const missing = canteenApi({ path: `/api/orders/${id}` }, state);
      assert.equal(missing.status, 404, id);
      assert.equal(msg(missing), `No order with id ${id}`);
      assert.equal((missing.body as { path: string }).path, `/api/orders/${id}`);
    }
  });

  test("GET /api/orders/{id}: a non-integer is the same 400 conversion error as /api/snacks/{id}", () => {
    for (const id of ["abc", "2.5", "99999999999"]) {
      const r = canteenApi({ path: `/api/orders/${id}` }, fresh());
      assert.equal(r.status, 400, id);
      assert.equal(
        msg(r),
        `Method parameter 'id': Failed to convert value of type 'java.lang.String' to required type 'int'; For input string: "${id}"`,
      );
    }
  });

  test("an id too big for a Java int is a 400 on every id route, not a lookup", () => {
    assert.equal(canteenApi({ path: "/api/snacks/99999999999" }, fresh()).status, 400);
    assert.equal(canteenApi({ path: "/api/snacks?maxPrice=99999999999" }, fresh()).status, 400);
    assert.equal(canteenApi({ path: "/api/snacks/2147483647" }, fresh()).status, 404);
  });

  test("/api/orders/{id} and /api/summary are GET-only (405 with Allow: GET)", () => {
    for (const path of ["/api/orders/1", "/api/summary"]) {
      for (const method of ["POST", "DELETE"]) {
        const r = canteenApi({ method, path }, fresh());
        assert.equal(r.status, 405, `${method} ${path}`);
        assert.equal(r.allow, "GET");
        assert.equal(msg(r), `Method '${method}' is not supported.`);
      }
    }
  });

  test("the fake has no // line comment: the harness collapses it onto one line, and a // would swallow the rest", () => {
    assert.ok(!/(^|\s)\/\/(?!\/)/m.test(CANTEEN_API_JS.replace(/"[^"\n]*"|'[^'\n]*'|\/[^/\n]*\/[a-z]*\.exec|\/\^[^/\n]*\//g, "")));
  });

  test("a trailing slash is not the route: 404 'No static resource'", () => {
    assert.equal(msg(canteenApi({ path: "/api/orders/" }, fresh())), "No static resource api/orders.");
    assert.equal(msg(canteenApi({ path: "/api/summary/" }, fresh())), "No static resource api/summary.");
  });
});
