import Form from "next/form";

import { clsx } from "clsx";
import styles from "./form.module.css";
import { submitFeedback } from "./action";
import SendButton from "./SendButton";
import TextArea from "./TextArea";

export default function FormFeedback() {
  return (
    <Form
      action={submitFeedback}
      className={clsx(styles.form, "mx-auto flex w-full max-w-[640px] flex-col p-3 lg:mx-0")}
    >
      <label htmlFor="nome" className="helper_text">
        Nome*
      </label>
      <input type="text" id="nome" required name="nome" />
      <label htmlFor="email" className="helper_text mt-3 lg:mt-0">
        Email*
      </label>
      <input type="email" required id="email" name="email" />
      <TextArea />
      <p className="mt-5 text-text-grey">
        Proseguendo, confermo di aver letto e compreso i Termini e condizioni e l’Informativa sulla
        privacy, e acconsento a ricevere notizie e offerte esclusive.
      </p>
      <SendButton />
    </Form>
  );
}
