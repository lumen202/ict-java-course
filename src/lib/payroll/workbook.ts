import {
  buildWorkbook,
  cellRef,
  columnName,
  type Cell,
  type Row,
  type SheetSpec,
  type Style,
} from "../xlsx/sheet";
import { periodLabel } from "./calendar";
import { PRESENT_MARK, type PayrollSheet } from "./model";

// Renders a PayrollSheet as General Form No. 7(A) — the Time Book and Payroll
// the coordinator files each month. The paper form is fixed in every respect
// except its width: the time roll is one column per class day, so a 21-weekday
// month and a 23-weekday month are different sheets. Everything to the right of
// the roll is therefore positioned relative to the last day column rather than
// at a hard-coded letter.
//
// The totals are written as formulas, not as numbers. The teacher hands this
// file on to someone who will check it, and a payroll whose arithmetic can't be
// followed in the cells is one they have to re-key.

// Fixed left-hand columns.
const COL_NO = 1;
const COL_LAST = 2;
const COL_FIRST = 3;
const COL_MIDDLE = 4;
const COL_LABEL = 5;
const COL_LABEL_PAD = 6;
const COL_FIRST_DAY = 7;

const ROW_FORM_NO = 1;
const ROW_PERIOD = 2;
const ROW_HEAD_TOP = 4;
const ROW_WEEK = 5;
const ROW_WEEKDAY = 6;
const ROW_DATE = 7;
const ROW_FIRST_STUDENT = 8;

/**
 * The paper form is ruled for ten names whether or not ten turn up, and the
 * teacher writes late additions in by hand — so short classes keep their blank
 * lines instead of collapsing the sheet.
 */
const MIN_STUDENT_ROWS = 10;

type Layout = ReturnType<typeof layoutOf>;

function layoutOf(sheet: PayrollSheet) {
  const dayCount = sheet.days.length;
  const lastDay = COL_FIRST_DAY + dayCount - 1;
  const studentRows = Math.max(sheet.rows.length, MIN_STUDENT_ROWS);
  const lastStudentRow = ROW_FIRST_STUDENT + studentRows - 1;
  const width = lastDay + 8;

  return {
    dayCount,
    lastDay,
    studentRows,
    lastStudentRow,
    width,
    totalDays: lastDay + 1,
    transportRate: lastDay + 2,
    transportAmount: lastDay + 3,
    mealRate: lastDay + 4,
    mealAmount: lastDay + 5,
    totalReceived: lastDay + 6,
    number: lastDay + 7,
    signature: lastDay + 8,
    subtotalRow: lastStudentRow + 1,
  };
}

/** The three signature blocks under the roll, spread across the sheet's width. */
function band(layout: Layout, index: 0 | 1 | 2): { from: number; to: number } {
  const third = Math.floor(layout.width / 3);
  const from = index * third + 1;
  const to = index === 2 ? layout.width : (index + 1) * third;
  return { from, to };
}

