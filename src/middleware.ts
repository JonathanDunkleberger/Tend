import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Clerk middleware — REQUIRED for `auth()` to work in the App Router.
 *
 * Without this file every server-side `auth()` call throws
 * "clerkMiddleware() was not run" and the page 500s. It lives at
 * `src/middleware.ts` because this project uses the `src/` directory.
 *
 * Public: landing (/), sign-in, sign-up, and Stripe/Clerk webhooks (verified by
 * signature, not Clerk session). Everything else requires a signed-in user.
 */
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Run on everything except Next internals and static asset files…
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|gif|png|svg|ico|webp|avif|woff2?|ttf|otf|map)).*)",
    // …and always run on API/TRPC routes.
    "/(api|trpc)(.*)",
  ],
};
