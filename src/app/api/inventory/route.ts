import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/ensure-profile";
import { SHOP_ITEMS } from "@/lib/constants";
import { NextResponse } from "next/server";

/** GET /api/inventory — fetch all owned items for current user */
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("user_inventory")
    .select("item_id")
    .eq("user_id", userId)
    .order("created_at");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  // Return as simple string array for client convenience
  return NextResponse.json((data ?? []).map((r: { item_id: string }) => r.item_id));
}

/**
 * POST /api/inventory — purchase & add an item to user's inventory
 * Body: { itemId: string }
 * Server validates: item exists, not already owned, user has enough coins.
 * Deducts coins atomically so client can't cheat.
 */
export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const itemId = typeof body.itemId === "string" ? body.itemId.trim() : "";
  if (!itemId || itemId.length > 100) {
    return NextResponse.json({ error: "Invalid item ID" }, { status: 400 });
  }

  // Validate item exists in the shop catalog
  const shopItem = SHOP_ITEMS.find((i) => i.id === itemId);
  if (!shopItem) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  const supabase = await createServerSupabaseClient();

  // Check if already owned (prevent double-purchase)
  const { data: existing } = await supabase
    .from("user_inventory")
    .select("item_id")
    .eq("user_id", userId)
    .eq("item_id", itemId)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ error: "Already owned" }, { status: 409 });
  }

  // Validate coins — server is the source of truth
  const profile = await ensureProfile(supabase, userId);
  const currentCoins = profile?.coins ?? 0;
  if (currentCoins < shopItem.price) {
    return NextResponse.json({ error: "Not enough coins", need: shopItem.price, have: currentCoins }, { status: 402 });
  }

  // Deduct coins. If this write fails we must NOT grant the item — otherwise the
  // user gets it free and the response still reports success (shift 14 fix).
  const newCoins = currentCoins - shopItem.price;
  const { error: deductError } = await supabase
    .from("profiles")
    .update({ coins: newCoins })
    .eq("clerk_id", userId);
  if (deductError) {
    return NextResponse.json({ error: deductError.message }, { status: 500 });
  }

  // Add to inventory
  const { data, error } = await supabase
    .from("user_inventory")
    .upsert(
      { user_id: userId, item_id: itemId },
      { onConflict: "user_id,item_id" }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ...data, coins: newCoins }, { status: 201 });
}

/**
 * DELETE /api/inventory — remove an item from user's inventory
 * Body: { itemId: string }
 */
export async function DELETE(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const itemId = typeof body.itemId === "string" ? body.itemId.trim() : "";
  if (!itemId) {
    return NextResponse.json({ error: "Invalid item ID" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("user_inventory")
    .delete()
    .eq("user_id", userId)
    .eq("item_id", itemId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
