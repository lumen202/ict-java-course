import type { ClassDay } from "./calendar";

// The one description of General Form No. 7(A)'s geometry and standing text,
// read out of the teacher's own workbook (` E2PS ICT PHASE 2 Payroll
// 2026-2027.xlsx`, AUGUST sheet).
//
// Two renderers read this: `workbook.ts` writes it as .xlsx cells, `pdf.ts`
// draws it as lines and text on legal paper. Neither owns the layout. A second
// hand-maintained copy of these numbers would drift the moment one renderer
// was adjusted and the other wasn't, and the drift would show up as a filed
// document that doesn't match the one on screen.
//
// The geometry is FIXED, not month-shaped: the time roll always spans G:AC —
// 23 slots, the widest month possible — and a month fills slots from G, leaving
// the leftovers ruled but empty. The teacher's own AUGUST sheet uses 18 of 23.

/** 1-based column numbers, exactly where the template rules them. */
export const COL = {
  no: 1, // A
  last: 2, // B
  first: 3, // C
  middle: 4, // D
  label: 5, // E — "Week" / "Day" / "Date"
  labelPad: 6, // F — a 0.38-wide sliver, always merged into E
  firstDay: 7, // G
  lastDay: 29, // AC
  totalDays: 30, // AD
  transportRate: 31, // AE
  transportAmount: 32, // AF
  mealRate: 33, // AG
  mealAmount: 34, // AH
  total: 35, // AI
  no2: 36, // AJ
  sign: 37, // AK
} as const;

/** How many day slots the roll has, filled or not. */
export const ROLL_SLOTS = COL.lastDay - COL.firstDay + 1;

export const ROW = {
  formNo: 1,
  period: 2,
  gap: 3,
  headTop: 4,
  week: 5,
  weekday: 6,
  date: 7,
  firstStudent: 8,
} as const;

/**
 * The paper form is ruled for ten names whether or not ten turn up, and the
 * teacher writes late additions in by hand — so short classes keep their blank
 * lines instead of collapsing the sheet.
 */
export const MIN_STUDENT_ROWS = 10;

/** Column widths in Excel's character unit, as the template rules them. */
export const COLUMN_WIDTHS: { from: number; to: number; width: number }[] = [
  { from: COL.no, to: COL.no, width: 2.75 },
  { from: COL.last, to: COL.last, width: 12.38 },
  { from: COL.first, to: COL.first, width: 22 },
  { from: COL.middle, to: COL.middle, width: 3.13 },
  { from: COL.label, to: COL.label, width: 3.88 },
  { from: COL.labelPad, to: COL.labelPad, width: 0.38 },
  { from: COL.firstDay, to: COL.lastDay, width: 2.38 },
  { from: COL.totalDays, to: COL.totalDays, width: 4.38 },
  { from: COL.transportRate, to: COL.transportRate, width: 6.38 },
  { from: COL.transportAmount, to: COL.transportAmount, width: 8 },
  { from: COL.mealRate, to: COL.mealAmount, width: 5.38 },
  { from: COL.total, to: COL.total, width: 13.13 },
  { from: COL.no2, to: COL.no2, width: 2.88 },
  { from: COL.sign, to: COL.sign, width: 14.25 },
];

/** Every column's width, indexed 1..COL.sign — the flattened form of the above. */
export function columnWidths(): number[] {
  const widths = new Array<number>(COL.sign + 1).fill(0);
  for (const span of COLUMN_WIDTHS) {
    for (let col = span.from; col <= span.to; col++) widths[col] = span.width;
  }
  return widths;
}

/** Where the footer lands, which depends only on how many lines the roll is ruled for. */
export function formAnchors(studentCount: number) {
  const lines = Math.max(studentCount, MIN_STUDENT_ROWS);
  const lastStudent = ROW.firstStudent + lines - 1;
  const subtotal = lastStudent + 1;
  const cert = subtotal + 2;
  return {
    lines,
    lastStudent,
    subtotal,
    footerGap: subtotal + 1,
    cert,
    cert2: cert + 1,
    cert3: cert + 2,
    signName: cert + 3,
    signTitle: cert + 4,
    note: cert + 5,
    note2: cert + 6,
    motto: cert + 7,
  };
}

export type FormAnchors = ReturnType<typeof formAnchors>;

/** Row heights in points — Excel's own unit, so the PDF can use them directly. */
export function rowHeight(row: number, a: FormAnchors): number {
  if (row === ROW.formNo) return 32.25;
  if (row === ROW.period) return 18;
  if (row === ROW.gap) return 10.5;
  if (row === ROW.headTop) return 15.75;
  if (row === ROW.week) return 13.5;
  if (row === ROW.weekday) return 15;
  if (row === ROW.date) return 16.5;
  if (row >= ROW.firstStudent && row <= a.subtotal) return 24.75;
  if (row === a.footerGap) return 6;
  if (row === a.cert || row === a.cert2 || row === a.cert3) return 11.25;
  if (row === a.signName) return 30;
  return 13.5;
}

/** A merged block, in 1-based column/row coordinates, inclusive at both ends. */
export type MergeRect = { c1: number; r1: number; c2: number; r2: number };

/**
 * Every merged block on the sheet.
 *
 * The xlsx writes these as `mergeCells`; the PDF uses them the other way round,
 * to know which grid lines *not* to draw. Deriving both from one list is what
 * keeps a merge in the spreadsheet from showing up as a stray rule in the
 * printed copy.
 */
