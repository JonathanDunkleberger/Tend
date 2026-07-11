import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Guard the body parse (an empty/malformed request would otherwise throw an
  // unhandled 500 — the sibling log route already wraps this).
  let body: { intensity?: unknown; note?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  // Clamp intensity to the 1–10 scale the UI uses (a client could otherwise
  // persist -100 or a huge value) and cap the free-text note length.
  const rawIntensity = Number(body?.intensity);
  const intensity = Number.isFinite(rawIntensity)
    ? Math.min(10, Math.max(1, Math.round(rawIntensity)))
    : 5;
  const note = typeof body?.note === "string" ? body.note.slice(0, 500) : null;

  const supabase = await createServerSupabaseClient();

  // Verify habit belongs to user
  const { data: habit } = await supabase.from("habits").select("id").eq("id", id).eq("user_id", userId).single();
  if (!habit) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data, error } = await supabase
    .from("relapse_events")
    .insert({
      habit_id: id,
      intensity,
      note,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}
