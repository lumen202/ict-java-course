import { PdfPage, pdfDocument } from "../pdf/writer";
import { periodLabel } from "./calendar";
import {
  CERT_COL,
  COL,
  LABELS,
  ROW,
  columnWidths,
  formAnchors,
  formMerges,
  rowHeight,
  weekBands,
  type MergeRect,
} from "./form";
import {
  daysPresent,
  grandTotal,
  mealAmount,
  totalReceived,
  transportAmount,
  type PayrollSheet,
} from "./model";

// Draws the same General Form No. 7(A) as `workbook.ts`, on legal paper, from
// the same description in `form.ts`.
//
// Why both: the .xlsx is the copy someone *checks* — its totals are formulas
// you can click into. The PDF is the copy that gets *filed*, and it renders the
// same on every machine, which a spreadsheet does not: an .xlsx picks up the
// reader's fonts, column widths and print settings, so the page the coordinator
// sees is not guaranteed to be the page the office prints.
//
// The one thing a PDF cannot carry is a formula, so every total here is
// computed by the functions in `model.ts` — the same ones the on-screen preview
// calls, and the ones the spreadsheet's formulas mirror. There is deliberately
// no second implementation of the arithmetic.

// Legal paper, landscape: 14in x 8.5in at 72pt to the inch.
const PAGE_WIDTH = 1008;
const PAGE_HEIGHT = 612;
const MARGIN = 18;

/** Below this the form stops being readable, so it is allowed to run long instead. */
const MIN_SCALE = 0.55;

function money(value: number): string {
  const [whole, fraction] = (Math.round(value * 100) / 100).toFixed(2).split(".");
  return `${whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}.${fraction}`;
}

type Grid = {
  /** Left edge of column c, for c in 1..COL.sign + 1. */
  x: number[];
  /** Top edge of row r. */
  top: (row: number) => number;
  height: (row: number) => number;
  /** Everything is scaled by this to keep one page; 1 unless the roll is long. */
  scale: number;
};

function gridFor(sheet: PayrollSheet): Grid {
  const a = formAnchors(sheet.rows.length);
  const widths = columnWidths();

  const totalWidth = widths.reduce((sum, w) => sum + w, 0);
  const unit = (PAGE_WIDTH - MARGIN * 2) / totalWidth;

  const x: number[] = [];
  let at = MARGIN;
  for (let col = 1; col <= COL.sign + 1; col++) {
    x[col] = at;
    at += (widths[col] ?? 0) * unit;
  }

  const rows: number[] = [];
  for (let row = ROW.formNo; row <= a.motto; row++) rows[row] = rowHeight(row, a);
  const totalHeight = rows.reduce((sum, h) => sum + (h ?? 0), 0);
  const scale = Math.max(MIN_SCALE, Math.min(1, (PAGE_HEIGHT - MARGIN * 2) / totalHeight));

  const tops: number[] = [];
  let y = Math.max(MARGIN, (PAGE_HEIGHT - totalHeight * scale) / 2);
  for (let row = ROW.formNo; row <= a.motto + 1; row++) {
    tops[row] = y;
    y += (rows[row] ?? 0) * scale;
  }

  return {
    x,
    top: (row) => tops[row],
    height: (row) => (rows[row] ?? 0) * scale,
    scale,
  };
}

/** The rectangle a cell occupies, grown to its merge if it starts one. */
function boxOf(grid: Grid, merges: MergeRect[], col: number, row: number) {
  const merge = merges.find((m) => m.c1 === col && m.r1 === row);
  const c2 = merge ? merge.c2 : col;
  const r2 = merge ? merge.r2 : row;
  const top = grid.top(row);
  return {
    x: grid.x[col],
    top,
    width: grid.x[c2 + 1] - grid.x[col],
    height: grid.top(r2 + 1) - top,
  };
}

/**
 * The ruling of the table, derived from the merge list rather than declared.
 *
 * A line is drawn between two cells unless a merged block spans across it — so
 * the spreadsheet's merges and the printed copy's rules cannot disagree, which
 * they would if this were a second hand-written list of where lines go.
 */
