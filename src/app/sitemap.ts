import type { MetadataRoute } from "next";

/**
 * /sitemap.xml — enumerates the crawlable public URLs for search engines.
 *
 * Only the marketing landing (`/`) is public + indexable; every other route is
 * auth-gated (see middleware.ts) and would just redirect a crawler to sign-in,
 * so it's deliberately excluded (and disallowed in robots.ts). A single-URL
 * sitemap is still worthwhile: it declares the canonical URL + lastModified and
 * is referenced from robots.txt, which is what lets Google discover the landing's
 * JSON-LD rich results (see app/page.tsx). Generated statically by Next.
 */
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.hatchtend.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: APP_URL, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${APP_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${APP_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
