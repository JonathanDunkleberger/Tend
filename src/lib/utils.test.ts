import { describe, it, expect } from "vitest";
import { getStage, daysBetween, fmtDaysCompleted } from "./utils";
import { STAGE_THRESHOLDS, STAGE_LABELS } from "./constants";

// getStage maps total tended-days → dragon evolution stage (0..4). These
// thresholds ARE the emotional payoff (Egg → Hatchling → … → Elder Dragon),
// so lock them: a silent off-by-one here would hatch dragons at the wrong time.
describe("getStage", () => {
  it("starts at Egg (stage 0) below the first threshold", () => {
    expect(getStage(0)).toBe(0);
    expect(getStage(2)).toBe(0);
  });

  it("advances exactly on each threshold day", () => {
    expect(getStage(3)).toBe(1); // Hatchling
    expect(getStage(7)).toBe(2); // Whelp
    expect(getStage(14)).toBe(3); // Drake
    expect(getStage(30)).toBe(4); // Elder Dragon
  });

  it("holds the stage between thresholds and caps at the top", () => {
    expect(getStage(6)).toBe(1);
    expect(getStage(29)).toBe(3);
    expect(getStage(365)).toBe(4);
  });

  it("agrees with the STAGE_THRESHOLDS / STAGE_LABELS tables", () => {
    STAGE_THRESHOLDS.forEach((threshold, stage) => {
      expect(getStage(threshold)).toBe(stage);
    });
    expect(STAGE_LABELS.length).toBe(STAGE_THRESHOLDS.length);
  });
});

// daysBetween powers quit clean-days, money-saved, and consistency windows.
describe("daysBetween", () => {
  it("counts whole days between two date-only strings", () => {
    expect(daysBetween("2026-07-01", "2026-07-11")).toBe(10);
  });

  it("is 0 for the same day", () => {
    expect(daysBetween("2026-07-11", "2026-07-11")).toBe(0);
  });

  it("never goes negative when the range is reversed", () => {
    expect(daysBetween("2026-07-11", "2026-07-01")).toBe(0);
  });

  it("accepts an ISO timestamp on the 'from' side (quitDate is stored as ISO)", () => {
    // Same calendar span, but the start is a precise timestamp.
    expect(daysBetween("2026-07-01T18:04:00.000Z", "2026-07-11")).toBeGreaterThanOrEqual(9);
  });

  it("crosses a month boundary correctly", () => {
    expect(daysBetween("2026-06-28", "2026-07-02")).toBe(4);
  });
});

describe("fmtDaysCompleted", () => {
  it("frames build vs quit habits differently", () => {
    expect(fmtDaysCompleted(5, false)).toMatch(/5/);
    expect(fmtDaysCompleted(5, true)).toMatch(/5/);
  });
});
