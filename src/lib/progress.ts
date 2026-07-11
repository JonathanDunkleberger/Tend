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

/** One weekday's completion tally: how many done out of how many counted. */
export interface DayTally {
  done: number;
  total: number;
  pct: number;
}

/**
 * Day-of-week completion rates over a set of dates, for the "which day do I tend
 * best/worst?" analytics on Insights and in Wrapped.
 *
 * A day is only counted for a habit when it's on or after that habit's start
 * date — a day BEFORE a habit existed is not a "miss" and must not inflate the
 * denominator (this mirrors computeConsistency's age cap; without it a 3-day-old
 * habit reads ~0% on every weekday and fabricates a bogus "you slip on Tuesdays"
 * insight). Kept framework-free: the caller supplies `dayIndexOf(date)` (0=Sun…
 * 6=Sat) and `isDone(id, date)`, so nothing here touches `Date` or React.
 *
 * @param dates      the window of ISO `YYYY-MM-DD` dates to tally
 * @param habits     `{ id, startDate }` — startDate is the ISO date the habit began
 * @param isDone     (id, date) => was that habit completed on that date
 * @param dayIndexOf (date) => weekday index 0=Sun … 6=Sat
 * @returns 7 tallies indexed 0=Sun … 6=Sat, each with done/total/pct (pct 0–100)
 */
export function computeDayOfWeekRates(
  dates: readonly string[],
  habits: readonly { id: string; startDate: string }[],
  isDone: (id: string, date: string) => boolean,
  dayIndexOf: (date: string) => number,
): DayTally[] {
  const done = [0, 0, 0, 0, 0, 0, 0];
  const total = [0, 0, 0, 0, 0, 0, 0];
  for (const d of dates) {
    const idx = dayIndexOf(d);
    if (idx < 0 || idx > 6) continue;
    for (const h of habits) {
      if (d < h.startDate) continue; // day predates the habit — not a miss
      total[idx]++;
      if (isDone(h.id, d)) done[idx]++;
    }
  }
  return total.map((t, i) => ({
    done: done[i],
    total: t,
    pct: t > 0 ? Math.round((done[i] / t) * 100) : 0,
  }));
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

/**
 * Streak-length-over-time — the "streak history" analytic. For each day in a
 * trailing window, counts the consecutive completed days ENDING at (and including)
 * that day, so the series tells the story of streaks climbing and resetting.
 *
 * Derived purely from an offset predicate so it never touches Date/timezones:
 * `isDoneAgo(offset)` answers "was it done `offset` days before today" (0 = today,
 * increasing = further past). Each day walks back up to `lookback` days until it
 * hits a miss. Returns `windowDays` values ordered OLDEST→NEWEST (left→right for a
 * chart); the last element is today's live streak.
 */
export function computeStreakSeries(
  isDoneAgo: (offset: number) => boolean,
  windowDays: number,
  lookback = 120,
): number[] {
  const series: number[] = [];
  for (let d = windowDays - 1; d >= 0; d--) {
    let s = 0;
    for (let k = 0; k < lookback && isDoneAgo(d + k); k++) s++;
    series.push(s);
  }
  return series;
}
