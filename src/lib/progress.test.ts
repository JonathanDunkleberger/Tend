import { describe, it, expect } from "vitest";
import { computeConsistency, selectNewMilestones, selectNewCoinTiers } from "./progress";

// isDone(n) predicate from a boolean array indexed by "days ago".
const fromDays = (days: boolean[]) => (n: number) => days[n] ?? false;

describe("computeConsistency", () => {
  it("is 100% for a habit done every day of a full window", () => {
    expect(computeConsistency(() => true, 30)).toBe(100);
  });

  it("is 0% for a habit never done", () => {
    expect(computeConsistency(() => false, 30)).toBe(0);
  });

  it("does not punish a young habit — 3/3 over 3 days is 100%, not 10%", () => {
    expect(computeConsistency(fromDays([true, true, true]), 3)).toBe(100);
  });

  it("uses the true age as denominator for young habits", () => {
    // 2 of the last 4 days done, habit is 4 days old → 50%
    expect(computeConsistency(fromDays([true, false, true, false]), 4)).toBe(50);
  });

  it("caps the window at `cap` even for old habits", () => {
    // Done only the most recent 15 of a 100-day-old habit → 15/30 = 50%
    const done15 = (n: number) => n < 15;
    expect(computeConsistency(done15, 100)).toBe(50);
  });

  it("clamps a zero/negative age to a 1-day window", () => {
    expect(computeConsistency(fromDays([true]), 0)).toBe(100);
    expect(computeConsistency(fromDays([false]), -5)).toBe(0);
  });

  it("rounds to the nearest integer percent", () => {
    // 1 of 3 days → 33.33% → 33
    expect(computeConsistency(fromDays([true, false, false]), 3)).toBe(33);
    // 2 of 3 days → 66.67% → 67
    expect(computeConsistency(fromDays([true, true, false]), 3)).toBe(67);
  });

  it("honours a custom cap", () => {
    // 3 of the last 7 done, but cap the window at 7 → 3/7 ≈ 43%
    const done3 = (n: number) => n < 3;
    expect(computeConsistency(done3, 30, 7)).toBe(43);
  });
});

// Mirrors src/lib/constants.ts MILESTONES + tend-app's GRACE_MILESTONE_DAYS.
const MILESTONES = [
  { days: 1, coins: 1 },
  { days: 3, coins: 5 },
  { days: 7, coins: 15 },
  { days: 14, coins: 30 },
  { days: 21, coins: 50 },
  { days: 30, coins: 100 },
  { days: 60, coins: 200 },
  { days: 90, coins: 500 },
];
const GRACE_DAYS = new Set([7, 21, 60]);

describe("selectNewMilestones", () => {
  const none = () => false;

  it("reaches nothing below the first threshold", () => {
    const r = selectNewMilestones(0, none, MILESTONES, GRACE_DAYS);
    expect(r.reached).toHaveLength(0);
    expect(r.coins).toBe(0);
    expect(r.graceGifts).toBe(0);
  });

  it("banks every threshold at or below the streak, summing coins", () => {
    // streak 7 → days 1,3,7 → coins 1+5+15 = 21
    const r = selectNewMilestones(7, none, MILESTONES, GRACE_DAYS);
    expect(r.reached.map((m) => m.days)).toEqual([1, 3, 7]);
    expect(r.coins).toBe(21);
  });

  it("gifts a grace token only for grace-day milestones newly reached", () => {
    // streak 7 crosses day-7 (a grace day) exactly once → 1 gift
    expect(selectNewMilestones(7, none, MILESTONES, GRACE_DAYS).graceGifts).toBe(1);
    // streak 21 crosses days 7 AND 21 (both grace days) → 2 gifts
    expect(selectNewMilestones(21, none, MILESTONES, GRACE_DAYS).graceGifts).toBe(2);
    // streak 6 crosses no grace day → 0 gifts
    expect(selectNewMilestones(6, none, MILESTONES, GRACE_DAYS).graceGifts).toBe(0);
  });

  it("skips milestones already earned", () => {
    // Already banked days 1 and 3; streak 7 → only day 7 is new
    const earned = (d: number) => d === 1 || d === 3;
    const r = selectNewMilestones(7, earned, MILESTONES, GRACE_DAYS);
    expect(r.reached.map((m) => m.days)).toEqual([7]);
    expect(r.coins).toBe(15);
    expect(r.graceGifts).toBe(1);
  });

  it("gives no grace gifts when no grace-days are configured", () => {
    const r = selectNewMilestones(21, none, MILESTONES, new Set());
    expect(r.graceGifts).toBe(0);
    expect(r.coins).toBe(1 + 5 + 15 + 30 + 50);
  });
});

// Mirrors src/components/milestone-coin.tsx MILESTONE_COINS (key/days/hours only).
const COIN_TIERS = [
  { key: "2h", days: 0, hours: 2 },
  { key: "6h", days: 0, hours: 6 },
  { key: "12h", days: 0, hours: 12 },
  { key: "24h", days: 1, hours: 24 },
  { key: "48h", days: 2, hours: 48 },
  { key: "72h", days: 3, hours: 72 },
  { key: "7d", days: 7, hours: 168 },
  { key: "30d", days: 30, hours: 720 },
];

describe("selectNewCoinTiers", () => {
  it("ignores sub-day (0-day) tiers for build habits", () => {
    // A 3-day build streak → 24h/48h/72h tiers (days 1,2,3), never the hour-only ones
    const r = selectNewCoinTiers(COIN_TIERS, { isQuit: false, days: 3, earnedKeys: [] });
    expect(r.newKeys).toEqual(["24h", "48h", "72h"]);
  });

  it("returns the highest newly-unlocked tier for the celebration", () => {
    const r = selectNewCoinTiers(COIN_TIERS, { isQuit: false, days: 7, earnedKeys: [] });
    expect(r.highest?.key).toBe("7d");
  });

  it("uses hour thresholds for quit habits when hours are supplied", () => {
    // 13 hours clean → 2h/6h/12h unlocked, not 24h
    const r = selectNewCoinTiers(COIN_TIERS, { isQuit: true, days: 0, hours: 13, earnedKeys: [] });
    expect(r.newKeys).toEqual(["2h", "6h", "12h"]);
    expect(r.highest?.key).toBe("12h");
  });

  it("falls back to day thresholds for quit habits with no hours", () => {
    const r = selectNewCoinTiers(COIN_TIERS, { isQuit: true, days: 1, earnedKeys: [] });
    // day-1 tier (24h) reached; 0-day tiers count too (days 0 >= 0)... but their
    // day threshold is 0 so they also qualify by days — mirrors the real fallback.
    expect(r.newKeys).toContain("24h");
  });

  it("skips tiers already earned", () => {
    const r = selectNewCoinTiers(COIN_TIERS, {
      isQuit: false,
      days: 7,
      earnedKeys: ["24h", "48h"],
    });
    expect(r.newKeys).toEqual(["72h", "7d"]);
  });

  it("returns nothing (and null highest) when no tier is reached", () => {
    const r = selectNewCoinTiers(COIN_TIERS, { isQuit: false, days: 0, earnedKeys: [] });
    expect(r.newKeys).toHaveLength(0);
    expect(r.highest).toBeNull();
  });
});
