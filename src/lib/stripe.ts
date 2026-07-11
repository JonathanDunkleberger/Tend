import Stripe from "stripe";

/**
 * Lazily-initialized Stripe client.
 *
 * We deliberately DO NOT instantiate Stripe at module scope: doing so calls
 * `new Stripe(process.env.STRIPE_SECRET_KEY!)` the moment any route importing
 * this file is evaluated — which happens during `next build` page-data
 * collection, where env vars aren't present. That threw
 * "Neither apiKey nor config.authenticator provided" and failed the build.
 *
 * Instead, callers invoke `getStripe()` inside request handlers, so the key is
 * only read (by NAME, never logged) when an actual request is served.
 */
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  _stripe = new Stripe(key, {
    apiVersion: "2026-02-25.clover",
    typescript: true,
  });
  return _stripe;
}