function drawGrid(page: PdfPage, grid: Grid, merges: MergeRect[], firstRow: number, lastRow: number) {
  const left = grid.x[COL.no];
  const right = grid.x[COL.sign + 1];

  for (let row = firstRow; row <= lastRow; row++) {
    const top = grid.top(row);
    const bottom = grid.top(row + 1);

    // Verticals inside this row band.
    for (let col = COL.no; col < COL.sign; col++) {
      const spanning = merges.some(
        (m) => m.c1 <= col && m.c2 >= col + 1 && m.r1 <= row && m.r2 >= row,
      );
      if (!spanning) page.line(grid.x[col + 1], top, grid.x[col + 1], bottom);
    }

    // The horizontal below this row, per column, skipped where a merge spans it.
    if (row < lastRow) {
      for (let col = COL.no; col <= COL.sign; col++) {
        const spanning = merges.some(
          (m) => m.r1 <= row && m.r2 >= row + 1 && m.c1 <= col && m.c2 >= col,
        );
        if (!spanning) page.line(grid.x[col], bottom, grid.x[col + 1], bottom);
      }
    }
  }

  // The outer box last, so it sits over any seam.
  page.rect(left, grid.top(firstRow), right - left, grid.top(lastRow + 1) - grid.top(firstRow), 0.9);
}

function drawHead(page: PdfPage, sheet: PayrollSheet, grid: Grid, merges: MergeRect[]) {
  const s = grid.scale;
  const period = periodLabel(sheet.year, sheet.month);
  const { header } = sheet;

  const row1 = grid.top(ROW.formNo);
  const h1 = grid.height(ROW.formNo);
  page.text(grid.x[COL.no], row1 + h1 - 4 * s, header.formNo, { size: 8 * s });
  page.text((grid.x[COL.no] + grid.x[COL.sign + 1]) / 2, row1 + h1 - 4 * s, header.title, {
    size: 16 * s,
    font: "bold",
    align: "center",
  });

  // Row 2 reads as one sentence with the variable parts underlined, the way the
  // printed form does: For labor on _-_ <project>, at <venue>, Philippines,
  // for the period, <PERIOD>.
  const row2 = grid.top(ROW.period);
  const h2 = grid.height(ROW.period);
  const baseline = row2 + h2 - 3 * s;
  const fill = (col: number, value: string, bold = false) => {
    const box = boxOf(grid, merges, col, ROW.period);
    page.text(box.x + box.width / 2, baseline, value, {
      size: (bold ? 12 : 11) * s,
      font: bold ? "bold" : "regular",
      align: "center",
      maxWidth: box.width,
    });
    page.line(box.x, baseline + 1.5 * s, box.x + box.width, baseline + 1.5 * s, 0.6);
  };

  page.text(grid.x[3], baseline, LABELS.forLabor, { size: 10 * s });
  page.text(grid.x[8], baseline, LABELS.dash, { size: 10 * s });
  fill(9, header.project);
  page.text(grid.x[16], baseline, LABELS.at, { size: 10 * s });
  fill(17, header.venue);
  page.text(grid.x[31], baseline, LABELS.philippines, { size: 10 * s });
  fill(34, period, true);

  // The column headers.
  const box = (col: number, row: number) => boxOf(grid, merges, col, row);
  const block = (col: number, row: number, value: string, size: number, font?: "bold") => {
    const b = box(col, row);
    page.textBlock(b.x, b.top, b.width, b.height, value, { size: size * s, font });
  };

  block(COL.no, ROW.headTop, LABELS.no, 10);
  block(COL.last, ROW.headTop, LABELS.name, 10);
  block(COL.label, ROW.headTop, LABELS.timeRoll, 12, "bold");
  block(COL.totalDays, ROW.headTop, LABELS.totalDays, 9);
  block(COL.transportRate, ROW.headTop, LABELS.transportation, 9);
  block(COL.mealRate, ROW.headTop, LABELS.mealAllowance, 9);
  block(COL.total, ROW.headTop, LABELS.totalReceived, 10, "bold");
  block(COL.no2, ROW.headTop, LABELS.no, 10);
  block(COL.sign, ROW.headTop, LABELS.signature, 10, "bold");

  block(COL.label, ROW.week, LABELS.week, 9);
  block(COL.label, ROW.weekday, LABELS.day, 9);
  block(COL.label, ROW.date, LABELS.date, 9);
  block(COL.transportRate, ROW.weekday, LABELS.dailyRate, 9);
  block(COL.transportAmount, ROW.weekday, LABELS.amountDue, 9);
  block(COL.mealRate, ROW.weekday, LABELS.dailyRate, 9);
  block(COL.mealAmount, ROW.weekday, LABELS.amount, 9);

  for (const band of weekBands(sheet.days)) {
    const b = box(band.from, ROW.week);
    page.textInBox(b.x, b.top, b.width, b.height, String(band.number), { size: 8 * s });
  }

  sheet.days.forEach((day, i) => {
    const col = COL.firstDay + i;
    const dayBox = box(col, ROW.weekday);
    page.textInBox(dayBox.x, dayBox.top, dayBox.width, dayBox.height, day.weekday, { size: 8 * s });
    const dateBox = box(col, ROW.date);
    page.textInBox(dateBox.x, dateBox.top, dateBox.width, dateBox.height, String(day.day), {
      size: 9 * s,
    });
  });

  const countBox = box(COL.totalDays, ROW.date);
  page.textInBox(
    countBox.x,
    countBox.top,
    countBox.width,
    countBox.height,
    String(sheet.days.length),
    { size: 12 * s, font: "bold" },
  );
}

