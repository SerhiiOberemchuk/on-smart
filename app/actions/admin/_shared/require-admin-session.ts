import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function requireAdminSession() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Admin session is required");
  }

  return session;
}
