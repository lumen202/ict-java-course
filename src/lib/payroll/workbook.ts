import {
  buildWorkbook,
  cellRef,
  type Cell,
  type Row,
  type SheetSpec,
  type Style,
} from "../xlsx/sheet";
import { periodLabel } from "./calendar";
import { PRESENT_MARK, type PayrollSheet } from "./model";

// Renders a PayrollSheet as General Form No. 7(A) — the Time Book and Payroll
// the coordinator files each month, laid out cell-for-cell like the teacher's
// own workbook (` E2PS ICT PHASE 2 Payroll 2026-2027.xlsx`, AUGUST sheet).
//
// The template's geometry is FIXED, not month-shaped: the time roll always
// spans G:AC — 23 slots, enough for the widest possible month — and the class
// days fill in from G, leaving the leftover slots ruled but empty. Everything
// to the right (Total No. of Days through Signature) sits at hard-coded
// columns AD:AK, and the certification block sits at fixed cells below the
// roll. The teacher's own AUGUST sheet uses 18 of the 23 slots; a column that
// moved with the month would put every total somewhere the checker isn't
// looking for it.
//
// The totals are written as formulas, not as numbers. The teacher hands this
// file on to someone who will check it, and a payroll whose arithmetic can't
// be followed in the cells is one they have to re-key.

// Columns, exactly as the template rules them.
const COL_NO = 1; // A
const COL_LAST = 2; // B
const COL_FIRST = 3; // C
const COL_MIDDLE = 4; // D
const COL_LABEL = 5; // E — "Week" / "Day" / "Date"
const COL_LABEL_PAD = 6; // F — a 0.38-wide sliver merged into E
const COL_FIRST_DAY = 7; // G
const COL_LAST_DAY = 29; // AC — 23 roll slots, the widest month possible
const COL_TOTAL_DAYS = 30; // AD
const COL_T_RATE = 31; // AE
const COL_T_AMOUNT = 32; // AF
const COL_M_RATE = 33; // AG
const COL_M_AMOUNT = 34; // AH
const COL_TOTAL = 35; // AI
const COL_NO_2 = 36; // AJ
const COL_SIGN = 37; // AK

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

