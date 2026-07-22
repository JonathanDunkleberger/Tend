import { redirect } from "next/navigation";
import { accountPortalSignUpUrl } from "@/lib/auth-urls";

/**
 * Hand off to Clerk's Account Portal (production custom domain).
 * Embedded SignUp was stuck on a blank "tend." shell because Clerk instance
 * paths point at accounts.hatchtend.com, not this route.
 */
export default function SignUpPage() {
  redirect(accountPortalSignUpUrl());
}
