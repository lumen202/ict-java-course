// Does a typed SQL statement count as the one the round asked for?
//
// The bar is "would MySQL accept this as the same statement?" — that is the
// promise the typing game makes to a student ("forgiving but honest"), and
// anything stricter marks a correct student wrong. It did: w1d5 warm-up round 7
// rejected `VALUES (1,'Liza',8,'Math');` because the template happened to put a
// space after each comma (BUG-021). A student who cannot see the answer has no
// way to guess which spacing was intended, so the round becomes unpassable by
// knowing SQL.
//
// Forgiven, because MySQL forgives it: case, runs of whitespace, whitespace
// around the punctuation that already separates things, and the curly quotes a
// phone keyboard or a word processor substitutes for a typed apostrophe.
//
// NOT forgiven, because MySQL doesn't: a missing semicolon, a missing quote, a
// misspelling, a wrong value.
//
// The punctuation rule is deliberately naive about string literals — it strips
// spacing inside 'Grade 9, Math' too. Both sides are normalized the same way, so
// that can only ever accept an answer whose sole error is spacing inside a
// quoted string; it can never reject a correct one. For a typing drill that
// trade is the right way round.
export function normalizeAnswer(s: string): string {
  return s
    .trim()
    .replace(/[‘’‛′]/g, "'")
    .replace(/[“”‟″]/g, '"')
    .replace(/\s+/g, " ")
    .replace(/\s*([(),;])\s*/g, "$1")
    .toLowerCase();
}

/** True when `typed` is the same statement as `expected`, spacing and case aside. */
export function answersMatch(typed: string, expected: string): boolean {
  return normalizeAnswer(typed) === normalizeAnswer(expected);
}
