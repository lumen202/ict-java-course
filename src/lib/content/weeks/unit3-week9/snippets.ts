// unit3-week9 — the Java, SQL and page code the week's labs type, as constants.
//
// Week 9 starts from Week 8's FINAL controller (`CONTROLLER_D5` in
// ../unit3-week8/snippets.ts) and adds one block of Java per day, always as the
// LAST thing inside the class, so every lab can say "above the final }". The
// stage constants below were extracted from this module, compiled against Spring
// Boot 4.1.1 and a real MySQL 8.0 ledger, and probed day by day (see
// docs/agent/log/2026-11-03-week9-edit-and-cancel.md).
//
// Stage names: the letter A is a lab's FIRST version (the one that is
// deliberately incomplete: no 404, no 409), no letter is the finished version.
//   CONTROLLER_D1A  PUT /api/snacks/{id} without the rows-affected check
//   CONTROLLER_D1   … with the 404                       (Week 9 Day 1 final)
//   CONTROLLER_D2   + PUT /api/orders/{id}
//   CONTROLLER_D3A  + DELETE /api/orders/{id} without the check
//   CONTROLLER_D3   … with the 404
//   CONTROLLER_D4A  + DELETE /api/snacks/{id} with no catch (500 at the foreign key)
//   CONTROLLER_D4   … with the 409
//   CONTROLLER_D5   + PUT and DELETE /api/special          (Week 9 FINAL)
// Pages change in each day's Part 2; they are constants below too.

import { CONTROLLER_D5 as W8_FINAL, LAB_SNACK_ID, indent } from "../unit3-week8/snippets";
import { ORDERS_HTML, ORDERS_JS_FIND, ORDERS_JS_LOAD, ORDERS_JS_START } from "../unit3-week7/day5";

export { indent };

export const LAB_SNACK = "Kutsinta";
export { LAB_SNACK_ID };

// ---- imports ----------------------------------------------------------------

export const IMPORT_PUT = "import org.springframework.web.bind.annotation.PutMapping;";
export const IMPORT_DELETE = "import org.springframework.web.bind.annotation.DeleteMapping;";
export const IMPORT_INTEGRITY = "import org.springframework.dao.DataIntegrityViolationException;";

const insertBefore = (code: string, anchor: string, add: string) => {
  if (!code.includes(anchor)) throw new Error(`anchor not found: ${anchor}`);
  return code.replace(anchor, `${add}\n${anchor}`);
};
const insertAfter = (code: string, anchor: string, add: string) => {
  if (!code.includes(anchor)) throw new Error(`anchor not found: ${anchor}`);
  return code.replace(anchor, `${anchor}\n${add}`);
};
/** Adds methods as the last members of the class (just above its closing brace). */
const addMethods = (code: string, ...blocks: string[]) => {
  if (!code.endsWith("\n}")) throw new Error("controller must end with a closing brace");
  return `${code.slice(0, -2)}\n\n${blocks.map(indent).join("\n\n")}\n}`;
};
const withPut = (code: string) => insertAfter(code, "import org.springframework.web.bind.annotation.PostMapping;", IMPORT_PUT);
const withDelete = (code: string) => insertBefore(code, "import org.springframework.web.bind.annotation.GetMapping;", IMPORT_DELETE);
const withIntegrity = (code: string) => insertBefore(code, "import org.springframework.dao.DuplicateKeyException;", IMPORT_INTEGRITY);

// ---- Day 1: PUT /api/snacks/{id} --------------------------------------------

export const SNACK_CHANGE_RECORD = "record SnackChange(String name, int price) {\n}";

const updateSnack = (check: boolean) => `@PutMapping("/api/snacks/{id}")
public Snack updateSnack(@PathVariable int id, @RequestBody SnackChange change) {
    if (change.name() == null || change.name().isBlank()) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "name must not be blank");
    }
    if (change.name().length() > 50) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "name must be at most 50 characters");
    }
    if (change.price() < 1 || change.price() > 1000) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "price must be from 1 to 1000");
    }
    ${check ? "int changed = " : ""}jdbc.sql("UPDATE snacks SET name = ?, price = ? WHERE snack_id = ?")
        .param(change.name())
        .param(change.price())
        .param(id)
        .update();${
          check
            ? `
    if (changed == 0) {
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No snack with id " + id);
    }`
            : ""
        }
    return new Snack(id, change.name(), change.price());
}`;

export const UPDATE_SNACK_A = `${SNACK_CHANGE_RECORD}\n\n${updateSnack(false)}`;
export const UPDATE_SNACK = `${SNACK_CHANGE_RECORD}\n\n${updateSnack(true)}`;

