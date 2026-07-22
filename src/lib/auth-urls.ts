/**
 * Canonical auth entrypoints for production Tend.
 *
 * Clerk Production uses the Account Portal on accounts.hatchtend.com
 * (display_config.sign_in_url / sign_up_url). Landing CTAs and middleware must
 * send humans there, then bounce back to /garden on the www host.
 */

function normalizeAppOrigin(raw: string): string {
  const trimmed = raw.replace(/\/$/, "");
  // Apex permanently redirects to www — keep session + redirects on one host.
  if (trimmed === "https://hatchtend.com" || trimmed === "http://hatchtend.com") {
    return "https://www.hatchtend.com";
  }
  return trimmed || "https://www.hatchtend.com";
}

export const APP_ORIGIN = normalizeAppOrigin(
  process.env.NEXT_PUBLIC_APP_URL || "https://www.hatchtend.com",
);

export const GARDEN_URL = `${APP_ORIGIN}/garden`;

/** Clerk Account Portal (Production custom domain). */
export const CLERK_ACCOUNTS_ORIGIN = "https://accounts.hatchtend.com";

export function accountPortalSignInUrl(redirectTo: string = GARDEN_URL): string {
  const url = new URL("/sign-in", CLERK_ACCOUNTS_ORIGIN);
  url.searchParams.set("redirect_url", redirectTo);
  return url.toString();
}

export function accountPortalSignUpUrl(redirectTo: string = GARDEN_URL): string {
  const url = new URL("/sign-up", CLERK_ACCOUNTS_ORIGIN);
  url.searchParams.set("redirect_url", redirectTo);
  return url.toString();
}