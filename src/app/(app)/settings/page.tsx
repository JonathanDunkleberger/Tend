import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/ensure-profile";
import Link from "next/link";
import { Crown, ChevronLeft } from "lucide-react";
import { SettingsClient } from "./settings-client";

// Standalone (app)-group routes render outside the client THEME map, so they use
// the app's light-theme card look inline (matching the `.cd` aesthetic in globals.css).
const CARD = {
  padding: 18,
  background: "#ffffff",
  border: "1px solid rgba(0,0,0,0.05)",
  borderRadius: 16,
  boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
};

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) return null;
  const supabase = await createServerSupabaseClient();

  const profile = await ensureProfile(supabase, userId);
  const isPro = profile?.tier === "pro";

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "20px 14px 100px", fontFamily: "'DM Sans',sans-serif" }}>
      <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: 22, fontWeight: 500, marginBottom: 20 }}>Settings</h1>

      <div style={{ ...CARD, marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Crown size={18} color={isPro ? "#f59e0b" : "rgba(0,0,0,0.15)"} />
            <span style={{ fontSize: 14, fontWeight: 600 }}>{isPro ? "Tend+" : "Free Plan"}</span>
          </div>
          {isPro ? (
            <SettingsClient />
          ) : (
            <Link href="/pricing" style={{ fontSize: 12, fontWeight: 600, color: "#2e7d32", background: "rgba(76,175,80,0.08)", padding: "6px 14px", borderRadius: 8, textDecoration: "none" }}>
              Upgrade
            </Link>
          )}
        </div>
        {!isPro && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(0,0,0,0.04)", fontSize: 11, color: "rgba(0,0,0,0.45)" }}>
            <p>Free: 3 habit eggs, all wellness tools</p>
            <p style={{ color: "#2e7d32", marginTop: 3 }}>Tend+: Unlimited eggs, choose your dragon</p>
          </div>
        )}
      </div>

      <div style={CARD}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Account</div>
        <p style={{ fontSize: 12, color: "rgba(0,0,0,0.45)", marginBottom: 8 }}>
          Manage your account settings, profile, and security through Clerk.
        </p>
        <Link href="/garden" style={{ fontSize: 12, fontWeight: 600, color: "#2e7d32", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 2 }}>
          <ChevronLeft size={14} /> Back to Home
        </Link>
      </div>
    </div>
  );
}
