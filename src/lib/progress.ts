// ── Progress → reward math ────────────────────────────────────────────────
// Pure, side-effect-free logic for the three progress-derived numbers that are
// otherwise buried in components and could never be browser-verified here
// (auth-gated): per-habit CONSISTENCY %, streak-MILESTONE coin/grace rewards,
// and the AA-style COIN-TIER unlocks. Extracted so there is a single, tested
// source of truth (progress.test.ts); the components (constellation.tsx +
// tend-app.tsx) delegate to these. Kept framework-free — callers pass their own
// milestone/tier lists and an `isDone(n)`-style predicate — so nothing here
// imports React, the DB, or the tend-app monolith. Companion to streak.ts.

/**
 * Per-habit consistency: completions over a fair, capped recent window.
 *
 * The window is `min(cap, max(1, ageDays))` so a 3-day-old habit at 3/3 reads
 * 100%, not 10% — young habits aren't punished by a fixed large denominator.
 *
 * @param isDone  (n) => was the habit completed n days ago (0 = today)
 * @param ageDays how many days the habit has existed (inclusive of today)
 * @param cap     longest window to average over (default 30)
 * @returns integer percentage 0–100
 */
export function computeConsistency(
  isDone: (n: number) => boolean,
  ageDays: number,
  cap = 30,
): number {
  const window = Math.min(cap, Math.max(1, ageDays));
  let done = 0;
  for (let d = 0; d < window; d++) if (isDone(d)) done++;
  return Math.round((done / window) * 100);
}

/**
 * Which streak-milestones are newly reached at `streak`, plus the coins and free
 * grace tokens they grant. A milestone counts once: `alreadyEarned(days)` filters
 * out ones a habit has already banked. Grace-gift milestones (the public
 * "milestone rewards → a grace token so one slip never stings" promise) are those
 * whose `days` are in `graceMilestoneDays`.
 *
 * @param streak             current streak in days
 * @param alreadyEarned      (days) => has this habit already earned that milestone
 * @param milestones         ordered milestone defs ({ days, coins, ... })
 * @param graceMilestoneDays day-thresholds that also gift a grace token
 */
export function selectNewMilestones<M extends { days: number; coins: number }>(
  streak: number,
  alreadyEarned: (days: number) => boolean,
  milestones: readonly M[],
  graceMilestoneDays: ReadonlySet<number> = new Set(),
): { reached: M[]; coins: number; graceGifts: number } {
  const reached: M[] = [];
  let coins = 0;
  let graceGifts = 0;
  for (const m of milestones) {
    if (streak >= m.days && !alreadyEarned(m.days)) {
      reached.push(m);
      coins += m.coins;
      if (graceMilestoneDays.has(m.days)) graceGifts++;
    }
  }
  return { reached, coins, graceGifts };
}

/**
 * Which AA-style coin tiers are newly unlocked, and the highest of them (for the
 * celebration). Build habits use day thresholds and ignore the sub-day (0-day)
 * tiers; quit habits use hour thresholds when `hours` is supplied, else fall back
 * to days. Tiers already in `earnedKeys` are skipped. Because tiers are ordered
 * ascending, `highest` is simply the last newly-unlocked one.
 */
export function selectNewCoinTiers<T extends { key: string; days: number; hours: number }>(
  tiers: readonly T[],
  opts: { isQuit: boolean; days: number; hours?: number; earnedKeys: readonly string[] },
): { newKeys: string[]; highest: T | null } {
  const { isQuit, days, hours, earnedKeys } = opts;
  const pool = isQuit ? tiers : tiers.filter((c) => c.days > 0);
  const newKeys: string[] = [];
  let highest: T | null = null;
  for (const coin of pool) {
    if (earnedKeys.includes(coin.key)) continue;
    const reached = isQuit
      ? (hours !== undefined ? hours >= coin.hours : days >= coin.days)
      : days >= coin.days;
    if (reached) {
      newKeys.push(coin.key);
      highest = coin;
    }
  }
  return { newKeys, highest };
}

export interface SynergyPair {
  a: number;
  b: number;
  coCount: number;
  strength: number;
}

/**
 * Habit "synergies" — the analytics insight that two habits are being built
 * together ("you journal more on days you sleep well"). Enumerates every unordered
 * pair of `count` habits, keeps pairs completed together on at least `minDays` of
 * the window, and grades each pair's `strength` as a 0–1 ramp that saturates at
 * `strengthWindow` co-days. The caller supplies `coCountOf(i, j)` (the number of
 * window days both habit i and j were done) so this stays free of dates/isDone.
 */
export function computeSynergies(
  count: number,
  coCountOf: (i: number, j: number) => number,
  opts: { minDays?: number; strengthWindow?: number } = {},
): SynergyPair[] {
  const minDays = opts.minDays ?? 3;
  const strengthWindow = opts.strengthWindow ?? 20;
  const pairs: SynergyPair[] = [];
  for (let i = 0; i < count; i++) {
    for (let j = i + 1; j < count; j++) {
      const coCount = coCountOf(i, j);
      if (coCount >= minDays) {
        pairs.push({ a: i, b: j, coCount, strength: Math.min(coCount / strengthWindow, 1) });
      }
    }
  }
  return pairs;
}
