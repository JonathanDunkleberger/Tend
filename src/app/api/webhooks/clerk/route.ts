import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { Webhook } from "svix";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

type ClerkWebhookEvent = {
  type: string;
  data: {
    id: string;
    email_addresses?: { email_address: string }[];
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

  switch (event.type) {
    case "user.created":
    case "user.updated": {
      const { id, email_addresses, first_name, last_name, image_url } = event.data;
      const email = email_addresses?.[0]?.email_address;
      const display_name = [first_name, last_name].filter(Boolean).join(" ") || null;

      // Only write `email` when Clerk actually provides one. A `user.updated`
      // event that omits email data would otherwise upsert email:"" over a real
      // stored address (onConflict: clerk_id → UPDATE), clobbering good data —
      // the same class the shift-53 Stripe fix closed. display_name/avatar_url can
      // legitimately be nulled by a user, so those are written as-is.
      const payload: Record<string, unknown> = {
        clerk_id: id,
        display_name,
        avatar_url: image_url ?? null,
      };
      if (email) payload.email = email;

      await supabase.from("profiles").upsert(payload, { onConflict: "clerk_id" });
      break;
    }
    case "user.deleted": {
      const { id } = event.data;
      await supabase.from("profiles").delete().eq("clerk_id", id);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
