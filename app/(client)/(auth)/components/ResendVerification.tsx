"use client";

import { resendVerificationEmail } from "@/app/actions/account/auth/resend-verification";
import type { AuthActionState } from "@/app/actions/account/auth/auth-action.types";
import { useActionState } from "react";
import { SubmitButton } from "./SubmitButton";

const INITIAL: AuthActionState = { success: false, errorCode: null, errorMessage: null };

export default function ResendVerification({ email, redirect }: { email: string; redirect: string }) {
  const [state, formAction] = useActionState(resendVerificationEmail, INITIAL);

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-md border border-stroke-grey p-4">
      <p className="helper_text">La tua email non è ancora confermata.</p>
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="redirect" value={redirect} />
      {state.errorMessage && <p className="helper_text text-green-700">{state.errorMessage}</p>}
      <SubmitButton>Invia di nuovo l&apos;email di conferma</SubmitButton>
    </form>
  );
}
