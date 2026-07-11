/**
 * /preview — PUBLIC, auth-free QA/showcase harness (server wrapper).
 *
 * This thin server component reads a `?view=` query param and hands it to the
 * client harness as the INITIAL view. That matters for the offline screenshot
 * pipeline (scripts/, §14 of TEND_NIGHTTRAIN.md): the sandbox can only render a
 * client component's pre-hydration SSR markup via file://, so it can only "see"
 * the DEFAULT view. Driving the initial view from the URL lets the pipeline fetch
 * /preview?view=insights, /preview?view=garden, etc. and screenshot each surface
 * without any tab-switching JS. In a real browser the in-page tabs still work.
 *
 * See preview-client.tsx for the actual harness. Made public in middleware.ts.
 */

import { PreviewClient, type View } from "./preview-client";

export const dynamic = "force-dynamic";

// Kept in the SERVER module (not imported from the "use client" harness): a value
// imported across the client boundary is a reference proxy, not a real array.
const VIEW_KEYS: View[] =
  ["garden", "insights", "detail", "hatch", "evolve", "gallery", "onboarding", "wellness", "wrapped", "you", "breathe", "nav"];

export default async function PreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; dark?: string }>;
}) {
  const { view, dark } = await searchParams;
  const initialView = (VIEW_KEYS as string[]).includes(view ?? "")
    ? (view as View)
    : "garden";
  return <PreviewClient initialView={initialView} initialDark={dark === "1"} />;
}