const STYLES: Record<string, Style> = {
  // Row 1-2 — the running head.
  formNo: { font: { size: 8 }, align: { vertical: "bottom" } },
  title: { font: { size: 16, bold: true }, align: { vertical: "bottom" } },
  labelRight: {
    font: { name: "Arial Narrow", size: 10 },
    align: { horizontal: "right", vertical: "bottom" },
  },
  labelCenter: {
    font: { name: "Arial Narrow", size: 10 },
    align: { horizontal: "center", vertical: "bottom" },
  },
  labelLeft: {
    font: { name: "Arial Narrow", size: 10 },
    align: { horizontal: "left", vertical: "bottom" },
  },
  fillIn: {
    font: { name: "Arial Narrow", size: 11 },
    align: { horizontal: "center", vertical: "bottom" },
    border: { bottom: true },
  },
  period: {
    font: { name: "Arial Narrow", size: 12, bold: true },
    align: { horizontal: "center", vertical: "bottom" },
    border: { bottom: true },
  },

  // Rows 4-7 — the column headers.
  head: {
    font: { name: "Arial Narrow", size: 10 },
    align: { horizontal: "center", vertical: "center" },
    border: { top: true, bottom: true, left: true, right: true },
  },
  headBold: {
    font: { name: "Arial Narrow", size: 10, bold: true },
    align: { horizontal: "center", vertical: "center", wrap: true },
    border: { top: true, bottom: true, left: true, right: true },
  },
  headSmall: {
    font: { name: "Arial Narrow", size: 9 },
    align: { horizontal: "center", vertical: "center", wrap: true },
    border: { top: true, bottom: true, left: true, right: true },
  },
  timeRoll: {
    font: { size: 12, bold: true },
    align: { horizontal: "center", vertical: "center" },
    border: { top: true, bottom: true, left: true, right: true },
  },
  labelBox: {
    font: { name: "Arial Narrow", size: 9 },
    align: { horizontal: "center", vertical: "center" },
    border: { top: true, bottom: true, left: true, right: true },
  },
  dayHead: {
    font: { name: "Arial Narrow", size: 8 },
    align: { horizontal: "center", vertical: "bottom" },
    border: { bottom: true, left: true, right: true },
  },
  dayDate: {
    font: { name: "Arial Narrow", size: 9 },
    align: { horizontal: "center", vertical: "center" },
    border: { top: true, bottom: true, left: true, right: true },
  },
  countHead: {
    font: { name: "Arial Narrow", size: 12, bold: true },
    align: { horizontal: "center", vertical: "center" },
    border: { top: true, bottom: true, left: true, right: true },
  },

  // Rows 8-17 — the roll itself.
  bodyNo: {
    font: { name: "Arial Narrow", size: 10 },
    align: { horizontal: "center", vertical: "center" },
    border: { bottom: true, left: true, right: true },
  },
  bodyName: {
    font: { size: 11 },
    align: { horizontal: "left", vertical: "center", wrap: true },
    border: { bottom: true, left: true, right: true },
  },
  bodyMiddle: {
    font: { size: 11 },
    align: { horizontal: "center", vertical: "center" },
    border: { bottom: true, left: true, right: true },
  },
  bodyMark: {
    font: { size: 11, bold: true },
    align: { horizontal: "center", vertical: "center" },
    border: { bottom: true, left: true, right: true },
  },
  bodyCount: {
    font: { name: "Arial Narrow", size: 12 },
    align: { horizontal: "center", vertical: "center" },
    border: { bottom: true, left: true, right: true },
    numberFormat: "#,##0",
  },
  bodyRate: {
    font: { size: 9 },
    align: { horizontal: "right", vertical: "center" },
    border: { bottom: true, left: true, right: true },
    numberFormat: "#,##0.00",
  },
  bodyMoney: {
    font: { name: "Arial Narrow", size: 10 },
    align: { horizontal: "right", vertical: "center" },
    border: { bottom: true, left: true, right: true },
    numberFormat: "#,##0.00",
  },
  bodyBlank: { border: { bottom: true, left: true, right: true } },

  subtotalLabel: {
    font: { name: "Arial Narrow", size: 12, bold: true, italic: true },
    align: { horizontal: "right", vertical: "center" },
    border: { bottom: true, left: true, right: true },
  },
  subtotalValue: {
    font: { name: "Arial Narrow", size: 12, bold: true },
    align: { horizontal: "center", vertical: "center" },
    border: { bottom: true, left: true, right: true },
    numberFormat: "#,##0.00",
  },

  // The certification block.
  certNum: {
    font: { name: "Arial Narrow", size: 8 },
    align: { horizontal: "right", vertical: "bottom" },
  },
  cert: { font: { name: "Arial Narrow", size: 8 }, align: { vertical: "bottom" } },
  signName: {
    font: { name: "Arial Narrow", size: 12, bold: true },
    align: { horizontal: "center", vertical: "bottom" },
    border: { bottom: true },
  },
  signTitle: {
    font: { name: "Arial Narrow", size: 10, italic: true },
    align: { horizontal: "center", vertical: "bottom" },
  },
  note: { font: { name: "Arial Narrow", size: 9 }, align: { vertical: "bottom" } },
  motto: {
    font: { name: "Arial Narrow", size: 11, bold: true },
    align: { horizontal: "center", vertical: "bottom" },
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

// The template's own column widths, verbatim.
const COLUMNS = [
  { from: COL_NO, to: COL_NO, width: 2.75 },
  { from: COL_LAST, to: COL_LAST, width: 12.38 },
  { from: COL_FIRST, to: COL_FIRST, width: 22 },
  { from: COL_MIDDLE, to: COL_MIDDLE, width: 3.13 },
  { from: COL_LABEL, to: COL_LABEL, width: 3.88 },
  { from: COL_LABEL_PAD, to: COL_LABEL_PAD, width: 0.38 },
  { from: COL_FIRST_DAY, to: COL_LAST_DAY, width: 2.38 },
  { from: COL_TOTAL_DAYS, to: COL_TOTAL_DAYS, width: 4.38 },
  { from: COL_T_RATE, to: COL_T_RATE, width: 6.38 },
  { from: COL_T_AMOUNT, to: COL_T_AMOUNT, width: 8 },
  { from: COL_M_RATE, to: COL_M_AMOUNT, width: 5.38 },
  { from: COL_TOTAL, to: COL_TOTAL, width: 13.13 },
  { from: COL_NO_2, to: COL_NO_2, width: 2.88 },
  { from: COL_SIGN, to: COL_SIGN, width: 14.25 },
];

function headerRows(sheet: PayrollSheet, merges: string[]): Row[] {
  const period = periodLabel(sheet.year, sheet.month);
  const { header } = sheet;

  // Row 2 is composed of fixed fragments with the fill-ins underlined, the way
  // the printed form reads: For labor on _-_ <project>, at <venue>,
  // Philippines, for the period, <PERIOD>.
  pushMerge(merges, 9, ROW_PERIOD, 15, ROW_PERIOD); // I2:O2 project
  pushMerge(merges, 17, ROW_PERIOD, COL_TOTAL_DAYS, ROW_PERIOD); // Q2:AD2 venue
  pushMerge(merges, 34, ROW_PERIOD, 36, ROW_PERIOD); // AH2:AJ2 period

  // The header block over the roll and the totals.
  pushMerge(merges, COL_NO, ROW_HEAD_TOP, COL_NO, ROW_DATE); // A4:A7
  pushMerge(merges, COL_LAST, ROW_HEAD_TOP, COL_MIDDLE, ROW_DATE); // B4:D7
  pushMerge(merges, COL_LABEL, ROW_HEAD_TOP, COL_LAST_DAY, ROW_HEAD_TOP); // E4:AC4
  pushMerge(merges, COL_LABEL, ROW_WEEK, COL_LABEL_PAD, ROW_WEEK); // E5:F5
  pushMerge(merges, COL_LABEL, ROW_WEEKDAY, COL_LABEL_PAD, ROW_WEEKDAY); // E6:F6
  pushMerge(merges, COL_LABEL, ROW_DATE, COL_LABEL_PAD, ROW_DATE); // E7:F7
  pushMerge(merges, COL_TOTAL_DAYS, ROW_HEAD_TOP, COL_TOTAL_DAYS, ROW_WEEKDAY); // AD4:AD6
  pushMerge(merges, COL_T_RATE, ROW_HEAD_TOP, COL_T_AMOUNT, ROW_WEEK); // AE4:AF5
  pushMerge(merges, COL_M_RATE, ROW_HEAD_TOP, COL_M_AMOUNT, ROW_WEEK); // AG4:AH5
  pushMerge(merges, COL_T_RATE, ROW_WEEKDAY, COL_T_RATE, ROW_DATE); // AE6:AE7
  pushMerge(merges, COL_T_AMOUNT, ROW_WEEKDAY, COL_T_AMOUNT, ROW_DATE); // AF6:AF7
  pushMerge(merges, COL_M_RATE, ROW_WEEKDAY, COL_M_RATE, ROW_DATE); // AG6:AG7
  pushMerge(merges, COL_M_AMOUNT, ROW_WEEKDAY, COL_M_AMOUNT, ROW_DATE); // AH6:AH7
  pushMerge(merges, COL_TOTAL, ROW_HEAD_TOP, COL_TOTAL, ROW_DATE); // AI4:AI7
  pushMerge(merges, COL_NO_2, ROW_HEAD_TOP, COL_NO_2, ROW_DATE); // AJ4:AJ7
  pushMerge(merges, COL_SIGN, ROW_HEAD_TOP, COL_SIGN, ROW_DATE); // AK4:AK7

  // Week bands over the days that exist. Numbered by position rather than by
  // the day's own week index, so dropping a whole week (a holiday break)
  // doesn't leave a gap in the numbering.
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
    weekCells.push(number(from, weekNumber, "dayHead"));
    for (let col = from + 1; col <= to; col++) weekCells.push(blank(col, "dayHead"));
    groupStart = i;
  }
  // The slots the month doesn't reach stay ruled but empty, like the template.
  for (let col = COL_FIRST_DAY + sheet.days.length; col <= COL_LAST_DAY; col++) {
    weekCells.push(blank(col, "dayHead"));
  }

  const spareSlots: Cell[] = [];
  for (let col = COL_FIRST_DAY + sheet.days.length; col <= COL_LAST_DAY; col++) {
    spareSlots.push(blank(col, "dayHead"));
  }
  const spareDates: Cell[] = [];
  for (let col = COL_FIRST_DAY + sheet.days.length; col <= COL_LAST_DAY; col++) {
    spareDates.push(blank(col, "dayDate"));
  }

  return [
    {
      row: ROW_FORM_NO,
      height: 32.25,
      cells: [text(COL_NO, header.formNo, "formNo"), text(14, header.title, "title")],
    },
    {
      row: ROW_PERIOD,
      height: 18,
      cells: [
        text(3, "For labor on", "labelRight"),
        text(8, "-", "labelCenter"),
        text(9, header.project, "fillIn"),
        text(16, ",at", "labelCenter"),
        text(17, header.venue, "fillIn"),
        text(31, ", Philippines, for the period,", "labelLeft"),
        text(34, period, "period"),
      ],
    },
    { row: 3, height: 10.5, cells: [] },
    {
      row: ROW_HEAD_TOP,
      height: 15.75,
      cells: [
        text(COL_NO, "No.", "head"),
        text(COL_LAST, "Name", "head"),
        text(COL_LABEL, "TIME ROLL", "timeRoll"),
        text(COL_TOTAL_DAYS, "Total No. of Days", "headSmall"),
        text(COL_T_RATE, "Transportation", "headSmall"),
        text(COL_M_RATE, "Meal Allowance", "headSmall"),
        text(COL_TOTAL, "Total Amount Received", "headBold"),
        text(COL_NO_2, "No.", "head"),
        text(COL_SIGN, "Signature", "headBold"),
      ],
    },
    {
      row: ROW_WEEK,
      height: 13.5,
      cells: [text(COL_LABEL, "Week", "labelBox"), ...weekCells],
    },
    {
      row: ROW_WEEKDAY,
      height: 15,
      cells: [
        text(COL_LABEL, "Day", "labelBox"),
        ...sheet.days.map((d, i) => text(COL_FIRST_DAY + i, d.weekday, "dayHead")),
        ...spareSlots,
        text(COL_T_RATE, "Daily Rate", "headSmall"),
        text(COL_T_AMOUNT, "Amount Due", "headSmall"),
        text(COL_M_RATE, "Daily Rate", "headSmall"),
        text(COL_M_AMOUNT, "Amount", "headSmall"),
      ],
    },
    {
      row: ROW_DATE,
      height: 16.5,
      cells: [
        text(COL_LABEL, "Date", "labelBox"),
        ...sheet.days.map((d, i) => number(COL_FIRST_DAY + i, d.day, "dayDate")),
        ...spareDates,
        number(COL_TOTAL_DAYS, sheet.days.length, "countHead"),
      ],
    },
  ];
}

function studentRows(sheet: PayrollSheet, merges: string[]): { rows: Row[]; lastRow: number } {
  const rows: Row[] = [];
  const count = Math.max(sheet.rows.length, MIN_STUDENT_ROWS);

  for (let i = 0; i < count; i++) {
    const row = ROW_FIRST_STUDENT + i;
    const student = sheet.rows[i];
    const cells: Cell[] = [];

    pushMerge(merges, COL_LABEL, row, COL_LABEL_PAD, row); // E:F, every ruled line

    if (!student) {
      // A ruled but empty line. No formulas: a blank row that reports 0.00 in
      // three columns reads as a person who was paid nothing.
      for (let col = COL_NO; col <= COL_SIGN; col++) cells.push(blank(col, "bodyBlank"));
      rows.push({ row, height: 24.75, cells });
      continue;
    }

    const marked = new Set(student.present);
    const rollRange = range(COL_FIRST_DAY, row, COL_LAST_DAY, row);
    const countRef = cellRef(COL_TOTAL_DAYS, row);

    cells.push(number(COL_NO, i + 1, "bodyNo"));
    cells.push(text(COL_LAST, student.last, "bodyName"));
    cells.push(text(COL_FIRST, student.first, "bodyName"));
    cells.push(text(COL_MIDDLE, student.middle, "bodyMiddle"));
    cells.push(blank(COL_LABEL, "bodyBlank"));
    cells.push(blank(COL_LABEL_PAD, "bodyBlank"));

    // Every one of the 23 roll slots is a bordered cell; the month's days fill
    // in from the left and the leftovers stay empty, like the template.
    for (let col = COL_FIRST_DAY; col <= COL_LAST_DAY; col++) {
      const day = sheet.days[col - COL_FIRST_DAY];
      cells.push(
        day && marked.has(day.date) ? text(col, PRESENT_MARK, "bodyMark") : blank(col, "bodyMark"),
      );
    }

    cells.push(formula(COL_TOTAL_DAYS, `COUNTIF(${rollRange},"${PRESENT_MARK}")`, "bodyCount"));
    cells.push(
      student.transportRate > 0
        ? number(COL_T_RATE, student.transportRate, "bodyRate")
        : blank(COL_T_RATE, "bodyRate"),
    );
    cells.push(formula(COL_T_AMOUNT, `${countRef}*${cellRef(COL_T_RATE, row)}`, "bodyMoney"));
    cells.push(
      student.mealRate > 0
        ? number(COL_M_RATE, student.mealRate, "bodyRate")
        : blank(COL_M_RATE, "bodyRate"),
    );
    cells.push(
      student.mealRate > 0
        ? formula(COL_M_AMOUNT, `${countRef}*${cellRef(COL_M_RATE, row)}`, "bodyMoney")
        : blank(COL_M_AMOUNT, "bodyMoney"),
    );
    // The template's own formula caps transportation alone, because its meal
    // column was never filled in. Summing both first gives the same number
    // whenever meal is empty and the right one when it isn't. A blank meal
    // amount adds as zero.
    cells.push(
      formula(
        COL_TOTAL,
        `MIN(${cellRef(COL_T_AMOUNT, row)}+${cellRef(COL_M_AMOUNT, row)},${sheet.cap})`,
        "bodyMoney",
      ),
    );
    cells.push(number(COL_NO_2, i + 1, "bodyNo"));
    cells.push(blank(COL_SIGN, "bodyBlank"));

    rows.push({ row, height: 24.75, cells });
  }

  return { rows, lastRow: ROW_FIRST_STUDENT + count - 1 };
}

function footerRows(sheet: PayrollSheet, lastStudentRow: number, merges: string[]): Row[] {
  const { header } = sheet;
  const subtotal = lastStudentRow + 1;

  pushMerge(merges, COL_NO, subtotal, COL_M_AMOUNT, subtotal); // A18:AH18

  const rows: Row[] = [
    {
      row: subtotal,
      height: 24.75,
      cells: [
        text(COL_NO, "SUB - TOTAL FOR THIS PAGE", "subtotalLabel"),
        formula(
          COL_TOTAL,
          `SUM(AI${ROW_FIRST_STUDENT}:AI${lastStudentRow})`,
          "subtotalValue",
        ),
        blank(COL_NO_2, "bodyBlank"),
        blank(COL_SIGN, "bodyBlank"),
      ],
    },
    { row: subtotal + 1, height: 6, cells: [] },
  ];

  // The three numbered certifications, at the template's own anchors: the roll
  // certification at B, APPROVED at M, the payment certification wrapped over
  // three rows starting at Z.
  const certRow = subtotal + 2;
  rows.push({
    row: certRow,
    height: 11.25,
    cells: [
      text(COL_NO, "1.", "certNum"),
      text(COL_LAST, "I  HEREBY  CERTIFY  on my official oath to the correctness of the above roll.", "cert"),
      text(12, "2.", "certNum"),
      text(13, "APPROVED :", "cert"),
      text(
        26,
        "3. I HEREBY CERTIFY on my official oath that I have this ________ day of ______________, paid in cash to each man whose",
        "cert",
      ),
    ],
  });
  rows.push({
    row: certRow + 1,
    height: 11.25,
    cells: [
      text(COL_LAST, "Payment is also hereby approved from the appropriation indicated.", "cert"),
      text(
        26,
        "    name appears  on the above  roll,  the  amount  set opposite his name,  he  having presented himself established his identity",
        "cert",
      ),
    ],
  });
  rows.push({
    row: certRow + 2,
    height: 11.25,
    cells: [
      text(26, "    and  affixed  his signature  or  thumbmark  on the  space  provided thereof. ", "cert"),
    ],
  });

  // Signature lines: name over an underline, title beneath.
  const nameRow = certRow + 3;
  const titleRow = certRow + 4;
  pushMerge(merges, 3, nameRow, 7, nameRow); // C:G certifier
  pushMerge(merges, 12, nameRow, 24, nameRow); // L:X approver
  pushMerge(merges, 30, nameRow, 33, nameRow); // AD:AG payer
  pushMerge(merges, 3, titleRow, 7, titleRow);
  pushMerge(merges, 13, titleRow, 23, titleRow); // M:W
  pushMerge(merges, 30, titleRow, 33, titleRow);
  rows.push({
    row: nameRow,
    height: 30,
    cells: [
      text(3, header.certifier.name, "signName"),
      text(12, header.approver.name, "signName"),
      text(30, header.payer.name, "signName"),
    ],
  });
  rows.push({
    row: titleRow,
    height: 13.5,
    cells: [
      text(3, header.certifier.title, "signTitle"),
      text(13, header.approver.title, "signTitle"),
      text(30, header.payer.title, "signTitle"),
    ],
  });

  const noteRow = titleRow + 1;
  rows.push({
    row: noteRow,
    height: 13.5,
    cells: [
      text(
        COL_NO,
        "*NOTE:Where thumbmark is to be used in place of signature, and the space available is not sufficient, the thumbmark may be impressed on the back hereof with proper indication of the corresponding student's number and on the corresponding line on the payroll",
        "note",
      ),
    ],
  });
  rows.push({
    row: noteRow + 1,
    height: 13.5,
    cells: [text(COL_NO, 'a remark, "see thumbmark on the back" should be written.', "note")],
  });

  const mottoRow = noteRow + 2;
  pushMerge(merges, COL_NO, mottoRow, COL_SIGN, mottoRow); // A27:AK27
  rows.push({ row: mottoRow, height: 13.5, cells: [text(COL_NO, header.motto, "motto")] });

  return rows;
}

/** The sheet as it will be laid out — the same description the preview mirrors. */
export function payrollSpec(sheet: PayrollSheet): SheetSpec {
  const merges: string[] = [];
  const header = headerRows(sheet, merges);
  const { rows: students, lastRow } = studentRows(sheet, merges);
  const footer = footerRows(sheet, lastRow, merges);

  return {
    name: periodLabel(sheet.year, sheet.month),
    columns: COLUMNS,
    rows: [...header, ...students, ...footer],
    merges,
    // Legal paper in landscape, centred on the page — the template's own setup.
    page: { orientation: "landscape", paperSize: 5, centered: true },
  };
}

export function payrollWorkbook(sheet: PayrollSheet): Uint8Array {
  return buildWorkbook(payrollSpec(sheet), STYLES);
}

export function payrollFileName(sheet: PayrollSheet): string {
  return `Payroll ${periodLabel(sheet.year, sheet.month)}.xlsx`;
}
