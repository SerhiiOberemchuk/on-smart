"use client";

import { resetCustomerPassword } from "@/app/actions/account/auth/reset-password";
import type { AuthActionState } from "@/app/actions/account/auth/auth-action.types";
import { InputBlock } from "@/components/InputBloc";
import Link from "next/link";
import { useActionState } from "react";
import { SubmitButton } from "../components/SubmitButton";

const INITIAL: AuthActionState = { success: false, errorCode: null, errorMessage: null };

export default function ReimpostaPasswordForm({ token }: { token: string }) {
  const [state, formAction] = useActionState(resetCustomerPassword, INITIAL);

  if (state.success) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <h1 className="H5">Password aggiornata</h1>
        <p className="helper_text">Ora puoi accedere con la nuova password.</p>
        <Link href="/accedi" className="text-yellow-500 underline">
          Vai al login
        </Link>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <h1 className="H5">Link non valido</h1>
        <p className="helper_text">Il link di reimpostazione non è valido o è scaduto.</p>
        <Link href="/password-dimenticata" className="text-yellow-500 underline">
          Richiedi un nuovo link
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <h1 className="H5 text-center">Reimposta la password</h1>
      <input type="hidden" name="token" value={token} />
      <InputBlock
        title="Nuova password"
        name="password"
        type="password"
        required
        minLength={8}
        autoComplete="new-password"
      />
      <InputBlock
        title="Conferma password"
        name="confirmPassword"
        type="password"
        required
        minLength={8}
        autoComplete="new-password"
      />
      {state.errorMessage && <p className="text-sm text-red-400">{state.errorMessage}</p>}
      <SubmitButton>Salva la nuova password</SubmitButton>
    </form>
  );
}
