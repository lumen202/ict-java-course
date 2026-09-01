// Enough PDF to draw one ruled form: lines, rectangles and left/centre/right
// text in the standard Helvetica family. No font embedding and no compression,
// for the same reason the .xlsx writer stores rather than deflates its entries
// — the file is small either way, and the writer stays arithmetic.
//
// Two things here are load-bearing and easy to get subtly wrong:
//
//  1. **The cross-reference table is byte offsets, not string offsets.** Every
//     object's position is measured on the encoded bytes as they are appended,
//     never on `String.length`. Get this wrong and the file still opens in a
//     forgiving viewer and is rejected by a strict one, which is the worst
//     possible failure mode for a document that gets filed.
//  2. **Text is Latin-1, one char to one byte.** Anything outside that is
//     escaped or replaced before it reaches the stream, so the byte count of a
//     content stream is knowable without re-encoding it.

export type FontName = "regular" | "bold" | "italic" | "boldItalic";

const FONT_RESOURCE: Record<FontName, string> = {
  regular: "F1",
  bold: "F2",
  italic: "F3",
  boldItalic: "F4",
};

const BASE_FONT: Record<FontName, string> = {
  regular: "Helvetica",
  bold: "Helvetica-Bold",
  italic: "Helvetica-Oblique",
  boldItalic: "Helvetica-BoldOblique",
};

// Adobe's own AFM widths for codes 32-126, in 1/1000 em. The oblique faces
// have the same widths as their upright counterparts, which is why only two
// tables are needed. Anything outside this range falls back to a lowercase-n
// width — the roster is ASCII, and a wrong guess only shifts centring slightly.
// prettier-ignore
const HELVETICA = [
  278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278,
  556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556,
  1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778,
  667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556,
  333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556,
  556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584,
];
// prettier-ignore
const HELVETICA_BOLD = [
  278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278, 278,
  556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 333, 333, 584, 584, 584, 611,
  975, 722, 722, 722, 722, 667, 611, 778, 722, 278, 556, 722, 611, 833, 722, 778,
  667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 333, 278, 333, 584, 556,
  333, 556, 611, 556, 611, 556, 333, 611, 611, 278, 278, 556, 278, 889, 611, 611,
  611, 611, 389, 556, 333, 611, 556, 778, 556, 556, 500, 389, 280, 389, 584,
];

const FALLBACK_WIDTH = 556;

function widthTable(font: FontName): number[] {
  return font === "bold" || font === "boldItalic" ? HELVETICA_BOLD : HELVETICA;
}

/** How wide `text` renders, in points. */
export function textWidth(text: string, font: FontName, size: number): number {
  const table = widthTable(font);
  let total = 0;
  for (const ch of latin1(text)) {
    const code = ch.charCodeAt(0);
    const w = code >= 32 && code <= 126 ? table[code - 32] : FALLBACK_WIDTH;
    total += w;
  }
  return (total * size) / 1000;
}

/**
 * Everything the standard fonts can't show becomes something they can.
 * A filed payroll with a black diamond in a student's name is worse than one
 * with a plain letter, so the few characters that turn up in practice are
 * mapped rather than dropped.
 */
function latin1(text: string): string {
  let out = "";
  for (const ch of text) {
    const code = ch.codePointAt(0) ?? 63;
    if (code === 0x2019 || code === 0x2018) out += "'";
    else if (code === 0x201c || code === 0x201d) out += '"';
    else if (code === 0x2013 || code === 0x2014) out += "-";
    else if (code === 0x20b1) out += "P"; // ₱ — not in WinAnsi
    else if (code <= 0xff) out += ch;
    else out += "?";
  }
  return out;
}

function escapeString(text: string): string {
  let out = "";
  for (const ch of latin1(text)) {
    const code = ch.charCodeAt(0);
    if (ch === "(" || ch === ")" || ch === "\\") out += `\\${ch}`;
    else if (code < 32 || code > 126) out += `\\${code.toString(8).padStart(3, "0")}`;
    else out += ch;
  }
  return out;
}

function num(value: number): string {
  // Three decimals is finer than any printer resolves, and keeps the stream
  // free of exponent notation, which PDF does not accept.
  return (Math.round(value * 1000) / 1000).toString();
}

