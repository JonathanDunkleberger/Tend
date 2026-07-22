import { redirect } from "next/navigation";
import { accountPortalSignInUrl } from "@/lib/auth-urls";

/**
 * Hand off to Clerk's Account Portal (production custom domain).
 * Embedded SignIn was stuck on a blank "tend." shell because Clerk instance
 * paths point at accounts.hatchtend.com, not this route.
 */
export default function SignInPage() {
  redirect(accountPortalSignInUrl());
}
