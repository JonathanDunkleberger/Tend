import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Clerk middleware — REQUIRED for `auth()` to work in the App Router.
 *
 * NOTE: this file lives at the REPO ROOT, and Next.js uses it in preference to
 * any `src/middleware.ts`. (A duplicate once existed under `src/`; it was dead —
 * root wins — and has been removed to avoid two diverging matchers. If you ever
 * see auth changes "not taking effect", check you're editing THIS file.)
 *
 * Public routes: landing (/), sign-in, sign-up, Stripe/Clerk webhooks (verified
 * by signature, not a Clerk session), the dynamically-generated
 * `/opengraph-image` share card, the SEO metadata
 * routes `/robots.txt` + `/sitemap.xml`, and the PWA `/manifest.json`
 * (browsers fetch all four unauthenticated — as a plain resource fetch, not a
 * page navigation — so they MUST be public; their extensions aren't in the
 * static-asset skip list below [".json" deliberately isn't skipped there, or
 * every API route response would be treated as a static asset too], so
 * without this they'd hit auth.protect(), which — for a non-navigation
 * request — answers with a 404 instead of a sign-in redirect. That's exactly
 * why the manifest silently 404's in the browser console: it's real, but a
 * middleware gap, not a missing file).
 * Everything else requires a signed-in user.
 */
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/privacy(.*)",
  "/terms(.*)",
  "/opengraph-image(.*)",
  "/robots.txt",
  "/sitemap.xml",
  "/manifest.json",
  "/api/webhooks(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
