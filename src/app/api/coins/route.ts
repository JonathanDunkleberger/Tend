import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/ensure-profile";
import { applyCoinDelta, clampCoinDelta, clampCoinTotal } from "@/lib/economy";
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
  // The delta bound MUST stay above the largest legitimate single grant (the
  // 90-day milestone is +500) or big rewards get silently truncated and the user
  // loses coins on reload — see lib/economy.ts.
  if (typeof delta === "number") {
    const clampedDelta = clampCoinDelta(delta);

    // Atomic path (migration-009): a single UPDATE `coins = coins + delta` runs
    // under a row lock, so two concurrent requests can no longer read the same
    // balance and clobber each other (the old read-then-write lost-update race).
    // Falls back to read-then-write below if the RPC isn't present yet (migration
    // not run), so the route keeps working before/without migration-009.
    const { data: rpcCoins, error: rpcError } = await supabase.rpc("tend_increment_coins", {
      p_clerk_id: userId,
      p_delta: clampedDelta,
    });

    if (!rpcError && typeof rpcCoins === "number") {
      // streak_freezes is a whole-object replace (not an increment) so it has no
      // race to guard; write it separately when provided.
      if (streakFreezes !== undefined) {
        await supabase
          .from("profiles")
          .update({ streak_freezes: streakFreezes })
          .eq("clerk_id", userId);
      }
      return NextResponse.json({ coins: rpcCoins, streak_freezes: streakFreezes ?? null });
    }

    // Fallback: non-atomic read-then-write (pre-migration-009).
    const newCoins = applyCoinDelta(existingProfile?.coins ?? 250, clampedDelta);
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