const STYLES: Record<string, Style> = {
  formNo: { font: { size: 8 }, align: { horizontal: "left", vertical: "center" } },
  title: { font: { size: 12, bold: true }, align: { horizontal: "center", vertical: "center" } },
  period: { font: { size: 9 }, align: { horizontal: "left", vertical: "center" } },

  head: {
    font: { size: 7, bold: true },
    align: { horizontal: "center", vertical: "center", wrap: true },
    border: { top: true, bottom: true, left: true, right: true },
  },
  headTiny: {
    font: { size: 6, bold: true },
    align: { horizontal: "center", vertical: "center", wrap: true },
    border: { top: true, bottom: true, left: true, right: true },
  },
  headDay: {
    font: { size: 6 },
    align: { horizontal: "center", vertical: "center" },
    border: { top: true, bottom: true, left: true, right: true },
  },

  bodyNo: {
    font: { size: 8 },
    align: { horizontal: "center", vertical: "center" },
    border: { top: true, bottom: true, left: true, right: true },
  },
  bodyName: {
    font: { size: 8 },
    align: { horizontal: "left", vertical: "center" },
    border: { top: true, bottom: true, left: true, right: true },
  },
  bodyMark: {
    font: { size: 8 },
    align: { horizontal: "center", vertical: "center" },
    border: { top: true, bottom: true, left: true, right: true },
  },
  bodyCount: {
    font: { size: 8 },
    align: { horizontal: "center", vertical: "center" },
    border: { top: true, bottom: true, left: true, right: true },
  },
  bodyMoney: {
    font: { size: 8 },
    align: { horizontal: "right", vertical: "center" },
    border: { top: true, bottom: true, left: true, right: true },
    numberFormat: "#,##0.00",
  },
  bodyBlank: { border: { top: true, bottom: true, left: true, right: true } },

  subtotalLabel: {
    font: { size: 8, bold: true },
    align: { horizontal: "right", vertical: "center" },
    border: { top: true, bottom: true, left: true, right: true },
  },
  subtotalValue: {
    font: { size: 8, bold: true },
    align: { horizontal: "right", vertical: "center" },
    border: { top: true, bottom: true, left: true, right: true },
    numberFormat: "#,##0.00",
  },

  certify: { font: { size: 8 }, align: { horizontal: "left", vertical: "top", wrap: true } },
  signName: {
    font: { size: 8, bold: true },
    align: { horizontal: "center", vertical: "center" },
    border: { top: true },
  },
  signTitle: { font: { size: 7 }, align: { horizontal: "center", vertical: "center" } },
  note: { font: { size: 6 }, align: { horizontal: "left", vertical: "top", wrap: true } },
  motto: {
    font: { size: 9, bold: true, italic: true },
    align: { horizontal: "center", vertical: "center" },
  },
};

function text(col: number, value: string, style: string): Cell {
  return { col, value: { kind: "text", value }, style };
}

function number(col: number, value: number, style: string): Cell {
  return { col, value: { kind: "number", value }, style };
}

function formula(col: number, value: string, style: string): Cell {
  return { col, value: { kind: "formula", value }, style };
}

function blank(col: number, style: string): Cell {
  return { col, style };
}

function range(fromCol: number, fromRow: number, toCol: number, toRow: number): string {
  return `${cellRef(fromCol, fromRow)}:${cellRef(toCol, toRow)}`;
}

/** Merges of a single cell are invalid, and a one-day week produces one. */
function pushMerge(merges: string[], fromCol: number, fromRow: number, toCol: number, toRow: number) {
  if (fromCol === toCol && fromRow === toRow) return;
  merges.push(range(fromCol, fromRow, toCol, toRow));
}

function columns(layout: Layout) {
  return [
    { from: COL_NO, to: COL_NO, width: 4 },
    { from: COL_LAST, to: COL_LAST, width: 14 },
    { from: COL_FIRST, to: COL_FIRST, width: 16 },
    { from: COL_MIDDLE, to: COL_MIDDLE, width: 4 },
    { from: COL_LABEL, to: COL_LABEL, width: 5 },
    { from: COL_LABEL_PAD, to: COL_LABEL_PAD, width: 1.5 },
    { from: COL_FIRST_DAY, to: layout.lastDay, width: 2.9 },
    { from: layout.totalDays, to: layout.totalDays, width: 5.5 },
    { from: layout.transportRate, to: layout.transportRate, width: 7 },
    { from: layout.transportAmount, to: layout.transportAmount, width: 9 },
    { from: layout.mealRate, to: layout.mealRate, width: 7 },
    { from: layout.mealAmount, to: layout.mealAmount, width: 9 },
    { from: layout.totalReceived, to: layout.totalReceived, width: 10 },
    { from: layout.number, to: layout.number, width: 4 },
    { from: layout.signature, to: layout.signature, width: 16 },
  ];
}

