import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  daysInMonth,
  dateKey,
  localDateKey,
  monthKey,
  parseMonthKey,
  periodLabel,
  weekdaysOfMonth,
} from "./calendar";

describe("weekdaysOfMonth", () => {
  test("keeps Monday to Friday and drops the weekend", () => {
    const days = weekdaysOfMonth(2025, 8);
    assert.equal(days.length, 21);
    assert.deepEqual(
      days.slice(0, 6).map((d) => d.day),
      [1, 4, 5, 6, 7, 8],
    );
    assert.ok(days.every((d) => ["M", "T", "W", "Th", "F"].includes(d.weekday)));
  });

  test("a month opening mid-week gets a short first week", () => {
    // 1 August 2025 is a Friday: it is week 1 on its own, and Monday the 4th
    // opens week 2.
    const days = weekdaysOfMonth(2025, 8);
    assert.equal(days[0].week, 1);
    assert.equal(days[0].weekday, "F");
    assert.equal(days[1].week, 2);
    assert.equal(days[1].weekday, "M");
    assert.equal(days.at(-1)?.week, 5);
  });

  test("a month opening on a Monday starts one week, not two", () => {
    // 1 September 2025 is a Monday.
    const days = weekdaysOfMonth(2025, 9);
    assert.equal(days[0].week, 1);
    assert.equal(days[4].week, 1);
    assert.equal(days[5].week, 2);
  });

  test("dates are local calendar keys, matching the day printed beside them", () => {
    const days = weekdaysOfMonth(2026, 2);
    assert.equal(days[0].date, "2026-02-02");
    assert.equal(days[0].day, 2);
    assert.ok(days.every((d) => d.date === dateKey(2026, 2, d.day)));
  });

  test("leap years", () => {
    assert.equal(daysInMonth(2024, 2), 29);
    assert.equal(daysInMonth(2025, 2), 28);
    assert.equal(weekdaysOfMonth(2024, 2).at(-1)?.day, 29);
  });
});

describe("localDateKey", () => {
  test("uses the local calendar day, not the UTC one", () => {
    // Late in the evening west of UTC this instant is already tomorrow in UTC;
    // the roll is about the day the class actually met.
    const at = new Date(2025, 7, 4, 23, 30);
    assert.equal(localDateKey(at), "2025-08-04");
    assert.equal(localDateKey(new Date(2025, 0, 1, 0, 5)), "2025-01-01");
  });
});

describe("month keys", () => {
  test("round-trip", () => {
    assert.equal(monthKey(2025, 8), "2025-08");
    assert.deepEqual(parseMonthKey("2025-08"), { year: 2025, month: 8 });
  });

  test("rejects nonsense", () => {
    assert.equal(parseMonthKey("2025-13"), null);
    assert.equal(parseMonthKey("2025-00"), null);
    assert.equal(parseMonthKey("nope"), null);
    assert.equal(parseMonthKey(undefined), null);
  });

  test("period label is the form's own wording", () => {
    assert.equal(periodLabel(2025, 8), "AUGUST 2025");
  });
});