/** Greedy wrap on spaces. A single word wider than the box gets its own line. */
export function wrapLines(
  value: string,
  font: FontName,
  size: number,
  maxWidth: number,
): string[] {
  const words = value.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && textWidth(candidate, font, size) > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export type TextOptions = {
  font?: FontName;
  size?: number;
  align?: "left" | "center" | "right";
  /**
   * Shrink the type until the text fits this width, down to `minSize`.
   * The certification paragraphs are set in Arial Narrow on the paper form and
   * overflow their cells into empty ones; Helvetica is wider and a PDF has no
   * neighbouring cell to spill into, so they are fitted instead of clipped.
   */
  maxWidth?: number;
  minSize?: number;
};

/**
 * One page, drawn in **top-down** coordinates — y grows downward from the top
 * edge, which is how the form is described. PDF's own axis points the other
 * way; the flip happens here so no caller has to think about it.
 */
export class PdfPage {
  readonly width: number;
  readonly height: number;
  private readonly ops: string[] = [];

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  private y(top: number): number {
    return this.height - top;
  }

  line(x1: number, y1: number, x2: number, y2: number, weight = 0.5): this {
    this.ops.push(
      `${num(weight)} w ${num(x1)} ${num(this.y(y1))} m ${num(x2)} ${num(this.y(y2))} l S`,
    );
    return this;
  }

  rect(x: number, y: number, width: number, height: number, weight = 0.5): this {
    this.ops.push(
      `${num(weight)} w ${num(x)} ${num(this.y(y + height))} ${num(width)} ${num(height)} re S`,
    );
    return this;
  }

  /** `y` is the text baseline. */
  text(x: number, y: number, value: string, options: TextOptions = {}): this {
    const body = latin1(value);
    if (!body.trim()) return this;

    const font = options.font ?? "regular";
    let size = options.size ?? 10;
    if (options.maxWidth) {
      const floor = options.minSize ?? 4;
      while (size > floor && textWidth(body, font, size) > options.maxWidth) {
        size -= 0.25;
      }
    }

    const width = textWidth(body, font, size);
    const align = options.align ?? "left";
    const left = align === "center" ? x - width / 2 : align === "right" ? x - width : x;

    this.ops.push(
      `BT /${FONT_RESOURCE[font]} ${num(size)} Tf` +
        ` 1 0 0 1 ${num(left)} ${num(this.y(y))} Tm (${escapeString(body)}) Tj ET`,
    );
    return this;
  }

  /**
   * Text centred in a box, both ways.
   *
   * The vertical centring puts the middle of the capitals on the middle of the
   * box rather than the baseline, which is what "centred" looks like to a
   * reader. Helvetica's cap height is 0.717 em.
   */
  textInBox(
    x: number,
    top: number,
    width: number,
    height: number,
    value: string,
    options: TextOptions = {},
  ): this {
    const size = options.size ?? 10;
    const baseline = top + height / 2 + (0.717 * size) / 2;
    const align = options.align ?? "center";
    const inset = 1.5;
    const anchor = align === "center" ? x + width / 2 : align === "right" ? x + width - inset : x + inset;
    return this.text(anchor, baseline, value, {
      ...options,
      align,
      maxWidth: options.maxWidth ?? width - inset * 2,
    });
  }

  /**
   * Text wrapped on spaces and centred in a box, both ways.
   *
   * The narrow header cells ("Total No. of Days" over a 27pt column) wrap on
   * the paper form; shrinking them to fit on one line instead would land at
   * around 3pt and be unreadable, so they wrap here too — and only shrink once
   * wrapping alone can't fit the block in the box.
   */
  textBlock(
    x: number,
    top: number,
    width: number,
    height: number,
    value: string,
    options: TextOptions = {},
  ): this {
    const font = options.font ?? "regular";
    const inset = 1.5;
    const room = width - inset * 2;
    const floor = options.minSize ?? 4;

    let size = options.size ?? 10;
    let lines = wrapLines(value, font, size, room);
    while (size > floor && lines.length * size * 1.15 > height) {
      size -= 0.25;
      lines = wrapLines(value, font, size, room);
    }

    const leading = size * 1.15;
    const blockTop = top + (height - lines.length * leading) / 2;
    const align = options.align ?? "center";
    const anchor =
      align === "center" ? x + width / 2 : align === "right" ? x + width - inset : x + inset;

    lines.forEach((line, i) => {
      this.text(anchor, blockTop + leading * (i + 1) - size * 0.28, line, {
        ...options,
        size,
        align,
        maxWidth: room,
        minSize: floor,
      });
    });
    return this;
  }

  /**
   * The present mark, drawn as two strokes rather than set as a character.
   *
   * The form uses ✓ (U+2713), which none of the standard PDF fonts contain —
   * reaching it would mean either embedding a font or trusting the ZapfDingbats
   * encoding table, and a wrong code there prints a *different dingbat* in a
   * document that says who gets paid. Two line segments cannot be misencoded.
   */
  check(centreX: number, centreY: number, size: number, weight = 0.9): this {
    const h = size / 2;
    this.ops.push(
      `${num(weight)} w 1 J 1 j` +
        ` ${num(centreX - h)} ${num(this.y(centreY + h * 0.1))} m` +
        ` ${num(centreX - h * 0.25)} ${num(this.y(centreY + h * 0.75))} l` +
        ` ${num(centreX + h)} ${num(this.y(centreY - h * 0.7))} l S`,
    );
    return this;
  }

  content(): string {
    return this.ops.join("\n");
  }
}

/** Latin-1 bytes. One character in, one byte out — see the note at the top. */
function bytes(text: string): Uint8Array {
  const out = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i++) out[i] = text.charCodeAt(i) & 0xff;
  return out;
}

