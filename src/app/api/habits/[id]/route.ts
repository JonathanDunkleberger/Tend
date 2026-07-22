import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/ensure-profile";
import { HABIT_COLORS } from "@/lib/constants";
import { isFreeSpecies } from "@/lib/pricing";
import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("habits").select("*").eq("id", id).eq("user_id", userId).single();
  if (error) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();

  // Allowlist: only permit safe fields to be updated
  const ALLOWED_FIELDS = ["name", "color", "icon_name", "category", "is_archived", "is_paused", "sort_order", "creature_name", "creature_type"];
  const sanitized: Record<string, unknown> = {};
  for (const key of ALLOWED_FIELDS) {
    if (key in body) sanitized[key] = body[key];
  }
  if (Object.keys(sanitized).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const profile = await ensureProfile(supabase, userId);
  const isPro = profile?.tier === "pro";

  if ("creature_type" in sanitized) {
    const species = sanitized.creature_type;
    if (typeof species !== "number" || species < 1 || species > 36) {
      return NextResponse.json({ error: "Invalid dragon species." }, { status: 400 });
    }
    if (!isPro && !isFreeSpecies(species)) {
      return NextResponse.json(
        { error: "That dragon is part of Tend+. Upgrade to unlock all 36 species." },
        { status: 403 }
      );
    }
  }

  if ("color" in sanitized && !isPro) {
    const color = sanitized.color;
    if (typeof color !== "string" || !(HABIT_COLORS as readonly string[]).includes(color)) {
      return NextResponse.json(
        { error: "Custom colours are part of Tend+. Upgrade to unlock them." },
        { status: 403 }
      );
    }
  }

  const { data, error } = await supabase.from("habits").update(sanitized).eq("id", id).eq("user_id", userId).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("habits").delete().eq("id", id).eq("user_id", userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
