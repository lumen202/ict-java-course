import {
  buildWorkbook,
  cellRef,
  type Cell,
  type Row,
  type SheetSpec,
  type Style,
} from "../xlsx/sheet";
import { periodLabel } from "./calendar";
import {
  CERT_COL,
  COL,
  COLUMN_WIDTHS,
  LABELS,
  ROW,
  formAnchors,
  formMerges,
  rowHeight,
  weekBands,
} from "./form";
import { PRESENT_MARK, type PayrollSheet } from "./model";

// Writes a PayrollSheet as General Form No. 7(A) in .xlsx.
//
// The layout — which column is where, what the standing text says, how the
// merges fall — lives in `form.ts` and is shared with the PDF renderer. This
// file is only concerned with turning that description into spreadsheet cells:
// styles, formulas, and the ruling.
//
// The totals are written as formulas, not as numbers. This is the copy someone
// checks, and a payroll whose arithmetic can't be followed in the cells is one
// they have to re-key. (The PDF, which can't hold a formula, prints the same
// numbers computed by `model.ts` — the functions these formulas mirror.)

const STYLES: Record<string, Style> = {
  // Rows 1-2 — the running head.
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

  // The roll itself.
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

function headerRows(sheet: PayrollSheet): Row[] {
  const period = periodLabel(sheet.year, sheet.month);
  const { header } = sheet;
  const a = formAnchors(sheet.rows.length);

  // Week numbers sit in the first column of each band; the rest of the band is
  // ruled but empty, as are the slots the month never reaches.
  const weekCells: Cell[] = [];
  for (const band of weekBands(sheet.days)) {
    weekCells.push(number(band.from, band.number, "dayHead"));
    for (let col = band.from + 1; col <= band.to; col++) weekCells.push(blank(col, "dayHead"));
  }

  const spare = (style: string): Cell[] => {
    const cells: Cell[] = [];
    for (let col = COL.firstDay + sheet.days.length; col <= COL.lastDay; col++) {
      cells.push(blank(col, style));
    }
    return cells;
  };

  return [
    {
      row: ROW.formNo,
      height: rowHeight(ROW.formNo, a),
      cells: [text(COL.no, header.formNo, "formNo"), text(14, header.title, "title")],
    },
    {
      row: ROW.period,
      height: rowHeight(ROW.period, a),
      cells: [
        text(3, LABELS.forLabor, "labelRight"),
        text(8, LABELS.dash, "labelCenter"),
        text(9, header.project, "fillIn"),
        text(16, LABELS.at, "labelCenter"),
        text(17, header.venue, "fillIn"),
        text(31, LABELS.philippines, "labelLeft"),
        text(34, period, "period"),
      ],
    },
    { row: ROW.gap, height: rowHeight(ROW.gap, a), cells: [] },
    {
      row: ROW.headTop,
      height: rowHeight(ROW.headTop, a),
      cells: [
        text(COL.no, LABELS.no, "head"),
        text(COL.last, LABELS.name, "head"),
        text(COL.label, LABELS.timeRoll, "timeRoll"),
        text(COL.totalDays, LABELS.totalDays, "headSmall"),
        text(COL.transportRate, LABELS.transportation, "headSmall"),
        text(COL.mealRate, LABELS.mealAllowance, "headSmall"),
        text(COL.total, LABELS.totalReceived, "headBold"),
        text(COL.no2, LABELS.no, "head"),
        text(COL.sign, LABELS.signature, "headBold"),
      ],
    },
    {
      row: ROW.week,
      height: rowHeight(ROW.week, a),
      cells: [text(COL.label, LABELS.week, "labelBox"), ...weekCells, ...spare("dayHead")],
    },
    {
      row: ROW.weekday,
      height: rowHeight(ROW.weekday, a),
      cells: [
        text(COL.label, LABELS.day, "labelBox"),
        ...sheet.days.map((d, i) => text(COL.firstDay + i, d.weekday, "dayHead")),
        ...spare("dayHead"),
        text(COL.transportRate, LABELS.dailyRate, "headSmall"),
        text(COL.transportAmount, LABELS.amountDue, "headSmall"),
        text(COL.mealRate, LABELS.dailyRate, "headSmall"),
        text(COL.mealAmount, LABELS.amount, "headSmall"),
      ],
    },
    {
      row: ROW.date,
      height: rowHeight(ROW.date, a),
      cells: [
        text(COL.label, LABELS.date, "labelBox"),
        ...sheet.days.map((d, i) => number(COL.firstDay + i, d.day, "dayDate")),
        ...spare("dayDate"),
        number(COL.totalDays, sheet.days.length, "countHead"),
      ],
    },
  ];
}

function studentRows(sheet: PayrollSheet): Row[] {
  const a = formAnchors(sheet.rows.length);
  const rows: Row[] = [];

  for (let i = 0; i < a.lines; i++) {
    const row = ROW.firstStudent + i;
    const student = sheet.rows[i];
    const cells: Cell[] = [];
    const height = rowHeight(row, a);

    if (!student) {
      // A ruled but empty line. No formulas: a blank row that reports 0.00 in
      // three columns reads as a person who was paid nothing.
      for (let col = COL.no; col <= COL.sign; col++) cells.push(blank(col, "bodyBlank"));
      rows.push({ row, height, cells });
      continue;
    }

    const marked = new Set(student.present);
    const rollRange = `${cellRef(COL.firstDay, row)}:${cellRef(COL.lastDay, row)}`;
    const countRef = cellRef(COL.totalDays, row);

    cells.push(number(COL.no, i + 1, "bodyNo"));
    cells.push(text(COL.last, student.last, "bodyName"));
    cells.push(text(COL.first, student.first, "bodyName"));
    cells.push(text(COL.middle, student.middle, "bodyMiddle"));
    cells.push(blank(COL.label, "bodyBlank"));
    cells.push(blank(COL.labelPad, "bodyBlank"));

    // Every roll slot is a bordered cell; the month's days fill in from the
    // left and the leftovers stay empty, like the template.
    for (let col = COL.firstDay; col <= COL.lastDay; col++) {
      const day = sheet.days[col - COL.firstDay];
      cells.push(
        day && marked.has(day.date) ? text(col, PRESENT_MARK, "bodyMark") : blank(col, "bodyMark"),
      );
    }

    cells.push(formula(COL.totalDays, `COUNTIF(${rollRange},"${PRESENT_MARK}")`, "bodyCount"));
    cells.push(
      student.transportRate > 0
        ? number(COL.transportRate, student.transportRate, "bodyRate")
        : blank(COL.transportRate, "bodyRate"),
    );
    cells.push(
      formula(COL.transportAmount, `${countRef}*${cellRef(COL.transportRate, row)}`, "bodyMoney"),
    );
    cells.push(
      student.mealRate > 0
        ? number(COL.mealRate, student.mealRate, "bodyRate")
        : blank(COL.mealRate, "bodyRate"),
    );
    cells.push(
      student.mealRate > 0
        ? formula(COL.mealAmount, `${countRef}*${cellRef(COL.mealRate, row)}`, "bodyMoney")
        : blank(COL.mealAmount, "bodyMoney"),
    );
    // The template's own formula caps transportation alone, because its meal
    // column was never filled in. Summing both first gives the same number
    // whenever meal is empty and the right one when it isn't. This mirrors
    // totalReceived() in model.ts, which is what the preview and the PDF show.
    cells.push(
      formula(
        COL.total,
        `MIN(${cellRef(COL.transportAmount, row)}+${cellRef(COL.mealAmount, row)},${sheet.cap})`,
        "bodyMoney",
      ),
    );
    cells.push(number(COL.no2, i + 1, "bodyNo"));
    cells.push(blank(COL.sign, "bodyBlank"));

    rows.push({ row, height, cells });
  }

  return rows;
}

function footerRows(sheet: PayrollSheet): Row[] {
  const { header } = sheet;
  const a = formAnchors(sheet.rows.length);

  return [
    {
      row: a.subtotal,
      height: rowHeight(a.subtotal, a),
      cells: [
        text(COL.no, LABELS.subtotal, "subtotalLabel"),
        formula(
          COL.total,
          `SUM(${cellRef(COL.total, ROW.firstStudent)}:${cellRef(COL.total, a.lastStudent)})`,
          "subtotalValue",
        ),
        blank(COL.no2, "bodyBlank"),
        blank(COL.sign, "bodyBlank"),
      ],
    },
    { row: a.footerGap, height: rowHeight(a.footerGap, a), cells: [] },
    {
      row: a.cert,
      height: rowHeight(a.cert, a),
      cells: [
        text(CERT_COL.oneNum, "1.", "certNum"),
        text(CERT_COL.one, LABELS.cert1, "cert"),
        text(CERT_COL.twoNum, "2.", "certNum"),
        text(CERT_COL.two, LABELS.cert2, "cert"),
        text(CERT_COL.three, LABELS.cert3a, "cert"),
      ],
    },
    {
      row: a.cert2,
      height: rowHeight(a.cert2, a),
      cells: [
        text(CERT_COL.one, LABELS.cert1b, "cert"),
        text(CERT_COL.three, LABELS.cert3b, "cert"),
      ],
    },
    {
      row: a.cert3,
      height: rowHeight(a.cert3, a),
      cells: [text(CERT_COL.three, LABELS.cert3c, "cert")],
    },
    {
      row: a.signName,
      height: rowHeight(a.signName, a),
      cells: [
        text(3, header.certifier.name, "signName"),
        text(12, header.approver.name, "signName"),
        text(30, header.payer.name, "signName"),
      ],
    },
    {
      row: a.signTitle,
      height: rowHeight(a.signTitle, a),
      cells: [
        text(3, header.certifier.title, "signTitle"),
        text(13, header.approver.title, "signTitle"),
        text(30, header.payer.title, "signTitle"),
      ],
    },
    {
      row: a.note,
      height: rowHeight(a.note, a),
      cells: [text(COL.no, LABELS.note, "note")],
    },
    {
      row: a.note2,
      height: rowHeight(a.note2, a),
      cells: [text(COL.no, LABELS.note2, "note")],
    },
    {
      row: a.motto,
      height: rowHeight(a.motto, a),
      cells: [text(COL.no, header.motto, "motto")],
    },
  ];
}

/** The sheet as it will be laid out — the same description the preview mirrors. */
export function payrollSpec(sheet: PayrollSheet): SheetSpec {
  return {
    name: periodLabel(sheet.year, sheet.month),
    columns: COLUMN_WIDTHS,
    rows: [...headerRows(sheet), ...studentRows(sheet), ...footerRows(sheet)],
    merges: formMerges(sheet.days, sheet.rows.length).map(
      (m) => `${cellRef(m.c1, m.r1)}:${cellRef(m.c2, m.r2)}`,
    ),
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
