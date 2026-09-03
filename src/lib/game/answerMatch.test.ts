import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { answersMatch } from "./answerMatch";

// The round that produced BUG-021: a student typed a statement MySQL would run
// happily and the game marked it wrong, with no way to see what it wanted.
const ROUND_7 = "INSERT INTO students VALUES (1, 'Liza', 8, 'Math');";

test("accepts the round-7 answer however the student spaces the commas", () => {
  for (const typed of [
    "INSERT INTO students VALUES (1, 'Liza', 8, 'Math');",
    "INSERT INTO students VALUES (1,'Liza',8,'Math');",
    "INSERT INTO students VALUES(1,'Liza',8,'Math');",
    "insert into students values ( 1 , 'Liza' , 8 , 'Math' ) ;",
    "  INSERT   INTO students\n  VALUES (1, 'Liza', 8, 'Math') ;  ",
  ]) {
    assert.ok(answersMatch(typed, ROUND_7), `should accept: ${typed}`);
  }
});

test("accepts curly quotes a phone keyboard substitutes for apostrophes", () => {
  assert.ok(answersMatch("INSERT INTO students VALUES (1, ‘Liza’, 8, ‘Math’);", ROUND_7));
});

test("still rejects what MySQL would reject", () => {
  const wrong = [
    "INSERT INTO students VALUES (1, 'Liza', 8, 'Math')", // no semicolon
    "INSERT INTO students VALUES (1, Liza, 8, 'Math');", // unquoted text
    "INSERT INTO students VALUES (1, 'Liza', 8);", // missing a value
    "INSERT INTO student VALUES (1, 'Liza', 8, 'Math');", // wrong table
    "INSERT INTO students VALUES (1, 'Lisa', 8, 'Math');", // wrong value
    "INSERT INTO students VALUES (1, 'Liza', 9, 'Math');", // wrong grade
  ];
  for (const typed of wrong) {
    assert.ok(!answersMatch(typed, ROUND_7), `should reject: ${typed}`);
  }
});

test("keyword-only blanks are unaffected", () => {
  assert.ok(answersMatch("show databases;", "SHOW DATABASES;"));
  assert.ok(answersMatch("VARCHAR (50)", "VARCHAR(50)"));
  assert.ok(!answersMatch("SHOW DATABASE;", "SHOW DATABASES;"));
});

describe("caseSensitive — Java rounds", () => {
  test("case is forgiven by default, because MySQL forgives it", () => {
    assert.equal(answersMatch("select * from t;", "SELECT * FROM t;"), true);
  });

  test("case is enforced when asked, because javac enforces it", () => {
    assert.equal(answersMatch("preparedstatement", "PreparedStatement", true), false);
    assert.equal(answersMatch("PreparedStatement", "PreparedStatement", true), true);
  });

  test("spacing is still forgiven in case-sensitive mode", () => {
    assert.equal(
      answersMatch("ps.setInt( 1 , id );", "ps.setInt(1, id);", true),
      true,
    );
  });

  test("a wrong identifier is still wrong either way", () => {
    assert.equal(answersMatch("ps.setInteger(1, id);", "ps.setInt(1, id);", true), false);
  });
});
