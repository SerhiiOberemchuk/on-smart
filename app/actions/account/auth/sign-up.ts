"use server";

import { user } from "@/auth-schema";
import { db } from "@/db/db";
import { isAdminEmail } from "@/lib/admin-emails";
import { auth } from "@/lib/auth";
import { safeRedirect } from "@/utils/safe-redirect";
import { eq } from "drizzle-orm";
import type { AuthActionState, AuthErrorCode } from "./auth-action.types";

function fail(errorCode: AuthErrorCode, errorMessage: string): AuthActionState {
  return { success: false, errorCode, errorMessage };
}

export async function createCustomerAccount(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const redirectTarget = safeRedirect(String(formData.get("redirect") ?? ""), "");

  if (!name || !email || !password) {
    return fail("INVALID_INPUT", "Compila nome, email e password.");
  }
  if (password.length < 8) {
    return fail("INVALID_INPUT", "La password deve contenere almeno 8 caratteri.");
  }
  if (password !== confirmPassword) {
    return fail("INVALID_INPUT", "Le password non coincidono.");
  }

  try {
    const callbackURL = redirectTarget
      ? `/verifica-email?redirect=${encodeURIComponent(redirectTarget)}`
      : "/verifica-email";

    await auth.api.signUpEmail({ body: { name, email, password, callbackURL } });

    // Admin privilege comes from the ADMIN_EMAILS allowlist (spec decision #17).
    if (isAdminEmail(email)) {
      await db.update(user).set({ role: "admin" }).where(eq(user.email, email));
    }
  } catch (error) {
    // Neutral message — do not confirm whether the email already exists.
    console.error("[createCustomerAccount]", error);
    return fail(
      "AUTH_ERROR",
      "Impossibile completare la registrazione. Controlla i dati o prova ad accedere.",
    );
  }

  return { success: true, errorCode: null, errorMessage: null, pendingVerification: true, email };
}
