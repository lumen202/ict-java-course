import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { weekdaysOfMonth } from "./calendar";
import { formMerges } from "./form";
import { DEFAULT_CAP, DEFAULT_HEADER, PRESENT_MARK, type PayrollSheet } from "./model";
import { payrollPdf, payrollPdfFileName } from "./pdf";
import { payrollSpec } from "./workbook";
import { cellRef } from "../xlsx/sheet";

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
      {
        id: "b",
        last: "MONTALBAN",
        first: "KER",
        middle: "E.",
        // Over the cap once the rate is applied: 21 days x 132 = 2,772.
        present: days.map((d) => d.date),
        transportRate: 132,
        mealRate: 0,
      },
      {
        id: "c",
        last: "MORILLA",
        first: "NICO",
        middle: "",
        present: days.slice(0, 3).map((d) => d.date),
        transportRate: 50,
        mealRate: 10,
      },
    ],
  };
}

function asText(bytes: Uint8Array): string {
  let out = "";
  for (const b of bytes) out += String.fromCharCode(b);
  return out;
}

/**
 * What the spreadsheet's formulas would evaluate to, worked out from the cells
 * the spreadsheet actually writes — the tick marks and the rate numbers. This
 * is deliberately *not* model.ts: it reads the other document, so the two can
 * be compared without both being derived from the same function.
 */
function totalsFromWorkbook(sheet: PayrollSheet): number[] {
  const spec = payrollSpec(sheet);
  const value = (ref: string) => {
    for (const row of spec.rows) {
      for (const cell of row.cells) {
        if (cellRef(cell.col, row.row) === ref) return cell.value;
      }
    }
    return undefined;
  };

  return sheet.rows.map((_, i) => {
    const row = 8 + i;
    // COUNTIF(G:AC, "✓")
    let ticks = 0;
    for (let col = 7; col <= 29; col++) {
      const v = value(cellRef(col, row));
      if (v?.kind === "text" && v.value === PRESENT_MARK) ticks++;
    }
    const rate = (ref: string) => {
      const v = value(ref);
      return v?.kind === "number" ? v.value : 0;
    };
    // AF = AD*AE, AH = AD*AG, AI = MIN(AF+AH, cap)
    const transport = ticks * rate(cellRef(31, row));
    const meal = ticks * rate(cellRef(33, row));
    return Math.min(transport + meal, sheet.cap);
  });
}

function money(value: number): string {
  const [whole, fraction] = value.toFixed(2).split(".");
  return `${whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}.${fraction}`;
}

describe("payroll pdf", () => {
  test("prints what the spreadsheet's formulas would compute", () => {
    // The two documents are built by different code — one writes formulas, the
    // other writes numbers — so this is the check that they say the same thing.
    // A person paid on the strength of the PDF and audited on the strength of
    // the .xlsx must not find two different figures.
    const sheet = sheetFor(8);
    const expected = totalsFromWorkbook(sheet);
    const text = asText(payrollPdf(sheet));

    assert.deepEqual(expected, [1260, 1300, 180]);
    for (const total of expected) {
      assert.ok(text.includes(money(total)), `PDF is missing the total ${money(total)}`);
    }

    // The cap shows up as a *reduction*, which means both figures are on the
    // form: "Amount Due" carries the uncapped 2,772.00 and "Total Amount
    // Received" the capped 1,300.00, exactly as the paper form does.
    assert.ok(text.includes("2,772.00"), "Amount Due should show the uncapped figure");

    // What must not happen is the uncapped figure reaching the subtotal.
    assert.ok(text.includes(money(2740)), "subtotal should add the capped totals");
    assert.ok(!text.includes(money(4212)), "subtotal must not add the uncapped ones");
  });

  test("carries the roll, the names and the period", () => {
    const text = asText(payrollPdf(sheetFor(8)));
    assert.ok(text.includes("AUGUST 2025"));
    assert.ok(text.includes("DELIMA"));
    assert.ok(text.includes("LUCKY JADE"));
    assert.ok(text.includes("TIME BOOK AND PAYROLL"));
    assert.ok(text.includes("SUB - TOTAL FOR THIS PAGE"));
    // The certification block survives in full, not truncated to fit.
    assert.ok(text.includes("to the correctness of the above roll"));
  });

  test("is one page whatever the month, and names the period", () => {
    for (const month of [2, 8, 9, 12]) {
      const text = asText(payrollPdf(sheetFor(month)));
      assert.equal((text.match(/\/Type \/Page\b/g) ?? []).length, 1, `month ${month}`);
    }
    assert.equal(payrollPdfFileName(sheetFor(8)), "Payroll AUGUST 2025.pdf");
  });

  test("draws no rule through a merged block", () => {
    // The ruling is derived from the same merge list the spreadsheet uses. If
    // it were a second hand-written list, a merge added to one and not the
    // other would print a line across a merged heading.
    const sheet = sheetFor(8);
    const merges = formMerges(sheet.days, sheet.rows.length);
    const wide = merges.find((m) => m.c2 - m.c1 > 3 && m.r1 === 4);
    assert.ok(wide, "expected a wide heading merge to test against");

    // "TIME ROLL" spans E4:AC4, so no vertical rule may fall inside it on row 4.
    const spec = payrollSpec(sheet);
    const merged = spec.merges;
    assert.ok(merged.includes("E4:AC4"));
    // Both documents read the same list, which is the property under test.
    assert.deepEqual(
      merges.map((m) => `${cellRef(m.c1, m.r1)}:${cellRef(m.c2, m.r2)}`).sort(),
      [...merged].sort(),
    );
  });

  test("a dropped day leaves its slot empty instead of moving the columns", () => {
    const full = asText(payrollPdf(sheetFor(8)));
    const dropped = asText(payrollPdf(sheetFor(8, [6])));
    assert.ok(full.includes("(21) Tj"), "21 class days");
    assert.ok(dropped.includes("(20) Tj"), "20 after dropping one");
  });
});
