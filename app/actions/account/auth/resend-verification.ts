"use server";

import { auth } from "@/lib/auth";
import { safeRedirect } from "@/utils/safe-redirect";
import type { AuthActionState } from "./auth-action.types";

const NEUTRAL = "Se l'email è registrata e non ancora confermata, ti abbiamo inviato un nuovo link.";

export async function resendVerificationEmail(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const redirectTarget = safeRedirect(String(formData.get("redirect") ?? ""), "");

  if (email) {
    try {
      const callbackURL = redirectTarget
        ? `/verifica-email?redirect=${encodeURIComponent(redirectTarget)}`
        : "/verifica-email";
      await auth.api.sendVerificationEmail({ body: { email, callbackURL } });
    } catch (error) {
      console.error("[resendVerificationEmail]", error);
    }
  }

  // Enumeration-safe: always the same neutral confirmation.
  return { success: true, errorCode: null, errorMessage: NEUTRAL };
}
