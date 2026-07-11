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

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const clerkId = session.metadata?.clerk_id;
      if (!clerkId) break;

      // Use upsert — profile may not exist yet if Clerk webhook didn't fire.
      // Only include email when Stripe actually provides one, so an upsert into an
      // existing profile never clobbers a real stored email with an empty string.
      const email = session.customer_details?.email;
      await supabase
        .from("profiles")
        .upsert(
          {
            clerk_id: clerkId,
            ...(email ? { email } : {}),
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            tier: "pro",
          },
          { onConflict: "clerk_id" }
        );
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      const status = subscription.status;
      const tier = status === "active" || status === "trialing" ? "pro" : "free";

      await supabase
        .from("profiles")
        .update({
          tier,
          stripe_subscription_id: subscription.id,
        })
        .eq("stripe_customer_id", customerId);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      await supabase
        .from("profiles")
        .update({
          tier: "free",
          stripe_subscription_id: null,
        })
        .eq("stripe_customer_id", customerId);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
