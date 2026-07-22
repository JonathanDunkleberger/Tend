/**
 * Tend pricing & entitlement constants - single source of truth for copy + gates.
 *
 * Product story:
 *   Free  - warm hook. Enough eggs + dragons + wellness to feel the magic.
 *   Tend+ - depth & expression for people building a 12-18 month life change.
 *
 * Economics (side-project friendly, goodwill-first):
 *   $4.99/mo   - low-friction try
 *   $29.99/yr  - primary plan (~$2.50/mo, ~50% vs paying monthly)
 *   $39.99     - lifetime (one payment; for subscription-averse)
 *
 * Stripe Price IDs come from env. Displayed amounts here must match those Prices.
 */

/** Free tier: how many active habit eggs */
export const FREE_HABIT_LIMIT = 5;

/**
 * Free-tier dragon species (1-36). One or two commons per element so the garden
 * still feels like a collection without unlocking the full catalog.
 */
export const FREE_SPECIES_IDS = [1, 2, 6, 7, 11, 12, 17, 18, 23, 24, 29, 30] as const;

export const FREE_SPECIES_COUNT = FREE_SPECIES_IDS.length;

export function isFreeSpecies(speciesId: number): boolean {
  return (FREE_SPECIES_IDS as readonly number[]).includes(speciesId);
}

/** Display prices - keep in sync with Stripe Dashboard prices */
export const PRICE_MONTHLY_DISPLAY = "$4.99";
export const PRICE_YEARLY_DISPLAY = "$29.99";
export const PRICE_LIFETIME_DISPLAY = "$39.99";
export const PRICE_MONTHLY_CENTS = 499;
export const PRICE_YEARLY_CENTS = 2999;
export const PRICE_LIFETIME_CENTS = 3999;

/** Effective monthly on annual plan */
export const PRICE_YEARLY_PER_MONTH_DISPLAY = "$2.50";

/** Savings vs 12x monthly ($59.88) -> ~50% */
export const YEARLY_SAVE_PERCENT = 50;

export type CheckoutPlan = "monthly" | "annual" | "lifetime";

export const TEND_PLUS_FEATURES = [
  "Unlimited habit eggs",
  "All 36 dragon species",
  "Deep insights and pattern maps",
  "All garden decor and themes",
  "+5 daily Tend+ coins",
  "Extra grace tokens",
] as const;

export const FREE_TIER_FEATURES = [
  `${FREE_HABIT_LIMIT} habit eggs`,
  `${FREE_SPECIES_COUNT} starter dragons`,
  "Daily check-in, streaks and coins",
  "Hatching and evolution ceremonies",
  "All wellness tools (breathe, urge, calm)",
  "Tend Wrapped and daily wisdom",
] as const;
