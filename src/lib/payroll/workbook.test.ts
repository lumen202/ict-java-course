import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { weekdaysOfMonth } from "./calendar";
import { DEFAULT_CAP, DEFAULT_HEADER, parseSheet, totalReceived, type PayrollSheet } from "./model";
import { payrollFileName, payrollSpec } from "./workbook";
import { assignedTransportRate, countAssigned } from "./rates";
import { cellRef, type SheetSpec } from "../xlsx/sheet";
import { crc32, zipSync } from "../xlsx/zip";

function sheetFor(month: number, drop: number[] = []): PayrollSheet {
  const days = weekdaysOfMonth(2025, month).filter((d) => !drop.includes(d.day));
  return {
    year: 2025,
    month,
    days,
    cap: DEFAULT_CAP,
    header: DEFAULT_HEADER,
    rows: [
      {
        id: "a",
        last: "DELIMA",
        first: "LUCKY JADE",
        middle: "P.",
        present: days.map((d) => d.date),
        transportRate: 60,
        mealRate: 0,
      },
    ],
  };
}

function widthOf(spec: SheetSpec): number {
  return Math.max(...spec.rows.flatMap((r) => r.cells.map((c) => c.col)));
}

function cellAt(spec: SheetSpec, ref: string) {
  for (const row of spec.rows) {
    for (const cell of row.cells) {
      if (cellRef(cell.col, row.row) === ref) return cell;
    }
  }
  return undefined;
}

function columnOf(name: string): number {
  return [...name].reduce((n, ch) => n * 26 + (ch.charCodeAt(0) - 64), 0);
}

describe("payroll layout", () => {
  test("the sheet is always the template's fixed width, whatever the month", () => {
    // The template's roll always spans G:AC — 23 slots — with the totals at
    // AD:AK. August 2025 (21 weekdays) and September (22) fill different
    // numbers of slots, but the sheet itself never changes shape.
    assert.equal(widthOf(payrollSpec(sheetFor(8))), 37);
    assert.equal(widthOf(payrollSpec(sheetFor(9))), 37);
  });

  test("dropping a day empties a slot instead of reshaping the sheet", () => {
    const full = payrollSpec(sheetFor(8));
    const dropped = payrollSpec(sheetFor(8, [6, 21]));
    assert.equal(widthOf(full), widthOf(dropped));
    const dates = (spec: SheetSpec) =>
      spec.rows
        .find((r) => r.row === 7)!
        .cells.filter((c) => c.col >= 7 && c.col <= 29 && c.value?.kind === "number").length;
    assert.equal(dates(full) - dates(dropped), 2);
  });

  test("the Date row prints the days of the month, and the day count at AD7", () => {
    const spec = payrollSpec(sheetFor(8, [6]));
    const dateRow = spec.rows.find((r) => r.row === 7);
    assert.ok(dateRow);
    const numbers = dateRow.cells
      .filter((c) => c.col >= 7 && c.col <= 29 && c.value?.kind === "number")
      .map((c) => (c.value as { value: number }).value);
    assert.equal(numbers.length, 20);
    assert.ok(!numbers.includes(6));
    assert.deepEqual(cellAt(spec, "AD7")?.value, { kind: "number", value: 20 });
  });

  test("week bands are numbered by position, so a dropped week leaves no gap", () => {
    // Take out the whole week of 11-15 August. The remaining bands must read
    // 1,2,3,4 rather than 1,2,4,5.
    const spec = payrollSpec(sheetFor(8, [11, 12, 13, 14, 15]));
    const weekRow = spec.rows.find((r) => r.row === 5);
    assert.ok(weekRow);
    const numbers = weekRow.cells
      .filter((c) => c.col >= 7 && c.value?.kind === "number")
      .map((c) => (c.value as { value: number }).value);
    assert.deepEqual(numbers, [1, 2, 3, 4]);
  });

  test("totals are formulas at the template's own cells", () => {
    const spec = payrollSpec(sheetFor(8));
    assert.deepEqual(cellAt(spec, "AD8")?.value, {
      kind: "formula",
      value: 'COUNTIF(G8:AC8,"✓")',
    });
    assert.deepEqual(cellAt(spec, "AF8")?.value, { kind: "formula", value: "AD8*AE8" });
    assert.deepEqual(cellAt(spec, "AI8")?.value, {
      kind: "formula",
      value: "MIN(AF8+AH8,1300)",
    });
    // Ten ruled lines, subtotal beneath them at the template's row 18.
    assert.deepEqual(cellAt(spec, "AI18")?.value, { kind: "formula", value: "SUM(AI8:AI17)" });
  });

  test("blank lines are ruled but carry no arithmetic", () => {
    // One student against ten ruled lines: a blank line reporting 0.00 in three
    // columns would read as someone who was paid nothing.
    const spec = payrollSpec(sheetFor(8));
    const row = spec.rows.find((r) => r.row === 12);
    assert.ok(row);
    assert.ok(row.cells.every((c) => c.value === undefined));
    assert.ok(row.cells.every((c) => c.style === "bodyBlank"));
  });

  test("no merge covers a single cell or overlaps another, in any month", () => {
    for (const month of [1, 2, 3, 5, 8, 11, 12]) {
      const spec = payrollSpec(sheetFor(month));
      const covered = new Set<string>();
      for (const merge of spec.merges) {
        const [from, to] = merge.split(":");
        assert.notEqual(from, to, `degenerate merge ${merge} in month ${month}`);
        const [, fromCol, fromRow] = /^([A-Z]+)(\d+)$/.exec(from) ?? [];
        const [, toCol, toRow] = /^([A-Z]+)(\d+)$/.exec(to) ?? [];
        for (let r = Number(fromRow); r <= Number(toRow); r++) {
          for (let c = columnOf(fromCol); c <= columnOf(toCol); c++) {
            const key = `${c}:${r}`;
            assert.ok(!covered.has(key), `merges overlap at ${key} in month ${month}`);
            covered.add(key);
          }
        }
      }
    }
  });

  test("the file is named for the period it covers", () => {
    assert.equal(payrollFileName(sheetFor(8)), "Payroll AUGUST 2025.xlsx");
  });
});

