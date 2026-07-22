"use client";

import { SignIn } from "@clerk/nextjs";
import { AuthScreen } from "@/components/auth-screen";

const appearance = {
  elements: {
    rootBox: "mx-auto w-full",
    card: "rounded-3xl shadow-lg border border-green-100 !bg-white",
    formButtonPrimary: "bg-[#2E9E5B] hover:bg-[#1F7A46] rounded-2xl",
    footerActionLink: "text-[#2E9E5B]",
    headerTitle: "hidden",
    headerSubtitle: "hidden",
  },
} as const;

export default function SignInPage() {
  return (
    <AuthScreen mode="sign-in">
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        forceRedirectUrl="/garden"
        fallbackRedirectUrl="/garden"
        appearance={appearance}
      />
    </AuthScreen>
  );
}
