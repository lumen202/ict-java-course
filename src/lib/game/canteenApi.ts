// A fake of the Week 7 canteen API, for script checkpoints whose pages fetch
// /api/… (html-sandbox with `api: "canteen"`). It reproduces what the real
// controller answers — status codes AND error bodies — as observed from a
// Spring Boot 4.1.1 build on 2026-10-11 with
// spring.web.error.include-message=always (the property Week 7 Day 2 adds).
// GET /api/orders/{id} and GET /api/summary (Week 7 Day 5, Part 2) and the
// out-of-range-id answer were observed on a 4.1.1 build on 2026-10-28.
// If the Week 7 controller changes, change this too, or the checker will
// teach errors the student's own app never shows.
//
// isInt() mirrors Java's int: a longer number is a conversion error (400), not
// a lookup. NO line comments inside the string: the harness collapses it onto
// one line, and a // would swallow everything after it.
//
// Plain ES5 in a string, because it runs INSIDE the sandboxed page (the
// harness embeds it); the same string is evaluated in node by
// canteenApi.test.ts, so what is tested is exactly what runs.

export const CANTEEN_API_JS = `
function canteenApi(req, state) {
  var snacks = [
    { snack_id: 1, name: "Banana cue", price: 15 },
    { snack_id: 2, name: "Turon", price: 12 },
    { snack_id: 3, name: "Kwek-kwek", price: 20 },
    { snack_id: 4, name: "Gulaman", price: 10 },
    { snack_id: 5, name: "Siopao", price: 25 },
    { snack_id: 6, name: "Pastillas", price: 8 }
  ];
  var q = req.path.indexOf("?");
  var path = q === -1 ? req.path : req.path.slice(0, q);
  var query = q === -1 ? "" : req.path.slice(q + 1);
  var method = (req.method || "GET").toUpperCase();
  function error(status, error, message, allow) {
    var body = { timestamp: new Date().toISOString(), status: status, error: error };
    if (message) body.message = message;
    body.path = path;
    return { status: status, body: body, allow: allow };
  }
  function isInt(text) {
    return /^-?\\d+$/.test(text) && Number(text) >= -2147483648 && Number(text) <= 2147483647;
  }
  function findSnack(id) {
    for (var i = 0; i < snacks.length; i++) if (snacks[i].snack_id === id) return snacks[i];
    return null;
  }
  if (path === "/api/snacks") {
    if (method !== "GET") return error(405, "Method Not Allowed", "Method '" + method + "' is not supported.", "GET");
    var max = /(?:^|&)maxPrice=([^&]*)/.exec(query);
    if (!max) return { status: 200, body: snacks };
    if (!isInt(decodeURIComponent(max[1]))) return error(400, "Bad Request", "Method parameter 'maxPrice': Failed to convert value of type 'java.lang.String' to required type 'java.lang.Integer'; For input string: \\"" + decodeURIComponent(max[1]) + "\\"");
    var limit = Number(decodeURIComponent(max[1]));
    return { status: 200, body: snacks.filter(function (s) { return s.price <= limit; }) };
  }
  var one = /^\\/api\\/snacks\\/([^/]+)$/.exec(path);
  if (one) {
    if (method !== "GET") return error(405, "Method Not Allowed", "Method '" + method + "' is not supported.", "GET");
    if (!isInt(one[1])) return error(400, "Bad Request", "Method parameter 'id': Failed to convert value of type 'java.lang.String' to required type 'int'; For input string: \\"" + one[1] + "\\"");
    var found = findSnack(Number(one[1]));
    return found ? { status: 200, body: found } : error(404, "Not Found", "No snack with id " + Number(one[1]));
  }
  var oneOrder = /^\\/api\\/orders\\/([^/]+)$/.exec(path);
  if (oneOrder) {
    if (method !== "GET") return error(405, "Method Not Allowed", "Method '" + method + "' is not supported.", "GET");
    if (!isInt(oneOrder[1])) return error(400, "Bad Request", "Method parameter 'id': Failed to convert value of type 'java.lang.String' to required type 'int'; For input string: \\"" + oneOrder[1] + "\\"");
    for (var j = 0; j < state.orders.length; j++) if (state.orders[j].order_id === Number(oneOrder[1])) return { status: 200, body: state.orders[j] };
    return error(404, "Not Found", "No order with id " + Number(oneOrder[1]));
  }
  if (path === "/api/summary") {
    if (method !== "GET") return error(405, "Method Not Allowed", "Method '" + method + "' is not supported.", "GET");
    var sales = 0;
    for (var k = 0; k < state.orders.length; k++) sales += state.orders[k].total;
    return { status: 200, body: { total_orders: state.orders.length, total_sales: sales } };
  }
  if (path === "/api/orders") {
    if (method === "GET") return { status: 200, body: state.orders };
    if (method !== "POST") return error(405, "Method Not Allowed", "Method '" + method + "' is not supported.", "GET, POST");
    var type = req.contentType || "";
    if (!/^application\\/json/i.test(type)) {
      return error(415, "Unsupported Media Type", "Content-Type '" + (type || "text/plain;charset=UTF-8") + "' is not supported.");
    }
    var text = req.body == null ? "" : String(req.body);
    var data;
    if (/^\\s*\\[/.test(text) && !/^\\s*\\[\\s*[\\[{"\\d\\]tfn-]/.test(text)) {
      return error(400, "Bad Request", "JSON parse error: Cannot deserialize value of type \`com.example.canteen_web.OrderRequest\` from Array value (token \`JsonToken.START_ARRAY\`)");
    }
    try { data = JSON.parse(text); } catch (e) {
      return error(400, "Bad Request", "JSON parse error: Unexpected end-of-input within/between Object entries");
    }
    if (data === null || typeof data !== "object" || Array.isArray(data)) {
      return error(400, "Bad Request", "JSON parse error: Cannot deserialize value of type \`com.example.canteen_web.OrderRequest\` from " + (Array.isArray(data) ? "Array value (token \`JsonToken.START_ARRAY\`)" : "a non-object value"));
    }
    function asInt(v) {
      if (typeof v === "number" && Math.floor(v) === v) return v;
      if (typeof v === "string" && /^-?\\d+$/.test(v)) return Number(v);
      return null;
    }
    var snackId = asInt(data.snack_id), qty = asInt(data.qty);
    if (snackId === null || qty === null) {
      return error(400, "Bad Request", "JSON parse error: Cannot map \`null\` into type \`int\` (set \`DeserializationFeature.FAIL_ON_NULL_FOR_PRIMITIVES\` to 'false' to allow)");
    }
    if (qty < 1 || qty > 20) return error(400, "Bad Request", "qty must be from 1 to 20");
    var snack = findSnack(snackId);
    if (!snack) return error(404, "Not Found", "No snack with id " + snackId);
    var order = { order_id: state.orders.length + 1, snack_id: snack.snack_id, name: snack.name, qty: qty, total: snack.price * qty };
    state.orders.push(order);
    return { status: 201, body: order };
  }
  return error(404, "Not Found", "No static resource " + path.replace(/^\\//, "").replace(/\\/$/, "") + ".");
}
`;
