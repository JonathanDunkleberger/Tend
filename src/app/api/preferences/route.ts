import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSeason } from "@/lib/constants";
import { NextResponse } from "next/server";

/** GET /api/preferences — fetch user preferences (or defaults) */
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    // Return defaults — row may not exist yet
    return NextResponse.json({
      dark_mode: false,
      season: getSeason(),
      earned_milestone_coins: {},
      stage_drops: {},
      onboarding_complete: false,
      last_checkin_date: null,
      last_bonus_date: null,
      gratitude_entries: [],
    });
  }
  return NextResponse.json(data);
}

/**
 * PUT /api/preferences — upsert user preferences
 * Body: partial { dark_mode, season, earned_milestone_coins, stage_drops }
 */
export async function PUT(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  // Build update payload from allowed fields
  const allowed: Record<string, unknown> = {};
  if (typeof body.dark_mode === "boolean") allowed.dark_mode = body.dark_mode;
  if (typeof body.season === "string") allowed.season = body.season;
  if (body.earned_milestone_coins && typeof body.earned_milestone_coins === "object") {
    allowed.earned_milestone_coins = body.earned_milestone_coins;
  }
  if (body.stage_drops && typeof body.stage_drops === "object") {
    allowed.stage_drops = body.stage_drops;
  }
  // Server-persisted UI state (was localStorage-only before)
  if (typeof body.onboarding_complete === "boolean") allowed.onboarding_complete = body.onboarding_complete;
  if (typeof body.last_checkin_date === "string") allowed.last_checkin_date = body.last_checkin_date;
  if (typeof body.last_bonus_date === "string") allowed.last_bonus_date = body.last_bonus_date;
  // Wellness gratitude log — append-only array of { date, items[] }, capped to 60
  if (Array.isArray(body.gratitude_entries)) allowed.gratitude_entries = body.gratitude_entries.slice(-60);

  if (Object.keys(allowed).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();

  // MERGE the append-only jsonb fields with what's already stored instead of
  // blind-replacing. Both grow monotonically (milestone coins are never un-earned;
  // gratitude is append-only), so without this a stale snapshot PUT from a second
  // device would WIPE entries this device never saw. A read-then-merge here can at
  // worst momentarily miss a truly-concurrent add (self-heals on the next sync),
  // whereas a blind replace permanently deletes. Other fields stay last-write-wins.
  const mergeCoins = allowed.earned_milestone_coins && typeof allowed.earned_milestone_coins === "object";
  const mergeGratitude = Array.isArray(allowed.gratitude_entries);
  if (mergeCoins || mergeGratitude) {
    const { data: cur } = await supabase
      .from("user_preferences")
      .select("earned_milestone_coins, gratitude_entries")
      .eq("user_id", userId)
      .single();

    if (mergeCoins) {
      const stored = (cur?.earned_milestone_coins as Record<string, string[]>) ?? {};
      const incoming = allowed.earned_milestone_coins as Record<string, string[]>;
      const merged: Record<string, string[]> = { ...stored };
      for (const [k, v] of Object.entries(incoming)) {
        const prev = Array.isArray(merged[k]) ? merged[k] : [];
        merged[k] = Array.from(new Set([...prev, ...(Array.isArray(v) ? v : [])]));
      }
      allowed.earned_milestone_coins = merged;
    }

    if (mergeGratitude) {
      const stored = Array.isArray(cur?.gratitude_entries)
        ? (cur!.gratitude_entries as { date: string; items: string[] }[])
        : [];
      const incoming = allowed.gratitude_entries as { date: string; items: string[] }[];
      const byDate = new Map<string, { date: string; items: string[] }>();
      for (const e of stored) if (e?.date) byDate.set(e.date, e);
      for (const e of incoming) if (e?.date) byDate.set(e.date, e); // same-day: incoming wins
      allowed.gratitude_entries = Array.from(byDate.values())
        .sort((a, b) => (a.date < b.date ? -1 : 1))
        .slice(-60);
    }
  }

  const { data, error } = await supabase
    .from("user_preferences")
    .upsert(
      { user_id: userId, ...allowed },
      { onConflict: "user_id" }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