describe("totals", () => {
  test("transport and meal are summed, then capped", () => {
    const days = weekdaysOfMonth(2025, 8);
    const row = {
      id: "a",
      last: "A",
      first: "B",
      middle: "",
      present: days.map((d) => d.date),
      transportRate: 50,
      mealRate: 0,
    };
    // 21 days at 50 is 1050, under the cap.
    assert.equal(totalReceived(row, days, DEFAULT_CAP), 1050);
    assert.equal(totalReceived({ ...row, mealRate: 20 }, days, DEFAULT_CAP), DEFAULT_CAP);
  });

  test("only days that are still columns count", () => {
    const days = weekdaysOfMonth(2025, 8);
    const row = {
      id: "a",
      last: "A",
      first: "B",
      middle: "",
      present: days.map((d) => d.date),
      transportRate: 10,
      mealRate: 0,
    };
    assert.equal(totalReceived(row, days.slice(0, 3), DEFAULT_CAP), 30);
  });
});

describe("parseSheet", () => {
  test("accepts what the preview posts back", () => {
    const result = parseSheet(JSON.parse(JSON.stringify(sheetFor(8))));
    assert.ok("sheet" in result);
    assert.equal(result.sheet.days.length, 21);
    assert.equal(result.sheet.rows[0].present.length, 21);
  });

  test("drops ticks for days that are no longer columns", () => {
    const raw = JSON.parse(JSON.stringify(sheetFor(8, [6])));
    raw.rows[0].present.push("2025-08-06");
    const result = parseSheet(raw);
    assert.ok("sheet" in result);
    assert.ok(!result.sheet.rows[0].present.includes("2025-08-06"));
  });

  test("refuses a roll with no days, and a nonsense month", () => {
    assert.ok("error" in parseSheet({ year: 2025, month: 8, days: [], rows: [] }));
    assert.ok("error" in parseSheet({ year: 2025, month: 44, days: [], rows: [] }));
    assert.ok("error" in parseSheet(null));
  });

  test("negative and non-numeric rates become zero", () => {
    const raw = JSON.parse(JSON.stringify(sheetFor(8)));
    raw.rows[0].transportRate = -5;
    raw.rows[0].mealRate = "abc";
    const result = parseSheet(raw);
    assert.ok("sheet" in result);
    assert.equal(result.sheet.rows[0].transportRate, 0);
    assert.equal(result.sheet.rows[0].mealRate, 0);
  });

  test("a missing header falls back to the standing form text", () => {
    const raw = JSON.parse(JSON.stringify(sheetFor(8)));
    delete raw.header;
    const result = parseSheet(raw);
    assert.ok("sheet" in result);
    assert.equal(result.sheet.header.formNo, DEFAULT_HEADER.formNo);
    assert.equal(result.sheet.cap, DEFAULT_CAP);
  });
});

describe("zip container", () => {
  test("known CRC-32", () => {
    assert.equal(crc32(new TextEncoder().encode("123456789")), 0xcbf43926);
  });

  test("writes a readable local header and end-of-directory record", () => {
    const bytes = zipSync([{ name: "a.txt", data: new TextEncoder().encode("hi") }]);
    assert.deepEqual([...bytes.slice(0, 4)], [0x50, 0x4b, 0x03, 0x04]);
    const eocd = bytes.slice(bytes.length - 22);
    assert.deepEqual([...eocd.slice(0, 4)], [0x50, 0x4b, 0x05, 0x06]);
    assert.equal(eocd[8], 1); // one entry on this disk
  });
});

describe("assigned rates", () => {
  test("carries the rate the workbook already assigned", () => {
    assert.equal(assignedTransportRate("DELIMA", "LUCKY JADE"), 60);
    assert.equal(assignedTransportRate("MARAPOC", "MARK LESTER"), 162);
    // Casing and punctuation in the roster shouldn't matter, and the roster
    // often holds one given name where the workbook held two.
    assert.equal(assignedTransportRate("Montalban", "Ker"), 132);
    assert.equal(assignedTransportRate("delima", "Lucky"), 60);
  });

  test("an unknown name gets nothing rather than someone else's rate", () => {
    assert.equal(assignedTransportRate("SANTOS", "MARIA"), 0);
    assert.equal(assignedTransportRate("", ""), 0);
  });

  test("counts how much of a roster it recognises", () => {
    assert.equal(
      countAssigned([
        { last: "DELIMA", first: "LUCKY JADE" },
        { last: "SANTOS", first: "MARIA" },
      ]),
      1,
    );
  });
});