/** The Day 1 fix, shown on its own: the middle of updateSnack(true), from the statement to the 404. */
export const ROWS_CHANGED_FIX = updateSnack(true)
  .split("\n")
  .slice(11, 19)
  .map((l) => l.slice(4))
  .join("\n");

// ---- Day 2: PUT /api/orders/{id} ---------------------------------------------

export const ORDER_CHANGE_RECORD = "record OrderChange(int qty) {\n}";

export const UPDATE_ORDER = `${ORDER_CHANGE_RECORD}

@PutMapping("/api/orders/{id}")
public Order updateOrder(@PathVariable int id, @RequestBody OrderChange change) {
    if (change.qty() < 1 || change.qty() > 20) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "qty must be from 1 to 20");
    }
    int changed = jdbc.sql("UPDATE sales SET qty = ? WHERE sale_id = ? AND snack_id IS NOT NULL")
        .param(change.qty())
        .param(id)
        .update();
    if (changed == 0) {
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No order with id " + id);
    }
    return getOrder(id);
}`;

/** Lab-only, deliberately wrong: no AND snack_id IS NOT NULL. A sale with no snack is updated, then getOrder says 404. */
export const UPDATE_ORDER_NO_GUARD = UPDATE_ORDER.replace(" AND snack_id IS NOT NULL", "");

// ---- Day 3: DELETE /api/orders/{id} ------------------------------------------

const cancelOrder = (check: boolean) => `@DeleteMapping("/api/orders/{id}")
@ResponseStatus(HttpStatus.NO_CONTENT)
public void cancelOrder(@PathVariable int id) {
    ${check ? "int removed = " : ""}jdbc.sql("DELETE FROM sales WHERE sale_id = ? AND snack_id IS NOT NULL")
        .param(id)
        .update();${
          check
            ? `
    if (removed == 0) {
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No order with id " + id);
    }`
            : ""
        }
}`;

export const CANCEL_ORDER_A = cancelOrder(false);
export const CANCEL_ORDER = cancelOrder(true);

// ---- Day 4: DELETE /api/snacks/{id} ------------------------------------------

export const DELETE_SNACK_A = `@DeleteMapping("/api/snacks/{id}")
@ResponseStatus(HttpStatus.NO_CONTENT)
public void deleteSnack(@PathVariable int id) {
    int removed = jdbc.sql("DELETE FROM snacks WHERE snack_id = ?")
        .param(id)
        .update();
    if (removed == 0) {
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No snack with id " + id);
    }
}`;

export const DELETE_SNACK = `@DeleteMapping("/api/snacks/{id}")
@ResponseStatus(HttpStatus.NO_CONTENT)
public void deleteSnack(@PathVariable int id) {
    int removed;
    try {
        removed = jdbc.sql("DELETE FROM snacks WHERE snack_id = ?")
            .param(id)
            .update();
    } catch (DataIntegrityViolationException e) {
        throw new ResponseStatusException(HttpStatus.CONFLICT, "Snack " + id + " is used by a sale or a special");
    }
    if (removed == 0) {
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No snack with id " + id);
    }
}`;

// ---- Day 5: PUT and DELETE /api/special --------------------------------------

export const SPECIAL_CHANGE_RECORD = "record SpecialChange(int special_price) {\n}";

/** The ONE place that decides which special is "the newest": the same FROM and INNER JOIN as Week 8's GET /api/special, so PUT, DELETE and GET always agree. */
export const NEWEST_SPECIAL_ID = `private int newestSpecialId() {
    return jdbc.sql("""
        SELECT specials.special_id
        FROM specials
        INNER JOIN snacks ON specials.snack_id = snacks.snack_id
        ORDER BY specials.special_id DESC
        LIMIT 1
        """)
        .query(Integer.class)
        .optional()
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No special today"));
}`;

export const UPDATE_SPECIAL = `${SPECIAL_CHANGE_RECORD}

@PutMapping("/api/special")
public Special updateSpecial(@RequestBody SpecialChange change) {
    if (change.special_price() < 1 || change.special_price() > 1000) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "special_price must be from 1 to 1000");
    }
    int specialId = newestSpecialId();
    jdbc.sql("UPDATE specials SET special_price = ? WHERE special_id = ?")
        .param(change.special_price())
        .param(specialId)
        .update();
    return special();
}`;

export const REMOVE_SPECIAL = `@DeleteMapping("/api/special")
@ResponseStatus(HttpStatus.NO_CONTENT)
public void removeSpecial() {
    int specialId = newestSpecialId();
    int removed = jdbc.sql("DELETE FROM specials WHERE special_id = ?")
        .param(specialId)
        .update();
    if (removed == 0) {
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No special today");
    }
}`;

