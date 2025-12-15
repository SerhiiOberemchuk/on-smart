"use server";

import { setTimeout } from "node:timers/promises";

export async function submitProductFeedback(
  prevState: { success: boolean; messaggio: string },
  formData: FormData,
) {
  await setTimeout(1000);

  const nome = formData.get("nome");
  const email = formData.get("email");
  const messaggio = formData.get("messaggio");
  const rating = formData.get("rating");
  const productId = formData.get("productId");
  console.log({ nome, email, messaggio, rating, productId });
  return {
    success: true,
    messaggio: "Feedback submitted successfully",
  };
}
export async function submitGeneralFeedback(prevState: { success: boolean }, formData: FormData) {
  await setTimeout(1000);

  const nome = formData.get("nome");
  const email = formData.get("email");
  const messaggio = formData.get("messaggio");
  console.log({ nome, email, messaggio });
  return {
    success: true,
    messaggio: "Feedback submitted successfully",
  };
}
