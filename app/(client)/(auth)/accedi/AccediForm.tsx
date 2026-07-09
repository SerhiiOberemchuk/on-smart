"use client";

import { signInCustomer } from "@/app/actions/account/auth/sign-in";
import type { AuthActionState } from "@/app/actions/account/auth/auth-action.types";
import { InputBlock } from "@/components/InputBloc";
import { useWishlistStore } from "@/store/wishlist-store";
import Link from "next/link";
import { useActionState } from "react";
import ResendVerification from "../components/ResendVerification";
import { SubmitButton } from "../components/SubmitButton";

const INITIAL: AuthActionState = { success: false, errorCode: null, errorMessage: null };

export default function AccediForm({ redirect }: { redirect: string }) {
  const [state, formAction] = useActionState(signInCustomer, INITIAL);
  const registratiHref = redirect ? `/registrati?redirect=${encodeURIComponent(redirect)}` : "/registrati";

  return (
    <div className="flex flex-col gap-5">
      <form
        action={formAction}
        onSubmit={() => useWishlistStore.getState().reset()}
        className="flex flex-col gap-5"
      >
        <h1 className="H5 text-center">Accedi</h1>
        <input type="hidden" name="redirect" value={redirect} />
        <InputBlock title="Email" name="email" type="email" required autoComplete="email" />
        <InputBlock
          title="Password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
        />
        {state.errorMessage && <p className="text-sm text-red-400">{state.errorMessage}</p>}
        <SubmitButton>Accedi</SubmitButton>
      </form>

      {state.errorCode === "EMAIL_NOT_VERIFIED" && (
        <ResendVerification email={state.email ?? ""} redirect={redirect} />
      )}

      <div className="helper_text flex flex-col items-center gap-1 text-center">
        <Link href="/password-dimenticata" className="text-yellow-500 underline">
          Password dimenticata?
        </Link>
        <span>
          Non hai un account?{" "}
          <Link href={registratiHref} className="text-yellow-500 underline">
            Registrati
          </Link>
        </span>
      </div>
    </div>
  );
}