function drawRoll(page: PdfPage, sheet: PayrollSheet, grid: Grid, merges: MergeRect[]) {
  const s = grid.scale;
  const a = formAnchors(sheet.rows.length);

  sheet.rows.forEach((student, i) => {
    const row = ROW.firstStudent + i;
    if (row > a.lastStudent) return;
    const top = grid.top(row);
    const height = grid.height(row);
    const cell = (col: number) => ({ x: grid.x[col], width: grid.x[col + 1] - grid.x[col] });

    const at = (col: number, value: string, size: number, align: "left" | "center" | "right") => {
      const c = cell(col);
      page.textInBox(c.x, top, c.width, height, value, { size: size * s, align });
    };

    at(COL.no, String(i + 1), 10, "center");
    at(COL.last, student.last, 11, "left");
    at(COL.first, student.first, 11, "left");
    at(COL.middle, student.middle, 11, "center");

    const marked = new Set(student.present);
    sheet.days.forEach((day, dayIndex) => {
      if (!marked.has(day.date)) return;
      const c = cell(COL.firstDay + dayIndex);
      page.check(c.x + c.width / 2, top + height / 2, Math.min(c.width, height) * 0.55);
    });

    const present = daysPresent(student, sheet.days);
    const transport = transportAmount(student, sheet.days);
    const meal = mealAmount(student, sheet.days);

    at(COL.totalDays, String(present), 12, "center");
    if (student.transportRate > 0) at(COL.transportRate, money(student.transportRate), 9, "right");
    at(COL.transportAmount, money(transport), 10, "right");
    if (student.mealRate > 0) {
      at(COL.mealRate, money(student.mealRate), 9, "right");
      at(COL.mealAmount, money(meal), 10, "right");
    }
    at(COL.total, money(totalReceived(student, sheet.days, sheet.cap)), 10, "right");
    at(COL.no2, String(i + 1), 10, "center");
  });

  // Blank lines stay ruled and empty — a line reading 0.00 in three columns
  // would read as somebody who was paid nothing.

  const subtotalBox = boxOf(grid, merges, COL.no, a.subtotal);
  page.textInBox(
    subtotalBox.x,
    subtotalBox.top,
    subtotalBox.width,
    subtotalBox.height,
    LABELS.subtotal,
    { size: 12 * s, font: "boldItalic", align: "right" },
  );
  const totalBox = { x: grid.x[COL.total], width: grid.x[COL.total + 1] - grid.x[COL.total] };
  page.textInBox(
    totalBox.x,
    grid.top(a.subtotal),
    totalBox.width,
    grid.height(a.subtotal),
    money(grandTotal(sheet)),
    { size: 12 * s, font: "bold" },
  );
}

