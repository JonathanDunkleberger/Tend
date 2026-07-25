import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Clerk middleware — REQUIRED for `auth()` to work in the App Router.
 *
 * NOTE: this file MUST live at `src/middleware.ts` because this project keeps
 * its code in `src/` — Next.js only picks up middleware from the same directory
 * that contains `app/`. A copy at the repo ROOT is ignored by `next dev`
 * (Clerk then throws "clerkMiddleware() was not run" and every page 500s),
 * which is exactly the bug that broke local auth for a week in Jul 2026.
 * Do NOT "consolidate" this file back to the repo root.
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
  "/api/qa-log",
  "/api/qa-clerk",
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    // Always send humans to our branded sign-in (never a blank protect-rewrite 404).
    await auth.protect({
      unauthenticatedUrl: new URL("/sign-in", request.url).toString(),
    });
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