export type PdfMeta = { title?: string; author?: string; creator?: string };

/** The finished PDF, ready to hand to a browser as a download. */
export function pdfDocument(pages: PdfPage[], meta: PdfMeta = {}): Uint8Array {
  if (pages.length === 0) throw new Error("A PDF needs at least one page.");

  const chunks: Uint8Array[] = [];
  let length = 0;
  const offsets: number[] = [];

  const push = (text: string) => {
    const encoded = bytes(text);
    chunks.push(encoded);
    length += encoded.length;
  };

  // Object numbering: 1 catalog, 2 page tree, 3 info, 4-7 fonts, then a page
  // and a content stream for each page.
  const FIRST_PAGE_OBJ = 8;
  const pageObj = (i: number) => FIRST_PAGE_OBJ + i * 2;
  const contentObj = (i: number) => FIRST_PAGE_OBJ + i * 2 + 1;
  // The highest object number actually written. `contentObj` of the last page
  // is the last one, so this is that number — not one past it. Claiming an
  // object in the xref that was never emitted leaves a file that opens anyway
  // in a lenient viewer and is rejected by a strict one.
  const objectCount = contentObj(pages.length - 1);

  const startObject = (n: number) => {
    offsets[n] = length;
    push(`${n} 0 obj\n`);
  };
  const endObject = () => push("endobj\n");

  push("%PDF-1.4\n");
  // A comment of high bytes marks the file as binary for tools that sniff it.
  push("%\xE2\xE3\xCF\xD3\n");

  startObject(1);
  push(`<< /Type /Catalog /Pages 2 0 R >>\n`);
  endObject();

  startObject(2);
  const kids = pages.map((_, i) => `${pageObj(i)} 0 R`).join(" ");
  push(`<< /Type /Pages /Kids [${kids}] /Count ${pages.length} >>\n`);
  endObject();

  startObject(3);
  const info = [
    meta.title ? `/Title (${escapeString(meta.title)})` : "",
    meta.author ? `/Author (${escapeString(meta.author)})` : "",
    `/Creator (${escapeString(meta.creator ?? "ICT course payroll")})`,
  ]
    .filter(Boolean)
    .join(" ");
  push(`<< ${info} >>\n`);
  endObject();

  (["regular", "bold", "italic", "boldItalic"] as FontName[]).forEach((font, i) => {
    startObject(4 + i);
    push(
      `<< /Type /Font /Subtype /Type1 /BaseFont /${BASE_FONT[font]}` +
        ` /Encoding /WinAnsiEncoding >>\n`,
    );
    endObject();
  });

  const fontResources = (["regular", "bold", "italic", "boldItalic"] as FontName[])
    .map((font, i) => `/${FONT_RESOURCE[font]} ${4 + i} 0 R`)
    .join(" ");

  pages.forEach((page, i) => {
    startObject(pageObj(i));
    push(
      `<< /Type /Page /Parent 2 0 R` +
        ` /MediaBox [0 0 ${num(page.width)} ${num(page.height)}]` +
        ` /Resources << /Font << ${fontResources} >> >>` +
        ` /Contents ${contentObj(i)} 0 R >>\n`,
    );
    endObject();

    const stream = page.content();
    startObject(contentObj(i));
    // The length is the encoded byte count, which for Latin-1 is the character
    // count — but it is measured, not assumed.
    push(`<< /Length ${bytes(stream).length} >>\nstream\n`);
    push(stream);
    push("\nendstream\n");
    endObject();
  });

  const xrefAt = length;
  push(`xref\n0 ${objectCount + 1}\n`);
  push("0000000000 65535 f \n");
  for (let n = 1; n <= objectCount; n++) {
    push(`${String(offsets[n]).padStart(10, "0")} 00000 n \n`);
  }
  push(`trailer\n<< /Size ${objectCount + 1} /Root 1 0 R /Info 3 0 R >>\n`);
  push(`startxref\n${xrefAt}\n%%EOF\n`);

  const out = new Uint8Array(length);
  let at = 0;
  for (const chunk of chunks) {
    out.set(chunk, at);
    at += chunk.length;
  }
  return out;
}
