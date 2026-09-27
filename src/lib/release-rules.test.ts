import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { weeks } from "@/lib/content";
import { isPastWeek, isReviewWeek, releasedDayCount, visibleDayCount } from "@/lib/release-rules";

// isPastWeek REMOVES a gate (review mode: every step of every day open), so it
// must fail closed — unlike releasedDayCount, whose unknown-state fallback
// shows everything. These pin that difference.

const [first, second] = weeks;
const last = weeks[weeks.length - 1];

describe("release rules", () => {
  test("weeks before the current one are past; the current week and later are not", () => {
    const state = { currentWeekSlug: last.slug, currentDay: 1 };
    for (const w of weeks.slice(0, -1)) assert.equal(isPastWeek(w, state), true, w.slug);
    assert.equal(isPastWeek(last, state), false);

    const early = { currentWeekSlug: second.slug, currentDay: 3 };
    assert.equal(isPastWeek(first, early), true);
    assert.equal(isPastWeek(second, early), false);
    for (const w of weeks.slice(2)) assert.equal(isPastWeek(w, early), false, w.slug);
  });

  test("an unknown current week opens nothing for review", () => {
    for (const slug of ["", "no-such-week"]) {
      const state = { currentWeekSlug: slug, currentDay: 5 };
      for (const w of weeks) assert.equal(isPastWeek(w, state), false, `${slug} · ${w.slug}`);
    }
  });

  test("openForReview opens the current week only — never a week the class hasn't reached", () => {
    const flagged = { ...second, openForReview: true };
    const onIt = { currentWeekSlug: second.slug, currentDay: 1 };
    assert.equal(isReviewWeek(flagged, onIt), true);
    assert.equal(visibleDayCount(flagged, onIt), flagged.video.days.length);

    const before = { currentWeekSlug: first.slug, currentDay: 5 };
    assert.equal(isReviewWeek(flagged, before), false);
    assert.equal(visibleDayCount(flagged, before), 0);

    assert.equal(isReviewWeek(flagged, { currentWeekSlug: "no-such-week", currentDay: 5 }), false);
    assert.equal(isReviewWeek(second, onIt), false);
  });

  test("openForReview changes what students SEE, never what counts as released", () => {
    // Streaks and the teacher's release list read releasedDayCount; if the
    // flag leaked into it, unreleased days would count as missed turn-ins.
    const flagged = { ...second, openForReview: true };
    const onDay1 = { currentWeekSlug: second.slug, currentDay: 1 };
    assert.equal(releasedDayCount(flagged, onDay1), Math.min(1, flagged.video.days.length));
    assert.equal(visibleDayCount(second, onDay1), releasedDayCount(second, onDay1));
  });

  test("a past week shows every day it has", () => {
    const state = { currentWeekSlug: last.slug, currentDay: 1 };
    for (const w of weeks.slice(0, -1)) {
      assert.equal(releasedDayCount(w, state), w.video.days.length, w.slug);
    }
  });
});
