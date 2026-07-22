import type { MetadataRoute } from "next";

/**
 * /robots.txt — crawler directives. Complements the landing's structured data
 * (app/opengraph-image.tsx + the JSON-LD in app/page.tsx): tells search engines
 * to crawl the public marketing landing, points them at the sitemap, and keeps
 * them out of the auth-gated app + the /preview QA harness (both would only
 * redirect to sign-in or expose a mock-data page — wasted crawl budget / thin
 * results). Generated statically by Next; no client JS.
 *
 * NOTE: `/robots.txt` and `/sitemap.xml` are added to the PUBLIC route matcher
 * in middleware.ts — otherwise Clerk's auth.protect() intercepts them (their
 * extensions aren't in the middleware's static-asset skip list), same gotcha
 * as /opengraph-image.
 */
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.hatchtend.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/garden",
        "/settings",
        "/pricing",
        "/sign-in",
        "/sign-up",
        "/preview",
        "/api/",
      ],
    },
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
