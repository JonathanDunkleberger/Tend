// ── Quit-mode economy + relapse-evolution math (pure, unit-tested) ──────────
//
// Tend keeps "quit a bad habit" as a first-class MODE inside the dragon garden.
// The numbers below are emotionally loaded — the dollars a user has saved, and
// how far their dragon regresses when they slip — so they must be correct, not
// trusted by cold-read. This kernel is framework-free (no React, no live state):
// callers pass plain values and the tend-app monolith delegates to it, exactly
// like src/lib/streak.ts and src/lib/progress.ts. See progress.test.ts / quit.test.ts.

import { daysBetween, getStage } from "./utils";

/** Whole clean days for a quit habit — days since the quit timestamp (0 if never started). */
export function computeCleanDays(quitDate: string | undefined, today: string): number {
  if (!quitDate) return 0;
  return daysBetween(quitDate, today);
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
    return sum + (q.dailyCost || 0) * daysBetween(q.quitDate, today);
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

/** Apply the relapse stage-drop penalty — never below the egg (stage 0). Shared by build + quit habits. */
export function applyStageDrop(rawStage: number, drops: number | undefined): number {
  return Math.max(0, rawStage - (drops || 0));
}

/**
 * Dragon evolution stage for a quit habit. The best-ever clean streak (not the current one)
 * drives the stage, so a single relapse gently drops the dragon one tier via `drops` rather
 * than wiping progress. Returns 0 (egg) before the habit is ever started.
 */
export function computeQuitStage(
  quitDate: string | undefined,
  priorBest: number | undefined,
  today: string,
  drops: number = 0,
): number {
  if (!quitDate) return 0;
  const cleanDays = daysBetween(quitDate, today);
  const best = computeQuitBest(cleanDays, priorBest);
  return applyStageDrop(getStage(best), drops);
}
