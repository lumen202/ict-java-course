import { utf8, zipSync } from "./zip";

// Just enough SpreadsheetML to write one formatted worksheet: values, formulas,
// merges, column widths, borders and fonts. Everything is declared as data and
// rendered here, so the payroll layout (see src/lib/payroll/workbook.ts) reads
// as a description of the form rather than as string concatenation.

export type CellValue =
  | { kind: "number"; value: number }
  | { kind: "text"; value: string }
  /** Written without a cached result; the workbook asks Excel to calculate on open. */
  | { kind: "formula"; value: string };

export type Cell = {
  /** 1-based column. */
  col: number;
  value?: CellValue;
  /** A key from the style table passed to buildWorkbook(). */
  style?: string;
};

export type Row = {
  /** 1-based row number. */
  row: number;
  /** Points, matching Excel's own unit. */
  height?: number;
  cells: Cell[];
};

export type ColumnWidth = { from: number; to: number; width: number };

export type Style = {
  font?: { size?: number; bold?: boolean; italic?: boolean; underline?: boolean; name?: string };
  align?: {
    horizontal?: "left" | "center" | "right";
    vertical?: "top" | "center" | "bottom";
    wrap?: boolean;
  };
  /** Thin black edges. Anything omitted is no edge at all. */
  border?: { top?: boolean; bottom?: boolean; left?: boolean; right?: boolean };
  /** Solid background, as RRGGBB. */
  fill?: string;
  /** An Excel number format code, e.g. "#,##0". */
  numberFormat?: string;
};

export type SheetSpec = {
  /** Becomes the tab name; Excel rejects > 31 characters and : \ / ? * [ ]. */
  name: string;
  columns: ColumnWidth[];
  rows: Row[];
  /** "A1:D4" ranges. */
  merges: string[];
  /** Rows/columns held still while the rest scrolls. */
  freeze?: { rows: number; columns: number };
  showGridLines?: boolean;
  page?: { orientation?: "portrait" | "landscape"; fitToWidth?: boolean };
};

/** 1 -> A, 27 -> AA. */
export function columnName(index: number): string {
  let name = "";
  let n = index;
  while (n > 0) {
    const rem = (n - 1) % 26;
    name = String.fromCharCode(65 + rem) + name;
    n = Math.floor((n - 1) / 26);
  }
  return name;
}

export function cellRef(col: number, row: number): string {
  return `${columnName(col)}${row}`;
}

export function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Excel's sheet-name rules; a period label like "AUGUST 2025" passes untouched. */
function safeSheetName(name: string): string {
  const cleaned = name.replace(/[:\\/?*[\]]/g, " ").trim();
  return (cleaned || "Sheet1").slice(0, 31);
}

// ---------------------------------------------------------------------------
// styles.xml
//
// One font / fill / border per declared style rather than a deduplicated table:
// the file grows by a few hundred bytes and the mapping stays obvious. The
// fixed entries at the front are Excel's requirement, not a choice — fill 0
// must be "none" and fill 1 must be "gray125" or it refuses the workbook.
// ---------------------------------------------------------------------------

const FIRST_CUSTOM_NUMBER_FORMAT = 164;

function fontXml(style: Style): string {
  const font = style.font ?? {};
  return [
    "<font>",
    font.bold ? "<b/>" : "",
    font.italic ? "<i/>" : "",
    font.underline ? "<u/>" : "",
    `<sz val="${font.size ?? 10}"/>`,
    `<name val="${escapeXml(font.name ?? "Arial")}"/>`,
    "</font>",
  ].join("");
}

function borderXml(style: Style): string {
  const edge = (side: "left" | "right" | "top" | "bottom") =>
    style.border?.[side] ? `<${side} style="thin"><color rgb="FF000000"/></${side}>` : `<${side}/>`;
  return `<border>${edge("left")}${edge("right")}${edge("top")}${edge("bottom")}<diagonal/></border>`;
}

