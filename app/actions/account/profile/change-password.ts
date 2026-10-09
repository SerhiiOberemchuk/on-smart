"use server";

import {
  MAX_AUTH_PASSWORD_LENGTH,
  PASSWORD_TOO_LONG_MESSAGE,
} from "@/types/auth-password.constant";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import type { ProfileFormState } from "./profile-action.types";

export async function changeCustomerPassword(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (
    currentPassword.length > MAX_AUTH_PASSWORD_LENGTH ||
    newPassword.length > MAX_AUTH_PASSWORD_LENGTH
  ) {
    return { success: false, message: PASSWORD_TOO_LONG_MESSAGE };
  }

  if (newPassword.length < 8) {
    return { success: false, message: "La nuova password deve contenere almeno 8 caratteri." };
  }
  if (newPassword !== confirmPassword) {
    return { success: false, message: "Le password non coincidono." };
  }

  try {
    await auth.api.changePassword({
      body: { currentPassword, newPassword },
      headers: await headers(),
    });
  } catch (error) {
    console.error("[changeCustomerPassword]", error);
    return { success: false, message: "Password attuale non corretta o errore. Riprova." };
  }

  return { success: true, message: "Password aggiornata." };
}
