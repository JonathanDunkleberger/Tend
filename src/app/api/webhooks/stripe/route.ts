import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing webhook secret" }, { status: 500 });
  }

  const body = await req.text();
  const headerPayload = await headers();
  const sig = headerPayload.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createAdminSupabaseClient();

  // Any DB write that fails must return a non-2xx so Stripe RETRIES the event.
  // Previously every write's error was swallowed and the handler always returned
  // 200 → Stripe marked the event delivered and never retried, permanently
  // stranding a paying customer on the free tier on any transient blip.
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const clerkId = session.metadata?.clerk_id;
        if (!clerkId) break;

        const email = session.customer_details?.email;
        const isLifetime =
          session.mode === "payment" || session.metadata?.tend_plan === "lifetime";
        const proFields = {
          stripe_customer_id: session.customer as string,
          // Lifetime is a one-time payment — no recurring subscription id.
          stripe_subscription_id: isLifetime
            ? null
            : (session.subscription as string),
          tier: "pro" as const,
        };

        // UPDATE-first (email omitted → never clobbers a real stored address),
        // then INSERT only if the profile doesn't exist yet (Clerk webhook /
        // ensureProfile hasn't run). On INSERT `email` is NOT NULL, so fall back
        // to "" — the same placeholder ensureProfile uses — never to a missing
        // column (which would poison-retry against the constraint forever).
        const { data: updated, error: updErr } = await supabase
          .from("profiles")
          .update({ ...proFields, ...(email ? { email } : {}) })
          .eq("clerk_id", clerkId)
          .select("id");
        if (updErr) throw updErr;

        if (!updated || updated.length === 0) {
          const { error: insErr } = await supabase
            .from("profiles")
            .insert({ clerk_id: clerkId, email: email || "", ...proFields });
          if (insErr) throw insErr;
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Keep the user Pro through the dunning window: `past_due` means Stripe is
        // still retrying a failed renewal charge and may recover it. Only a
        // terminal state (canceled / unpaid / incomplete_expired — anything not in
        // this set) drops them to free, and true cancellation also arrives as
        // subscription.deleted below. Yanking access on the first failed charge
        // for a recoverable blip would be needlessly harsh.
        const status = subscription.status;
        const tier =
          status === "active" || status === "trialing" || status === "past_due"
            ? "pro"
            : "free";

        const { error } = await supabase
          .from("profiles")
          .update({ tier, stripe_subscription_id: subscription.id })
          .eq("stripe_customer_id", customerId);
        if (error) throw error;
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const { error } = await supabase
          .from("profiles")
          .update({ tier: "free", stripe_subscription_id: null })
          .eq("stripe_customer_id", customerId);
        if (error) throw error;
        break;
      }
    }
  } catch (err) {
    console.error("Stripe webhook DB write failed:", err);
    return NextResponse.json({ error: "Database write failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
