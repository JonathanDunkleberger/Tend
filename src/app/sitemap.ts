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
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://tendhabit.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: APP_URL,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
