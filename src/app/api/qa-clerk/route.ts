import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * TEMPORARY production self-diagnostic (safe: reveals only key prefixes and
 * booleans, never secrets). Tests whether the server-side Clerk secret key
 * actually works against the Clerk Backend API, and what auth() sees for the
 * caller. Delete once the sign-in wiring issue is resolved.
 */
export async function GET() {
  const out: Record<string, unknown> = {};

  const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "";
  const sk = process.env.CLERK_SECRET_KEY || "";
  out.publishableKeyPrefix = pk.slice(0, 12);
  out.secretKeyPrefix = sk.slice(0, 8);
  out.secretKeyLength = sk.length;
  out.keyModesMatch =
    (pk.startsWith("pk_live_") && sk.startsWith("sk_live_")) ||
    (pk.startsWith("pk_test_") && sk.startsWith("sk_test_"));

  try {
    const a = await auth();
    out.callerUserId = a.userId ?? null;
  } catch (e) {
    out.authError = String(e).slice(0, 300);
  }

  try {
    const client = await clerkClient();
    const count = await client.users.getCount();
    out.secretKeyWorks = true;
    out.totalUsers = count;
  } catch (e) {
    out.secretKeyWorks = false;
    out.backendApiError = String(e).slice(0, 300);
  }

  return NextResponse.json(out);
}
