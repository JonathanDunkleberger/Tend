import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://tendhabit.com";
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
  themeColor: "#0a0e18",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&display=swap" rel="stylesheet" />
        </head>
        <body className="antialiased" style={{ background: "#f8f8f6", fontFamily: "'DM Sans',-apple-system,BlinkMacSystemFont,sans-serif" }}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
