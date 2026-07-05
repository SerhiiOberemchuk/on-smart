"use client";

import { createCustomerAccount } from "@/app/actions/account/auth/sign-up";
import type { AuthActionState } from "@/app/actions/account/auth/auth-action.types";
import { InputBlock } from "@/components/InputBloc";
import Link from "next/link";
import { useActionState } from "react";
import { SubmitButton } from "../components/SubmitButton";

const INITIAL: AuthActionState = { success: false, errorCode: null, errorMessage: null };

export default function RegistratiForm({ redirect }: { redirect: string }) {
  const [state, formAction] = useActionState(createCustomerAccount, INITIAL);

  if (state.success && state.pendingVerification) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <h1 className="H5">Controlla la tua email</h1>
        <p className="helper_text">
          Ti abbiamo inviato un link di conferma a <strong>{state.email}</strong>. Conferma il tuo
          indirizzo per attivare l&apos;account.
        </p>
        <Link href="/accedi" className="text-yellow-primary underline">
          Vai al login
        </Link>
      </div>
    );
  }

  const accediHref = redirect ? `/accedi?redirect=${encodeURIComponent(redirect)}` : "/accedi";

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <h1 className="H5 text-center">Crea un account</h1>
      <input type="hidden" name="redirect" value={redirect} />
      <InputBlock title="Nome" name="name" type="text" required autoComplete="name" />
      <InputBlock title="Email" name="email" type="email" required autoComplete="email" />
      <InputBlock
        title="Password"
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
      {state.errorMessage && <p className="text-sm text-red-600">{state.errorMessage}</p>}
      <SubmitButton>Registrati</SubmitButton>
      <p className="helper_text text-center">
        Hai già un account?{" "}
        <Link href={accediHref} className="text-yellow-primary underline">
          Accedi
        </Link>
      </p>
    </form>
  );
}