function fillXml(style: Style): string {
  if (!style.fill) return '<fill><patternFill patternType="none"/></fill>';
  return `<fill><patternFill patternType="solid"><fgColor rgb="FF${style.fill}"/><bgColor indexed="64"/></patternFill></fill>`;
}

function alignmentXml(style: Style): string {
  const align = style.align;
  if (!align) return "";
  const parts = [
    align.horizontal ? ` horizontal="${align.horizontal}"` : "",
    align.vertical ? ` vertical="${align.vertical}"` : "",
    align.wrap ? ' wrapText="1"' : "",
  ].join("");
  return parts ? `<alignment${parts}/>` : "";
}

function buildStyles(styles: Record<string, Style>): { xml: string; index: Record<string, number> } {
  const names = Object.keys(styles);
  const index: Record<string, number> = {};
  names.forEach((name, i) => {
    index[name] = i + 1; // 0 is the default xf
  });

  const numberFormats: string[] = [];
  const numberFormatId = new Map<string, number>();
  for (const name of names) {
    const code = styles[name].numberFormat;
    if (!code || numberFormatId.has(code)) continue;
    const id = FIRST_CUSTOM_NUMBER_FORMAT + numberFormatId.size;
    numberFormatId.set(code, id);
    numberFormats.push(`<numFmt numFmtId="${id}" formatCode="${escapeXml(code)}"/>`);
  }

  const xfs = names.map((name, i) => {
    const style = styles[name];
    const fmtId = style.numberFormat ? (numberFormatId.get(style.numberFormat) ?? 0) : 0;
    const alignment = alignmentXml(style);
    const attrs =
      `numFmtId="${fmtId}" fontId="${i + 1}" fillId="${i + 2}" borderId="${i + 1}" xfId="0"` +
      ` applyFont="1" applyBorder="1" applyFill="1"` +
      (style.numberFormat ? ' applyNumberFormat="1"' : "") +
      (alignment ? ' applyAlignment="1"' : "");
    return alignment ? `<xf ${attrs}>${alignment}</xf>` : `<xf ${attrs}/>`;
  });

  const xml =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
    (numberFormats.length
      ? `<numFmts count="${numberFormats.length}">${numberFormats.join("")}</numFmts>`
      : "") +
    `<fonts count="${names.length + 1}">` +
    `<font><sz val="10"/><name val="Arial"/></font>` +
    names.map((n) => fontXml(styles[n])).join("") +
    `</fonts>` +
    `<fills count="${names.length + 2}">` +
    `<fill><patternFill patternType="none"/></fill>` +
    `<fill><patternFill patternType="gray125"/></fill>` +
    names.map((n) => fillXml(styles[n])).join("") +
    `</fills>` +
    `<borders count="${names.length + 1}">` +
    `<border><left/><right/><top/><bottom/><diagonal/></border>` +
    names.map((n) => borderXml(styles[n])).join("") +
    `</borders>` +
    `<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>` +
    `<cellXfs count="${xfs.length + 1}">` +
    `<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>` +
    xfs.join("") +
    `</cellXfs>` +
    `<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>` +
    `</styleSheet>`;

  return { xml, index };
}

// ---------------------------------------------------------------------------
// The worksheet itself.
// ---------------------------------------------------------------------------

function cellXml(cell: Cell, row: number, styleIndex: Record<string, number>): string {
  const ref = cellRef(cell.col, row);
  const s = cell.style ? styleIndex[cell.style] : undefined;
  const attrs = `r="${ref}"${s === undefined ? "" : ` s="${s}"`}`;

  if (!cell.value) return `<c ${attrs}/>`;
  if (cell.value.kind === "number") return `<c ${attrs}><v>${cell.value.value}</v></c>`;
  if (cell.value.kind === "formula") {
    return `<c ${attrs}><f>${escapeXml(cell.value.value)}</f></c>`;
  }
  return `<c ${attrs} t="inlineStr"><is><t xml:space="preserve">${escapeXml(cell.value.value)}</t></is></c>`;
}

