"use server";

import { user } from "@/auth-schema";
import { db } from "@/db/db";
import { isAdminEmail } from "@/lib/admin-emails";
import { auth } from "@/lib/auth";
import { safeRedirect } from "@/utils/safe-redirect";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import type { AuthActionState } from "./auth-action.types";

export async function signInCustomer(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const explicitTarget = safeRedirect(String(formData.get("redirect") ?? ""), "");

  if (!email || !password) {
    return { success: false, errorCode: "INVALID_INPUT", errorMessage: "Inserisci email e password." };
  }

  try {
    await auth.api.signInEmail({ body: { email, password } });
  } catch (error) {
    const [account] = await db
      .select({ verified: user.emailVerified })
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    if (account && !account.verified) {
      return {
        success: false,
        errorCode: "EMAIL_NOT_VERIFIED",
        errorMessage: "Conferma la tua email per accedere.",
        email,
      };
    }

    console.error("[signInCustomer]", error);
    return {
      success: false,
      errorCode: "INVALID_CREDENTIALS",
      errorMessage: "Email o password non corretti.",
    };
  }

  // Session cookie is set by the nextCookies() plugin; navigate on success.
  // An explicit ?redirect wins; otherwise admins go to the dashboard, customers to /account.
  const destination = explicitTarget || (isAdminEmail(email) ? "/admin/dashboard" : "/account");
  redirect(destination);
}
