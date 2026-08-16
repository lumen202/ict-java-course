import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { toParsonsFragments, assembleFragments, isAssemblable } from "./sqlParsons";

/**
 * The splitter feeds the stuck-student fallback in `SqlConsole` (BUG-015), so
 * two properties are load-bearing and both are tested by planting the exact
 * input that would break them:
 *   1. Round-trip — reassembling the fragments in order must reproduce the
 *      solution, because the puzzle is checked by rebuilding the string.
 *   2. One valid order — a puzzle with two correct answers marks a correct
 *      student wrong, which is the defect recorded as BUG-017.
 */

const roundTrips = (sql: string) =>
  assembleFragments(toParsonsFragments(sql)).replace(/\s+/g, " ") === sql.replace(/\s+/g, " ").trim();

describe("toParsonsFragments", () => {
  test("splits a SELECT at its clause boundaries", () => {
    assert.deepEqual(
      toParsonsFragments("SELECT name FROM students WHERE grade_level = 9 ORDER BY name;"),
      ["SELECT name", "FROM students", "WHERE grade_level = 9", "ORDER BY name;"],
    );
  });

  test("splits a join, keeping ON as its own fragment", () => {
    assert.deepEqual(
      toParsonsFragments(
        "SELECT snacks.name FROM snacks LEFT JOIN sales ON snacks.snack_id = sales.snack_id;",
      ),
      ["SELECT snacks.name", "FROM snacks", "LEFT JOIN sales", "ON snacks.snack_id = sales.snack_id;"],
    );
  });

  test("splits ALTER's tail so an ALTER is never one atomic blob", () => {
    assert.deepEqual(toParsonsFragments("ALTER TABLE students ADD PRIMARY KEY (id);"), [
      "ALTER TABLE students",
      "ADD PRIMARY KEY (id);",
    ]);
  });

  // A column list must survive intact: splitting inside the parentheses would
  // let `name VARCHAR(50)` and `id INT` be ordered either way — two right answers.
  test("never splits inside parentheses", () => {
    const sql = "CREATE TABLE students ( id INT, name VARCHAR(50), grade_level INT );";
    assert.deepEqual(toParsonsFragments(sql), [sql]);
  });

  // `ON` and `FROM` appear inside this string literal; cutting there would both
  // corrupt the SQL and invent fragments.
  test("never splits inside a quoted string", () => {
    const sql = "UPDATE notes SET body = 'read FROM the shelf ON friday' WHERE id = 1;";
    assert.deepEqual(toParsonsFragments(sql), [
      "UPDATE notes",
      "SET body = 'read FROM the shelf ON friday'",
      "WHERE id = 1;",
    ]);
    assert.ok(roundTrips(sql));
  });

  // The BUG-017 guard: `WHERE a AND b` and `WHERE b AND a` are both correct, so
  // AND/OR must stay inside one fragment or the puzzle gains a second answer.
  test("does not split on AND or OR, which would create two valid orders", () => {
    assert.deepEqual(
      toParsonsFragments("SELECT * FROM students WHERE grade_level = 9 AND name = 'Liza';"),
      ["SELECT *", "FROM students", "WHERE grade_level = 9 AND name = 'Liza';"],
    );
  });

  // A keyword that is only a substring of an identifier is not a boundary.
  test("ignores a keyword embedded in an identifier", () => {
    const sql = "SELECT onset FROM season_from_data;";
    assert.deepEqual(toParsonsFragments(sql), ["SELECT onset", "FROM season_from_data;"]);
    assert.ok(roundTrips(sql));
  });

  test("a multi-statement solution is a statement-order puzzle", () => {
    assert.deepEqual(
      toParsonsFragments("SET SQL_SAFE_UPDATES = 0; DELETE FROM practice_rows; SET SQL_SAFE_UPDATES = 1;"),
      ["SET SQL_SAFE_UPDATES = 0;", "DELETE FROM practice_rows;", "SET SQL_SAFE_UPDATES = 1;"],
    );
  });

  test("an atomic command yields one fragment and is not assemblable", () => {
    assert.deepEqual(toParsonsFragments("SHOW TABLES;"), ["SHOW TABLES;"]);
    assert.equal(isAssemblable("SHOW TABLES;"), false);
    assert.equal(isAssemblable("SELECT name FROM students;"), true);
  });

  test("round-trips every shape the consoles actually use", () => {
    for (const sql of [
      "USE school;",
      "SELECT * FROM students WHERE grade_level = 9 ORDER BY id;",
      "INSERT INTO visitors (name) VALUES ('Kristine');",
      "UPDATE students SET favorite_subject = 'Science' WHERE grade_level = 8;",
      "DELETE FROM signups WHERE name = 'test';",
      "ALTER TABLE sales ADD FOREIGN KEY (snack_id) REFERENCES snacks (snack_id);",
      "SELECT snacks.name, sales.qty FROM sales INNER JOIN snacks ON sales.snack_id = snacks.snack_id ORDER BY snacks.name;",
      "CREATE TABLE sales ( sale_id INT PRIMARY KEY, snack_id INT, FOREIGN KEY (snack_id) REFERENCES snacks (snack_id) );",
    ]) {
      assert.ok(roundTrips(sql), `did not round-trip: ${sql}`);
    }
  });
});
