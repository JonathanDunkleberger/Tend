import { describe, it, expect } from "vitest";
import {
  computeCleanDays,
  computeMoneySaved,
  computeTotalSaved,
  computeQuitBest,
  applyStageDrop,
  computeQuitStage,
} from "./quit";

// The quit-mode economy + relapse-evolution math. These numbers are shown to the
// user (dollars saved) or drive the emotional dragon-regression on a slip, so they
// are locked here — the one corner of the reward math shifts 11–12 didn't reach.

describe("computeCleanDays", () => {
  it("is 0 when the habit was never started (no quit date)", () => {
    expect(computeCleanDays(undefined, "2026-07-11")).toBe(0);
  });

  it("counts whole days since the quit date", () => {
    expect(computeCleanDays("2026-07-01", "2026-07-11")).toBe(10);
  });

  it("is 0 on the day you quit", () => {
    expect(computeCleanDays("2026-07-11", "2026-07-11")).toBe(0);
  });

  it("never goes negative if the quit date is in the future", () => {
    expect(computeCleanDays("2026-07-20", "2026-07-11")).toBe(0);
  });

  it("handles an ISO timestamp quit date (relapse stores exact time)", () => {
    // Quit at 6:04pm on the 1st, 'today' is the 11th → ~9 full days elapsed.
    expect(computeCleanDays("2026-07-01T18:04:00.000Z", "2026-07-11")).toBeGreaterThanOrEqual(9);
  });
});

describe("computeMoneySaved", () => {
  it("multiplies daily cost by clean days", () => {
    expect(computeMoneySaved(12, 10)).toBe(120);
  });

  it("rounds to whole cents (no floating-point crumbs)", () => {
    // 12.35 * 7 = 86.45 exactly, but 0.1*3 style drift is what we guard.
    expect(computeMoneySaved(7.13, 3)).toBe(21.39);
    expect(computeMoneySaved(0.1, 3)).toBe(0.3); // 0.30000000000000004 → 0.3
  });

  it("treats a missing daily cost as 0 (no NaN)", () => {
    expect(computeMoneySaved(undefined, 10)).toBe(0);
  });

  it("is 0 with 0 clean days", () => {
    expect(computeMoneySaved(15, 0)).toBe(0);
  });
});

describe("computeTotalSaved", () => {
  it("sums savings across every started quit habit", () => {
    const total = computeTotalSaved(
      [
        { quitDate: "2026-07-01", dailyCost: 10 }, // 10 days * 10 = 100
        { quitDate: "2026-07-06", dailyCost: 4 }, //  5 days *  4 =  20
      ],
      "2026-07-11",
    );
    expect(total).toBe(120);
  });

  it("skips habits with no quit date and treats missing cost as 0", () => {
    const total = computeTotalSaved(
      [
        { dailyCost: 99 }, // never started → contributes nothing
        { quitDate: "2026-07-01" }, // no cost → 0
        { quitDate: "2026-07-09", dailyCost: 5 }, // 2 * 5 = 10
      ],
      "2026-07-11",
    );
    expect(total).toBe(10);
  });

  it("is 0 for an empty garden", () => {
    expect(computeTotalSaved([], "2026-07-11")).toBe(0);
  });
});

describe("computeQuitBest", () => {
  it("keeps the prior best when the current run is shorter (post-relapse)", () => {
    expect(computeQuitBest(2, 30)).toBe(30);
  });

  it("takes the current run when it beats the prior best", () => {
    expect(computeQuitBest(41, 30)).toBe(41);
  });

  it("treats an undefined prior best as 0", () => {
    expect(computeQuitBest(5, undefined)).toBe(5);
  });
});

describe("applyStageDrop", () => {
  it("subtracts the relapse penalty", () => {
    expect(applyStageDrop(4, 1)).toBe(3);
  });

  it("never drops below the egg (stage 0)", () => {
    expect(applyStageDrop(1, 5)).toBe(0);
  });

  it("is a no-op with no drops", () => {
    expect(applyStageDrop(3, 0)).toBe(3);
    expect(applyStageDrop(3, undefined)).toBe(3);
  });
});

describe("computeQuitStage", () => {
  it("is an egg (0) before the habit is ever started", () => {
    expect(computeQuitStage(undefined, 0, "2026-07-11")).toBe(0);
  });

  it("evolves off the current clean run (30 clean days → stage 4)", () => {
    expect(computeQuitStage("2026-06-11", 0, "2026-07-11")).toBe(4);
  });

  it("evolves off the best-ever run even after a relapse reset the clean count", () => {
    // Relapsed today (0 clean days) but a 30-day best keeps the dragon evolved…
    expect(computeQuitStage("2026-07-11", 30, "2026-07-11")).toBe(4);
  });

  it("…softened by the relapse stage drop (30-day best, one drop → stage 3)", () => {
    expect(computeQuitStage("2026-07-11", 30, "2026-07-11", 1)).toBe(3);
  });

  it("uses whichever is larger — current clean run or prior best", () => {
    // 14 clean days (stage 3) beats a stale 5-day best (stage 1).
    expect(computeQuitStage("2026-06-27", 5, "2026-07-11")).toBe(3);
  });

  it("a heavy penalty can knock even a grown dragon back to an egg", () => {
    expect(computeQuitStage("2026-06-11", 0, "2026-07-11", 9)).toBe(0);
  });
});
