import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { nameParts, onThePayroll, payrollLine } from "./roster";

describe("nameParts", () => {
  test("prefers the account's own parts", () => {
    assert.deepEqual(
      nameParts(
        { first_name: "Lucky Jade", middle_name: "Pescadera", last_name: "Delima" },
        { first_name: "LJ", last_name: "Dilima" },
      ),
      { last: "Delima", first: "Lucky Jade", middle: "P." },
    );
  });

  test("falls back to the class list, then to a full name, then to the email", () => {
    assert.deepEqual(nameParts(null, { first_name: "Nico", last_name: "Morilla" }), {
      last: "Morilla",
      first: "Nico",
      middle: "",
    });
    assert.deepEqual(nameParts({ full_name: "Ker E. Montalban" }, null), {
      last: "Montalban",
      first: "Ker E.",
      middle: "",
    });
    assert.deepEqual(nameParts({ email: "khorvin@example.com" }, null), {
      last: "khorvin",
      first: "",
      middle: "",
    });
  });

  test("a middle name that is already an initial is left alone", () => {
    assert.equal(nameParts({ first_name: "A", last_name: "B", middle_name: "C." }, null).middle, "C.");
    assert.equal(nameParts({ first_name: "A", last_name: "B", middle_name: "cruz" }, null).middle, "C.");
  });
});

describe("onThePayroll", () => {
  test("drops the app's own test account, in either name order", () => {
    assert.equal(onThePayroll({ first: "Test", last: "Account" }), false);
    assert.equal(onThePayroll({ first: "Account", last: "Test" }), false);
    assert.equal(onThePayroll({ first: "test", last: "  account " }), false);
  });

  test("keeps a real person whose name merely contains one of those words", () => {
    // The whole point of matching whole names: a substring rule would drop
    // these off a payroll silently, which is far worse than one extra row.
    assert.equal(onThePayroll({ first: "Testa", last: "Accountado" }), true);
    assert.equal(onThePayroll({ first: "Maria", last: "Testadillo" }), true);
    assert.equal(onThePayroll({ first: "Lucky Jade", last: "Delima" }), true);
  });
});

describe("payrollLine", () => {
  test("opens at the rate the workbook already assigned, meal at nothing", () => {
    assert.deepEqual(payrollLine("abc", { last: "Delima", first: "Lucky Jade", middle: "P." }), {
      id: "abc",
      last: "DELIMA",
      first: "LUCKY JADE",
      middle: "P.",
      transportRate: 60,
      mealRate: 0,
    });
  });

  test("names are upper-cased, the way the form is written", () => {
    const line = payrollLine("x", { last: "de la Cruz", first: "Maria Ana", middle: "s." });
    assert.equal(line.last, "DE LA CRUZ");
    assert.equal(line.first, "MARIA ANA");
    assert.equal(line.middle, "S.");
  });

  test("an unrecognised name opens at zero, not at someone else's rate", () => {
    assert.equal(payrollLine("x", { last: "Santos", first: "Maria", middle: "" }).transportRate, 0);
  });
});
