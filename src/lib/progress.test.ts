import { describe, it, expect } from "vitest";
import { computeConsistency, selectNewMilestones, selectNewCoinTiers, computeSynergies, computeDayOfWeekRates, computeStreakSeries } from "./progress";

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

describe("computeSynergies", () => {
  it("finds no pairs with fewer than two habits", () => {
    expect(computeSynergies(1, () => 30)).toHaveLength(0);
    expect(computeSynergies(0, () => 30)).toHaveLength(0);
  });

  it("enumerates every unordered pair", () => {
    // 3 habits, all strongly paired → C(3,2) = 3 pairs
    const pairs = computeSynergies(3, () => 10);
    expect(pairs.map((p) => [p.a, p.b])).toEqual([
      [0, 1],
      [0, 2],
      [1, 2],
    ]);
  });

  it("keeps only pairs at or above the min-days threshold", () => {
    // pair (0,1) shares 2 days (below 3) → dropped; pair (0,2) shares 5 → kept
    const co: Record<string, number> = { "0,1": 2, "0,2": 5, "1,2": 3 };
    const pairs = computeSynergies(3, (i, j) => co[`${i},${j}`]);
    expect(pairs.map((p) => [p.a, p.b])).toEqual([
      [0, 2],
      [1, 2],
    ]);
  });

  it("grades strength as a 0–1 ramp saturating at strengthWindow (20)", () => {
    expect(computeSynergies(2, () => 10)[0].strength).toBe(0.5); // 10/20
    expect(computeSynergies(2, () => 20)[0].strength).toBe(1); // 20/20
    expect(computeSynergies(2, () => 40)[0].strength).toBe(1); // capped at 1
  });

  it("honours custom minDays + strengthWindow", () => {
    // minDays 5 drops a 4-day pair; strengthWindow 10 → 4/10 would-be... but dropped
    expect(computeSynergies(2, () => 4, { minDays: 5 })).toHaveLength(0);
    expect(computeSynergies(2, () => 5, { minDays: 5, strengthWindow: 10 })[0].strength).toBe(0.5);
  });
});

describe("computeDayOfWeekRates", () => {
  // Fixed calendar: 7 consecutive dates whose weekday indices are 0=Sun…6=Sat.
  // (2024-06-30 is a Sunday, so the index equals the offset here.)
  const week = ["2024-06-30", "2024-07-01", "2024-07-02", "2024-07-03", "2024-07-04", "2024-07-05", "2024-07-06"];
  const dayIndexOf = (d: string) => new Date(d + "T12:00:00").getDay();

  it("tallies done/total/pct per weekday for a habit done every day", () => {
    const rates = computeDayOfWeekRates(week, [{ id: "a", startDate: "2024-06-30" }], () => true, dayIndexOf);
    rates.forEach((r) => {
      expect(r.total).toBe(1);
      expect(r.done).toBe(1);
      expect(r.pct).toBe(100);
    });
  });

  it("does NOT count days before a habit existed as misses", () => {
    // Habit starts mid-week (Wed = index 3). Done on every day it existed.
    const start = "2024-07-03";
    const rates = computeDayOfWeekRates(week, [{ id: "a", startDate: start }], (_id, d) => d >= start, dayIndexOf);
    // Sun–Tue (pre-creation) are untallied → total 0, pct 0 (not a fabricated miss).
    [0, 1, 2].forEach((i) => { expect(rates[i].total).toBe(0); expect(rates[i].pct).toBe(0); });
    // Wed–Sat all counted and done → 100%.
    [3, 4, 5, 6].forEach((i) => { expect(rates[i].total).toBe(1); expect(rates[i].pct).toBe(100); });
  });

  it("computes an honest rate over only the days a young habit existed", () => {
    // 4-day-old habit (Wed–Sat), done Wed+Fri, missed Thu+Sat → each weekday 0/1 or 1/1.
    const start = "2024-07-03";
    const done = new Set(["2024-07-03", "2024-07-05"]);
    const rates = computeDayOfWeekRates(week, [{ id: "a", startDate: start }], (_id, d) => done.has(d), dayIndexOf);
    expect(rates[3].pct).toBe(100); // Wed done
    expect(rates[4].pct).toBe(0);   // Thu missed
    expect(rates[5].pct).toBe(100); // Fri done
    expect(rates[6].pct).toBe(0);   // Sat missed
  });

  it("aggregates multiple habits into the same weekday buckets", () => {
    const rates = computeDayOfWeekRates(
      ["2024-06-30", "2024-07-07"], // two Sundays
      [{ id: "a", startDate: "2024-06-01" }, { id: "b", startDate: "2024-06-01" }],
      (id, d) => id === "a" || d === "2024-07-07", // a always; b only on the 2nd Sunday
      dayIndexOf,
    );
    // Sunday bucket: 2 habits × 2 Sundays = 4 counted; done = a(2) + b(1) = 3 → 75%.
    expect(rates[0].total).toBe(4);
    expect(rates[0].done).toBe(3);
    expect(rates[0].pct).toBe(75);
  });

  it("returns all-zero tallies for an empty habit list", () => {
    const rates = computeDayOfWeekRates(week, [], () => true, dayIndexOf);
    expect(rates).toHaveLength(7);
    rates.forEach((r) => { expect(r.total).toBe(0); expect(r.done).toBe(0); expect(r.pct).toBe(0); });
  });
});

describe("computeStreakSeries", () => {
  it("ramps 1..N over a solid recent run, ending on today's live streak", () => {
    // Done every one of the last 5 days (offsets 0–4), nothing older.
    const series = computeStreakSeries((o) => o < 5, 5);
    // Ordered oldest→newest: the day 4-ago sees a 5-day run behind it, … today sees 1.
    // Wait: offset 4 (oldest in window) walks back to 4,5,6… → only offset 4 done → 1.
    expect(series).toEqual([1, 2, 3, 4, 5]);
  });

  it("resets to 0 on a missed day and climbs again after", () => {
    // Done on offsets 0,1,2 and 4,5 ; missed offset 3.
    const done = new Set([0, 1, 2, 4, 5]);
    const series = computeStreakSeries((o) => done.has(o), 6);
    // Window offsets 5..0 → oldest→newest.
    // o5: run 5,6 → done5,done6? only 5 → 1 ; o4: 4,5,6 → 4,5 done → 2 ; o3: missed → 0
    // o2: 2,3.. → 3 missed → just 2 → 1 ; o1: 1,2,3 → 1,2 done,3 miss → 2 ; o0: 0,1,2,3 → 3 → 3
    expect(series).toEqual([1, 2, 0, 1, 2, 3]);
  });

  it("returns all zeros when nothing is done", () => {
    expect(computeStreakSeries(() => false, 4)).toEqual([0, 0, 0, 0]);
  });

  it("honors the lookback cap so a long run doesn't over-count", () => {
    // Everything done, but only count back `lookback` days per point.
    const series = computeStreakSeries(() => true, 3, 2);
    // Each point walks back at most 2 days → capped at 2.
    expect(series).toEqual([2, 2, 2]);
  });

  it("produces one value per window day", () => {
    expect(computeStreakSeries((o) => o % 2 === 0, 30)).toHaveLength(30);
  });
});