// ---- SQL the labs run --------------------------------------------------------

export const SQL_UPDATE_KUTSINTA = `UPDATE snacks SET price = 12 WHERE snack_id = ${LAB_SNACK_ID};`;
export const SQL_UPDATE_BACK = `UPDATE snacks SET price = 10 WHERE snack_id = ${LAB_SNACK_ID};`;
export const SQL_PRACTICE_COPY = "CREATE TABLE sales_practice AS SELECT * FROM sales;";
export const SQL_PRACTICE_DROP = "DROP TABLE sales_practice;";
export const SQL_CLEAN_CHECKS = "DELETE FROM snacks WHERE name LIKE 'Check %' OR name LIKE 'Renamed %';";
export const SQL_CLEAN_TEST_ORDERS = `DELETE FROM sales WHERE snack_id = ${LAB_SNACK_ID} AND qty = 19;`;
export const SPECIAL_REINSERT = `INSERT INTO specials (snack_id, special_price) VALUES (${LAB_SNACK_ID}, 7);`;
/** Two specials, an older and a newer one: the tasks that change or remove the newest need an older one to prove it stays. */
export const SPECIAL_REINSERT_TWO = `INSERT INTO specials (snack_id, special_price) VALUES (${LAB_SNACK_ID}, 6);\nINSERT INTO specials (snack_id, special_price) VALUES (${LAB_SNACK_ID}, 7);`;

// ---- Whole-file stages -------------------------------------------------------

export const CONTROLLER_D1A = addMethods(withPut(W8_FINAL), UPDATE_SNACK_A);
export const CONTROLLER_D1 = addMethods(withPut(W8_FINAL), UPDATE_SNACK);
export const CONTROLLER_D2 = addMethods(withPut(W8_FINAL), UPDATE_SNACK, UPDATE_ORDER);
export const CONTROLLER_D3A = addMethods(withDelete(withPut(W8_FINAL)), UPDATE_SNACK, UPDATE_ORDER, CANCEL_ORDER_A);
export const CONTROLLER_D3 = addMethods(withDelete(withPut(W8_FINAL)), UPDATE_SNACK, UPDATE_ORDER, CANCEL_ORDER);
export const CONTROLLER_D4A = addMethods(withDelete(withPut(W8_FINAL)), UPDATE_SNACK, UPDATE_ORDER, CANCEL_ORDER, DELETE_SNACK_A);
export const CONTROLLER_D4 = addMethods(
  withIntegrity(withDelete(withPut(W8_FINAL))),
  UPDATE_SNACK,
  UPDATE_ORDER,
  CANCEL_ORDER,
  DELETE_SNACK,
);
export const CONTROLLER_D5 = addMethods(
  withIntegrity(withDelete(withPut(W8_FINAL))),
  UPDATE_SNACK,
  UPDATE_ORDER,
  CANCEL_ORDER,
  DELETE_SNACK,
  NEWEST_SPECIAL_ID,
  UPDATE_SPECIAL,
  REMOVE_SPECIAL,
);

/** Lab-only variant for the Day 2 clinic. */
export const CONTROLLER_D2_NO_GUARD = addMethods(withPut(W8_FINAL), UPDATE_SNACK, UPDATE_ORDER_NO_GUARD);


// ---- Day 1, Part 2: edit-snack.html + edit-snack.js ---------------------------

export const EDIT_SNACK_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Edit a snack — Aling Nena's Canteen</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <a href="index.html">Home</a>
  <a href="menu.html">Menu</a>
  <a href="ledger.html">Ledger</a>
  <a href="add-snack.html">Add a snack</a>
  <h1>Edit a snack</h1>
  <p id="status"></p>
  <form id="edit-form">
    <p>Snack number: <span id="snack-number"></span></p>
    <label for="snack-name">Name</label>
    <input type="text" id="snack-name" required>
    <label for="snack-price">Price</label>
    <input type="number" id="snack-price" min="1" max="1000" required>
    <button type="submit">Save</button>
  </form>
  <p id="result"></p>
  <script src="edit-snack.js"></script>
</body>
</html>`;

export const EDIT_SNACK_JS_TOP = `const params = new URLSearchParams(location.search);
const snackId = params.get("id");
const nameBox = document.getElementById("snack-name");
const priceBox = document.getElementById("snack-price");
const statusLine = document.getElementById("status");
const result = document.getElementById("result");

