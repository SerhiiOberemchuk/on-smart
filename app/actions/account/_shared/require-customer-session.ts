import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Any valid (non-banned) session — admins included. Account actions call this
 * first and additionally filter every query by `session.user.id` (ownership).
 * Mirrors `app/actions/admin/_shared/require-admin-session.ts`.
 */
export async function requireCustomerSession() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    throw new Error("Customer session is required");
  }

  return session;
}
