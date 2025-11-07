"use server";

import { setTimeout } from "node:timers/promises";

export async function submitFeedback(formData: FormData) {
  const timer = await setTimeout(10000, "finished");

  console.log(timer);

  const nome = formData.get("nome");
  const email = formData.get("email");
  const messaggio = formData.get("messaggio");
  console.log({ nome, email, messaggio });
}