export function formMerges(days: ClassDay[], studentCount: number): MergeRect[] {
  const a = formAnchors(studentCount);
  const rects: MergeRect[] = [];
  const add = (c1: number, r1: number, c2: number, r2: number) => {
    // A merge of a single cell is invalid, and a one-day week produces one.
    if (c1 === c2 && r1 === r2) return;
    rects.push({ c1, r1, c2, r2 });
  };

  // Row 2 — the underlined fill-ins.
  add(9, ROW.period, 15, ROW.period); // I2:O2 project
  add(17, ROW.period, COL.totalDays, ROW.period); // Q2:AD2 venue
  add(34, ROW.period, 36, ROW.period); // AH2:AJ2 period

  // The header block over the roll and the totals.
  add(COL.no, ROW.headTop, COL.no, ROW.date); // A4:A7
  add(COL.last, ROW.headTop, COL.middle, ROW.date); // B4:D7
  add(COL.label, ROW.headTop, COL.lastDay, ROW.headTop); // E4:AC4
  add(COL.label, ROW.week, COL.labelPad, ROW.week); // E5:F5
  add(COL.label, ROW.weekday, COL.labelPad, ROW.weekday); // E6:F6
  add(COL.label, ROW.date, COL.labelPad, ROW.date); // E7:F7
  add(COL.totalDays, ROW.headTop, COL.totalDays, ROW.weekday); // AD4:AD6
  add(COL.transportRate, ROW.headTop, COL.transportAmount, ROW.week); // AE4:AF5
  add(COL.mealRate, ROW.headTop, COL.mealAmount, ROW.week); // AG4:AH5
  add(COL.transportRate, ROW.weekday, COL.transportRate, ROW.date); // AE6:AE7
  add(COL.transportAmount, ROW.weekday, COL.transportAmount, ROW.date); // AF6:AF7
  add(COL.mealRate, ROW.weekday, COL.mealRate, ROW.date); // AG6:AG7
  add(COL.mealAmount, ROW.weekday, COL.mealAmount, ROW.date); // AH6:AH7
  add(COL.total, ROW.headTop, COL.total, ROW.date); // AI4:AI7
  add(COL.no2, ROW.headTop, COL.no2, ROW.date); // AJ4:AJ7
  add(COL.sign, ROW.headTop, COL.sign, ROW.date); // AK4:AK7

  // Week bands over the days that exist.
  for (const band of weekBands(days)) {
    add(band.from, ROW.week, band.to, ROW.week);
  }

  // E:F stays merged down every ruled line.
  for (let row = ROW.firstStudent; row <= a.lastStudent; row++) {
    add(COL.label, row, COL.labelPad, row);
  }

  add(COL.no, a.subtotal, COL.mealAmount, a.subtotal); // A18:AH18

  // Signature lines.
  add(3, a.signName, 7, a.signName); // C:G certifier
  add(12, a.signName, 24, a.signName); // L:X approver
  add(30, a.signName, 33, a.signName); // AD:AG payer
  add(3, a.signTitle, 7, a.signTitle);
  add(13, a.signTitle, 23, a.signTitle); // M:W
  add(30, a.signTitle, 33, a.signTitle);

  add(COL.no, a.motto, COL.sign, a.motto); // A27:AK27

  return rects;
}

/**
 * The week bands across the roll, as column spans with their printed number.
 *
 * Numbered by position rather than by the day's own week index, so dropping a
 * whole week (a holiday break) doesn't leave a gap in the numbering the way it
 * leaves one in the calendar.
 */
export function weekBands(days: ClassDay[]): { from: number; to: number; number: number }[] {
  const bands: { from: number; to: number; number: number }[] = [];
  let start = 0;
  let number = 0;

  for (let i = 0; i <= days.length; i++) {
    if (i < days.length && days[i].week === days[start].week) continue;
    number++;
    bands.push({ from: COL.firstDay + start, to: COL.firstDay + i - 1, number });
    start = i;
  }

  return bands;
}

/** The standing text printed on the form, wherever it isn't a number. */
export const LABELS = {
  forLabor: "For labor on",
  dash: "-",
  at: ",at",
  philippines: ", Philippines, for the period,",

  no: "No.",
  name: "Name",
  timeRoll: "TIME ROLL",
  totalDays: "Total No. of Days",
  transportation: "Transportation",
  mealAllowance: "Meal Allowance",
  totalReceived: "Total Amount Received",
  signature: "Signature",
  dailyRate: "Daily Rate",
  amountDue: "Amount Due",
  amount: "Amount",
  week: "Week",
  day: "Day",
  date: "Date",

  subtotal: "SUB - TOTAL FOR THIS PAGE",

  cert1: "I  HEREBY  CERTIFY  on my official oath to the correctness of the above roll.",
  cert1b: "Payment is also hereby approved from the appropriation indicated.",
  cert2: "APPROVED :",
  cert3a:
    "3. I HEREBY CERTIFY on my official oath that I have this ________ day of ______________, paid in cash to each man whose",
  cert3b:
    "    name appears  on the above  roll,  the  amount  set opposite his name,  he  having presented himself established his identity",
  cert3c: "    and  affixed  his signature  or  thumbmark  on the  space  provided thereof. ",

  note: "*NOTE:Where thumbmark is to be used in place of signature, and the space available is not sufficient, the thumbmark may be impressed on the back hereof with proper indication of the corresponding student's number and on the corresponding line on the payroll",
  note2: 'a remark, "see thumbmark on the back" should be written.',
} as const;

/** Anchors for the certification block's three columns. */
export const CERT_COL = { one: COL.last, oneNum: COL.no, two: 13, twoNum: 12, three: 26 } as const;