function headerRows(sheet: PayrollSheet, layout: Layout, merges: string[]): Row[] {
  const period = periodLabel(sheet.year, sheet.month);
  const { header } = sheet;

  pushMerge(merges, COL_NO, ROW_FORM_NO, COL_LABEL_PAD, ROW_FORM_NO);
  pushMerge(merges, COL_FIRST_DAY, ROW_FORM_NO, layout.width, ROW_FORM_NO);
  pushMerge(merges, COL_NO, ROW_PERIOD, layout.width, ROW_PERIOD);

  // The header block: four rows deep, so every label above the roll lines up
  // with the roll's own three rows of Week / Day / Date.
  pushMerge(merges, COL_NO, ROW_HEAD_TOP, COL_NO, ROW_DATE);
  pushMerge(merges, COL_LAST, ROW_HEAD_TOP, COL_MIDDLE, ROW_DATE);
  pushMerge(merges, COL_LABEL, ROW_HEAD_TOP, layout.lastDay, ROW_HEAD_TOP);
  pushMerge(merges, COL_LABEL, ROW_WEEK, COL_LABEL_PAD, ROW_WEEK);
  pushMerge(merges, COL_LABEL, ROW_WEEKDAY, COL_LABEL_PAD, ROW_WEEKDAY);
  pushMerge(merges, COL_LABEL, ROW_DATE, COL_LABEL_PAD, ROW_DATE);
  pushMerge(merges, layout.totalDays, ROW_HEAD_TOP, layout.totalDays, ROW_WEEKDAY);
  pushMerge(merges, layout.transportRate, ROW_HEAD_TOP, layout.transportAmount, ROW_WEEK);
  pushMerge(merges, layout.transportRate, ROW_WEEKDAY, layout.transportRate, ROW_DATE);
  pushMerge(merges, layout.transportAmount, ROW_WEEKDAY, layout.transportAmount, ROW_DATE);
  pushMerge(merges, layout.mealRate, ROW_HEAD_TOP, layout.mealAmount, ROW_WEEK);
  pushMerge(merges, layout.mealRate, ROW_WEEKDAY, layout.mealRate, ROW_DATE);
  pushMerge(merges, layout.mealAmount, ROW_WEEKDAY, layout.mealAmount, ROW_DATE);
  pushMerge(merges, layout.totalReceived, ROW_HEAD_TOP, layout.totalReceived, ROW_DATE);
  pushMerge(merges, layout.number, ROW_HEAD_TOP, layout.number, ROW_DATE);
  pushMerge(merges, layout.signature, ROW_HEAD_TOP, layout.signature, ROW_DATE);

  // Week bands across the roll. Numbered by position rather than by the day's
  // own week index, so dropping a whole week (a holiday break) doesn't leave a
  // gap in the numbering the way it would leave one in the calendar.
  const weekCells: Cell[] = [];
  let groupStart = 0;
  let weekNumber = 0;
  for (let i = 0; i <= sheet.days.length; i++) {
    const sameGroup = i < sheet.days.length && sheet.days[i].week === sheet.days[groupStart].week;
    if (sameGroup) continue;
    weekNumber++;
    const from = COL_FIRST_DAY + groupStart;
    const to = COL_FIRST_DAY + i - 1;
    pushMerge(merges, from, ROW_WEEK, to, ROW_WEEK);
    weekCells.push(number(from, weekNumber, "headDay"));
    for (let col = from + 1; col <= to; col++) weekCells.push(blank(col, "headDay"));
    groupStart = i;
  }

  return [
    {
      row: ROW_FORM_NO,
      height: 18,
      cells: [text(COL_NO, header.formNo, "formNo"), text(COL_FIRST_DAY, header.title, "title")],
    },
    {
      row: ROW_PERIOD,
      height: 15,
      cells: [
        text(
          COL_NO,
          `For labor on ${header.project}, at ${header.venue}, Philippines, for the period, ${period}`,
          "period",
        ),
      ],
    },
    {
      row: ROW_HEAD_TOP,
      cells: [
        text(COL_NO, "No.", "headTiny"),
        text(COL_LAST, "Name", "head"),
        text(COL_LABEL, "TIME ROLL", "head"),
        text(layout.totalDays, "Total No. of Days", "headTiny"),
        text(layout.transportRate, "Transportation", "headTiny"),
        text(layout.mealRate, "Meal Allowance", "headTiny"),
        text(layout.totalReceived, "Total Amount Received", "headTiny"),
        text(layout.number, "No.", "headTiny"),
        text(layout.signature, "Signature", "headTiny"),
      ],
    },
    {
      row: ROW_WEEK,
      cells: [text(COL_LABEL, "Week", "headDay"), blank(COL_LABEL_PAD, "headDay"), ...weekCells],
    },
    {
      row: ROW_WEEKDAY,
      cells: [
        text(COL_LABEL, "Day", "headDay"),
        blank(COL_LABEL_PAD, "headDay"),
        ...sheet.days.map((d, i) => text(COL_FIRST_DAY + i, d.weekday, "headDay")),
        text(layout.transportRate, "Daily Rate", "headTiny"),
        text(layout.transportAmount, "Amount Due", "headTiny"),
        text(layout.mealRate, "Daily Rate", "headTiny"),
        text(layout.mealAmount, "Amount", "headTiny"),
      ],
    },
    {
      row: ROW_DATE,
      cells: [
        text(COL_LABEL, "Date", "headDay"),
        blank(COL_LABEL_PAD, "headDay"),
        ...sheet.days.map((d, i) => number(COL_FIRST_DAY + i, d.day, "headDay")),
        number(layout.totalDays, layout.dayCount, "headDay"),
      ],
    },
  ];
}

