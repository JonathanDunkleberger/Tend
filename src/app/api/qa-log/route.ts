import { NextResponse } from "next/server";

/**
 * Tiny client-diagnostics sink. The auth screen POSTs here when the Clerk
 * form fails to mount in a user's browser, so failures show up in Vercel
 * function logs with the user agent + captured errors. Public route (the
 * whole point is that the user could NOT sign in).
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("[qa-log]", JSON.stringify(body).slice(0, 2000));
  } catch {
    console.log("[qa-log] unparseable body");
  }
  return new NextResponse(null, { status: 204 });
}