function drawFooter(page: PdfPage, sheet: PayrollSheet, grid: Grid, merges: MergeRect[]) {
  const s = grid.scale;
  const a = formAnchors(sheet.rows.length);
  const { header } = sheet;
  const right = grid.x[COL.sign + 1];

  const line = (row: number, col: number, value: string, width: number, align?: "right") => {
    const bottom = grid.top(row) + grid.height(row) - 2 * s;
    page.text(align === "right" ? grid.x[col + 1] - 1 : grid.x[col], bottom, value, {
      size: 8 * s,
      align: align ?? "left",
      maxWidth: width,
      minSize: 4,
    });
  };

  const certOneWidth = grid.x[CERT_COL.twoNum] - grid.x[CERT_COL.one] - 4;
  const certTwoWidth = grid.x[CERT_COL.three] - grid.x[CERT_COL.two] - 4;
  const certThreeWidth = right - grid.x[CERT_COL.three] - 2;

  line(a.cert, CERT_COL.oneNum, "1.", 12, "right");
  line(a.cert, CERT_COL.one, LABELS.cert1, certOneWidth);
  line(a.cert, CERT_COL.twoNum, "2.", 12, "right");
  line(a.cert, CERT_COL.two, LABELS.cert2, certTwoWidth);
  line(a.cert, CERT_COL.three, LABELS.cert3a, certThreeWidth);
  line(a.cert2, CERT_COL.one, LABELS.cert1b, certOneWidth);
  line(a.cert2, CERT_COL.three, LABELS.cert3b, certThreeWidth);
  line(a.cert3, CERT_COL.three, LABELS.cert3c, certThreeWidth);

  // Three signature lines: the name sits on a rule, the title beneath it.
  const signatories = [
    { col: 3, person: header.certifier },
    { col: 12, person: header.approver },
    { col: 30, person: header.payer },
  ] as const;
  const titleCol: Record<number, number> = { 3: 3, 12: 13, 30: 30 };

  for (const { col, person } of signatories) {
    const nameBox = boxOf(grid, merges, col, a.signName);
    const baseline = nameBox.top + nameBox.height - 3 * s;
    page.text(nameBox.x + nameBox.width / 2, baseline, person.name, {
      size: 12 * s,
      font: "bold",
      align: "center",
      maxWidth: nameBox.width,
    });
    page.line(nameBox.x, baseline + 2 * s, nameBox.x + nameBox.width, baseline + 2 * s, 0.7);

    const titleBox = boxOf(grid, merges, titleCol[col], a.signTitle);
    page.text(
      titleBox.x + titleBox.width / 2,
      titleBox.top + titleBox.height - 3 * s,
      person.title,
      { size: 10 * s, font: "italic", align: "center", maxWidth: titleBox.width },
    );
  }

  const noteWidth = right - grid.x[COL.no];
  line(a.note, COL.no, LABELS.note, noteWidth);
  line(a.note2, COL.no, LABELS.note2, noteWidth);

  const mottoBox = boxOf(grid, merges, COL.no, a.motto);
  page.text(
    mottoBox.x + mottoBox.width / 2,
    mottoBox.top + mottoBox.height - 3 * s,
    header.motto,
    { size: 11 * s, font: "bold", align: "center", maxWidth: mottoBox.width },
  );
}

/** The finished form, as a one-page PDF. */
export function payrollPdf(sheet: PayrollSheet): Uint8Array {
  const grid = gridFor(sheet);
  const merges = formMerges(sheet.days, sheet.rows.length);
  const a = formAnchors(sheet.rows.length);
  const page = new PdfPage(PAGE_WIDTH, PAGE_HEIGHT);

  drawGrid(page, grid, merges, ROW.headTop, a.subtotal);
  drawHead(page, sheet, grid, merges);
  drawRoll(page, sheet, grid, merges);
  drawFooter(page, sheet, grid, merges);

  return pdfDocument([page], {
    title: `${sheet.header.title} — ${periodLabel(sheet.year, sheet.month)}`,
    creator: sheet.header.formNo,
  });
}

export function payrollPdfFileName(sheet: PayrollSheet): string {
  return `Payroll ${periodLabel(sheet.year, sheet.month)}.pdf`;
}
