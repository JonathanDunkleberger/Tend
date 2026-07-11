import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { Webhook } from "svix";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

type ClerkWebhookEvent = {
  type: string;
  data: {
    id: string;
    email_addresses?: { id: string; email_address: string }[];
    primary_email_address_id?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    image_url?: string | null;
  };
};

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing webhook secret" }, { status: 500 });
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let event: ClerkWebhookEvent;

  try {
    event = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as ClerkWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createAdminSupabaseClient();

  // As with the Stripe webhook: any DB write that fails returns a non-2xx so svix
  // RETRIES the event, instead of the old always-200 that silently dropped a
  // failed profile create/delete with no retry.
  try {
    switch (event.type) {
      case "user.created":
      case "user.updated": {
        const { id, email_addresses, primary_email_address_id, first_name, last_name, image_url } = event.data;
        // Resolve the PRIMARY address (Clerk doesn't guarantee it's index 0);
        // fall back to the first address only if the primary can't be matched.
        const email =
          email_addresses?.find((e) => e.id === primary_email_address_id)?.email_address ??
          email_addresses?.[0]?.email_address;
        const display_name = [first_name, last_name].filter(Boolean).join(" ") || null;

        const payload: Record<string, unknown> = {
          clerk_id: id,
          display_name,
          avatar_url: image_url ?? null,
        };
        // Only write `email` when Clerk provides one, so a `user.updated` that
        // omits email data never clobbers a real stored address with "" (the
        // onConflict:clerk_id upsert is an UPDATE here) — the shift-53 class of bug.
        // But a fresh `user.created` INSERT must satisfy the NOT NULL email column,
        // so fall back to "" (the ensureProfile placeholder) rather than omitting
        // the column and poison-retrying against the constraint.
        if (email) payload.email = email;
        else if (event.type === "user.created") payload.email = "";

        const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "clerk_id" });
        if (error) throw error;
        break;
      }
      case "user.deleted": {
        const { id } = event.data;
        const { error } = await supabase.from("profiles").delete().eq("clerk_id", id);
        if (error) throw error;
        break;
      }
    }
  } catch (err) {
    console.error("Clerk webhook DB write failed:", err);
    return NextResponse.json({ error: "Database write failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
