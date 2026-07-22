/**
 * Canonical app origin helpers. Auth UI lives on www (embedded Clerk components).
 * Do not send users to accounts.hatchtend.com — that Account Portal path fought
 * /sign-in + /sign-up and caused an infinite gray redirect loop.
 */

function normalizeAppOrigin(raw: string): string {
  const trimmed = raw.replace(/\/$/, "");
  if (trimmed === "https://hatchtend.com" || trimmed === "http://hatchtend.com") {
    return "https://www.hatchtend.com";
  }
  return trimmed || "https://www.hatchtend.com";
}

export const APP_ORIGIN = normalizeAppOrigin(
  process.env.NEXT_PUBLIC_APP_URL || "https://www.hatchtend.com",
);

export const GARDEN_URL = `${APP_ORIGIN}/garden`;
