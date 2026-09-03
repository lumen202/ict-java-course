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
//
// `caseSensitive` exists for Java rounds (week 4 onward). The bar above is
// "would the language accept this?", and Java would not — `preparedstatement`
// and `string` are compile errors — so forgiving case there would drill a habit
// that fails at the first build. Leave it OFF for SQL, which genuinely doesn't
// care, and which every existing round was authored against.
export function normalizeAnswer(s: string, caseSensitive = false): string {
  const out = s
    .trim()
    .replace(/[‘’‛′]/g, "'")
    .replace(/[“”‟″]/g, '"')
    .replace(/\s+/g, " ")
    .replace(/\s*([(),;])\s*/g, "$1");
  return caseSensitive ? out : out.toLowerCase();
}

/** True when `typed` is the same statement as `expected`, spacing — and unless `caseSensitive`, case — aside. */
export function answersMatch(typed: string, expected: string, caseSensitive = false): boolean {
  return normalizeAnswer(typed, caseSensitive) === normalizeAnswer(expected, caseSensitive);
}
