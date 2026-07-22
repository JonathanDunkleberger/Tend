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
 * by signature, not a Clerk session), the auth-free `/preview` QA/showcase
 * harness (mock data only, no secrets — see src/app/preview/page.tsx), the
 * dynamically-generated `/opengraph-image` share card, and the SEO metadata
 * routes `/robots.txt` + `/sitemap.xml` (search crawlers fetch all three
 * unauthenticated, so they MUST be public — their extensions aren't in the
 * static-asset skip list below, so without this they'd hit auth.protect()).
 * Everything else requires a signed-in user.
 */
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/privacy(.*)",
  "/terms(.*)",
  "/preview(.*)",
  "/opengraph-image(.*)",
  "/robots.txt",
  "/sitemap.xml",
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