document.getElementById("snack-number").textContent = snackId;`;

export const EDIT_SNACK_JS_LOAD = `fetch(\`/api/snacks/\${snackId}\`)
  .then(response => {
    response.json().then(data => {
      if (response.ok) {
        nameBox.value = data.name;
        priceBox.value = data.price;
      } else {
        statusLine.textContent = \`Sorry: \${data.message}\`;
      }
    });
  })
  .catch(error => {
    console.error(error);
    statusLine.textContent = "Can't reach the canteen app. Is it running?";
  });`;

export const EDIT_SNACK_JS_SAVE = `document.getElementById("edit-form").addEventListener("submit", function (event) {
  event.preventDefault();
  fetch(\`/api/snacks/\${snackId}\`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: nameBox.value, price: Number(priceBox.value) })
  })
    .then(response => {
      response.json().then(data => {
        if (response.ok) {
          result.textContent = \`Saved: \${data.name} at ₱\${data.price}\`;
        } else {
          result.textContent = \`Sorry: \${data.message}\`;
        }
      });
    })
    .catch(error => console.error(error));
});`;

export const EDIT_SNACK_JS = `${EDIT_SNACK_JS_TOP}

${EDIT_SNACK_JS_LOAD}

${EDIT_SNACK_JS_SAVE}`;

// ---- Day 4, Part 2: a Remove button on edit-snack.html ------------------------

export const EDIT_SNACK_REMOVE_BUTTON = `<button type="button" id="remove">Remove this snack</button>`;

/** The page with the button, one line under the form's closing tag. */
export const EDIT_SNACK_HTML_D4 = insertAfter(EDIT_SNACK_HTML, "  </form>", `  ${EDIT_SNACK_REMOVE_BUTTON}`);

export const EDIT_SNACK_JS_REMOVE = `document.getElementById("remove").addEventListener("click", function () {
  if (!confirm(\`Remove snack \${snackId} from the menu?\`)) {
    return;
  }
  fetch(\`/api/snacks/\${snackId}\`, { method: "DELETE" })
    .then(response => {
      if (response.status === 204) {
        result.textContent = \`Snack \${snackId} is off the menu.\`;
      } else {
        response.json().then(data => {
          result.textContent = \`Sorry: \${data.message}\`;
        });
      }
    })
    .catch(error => console.error(error));
});`;

export const EDIT_SNACK_JS_D4 = `${EDIT_SNACK_JS}

${EDIT_SNACK_JS_REMOVE}`;

// ---- Day 2 and 3, Part 2: the orders board gets Change and Cancel -------------

const replaceOnce = (code: string, from: string, to: string) => {
  if (!code.includes(from)) throw new Error(`text not found: ${from}`);
  return code.replace(from, to);
};

/** orders.html after Day 2: a message line, and a Change heading. */
export const ORDERS_HTML_D2 = replaceOnce(
  replaceOnce(ORDERS_HTML, '  <p id="status"></p>', '  <p id="status"></p>\n  <p id="message"></p>'),
  "<th>Total</th></tr>",
  "<th>Total</th><th>Change</th></tr>",
);
/** orders.html after Day 3: and a Cancel heading. */
export const ORDERS_HTML_D3 = replaceOnce(ORDERS_HTML_D2, "<th>Change</th></tr>", "<th>Change</th><th>Cancel</th></tr>");

export const ORDERS_HEAD_LINES = `const rows = document.getElementById("order-rows");
const statusLine = document.getElementById("status");
const summaryLine = document.getElementById("summary");
const messageLine = document.getElementById("message");`;

const showOrders = (cancel: boolean) => `function showOrders(list) {
  rows.replaceChildren();
  for (const order of list) {
    const tr = document.createElement("tr");
    const id = document.createElement("td");
    id.textContent = order.order_id;
    const name = document.createElement("td");
    name.textContent = order.name;
    const qty = document.createElement("td");
    qty.textContent = order.qty;
    const total = document.createElement("td");
    total.textContent = \`₱\${order.total}\`;
    const change = document.createElement("td");
    const box = document.createElement("input");
    box.type = "number";
    box.min = 1;
    box.max = 20;
    box.value = order.qty;
    const save = document.createElement("button");
    save.type = "button";
    save.textContent = "Change";
    save.addEventListener("click", function () {
      changeQty(order.order_id, box.value);
    });
    change.append(box, save);${
      cancel
        ? `
    const cancel = document.createElement("td");
    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "Cancel";
    remove.addEventListener("click", function () {
      cancelOrder(order.order_id);
    });
    cancel.append(remove);`
        : ""
    }
    tr.append(id, name, qty, total, change${cancel ? ", cancel" : ""});
    rows.append(tr);
  }
  if (list.length === 0) {
    statusLine.textContent = "No orders yet.";
  } else {
    statusLine.textContent = "";
  }
}`;

export const ORDERS_SHOW_D2 = showOrders(false);
export const ORDERS_SHOW_D3 = showOrders(true);

export const ORDERS_CHANGE_QTY = `function changeQty(orderId, newQty) {
  fetch(\`/api/orders/\${orderId}\`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ qty: Number(newQty) })
  })
    .then(response => {
      response.json().then(data => {
        if (response.ok) {
          messageLine.textContent = \`Order \${data.order_id} now has \${data.qty} × \${data.name} = ₱\${data.total}\`;
          loadOrders();
        } else {
          messageLine.textContent = \`Sorry: \${data.message}\`;
        }
      });
    })
    .catch(error => console.error(error));
}`;

export const ORDERS_CANCEL_ORDER = `function cancelOrder(orderId) {
  if (!confirm(\`Cancel order \${orderId}?\`)) {
    return;
  }
  fetch(\`/api/orders/\${orderId}\`, { method: "DELETE" })
    .then(response => {
      if (response.status === 204) {
        messageLine.textContent = \`Order \${orderId} is cancelled.\`;
        loadOrders();
      } else {
        response.json().then(data => {
          messageLine.textContent = \`Sorry: \${data.message}\`;
        });
      }
    })
    .catch(error => console.error(error));
}`;

/** The Week 7 orders.js with the Day 2 changes (Day 2 ends here). */
export const ORDERS_JS_D2 = `${ORDERS_HEAD_LINES}

${ORDERS_SHOW_D2}

${ORDERS_CHANGE_QTY}

${ORDERS_JS_LOAD}

${ORDERS_JS_START}

${ORDERS_JS_FIND}`;

/** …and with Cancel (Day 3 ends here). */
export const ORDERS_JS_D3 = `${ORDERS_HEAD_LINES}

${ORDERS_SHOW_D3}

${ORDERS_CHANGE_QTY}

${ORDERS_CANCEL_ORDER}

${ORDERS_JS_LOAD}

${ORDERS_JS_START}

${ORDERS_JS_FIND}`;

// ---- Day 5, Part 2: special.html + special.js ----------------------------------

export const SPECIAL_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Today's special — Aling Nena's Canteen</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <a href="index.html">Home</a>
  <a href="menu.html">Menu</a>
  <a href="orders.html">Orders</a>
  <h1>Today's special</h1>
  <p id="current"></p>
  <form id="special-form">
    <label for="special-price">New special price</label>
    <input type="number" id="special-price" min="1" max="1000" required>
    <button type="submit">Change price</button>
  </form>
  <button type="button" id="remove-special">Remove the special</button>
  <p id="result"></p>
  <script src="special.js"></script>
</body>
</html>`;

export const SPECIAL_JS_SHOW = `const current = document.getElementById("current");
const result = document.getElementById("result");
const priceBox = document.getElementById("special-price");

function showSpecial() {
  fetch("/api/special")
    .then(response => {
      response.json().then(data => {
        if (response.ok) {
          current.textContent = \`\${data.name}: ₱\${data.special_price} (usually ₱\${data.price})\`;
        } else {
          current.textContent = "No special today.";
        }
      });
    })
    .catch(error => {
      console.error(error);
      current.textContent = "Can't reach the canteen app. Is it running?";
    });
}

showSpecial();`;

export const SPECIAL_JS_CHANGE = `document.getElementById("special-form").addEventListener("submit", function (event) {
  event.preventDefault();
  fetch("/api/special", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ special_price: Number(priceBox.value) })
  })
    .then(response => {
      response.json().then(data => {
        if (response.ok) {
          result.textContent = \`The special is now ₱\${data.special_price}\`;
          showSpecial();
        } else {
          result.textContent = \`Sorry: \${data.message}\`;
        }
      });
    })
    .catch(error => console.error(error));
});`;

export const SPECIAL_JS_REMOVE = `document.getElementById("remove-special").addEventListener("click", function () {
  if (!confirm("Remove today's special?")) {
    return;
  }
  fetch("/api/special", { method: "DELETE" })
    .then(response => {
      if (response.status === 204) {
        result.textContent = "The special is removed.";
        showSpecial();
      } else {
        response.json().then(data => {
          result.textContent = \`Sorry: \${data.message}\`;
        });
      }
    })
    .catch(error => console.error(error));
});`;

export const SPECIAL_JS = `${SPECIAL_JS_SHOW}

${SPECIAL_JS_CHANGE}

${SPECIAL_JS_REMOVE}`;
