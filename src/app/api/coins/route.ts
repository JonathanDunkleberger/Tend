import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/ensure-profile";
import { applyCoinDelta, clampCoinTotal } from "@/lib/economy";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { coins, delta, streakFreezes } = body;

  const supabase = await createServerSupabaseClient();

  // Ensure profile exists (auto-creates if missing)
  const existingProfile = await ensureProfile(supabase, userId);

  // ── Delta-based path (preferred) ──
  // NOTE: this is a read-then-write, NOT atomic — concurrent requests can lose an
  // update. The real fix is a Postgres atomic-increment RPC (deferred; see the
  // night-train NEEDS EYES). The delta bound MUST stay above the largest
  // legitimate single grant (the 90-day milestone is +500) or big rewards get
  // silently truncated and the user loses coins on reload — see lib/economy.ts.
  if (typeof delta === "number") {
    const newCoins = applyCoinDelta(existingProfile?.coins ?? 250, delta);
    const updatePayload: Record<string, unknown> = { coins: newCoins };
    if (streakFreezes !== undefined) {
      updatePayload.streak_freezes = streakFreezes;
    }

    const { data, error } = await supabase
      .from("profiles")
      .update(updatePayload)
      .eq("clerk_id", userId)
      .select("coins, streak_freezes")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  // ── Legacy absolute path (kept for backward compat during migration) ──
  if (typeof coins !== "number") {
    return NextResponse.json({ error: "coins or delta must be a number" }, { status: 400 });
  }

  // Clamp absolute value to prevent abuse
  const clampedCoins = clampCoinTotal(coins);

  const updatePayload: Record<string, unknown> = { coins: clampedCoins };
  if (streakFreezes !== undefined) {
    updatePayload.streak_freezes = streakFreezes;
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(updatePayload)
    .eq("clerk_id", userId)
    .select("coins, streak_freezes")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
