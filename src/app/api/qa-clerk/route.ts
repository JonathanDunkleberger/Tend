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

  // THE test that catches a "mixed up" secret key. A secret key can be valid
  // (sk_live_, works against the Backend API) yet belong to a DIFFERENT Clerk
  // application than the publishable key. Then every session token the browser
  // receives fails server-side verification: users sign in fine client-side,
  // but auth() always sees them signed out — /garden bounces to /sign-in,
  // which renders a blank card because the client IS signed in.
  //
  // The publishable key base64-decodes to the instance's Frontend API domain,
  // whose public JWKS is at /.well-known/jwks.json. The Backend API's /v1/jwks
  // (authorized by the SECRET key) returns the JWKS of the secret key's
  // instance. If the key IDs don't overlap, the two keys are from different
  // applications.
  try {
    const domain = Buffer.from(pk.replace(/^pk_(test|live)_/, ""), "base64")
      .toString("utf8")
      .replace(/\$$/, "");
    const [pubJwks, skJwks] = await Promise.all([
      fetch(`https://${domain}/.well-known/jwks.json`).then((r) => r.json()),
      fetch("https://api.clerk.com/v1/jwks", {
        headers: { Authorization: `Bearer ${sk}` },
      }).then((r) => r.json()),
    ]);
    const pubKids: string[] = (pubJwks.keys ?? []).map((k: { kid: string }) => k.kid);
    const skKids: string[] = (skJwks.keys ?? []).map((k: { kid: string }) => k.kid);
    out.pkInstanceKids = pubKids;
    out.skInstanceKids = skKids;
    out.secretKeyMatchesPublishableKeyInstance = skKids.some((k) => pubKids.includes(k));
  } catch (e) {
    out.instanceCheckError = String(e).slice(0, 200);
  }

  return NextResponse.json(out);
}
