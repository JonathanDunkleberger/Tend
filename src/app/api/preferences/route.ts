import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
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
      season: "summer",
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
