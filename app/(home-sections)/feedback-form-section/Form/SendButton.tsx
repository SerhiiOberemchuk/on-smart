"use client";

import { useFormStatus } from "react-dom";

export default function SendButton() {
  const submit = useFormStatus();
  return (
    <button type="submit" className="button_yellow btn mt-2 ml-auto flex text-black lg:mt-1">
      {submit.pending ? "Invio..." : "Invia"}
    </button>
  );
}