function dimension(rows: Row[]): string {
  let maxCol = 1;
  let maxRow = 1;
  for (const row of rows) {
    maxRow = Math.max(maxRow, row.row);
    for (const cell of row.cells) maxCol = Math.max(maxCol, cell.col);
  }
  return `A1:${cellRef(maxCol, maxRow)}`;
}

function sheetXml(spec: SheetSpec, styleIndex: Record<string, number>): string {
  const rows = [...spec.rows]
    .sort((a, b) => a.row - b.row)
    .map((row) => {
      const cells = [...row.cells].sort((a, b) => a.col - b.col);
      const attrs = `r="${row.row}"${row.height ? ` ht="${row.height}" customHeight="1"` : ""}`;
      return `<row ${attrs}>${cells.map((c) => cellXml(c, row.row, styleIndex)).join("")}</row>`;
    });

  const freeze = spec.freeze
    ? `<pane xSplit="${spec.freeze.columns}" ySplit="${spec.freeze.rows}"` +
      ` topLeftCell="${cellRef(spec.freeze.columns + 1, spec.freeze.rows + 1)}"` +
      ` activePane="bottomRight" state="frozen"/>`
    : "";

  return (
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
    (spec.page?.fitToWidth ? `<sheetPr><pageSetUpPr fitToPage="1"/></sheetPr>` : "") +
    `<dimension ref="${dimension(spec.rows)}"/>` +
    `<sheetViews><sheetView workbookViewId="0"${
      spec.showGridLines === false ? ' showGridLines="0"' : ""
    }>${freeze}</sheetView></sheetViews>` +
    `<sheetFormatPr defaultRowHeight="12.75"/>` +
    (spec.columns.length
      ? `<cols>${spec.columns
          .map((c) => `<col min="${c.from}" max="${c.to}" width="${c.width}" customWidth="1"/>`)
          .join("")}</cols>`
      : "") +
    `<sheetData>${rows.join("")}</sheetData>` +
    (spec.merges.length
      ? `<mergeCells count="${spec.merges.length}">${spec.merges
          .map((ref) => `<mergeCell ref="${ref}"/>`)
          .join("")}</mergeCells>`
      : "") +
    `<pageMargins left="0.25" right="0.25" top="0.5" bottom="0.5" header="0.3" footer="0.3"/>` +
    `<pageSetup orientation="${spec.page?.orientation ?? "portrait"}" paperSize="9"${
      spec.page?.fitToWidth ? ' fitToWidth="1" fitToHeight="0"' : ""
    }/>` +
    `</worksheet>`
  );
}

/** The finished .xlsx, ready to hand to a browser as a download. */
export function buildWorkbook(spec: SheetSpec, styles: Record<string, Style>): Uint8Array {
  const { xml: stylesXml, index } = buildStyles(styles);
  const name = safeSheetName(spec.name);

  return zipSync([
    {
      name: "[Content_Types].xml",
      data: utf8(
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
          `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
          `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
          `<Default Extension="xml" ContentType="application/xml"/>` +
          `<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>` +
          `<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>` +
          `<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>` +
          `</Types>`,
      ),
    },
    {
      name: "_rels/.rels",
      data: utf8(
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
          `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
          `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>` +
          `</Relationships>`,
      ),
    },
    {
      name: "xl/workbook.xml",
      data: utf8(
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
          `<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"` +
          ` xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">` +
          `<sheets><sheet name="${escapeXml(name)}" sheetId="1" r:id="rId1"/></sheets>` +
          // Nothing here caches a formula result, so ask for a full calculation
          // on open — without it some readers show empty totals until edited.
          `<calcPr calcId="0" fullCalcOnLoad="1"/>` +
          `</workbook>`,
      ),
    },
    {
      name: "xl/_rels/workbook.xml.rels",
      data: utf8(
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
          `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
          `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>` +
          `<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>` +
          `</Relationships>`,
      ),
    },
    { name: "xl/styles.xml", data: utf8(stylesXml) },
    { name: "xl/worksheets/sheet1.xml", data: utf8(sheetXml(spec, index)) },
  ]);
}
