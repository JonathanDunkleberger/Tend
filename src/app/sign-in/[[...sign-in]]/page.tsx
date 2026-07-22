"use client";

import { SignIn, ClerkLoaded, ClerkLoading } from "@clerk/nextjs";

const cardAppearance = {
  elements: {
    card: "rounded-3xl shadow-lg border border-green-100",
    formButtonPrimary: "bg-green-500 hover:bg-green-600 rounded-2xl",
    footerActionLink: "text-green-600",
  },
} as const;

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-cream-100 flex items-center justify-center p-4">
      <div className="text-center w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <span style={{ fontFamily: "'Fraunces',serif", fontSize: 24, fontWeight: 500 }}>
            tend<span style={{ color: "#2E9E5B" }}>.</span>
          </span>
        </div>

        <ClerkLoading>
          <p style={{ color: "rgba(0,0,0,0.45)", fontSize: 14, marginBottom: 8 }}>
            Loading sign-in…
          </p>
          <p style={{ color: "rgba(0,0,0,0.35)", fontSize: 12, lineHeight: 1.45 }}>
            If this never finishes, hard-refresh (Ctrl+Shift+R) or try Incognito —
            a stuck auth script is almost always a browser cache from an earlier SSL glitch.
          </p>
        </ClerkLoading>

        <ClerkLoaded>
          <SignIn
            forceRedirectUrl="/garden"
            signUpUrl="/sign-up"
            appearance={cardAppearance}
          />
        </ClerkLoaded>
      </div>
    </div>
  );
}
