"use client";

import Form from "next/form";
import Link from "next/link";
import { useActionState, useEffect, useId, useState } from "react";
import { twMerge } from "tailwind-merge";

import { sendMailAssistance } from "@/app/actions/mail/mail-assistance";
import { createProductReview } from "@/app/actions/product-reviews/create-review";

import InputsRating from "./InputsRating";
import TextArea from "./TextArea";
import styles from "./form.module.css";

type FormFeedbackType = "general-feedback" | "product-review";

export default function FormFeedback({
  productId,
  className,
  type,
}: {
  productId?: string;
  className?: string;
  type: FormFeedbackType;
}) {
  const action = type === "product-review" ? createProductReview : sendMailAssistance;
  const [state, formAction, isPending] = useActionState(action, { success: false });
  const [showSuccess, setShowSuccess] = useState(false);
  const formUid = useId();
  const nameId = `${formUid}-name`;
  const emailId = `${formUid}-email`;
  const messageId = `${formUid}-message`;
  const formAriaLabel =
    type === "product-review" ? "Modulo recensione prodotto" : "Modulo richiesta consulenza";
  const successText =
    type === "product-review" ? "Grazie! Recensione inviata." : "Grazie! Messaggio inviato.";
  const stateRecord = state as Record<string, unknown>;
  const errorText = !state.success
    ? typeof stateRecord.message === "string"
      ? stateRecord.message
      : typeof stateRecord.messaggio === "string"
        ? stateRecord.messaggio
        : null
    : null;

  useEffect(() => {
    if (!state.success) {
      setShowSuccess(false);
      return;
    }

    setShowSuccess(true);
    const timeout = setTimeout(() => {
      setShowSuccess(false);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [state.success]);

  return (
    <Form
      action={formAction}
      aria-label={formAriaLabel}
      className={twMerge(
        styles.form,
        "mx-auto flex flex-col p-3",
        type === "general-feedback" && "w-full max-w-[640px] lg:mx-0",
        type === "product-review" && "mx-auto mt-4 p-0",
        className,
      )}
    >
      {type === "product-review" ? <input type="hidden" name="productId" value={productId} /> : null}
      {type === "product-review" ? <InputsRating /> : null}

      <div className="flex flex-col gap-3 lg:flex-row">
        <label htmlFor={nameId} className="helper_text flex flex-1 flex-col">
          <span>Nome*</span>
          <input type="text" id={nameId} required name="nome" autoComplete="name" />
        </label>
        <label htmlFor={emailId} className="helper_text flex flex-1 flex-col lg:mt-0">
          <span>Email*</span>
          <input type="email" id={emailId} required name="email" autoComplete="email" inputMode="email" />
        </label>
      </div>

      <TextArea id={messageId} />

      <p className="mt-5 text-text-grey">
        Proseguendo, confermo di aver letto e compreso i{" "}
        <Link href="/informativa-sulla-privacy" className="underline">
          Termini e condizioni
        </Link>{" "}
        e{" "}
        <Link href="/informativa-sulla-privacy" className="underline">
          l`Informativa sulla privacy
        </Link>
        , e acconsento a ricevere notizie e offerte esclusive.
      </p>

      {showSuccess ? (
        <p className="text-green-600" aria-live="polite">
          {successText}
        </p>
      ) : null}
      {errorText ? (
        <p className="text-red" aria-live="polite">
          {errorText}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="button_yellow btn mt-2 ml-auto flex text-black lg:mt-1"
      >
        {isPending ? "Invio..." : "Invia"}
      </button>
    </Form>
  );
}
