// ── Core-loop math ────────────────────────────────────────────────────────
// Pure, side-effect-free streak/grace/best-streak logic — the emotional heart
// of Tend (streaks, "one slip never stings" grace tokens, milestone rewards).
//
// This lives OUTSIDE the tend-app monolith on purpose: it is the one part of the
// daily loop that can be verified without a browser or auth, so it gets a real
// unit-test suite (streak.test.ts). tend-app.tsx delegates to these so there is a
// single, tested source of truth. Callers pass an `isDone(n)` predicate (was the
// habit completed n days ago, 0 = today) so this file is decoupled from React
// state and from date formatting entirely.

// Defensive lookback cap — real completion history is finite, but a corrupt
// "always done" predicate must never spin forever. ~274 years; unreachable in
// practice, so it never alters a real streak.
const MAX_LOOKBACK = 100_000;

/**
 * Consecutive-day streak with grace-freeze bridging.
 *
 * Today counts only once it's done — an as-yet-unlogged today never *breaks* the
 * streak (the day isn't over), it just doesn't add to it yet. A grace token may
 * bridge up to `maxFreezes` missed days so one slip doesn't reset progress.
 *
 * @param isDone   (n) => was the habit completed n days ago (0 = today)
 * @param maxFreezes how many missed days grace tokens may bridge (0 = none)
 */
export function computeStreak(isDone: (n: number) => boolean, maxFreezes = 0): number {
  let s = 0;
  // If today isn't done yet, start counting from yesterday (don't break mid-day).
  let d = isDone(0) ? 0 : 1;
  let gaps = 0;
  while (d < MAX_LOOKBACK) {
    if (isDone(d)) {
      s++;
      d++;
    } else if (d > 0 && gaps < maxFreezes) {
      // A grace token bridges this missed day.
      gaps++;
      d++;
    } else {
      break;
    }
  }
  return s;
}

/**
 * Is a grace token *actively* bridging a gap right now (i.e. saving this streak)?
 * True when the streak-with-freezes exceeds the raw consecutive (no-freeze) streak.
 * Drives the glowing shield badge on the garden row.
 */
export function computeGraceActive(isDone: (n: number) => boolean, freezes: number): boolean {
  if (freezes <= 0) return false;
  let raw = 0;
  let d = isDone(0) ? 0 : 1;
  while (d < MAX_LOOKBACK && isDone(d)) {
    raw++;
    d++;
  }
  return computeStreak(isDone, freezes) > raw;
}

/**
 * Historical best (longest ever) consecutive run from a list of completion dates
 * ("YYYY-MM-DD"). Duplicate dates are ignored; a gap of >1 day resets the run.
 * Callers typically take Math.max with the *current* streak (which may include
 * grace bridging) to get the all-time best.
 */
export function computeBestStreak(logDates: string[]): number {
  const dates = [...logDates].sort();
  if (!dates.length) return 0;
  let best = 1;
  let run = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1] + "T12:00:00");
    const curr = new Date(dates[i] + "T12:00:00");
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000);
    if (diffDays === 1) {
      run++;
      best = Math.max(best, run);
    } else if (diffDays > 1) {
      run = 1;
    }
    // diffDays === 0 → duplicate date, skip
  }
  return best;
}