function studentRows(sheet: PayrollSheet, layout: Layout): Row[] {
  const rows: Row[] = [];

  for (let i = 0; i < layout.studentRows; i++) {
    const row = ROW_FIRST_STUDENT + i;
    const student = sheet.rows[i];
    const cells: Cell[] = [];

    if (!student) {
      // A ruled but empty line. No formulas: a blank row that reports 0.00 in
      // three columns reads as a person who was paid nothing.
      for (let col = COL_NO; col <= layout.signature; col++) cells.push(blank(col, "bodyBlank"));
      rows.push({ row, cells });
      continue;
    }

    const marked = new Set(student.present);
    const rollRange = range(COL_FIRST_DAY, row, layout.lastDay, row);
    const daysRef = cellRef(layout.totalDays, row);
    const transportAmountRef = cellRef(layout.transportAmount, row);
    const mealAmountRef = cellRef(layout.mealAmount, row);

    cells.push(number(COL_NO, i + 1, "bodyNo"));
    cells.push(text(COL_LAST, student.last, "bodyName"));
    cells.push(text(COL_FIRST, student.first, "bodyName"));
    cells.push(text(COL_MIDDLE, student.middle, "bodyNo"));
    cells.push(blank(COL_LABEL, "bodyBlank"));
    cells.push(blank(COL_LABEL_PAD, "bodyBlank"));

    sheet.days.forEach((day, dayIndex) => {
      const col = COL_FIRST_DAY + dayIndex;
      cells.push(
        marked.has(day.date) ? text(col, PRESENT_MARK, "bodyMark") : blank(col, "bodyMark"),
      );
    });

    cells.push(formula(layout.totalDays, `COUNTIF(${rollRange},"${PRESENT_MARK}")`, "bodyCount"));
    cells.push(
      student.transportRate > 0
        ? number(layout.transportRate, student.transportRate, "bodyMoney")
        : blank(layout.transportRate, "bodyMoney"),
    );
    cells.push(
      formula(
        layout.transportAmount,
        `${daysRef}*${cellRef(layout.transportRate, row)}`,
        "bodyMoney",
      ),
    );
    cells.push(
      student.mealRate > 0
        ? number(layout.mealRate, student.mealRate, "bodyMoney")
        : blank(layout.mealRate, "bodyMoney"),
    );
    cells.push(
      formula(layout.mealAmount, `${daysRef}*${cellRef(layout.mealRate, row)}`, "bodyMoney"),
    );
    // The paper form caps transportation on its own, because its meal column
    // was never filled in. Summing both first gives the same number whenever
    // meal is empty and the right one when it isn't.
    cells.push(
      formula(
        layout.totalReceived,
        `MIN(${transportAmountRef}+${mealAmountRef},${sheet.cap})`,
        "bodyMoney",
      ),
    );
    cells.push(number(layout.number, i + 1, "bodyNo"));
    cells.push(blank(layout.signature, "bodyBlank"));

    rows.push({ row, cells });
  }

  return rows;
}

