import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { APP_ORIGIN, GARDEN_URL } from "@/lib/auth-urls";

// Canonical host is www — apex 308s here. Keep Clerk redirects + OG on the same origin
// or session cookies can land on the wrong host and look like a "blank" / broken sign-in.
const APP_URL = APP_ORIGIN;
const TITLE = "Tend — Grow habits, hatch dragons";
const DESCRIPTION =
  "A calm little garden for building better habits. Each habit is a dragon egg that hatches and evolves as you tend it daily. Assumes the best in you — never shaming.";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: TITLE,
  description: DESCRIPTION,
  keywords: ["habit tracker", "habit building", "self improvement", "dragon eggs", "gamified habits", "streaks", "wellness", "breathing"],
  manifest: "/manifest.json",
  applicationName: "Tend",
  openGraph: {
    type: "website",
    siteName: "Tend",
    title: TITLE,
    description: DESCRIPTION,
    url: APP_URL,
    locale: "en_US",
    // og image is provided by app/opengraph-image.tsx (dynamic 1200x630 card)
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.svg", sizes: "32x32", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Tend",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#2E9E5B",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl={GARDEN_URL}
      signUpFallbackRedirectUrl={GARDEN_URL}
      afterSignOutUrl={APP_ORIGIN}
    >
      <html lang="en">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="preconnect" href="https://clerk.hatchtend.com" />
          <link rel="preconnect" href="https://accounts.hatchtend.com" />
          <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&display=swap" rel="stylesheet" />
        </head>
        <body className="antialiased" style={{ background: "#FBFAF5", fontFamily: "'DM Sans',-apple-system,BlinkMacSystemFont,sans-serif" }}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}