import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { PdfPage, pdfDocument, textWidth, wrapLines } from "./writer";

function asText(bytes: Uint8Array): string {
  let out = "";
  for (const b of bytes) out += String.fromCharCode(b);
  return out;
}

function onePage(draw: (page: PdfPage) => void): Uint8Array {
  const page = new PdfPage(612, 396);
  draw(page);
  return pdfDocument([page]);
}

describe("pdf container", () => {
  test("every cross-reference offset lands on the object it claims", () => {
    // The offsets are byte positions into the finished file. If they are
    // computed from string lengths, or if the table claims an object that was
    // never written, the file still opens in a lenient viewer and is refused
    // by a strict one — so this walks the table the way a parser would.
    const bytes = pdfDocument([
      new PdfPage(612, 396).text(10, 20, "one"),
      new PdfPage(612, 396).text(10, 20, "two"),
    ]);
    const text = asText(bytes);

    const header = /\bxref\n0 (\d+)\n/.exec(text);
    assert.ok(header, "no xref table");
    const claimed = Number(header[1]);

    const table = text.slice(header.index + header[0].length);
    for (let n = 1; n < claimed; n++) {
      const entry = table.slice(n * 20, n * 20 + 20);
      const offset = Number(entry.slice(0, 10));
      assert.ok(offset > 0, `object ${n} has no offset`);
      assert.equal(
        text.slice(offset, offset + `${n} 0 obj`.length),
        `${n} 0 obj`,
        `xref entry ${n} points at the wrong place`,
      );
    }

    // ...and nothing is claimed that was never written.
    const written = (text.match(/^\d+ 0 obj$/gm) ?? []).length;
    assert.equal(claimed - 1, written, "the table claims more objects than exist");
  });

  test("declares its length in bytes, and opens and closes as a PDF", () => {
    const bytes = onePage((p) => p.text(10, 20, "hello"));
    const text = asText(bytes);
    assert.ok(text.startsWith("%PDF-1.4"));
    assert.ok(text.trimEnd().endsWith("%%EOF"));

    const stream = /<< \/Length (\d+) >>\nstream\n([\s\S]*?)\nendstream/.exec(text);
    assert.ok(stream);
    assert.equal(Number(stream[1]), stream[2].length);
  });

  test("characters that would break the syntax are escaped, not dropped", () => {
    // A name with brackets is the case that corrupts a naive writer: an
    // unescaped ")" closes the string early and everything after it is read as
    // operators. Verified end-to-end by an independent PDF reader too — see
    // the payroll tests.
    const text = asText(onePage((p) => p.text(10, 20, "O'Brien (Jr) \\ 50%")));
    assert.ok(text.includes("O'Brien \\(Jr\\) \\\\ 50%"));
  });

  test("text outside Latin-1 is mapped rather than emitted raw", () => {
    const text = asText(onePage((p) => p.text(10, 20, "“José” — ₱1,300")));
    assert.ok(text.includes('"Jos'), "smart quotes should become plain ones");
    assert.ok(!text.includes("“"));
    assert.ok(text.includes("P1,300"), "the peso sign has no glyph in the standard fonts");
    assert.ok(text.includes("\\351"), "é should survive as an octal escape");
  });

  test("a page with nothing on it is still a valid page", () => {
    const bytes = pdfDocument([new PdfPage(100, 100)]);
    assert.ok(asText(bytes).includes("/Type /Page"));
  });
});

describe("text measurement", () => {
  test("width scales with size and tracks the real metrics", () => {
    assert.equal(textWidth("iii", "regular", 10), (222 * 3 * 10) / 1000);
    assert.equal(textWidth("MMM", "regular", 10), (833 * 3 * 10) / 1000);
    assert.equal(textWidth("abc", "regular", 20), textWidth("abc", "regular", 10) * 2);
    assert.ok(textWidth("Payroll", "bold", 10) > textWidth("Payroll", "regular", 10));
  });

  test("shrink-to-fit actually fits", () => {
    const label = "Total Amount Received";
    const text = asText(onePage((p) => p.text(0, 20, label, { size: 20, maxWidth: 60 })));
    const size = Number(/\/F1 ([\d.]+) Tf/.exec(text)?.[1]);
    assert.ok(size < 20, "should have shrunk");
    assert.ok(textWidth(label, "regular", size) <= 60);
  });

  test("wrapping breaks on spaces and keeps every word", () => {
    const lines = wrapLines("Total No. of Days", "regular", 9, 30);
    assert.ok(lines.length > 1);
    assert.equal(lines.join(" "), "Total No. of Days");
    for (const line of lines) {
      // A single word wider than the box is allowed to overhang; nothing else is.
      if (line.includes(" ")) assert.ok(textWidth(line, "regular", 9) <= 30);
    }
  });
});