function footerRows(sheet: PayrollSheet, layout: Layout, merges: string[]): Row[] {
  const { header } = sheet;
  const subtotal = layout.subtotalRow;
  const totalColumn = columnName(layout.totalReceived);

  pushMerge(merges, COL_NO, subtotal, layout.totalReceived - 1, subtotal);

  const rows: Row[] = [
    {
      row: subtotal,
      cells: [
        text(COL_NO, "SUB - TOTAL FOR THIS PAGE", "subtotalLabel"),
        formula(
          layout.totalReceived,
          `SUM(${totalColumn}${ROW_FIRST_STUDENT}:${totalColumn}${layout.lastStudentRow})`,
          "subtotalValue",
        ),
        blank(layout.number, "bodyBlank"),
        blank(layout.signature, "bodyBlank"),
      ],
    },
  ];

  const left = band(layout, 0);
  const middle = band(layout, 1);
  const right = band(layout, 2);

  const certifyRow = subtotal + 2;
  const nameRow = certifyRow + 4;
  const titleRow = nameRow + 1;
  const noteRow = titleRow + 2;
  const mottoRow = noteRow + 2;

  pushMerge(merges, left.from, certifyRow, left.to, certifyRow);
  pushMerge(merges, middle.from, certifyRow, middle.to, certifyRow);
  pushMerge(merges, right.from, certifyRow, right.to, certifyRow + 2);
  pushMerge(merges, left.from, certifyRow + 1, left.to, certifyRow + 1);

  rows.push({
    row: certifyRow,
    height: 14,
    cells: [
      text(
        left.from,
        "1.  I HEREBY CERTIFY on my official oath to the correctness of the above roll.",
        "certify",
      ),
      text(middle.from, "2.  APPROVED :", "certify"),
      text(
        right.from,
        "3.  I HEREBY CERTIFY on my official oath that I have this ________ day of" +
          " ______________, paid in cash to each man whose name appears on the above roll," +
          " the amount set opposite his name, he having presented himself, established his" +
          " identity and affixed his signature or thumbmark on the space provided thereof.",
        "certify",
      ),
    ],
  });
  rows.push({
    row: certifyRow + 1,
    height: 14,
    cells: [
      text(
        left.from,
        "     Payment is also hereby approved from the appropriation indicated.",
        "certify",
      ),
    ],
  });

  for (const [row, pick] of [
    [nameRow, "name"],
    [titleRow, "title"],
  ] as const) {
    pushMerge(merges, left.from, row, left.to, row);
    pushMerge(merges, middle.from, row, middle.to, row);
    pushMerge(merges, right.from, row, right.to, row);
    const style = pick === "name" ? "signName" : "signTitle";
    rows.push({
      row,
      height: pick === "name" ? 16 : 12,
      cells: [
        text(left.from, header.certifier[pick], style),
        text(middle.from, header.approver[pick], style),
        text(right.from, header.payer[pick], style),
      ],
    });
  }

  pushMerge(merges, COL_NO, noteRow, layout.width, noteRow);
  rows.push({
    row: noteRow,
    height: 22,
    cells: [
      text(
        COL_NO,
        "*NOTE: Where thumbmark is to be used in place of signature, and the space available is" +
          " not sufficient, the thumbmark may be impressed on the back hereof with proper" +
          " indication of the corresponding student's number and on the corresponding line on the" +
          ' payroll a remark, "see thumbmark on the back" should be written.',
        "note",
      ),
    ],
  });

  pushMerge(merges, COL_NO, mottoRow, layout.width, mottoRow);
  rows.push({ row: mottoRow, height: 18, cells: [text(COL_NO, header.motto, "motto")] });

  return rows;
}

/** The sheet as it will be laid out — the same description the preview mirrors. */
export function payrollSpec(sheet: PayrollSheet): SheetSpec {
  const layout = layoutOf(sheet);
  const merges: string[] = [];

  return {
    name: periodLabel(sheet.year, sheet.month),
    columns: columns(layout),
    rows: [
      ...headerRows(sheet, layout, merges),
      ...studentRows(sheet, layout),
      ...footerRows(sheet, layout, merges),
    ],
    merges,
    // The names and the Week/Day/Date labels stay put while the roll scrolls —
    // a 23-column month is wider than any screen it'll be checked on.
    freeze: { rows: ROW_DATE, columns: COL_LABEL_PAD },
    showGridLines: false,
    page: { orientation: "landscape", fitToWidth: true },
  };
}

export function payrollWorkbook(sheet: PayrollSheet): Uint8Array {
  return buildWorkbook(payrollSpec(sheet), STYLES);
}

export function payrollFileName(sheet: PayrollSheet): string {
  return `Payroll ${periodLabel(sheet.year, sheet.month)}.xlsx`;
}
