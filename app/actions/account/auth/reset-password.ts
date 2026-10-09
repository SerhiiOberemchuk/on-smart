"use server";

import {
  MAX_AUTH_PASSWORD_LENGTH,
  PASSWORD_TOO_LONG_MESSAGE,
} from "@/types/auth-password.constant";

import { auth } from "@/lib/auth";
import type { AuthActionState } from "./auth-action.types";

export async function resetCustomerPassword(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const token = String(formData.get("token") ?? "");

  if (password.length > MAX_AUTH_PASSWORD_LENGTH) {
    return { success: false, errorCode: "INVALID_INPUT", errorMessage: PASSWORD_TOO_LONG_MESSAGE };
  }

  if (!token) {
    return {
      success: false,
      errorCode: "TOKEN_INVALID",
      errorMessage: "Link non valido o scaduto.",
    };
  }
  if (password.length < 8) {
    return {
      success: false,
      errorCode: "INVALID_INPUT",
      errorMessage: "La password deve contenere almeno 8 caratteri.",
    };
  }
  if (password !== confirmPassword) {
    return {
      success: false,
      errorCode: "INVALID_INPUT",
      errorMessage: "Le password non coincidono.",
    };
  }

  try {
    await auth.api.resetPassword({ body: { newPassword: password, token } });
  } catch (error) {
    console.error("[resetCustomerPassword]", error);
    return {
      success: false,
      errorCode: "TOKEN_INVALID",
      errorMessage: "Link non valido o scaduto. Richiedi un nuovo reset.",
    };
  }

  return { success: true, errorCode: null, errorMessage: null };
}
