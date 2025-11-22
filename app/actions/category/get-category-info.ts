"use server";

export async function getCategoryInfo(category: string) {
  return {
    name: "Elettronica",
    description: "Scopri la nostra vasta gamma di prodotti di elettronica per la casa e l'ufficio.",
    descriptionSeo:
      "Acquista prodotti di elettronica di alta qualità su OnSmart. Offriamo una selezione completa di dispositivi elettronici per soddisfare tutte le tue esigenze.",
  };
}
