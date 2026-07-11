import { describe, it, expect } from "vitest";
import { computeStreak, computeGraceActive, computeBestStreak, computeStreakForDate } from "./streak";

// Build an isDone(n) predicate from a boolean array indexed by "days ago".
// e.g. fromDays([true, true, false]) → done today & yesterday, not 2 days ago.
const fromDays = (days: boolean[]) => (n: number) => days[n] ?? false;

describe("computeStreak", () => {
  it("counts a clean consecutive run ending today", () => {
    expect(computeStreak(fromDays([true, true, true]))).toBe(3);
  });

  it("does not break the streak when today is not yet done (day isn't over)", () => {
    // today undone, yesterday+before done → streak still 2, not 0
    expect(computeStreak(fromDays([false, true, true]))).toBe(2);
  });

  it("is 0 when nothing is done", () => {
    expect(computeStreak(fromDays([false, false, false]))).toBe(0);
  });

  it("stops at the first gap without a grace token", () => {
    // done today, gap yesterday, done before → only today counts
    expect(computeStreak(fromDays([true, false, true, true]))).toBe(1);
  });

  it("bridges a single missed day with one grace token", () => {
    // done today, missed yesterday, done the two days before → 1 token bridges → 3
    expect(computeStreak(fromDays([true, false, true, true]), 1)).toBe(3);
  });

  it("only bridges as many gaps as tokens held", () => {
    const days = [true, false, true, false, true]; // two separate gaps
    expect(computeStreak(fromDays(days), 1)).toBe(2); // 1 token → reaches 2nd true, stops at 2nd gap
    expect(computeStreak(fromDays(days), 2)).toBe(3); // 2 tokens → bridges both
  });

  it("bridges a gap even when today itself is not done", () => {
    // today undone → start at yesterday; yesterday missed but a token bridges it
    expect(computeStreak(fromDays([false, false, true, true]), 1)).toBe(2);
  });

  it("never bridges 'today' itself (d===0 is not a bridgeable gap)", () => {
    // today undone with a token available: it should look back, not spend a token on today
    expect(computeStreak(fromDays([false, true, true]), 1)).toBe(2);
  });

  it("terminates on an always-true predicate (defensive lookback cap)", () => {
    // A corrupt 'always done' history must not spin forever.
    expect(computeStreak(() => true)).toBe(100_000);
  });
});

describe("computeGraceActive", () => {
  it("is false with no tokens", () => {
    expect(computeGraceActive(fromDays([true, false, true]), 0)).toBe(false);
  });

  it("is false when nothing is bridging (no gap in the streak)", () => {
    // clean run, token held but not needed
    expect(computeGraceActive(fromDays([true, true, true]), 1)).toBe(false);
  });

  it("is true when a token is actively bridging a gap right now", () => {
    // raw streak = 1 (today), but with a token the streak reaches 3 → protecting
    expect(computeGraceActive(fromDays([true, false, true, true]), 1)).toBe(true);
  });

  it("is true when today is undone but a token bridges yesterday's gap", () => {
    // raw = 0 (today undone, yesterday missed), with token streak = 2 → protecting
    expect(computeGraceActive(fromDays([false, false, true, true]), 1)).toBe(true);
  });
});

describe("computeBestStreak", () => {
  it("is 0 for no logs", () => {
    expect(computeBestStreak([])).toBe(0);
  });

  it("is 1 for a single log", () => {
    expect(computeBestStreak(["2026-07-01"])).toBe(1);
  });

  it("finds the longest consecutive run", () => {
    // 3-run, gap, 2-run → best is 3
    const dates = ["2026-07-01", "2026-07-02", "2026-07-03", "2026-07-10", "2026-07-11"];
    expect(computeBestStreak(dates)).toBe(3);
  });

  it("ignores duplicate dates", () => {
    const dates = ["2026-07-01", "2026-07-01", "2026-07-02"];
    expect(computeBestStreak(dates)).toBe(2);
  });

  it("is order-independent (sorts internally)", () => {
    const dates = ["2026-07-03", "2026-07-01", "2026-07-02"];
    expect(computeBestStreak(dates)).toBe(3);
  });

  it("handles a month boundary correctly", () => {
    const dates = ["2026-06-29", "2026-06-30", "2026-07-01", "2026-07-02"];
    expect(computeBestStreak(dates)).toBe(4);
  });

  it("resets the run across a multi-day gap", () => {
    const dates = ["2026-07-01", "2026-07-05", "2026-07-06"];
    expect(computeBestStreak(dates)).toBe(2);
  });
});

describe("computeStreakForDate (server-side, from log dates)", () => {
  it("counts a clean run ending today", () => {
    const dates = ["2026-07-09", "2026-07-10", "2026-07-11"];
    expect(computeStreakForDate(dates, "2026-07-11")).toBe(3);
  });

  it("is 0 when today is undone and yesterday is undone", () => {
    expect(computeStreakForDate(["2026-07-01"], "2026-07-11")).toBe(0);
  });

  it("does not break when today itself is not yet logged (counts from yesterday)", () => {
    // logged through yesterday, today not yet logged → streak still 2
    const dates = ["2026-07-09", "2026-07-10"];
    expect(computeStreakForDate(dates, "2026-07-11")).toBe(2);
  });

  it("stops at the first gap (no grace bridging server-side)", () => {
    // today + gap + earlier run → only today counts
    const dates = ["2026-07-11", "2026-07-08", "2026-07-07"];
    expect(computeStreakForDate(dates, "2026-07-11")).toBe(1);
  });

  it("KEY FIX: sporadic logging to 7 total days is NOT a 7-day streak", () => {
    // seven logged days but never consecutive → no false streak:7 milestone
    const dates = [
      "2026-07-01", "2026-07-03", "2026-07-05", "2026-07-07",
      "2026-07-09", "2026-07-10", "2026-07-11",
    ];
    expect(dates.length).toBe(7);
    expect(computeStreakForDate(dates, "2026-07-11")).toBe(3); // only the last three are consecutive
  });

  it("crosses a month boundary correctly", () => {
    const dates = ["2026-06-29", "2026-06-30", "2026-07-01"];
    expect(computeStreakForDate(dates, "2026-07-01")).toBe(3);
  });

  it("ignores duplicate log dates", () => {
    const dates = ["2026-07-10", "2026-07-11", "2026-07-11"];
    expect(computeStreakForDate(dates, "2026-07-11")).toBe(2);
  });

  it("is empty-safe", () => {
    expect(computeStreakForDate([], "2026-07-11")).toBe(0);
  });
});
