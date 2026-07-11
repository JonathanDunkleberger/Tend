/**
 * Coin-economy clamps — the server-side guards on how much a single request may
 * move a user's coin balance. Extracted pure so they can be unit-tested and so
 * client and server stay honest about the same bounds.
 *
 * WHY THIS EXISTS (shift 14 bug): the coins route originally clamped every delta
 * to a max of +100. But legitimate single grants go much higher — the 60-day
 * streak milestone gifts +200 and the 90-day gifts +500 (see MILESTONES), and a
 * first-load streak that crosses several milestones at once can sum to ~900. The
 * client optimistically adds the FULL reward, so any server clamp below the
 * largest legit grant silently under-credits the user and they lose coins on the
 * next reload (balance rehydrates from the server). The positive bound must sit
 * ABOVE the largest legitimate single-request grant, not below it.
 */

/** Largest legit single-request grant is ~901 (all build milestones crossed at
 *  once: 1+5+15+30+50+100+200+500); 1000 covers it with headroom while still
 *  blocking absurd values. */
export const MAX_COIN_DELTA = 1000;
/** Only negative delta in the app is a grace-token purchase (−50); −500 is
 *  ample and blocks a malicious client from zeroing an arbitrary balance in one
 *  shot. */
export const MIN_COIN_DELTA = -500;
/** Absolute-balance ceiling for the legacy set-absolute path (onboarding etc.). */
export const MAX_COIN_TOTAL = 10000;

/** Clamp a per-request coin delta to the allowed range. */
export function clampCoinDelta(delta: number): number {
  return Math.max(MIN_COIN_DELTA, Math.min(MAX_COIN_DELTA, delta));
}

/** Clamp an absolute coin total to [0, MAX_COIN_TOTAL]. */
export function clampCoinTotal(coins: number): number {
  return Math.max(0, Math.min(MAX_COIN_TOTAL, coins));
}

/** Apply a clamped delta to a current balance, flooring the result at 0. */
export function applyCoinDelta(current: number, delta: number): number {
  return Math.max(0, current + clampCoinDelta(delta));
}
