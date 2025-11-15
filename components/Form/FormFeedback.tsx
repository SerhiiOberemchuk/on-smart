import Form from "next/form";

import styles from "./form.module.css";
import SendButton from "./SendButton";
import TextArea from "./TextArea";
import {
  submitGeneralFeedback,
  submitProductFeedback,
} from "@/app/actions/product/feedback-product";
import { twMerge } from "tailwind-merge";
import Link from "next/link";
import InputsRating from "./InputsRating";

export default function FormFeedback({
  productId,
  className,
  type,
}: {
  productId?: string;
  className?: string;

  type: "general-feedback" | "product-review";
}) {
  const action = type === "product-review" ? submitProductFeedback : submitGeneralFeedback;
  return (
    <Form
      action={action}
      className={twMerge(
        styles.form,
        "flexflex-col mx-auto p-3",
        type === "general-feedback" && "w-full max-w-[640px] lg:mx-0",
        type === "product-review" && "mx-auto mt-4 p-0",
        className,
      )}
    >
      {type === "product-review" && <input type="hidden" name="productId" value={productId} />}
      {type === "product-review" && <InputsRating />}
      <div className="flex flex-col gap-3 lg:flex-row">
        <label htmlFor="nome" className="helper_text flex flex-1 flex-col">
          <span>Nome*</span>
          <input type="text" id="nome" required name="nome" />
        </label>
        <label htmlFor="email" className="helper_text flex flex-1 flex-col lg:mt-0">
          <span>Email*</span>
          <input type="email" required id="email" name="email" />
        </label>
      </div>

      <TextArea />
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
      <SendButton />
    </Form>
  );
}
