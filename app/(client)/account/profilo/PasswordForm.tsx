"use client";

import { SubmitButton } from "@/app/(client)/(auth)/components/SubmitButton";
import { changeCustomerPassword } from "@/app/actions/account/profile/change-password";
import type { ProfileFormState } from "@/app/actions/account/profile/profile-action.types";
import { InputBlock } from "@/components/InputBloc";
import clsx from "clsx";
import { useActionState } from "react";

const INITIAL: ProfileFormState = { success: false, message: null };

export default function PasswordForm() {
  const [state, formAction] = useActionState(changeCustomerPassword, INITIAL);

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      <InputBlock
        title="Password attuale"
        name="currentPassword"
        type="password"
        required
        autoComplete="current-password"
      />
      <InputBlock
        title="Nuova password"
        name="newPassword"
        type="password"
        required
        minLength={8}
        autoComplete="new-password"
      />
      <InputBlock
        title="Conferma nuova password"
        name="confirmPassword"
        type="password"
        required
        minLength={8}
        autoComplete="new-password"
      />
      {state.message && (
        <p className={clsx("text-sm", state.success ? "text-green-700" : "text-red-600")}>
          {state.message}
        </p>
      )}
      <SubmitButton>Aggiorna password</SubmitButton>
    </form>
  );
}
