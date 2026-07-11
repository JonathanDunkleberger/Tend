// ── Quit-mode economy + relapse-evolution math (pure, unit-tested) ──────────
//
// Tend keeps "quit a bad habit" as a first-class MODE inside the dragon garden.
// The numbers below are emotionally loaded — the dollars a user has saved, and
// how far their dragon regresses when they slip — so they must be correct, not
// trusted by cold-read. This kernel is framework-free (no React, no live state):
// callers pass plain values and the tend-app monolith delegates to it, exactly
// like src/lib/streak.ts and src/lib/progress.ts. See progress.test.ts / quit.test.ts.

import { daysBetween, getStage } from "./utils";

/**
 * Normalize a quit date to its LOCAL calendar date (YYYY-MM-DD).
 *
 * A relapse stores the exact instant via `new Date().toISOString()` (UTC), but the
 * whole app keys days by the LOCAL date (`today()`/`daysAgo()`). Counting clean days
 * by comparing that raw UTC instant against today-at-noon under-counted anyone who
 * quit in the evening — e.g. a 6pm quitter read 0 clean days for ~two calendar days.
 * Anchoring both endpoints to the local calendar date (like the `isStarted` slice in
 * tend-app already does) makes clean-days consistent for morning AND evening quitters
 * and matches the rest of the app's date-keying. Date-only inputs are anchored to
 * noon so a UTC parse can't roll them to the previous day in a negative-offset zone.
 */
function quitLocalDate(quitDate: string): string {
  const d = quitDate.includes("T") ? new Date(quitDate) : new Date(quitDate + "T12:00:00");
  if (isNaN(d.getTime())) return quitDate;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Whole clean days for a quit habit — local calendar days since the quit date (0 if never started). */
export function computeCleanDays(quitDate: string | undefined, today: string): number {
  if (!quitDate) return 0;
  return daysBetween(quitLocalDate(quitDate), today);
}

/** Money saved for ONE quit habit, rounded to whole cents (the figure shown in celebrations/subtitles). */
export function computeMoneySaved(dailyCost: number | undefined, cleanDays: number): number {
  return Math.round((dailyCost || 0) * cleanDays * 100) / 100;
}

export interface QuitSavingEntry {
  quitDate?: string;
  dailyCost?: number;
}

/** Total money saved across every quit habit (unrounded running sum; the header figure). */
export function computeTotalSaved(entries: QuitSavingEntry[], today: string): number {
  return entries.reduce((sum, q) => {
    if (!q.quitDate) return sum;
    return sum + (q.dailyCost || 0) * daysBetween(quitLocalDate(q.quitDate), today);
  }, 0);
}

/**
 * Best streak preserved across a relapse: the max of the current clean run and the prior best.
 * This is why a slip resets clean-days to 0 but does NOT reset the dragon to an egg — the
 * best-ever run keeps driving evolution, softened only by the stage-drop penalty below.
 */
export function computeQuitBest(cleanDays: number, priorBest: number | undefined): number {
  return Math.max(cleanDays, priorBest ?? 0);
}

/** Lower a stage by a whole number of tiers — never below the egg (stage 0). */
export function applyStageDrop(rawStage: number, drops: number | undefined): number {
  return Math.max(0, rawStage - (drops || 0));
}

/**
 * Dragon evolution stage for a quit habit — gentle and self-healing by design.
 *
 * The stage is the higher of:
 *   • what the CURRENT clean run has earned (heals fully as you rebuild), and
 *   • a floor one tier below your ALL-TIME-BEST clean run (a relapse never wipes
 *     the dragon back to an egg — it only ever slips one gentle tier below its peak).
 *
 * A relapse resets the current run to 0, so the dragon visibly drops one tier the
 * moment you slip, then climbs back as you tend it again — and no matter HOW many
 * times you slip it is never worse than one tier below your best. This is why we no
 * longer track a running `stageDrops` counter: an accumulating penalty could pin the
 * dragon at an egg forever after a handful of slips, which contradicts Tend's soul
 * (assumes the best in you; never shaming). Returns 0 (egg) before the habit starts.
 */
export function computeQuitStage(
  quitDate: string | undefined,
  priorBest: number | undefined,
  today: string,
): number {
  if (!quitDate) return 0;
  const cleanDays = daysBetween(quitLocalDate(quitDate), today);
  const currentStage = getStage(cleanDays);
  const best = computeQuitBest(cleanDays, priorBest);
  const floor = applyStageDrop(getStage(best), 1);
  return Math.max(currentStage, floor);
}
