"use server";

import { auth } from "@/lib/auth";
import type { AuthActionState } from "./auth-action.types";

const NEUTRAL = "Se l'email è registrata, riceverai un link per reimpostare la password.";

export async function requestCustomerPasswordReset(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (email) {
    try {
      await auth.api.requestPasswordReset({
        body: { email, redirectTo: "/reimposta-password" },
      });
    } catch (error) {
      console.error("[requestCustomerPasswordReset]", error);
    }
  }

  // Enumeration-safe: always the same neutral confirmation.
  return { success: true, errorCode: null, errorMessage: NEUTRAL };
}
