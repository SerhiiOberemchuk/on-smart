"use client";

import { requestCustomerPasswordReset } from "@/app/actions/account/auth/request-password-reset";
import type { AuthActionState } from "@/app/actions/account/auth/auth-action.types";
import { InputBlock } from "@/components/InputBloc";
import Link from "next/link";
import { useActionState } from "react";
import { SubmitButton } from "../components/SubmitButton";

const INITIAL: AuthActionState = { success: false, errorCode: null, errorMessage: null };

export default function PasswordDimenticataForm() {
  const [state, formAction] = useActionState(requestCustomerPasswordReset, INITIAL);

  if (state.success) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <h1 className="H5">Controlla la tua email</h1>
        <p className="helper_text">{state.errorMessage}</p>
        <Link href="/accedi" className="text-yellow-primary underline">
          Torna al login
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <h1 className="H5 text-center">Password dimenticata</h1>
      <p className="helper_text">
        Inserisci la tua email: ti invieremo un link per reimpostare la password.
      </p>
      <InputBlock title="Email" name="email" type="email" required autoComplete="email" />
      <SubmitButton>Invia il link</SubmitButton>
      <p className="helper_text text-center">
        <Link href="/accedi" className="text-yellow-primary underline">
          Torna al login
        </Link>
      </p>
    </form>
  );
}
