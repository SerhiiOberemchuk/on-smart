"use server";

import { GoogleReview } from "@/types/google-reviews.types";

export async function getGoogleReviews() {
  "use cache";
  // const res = await fetch(`${process.env.API_URL}/products?filter=top&page=${page}`, {
  //   headers: {
  //     Authorization: `Bearer ${process.env.API_TOKEN}`,
  //   },
  //   next: { revalidate: 60 * 30 }, // ISR (оновлення раз на 30 хв)
  // });

  // if (!res.ok) throw new Error("Failed to load top products");
  // const products: { title: string; id: string; name: string }[] = await res.json();
  // const products: GoogleReview[] = [
  //   {
  //     id: "cwece",
  //     clientName: "Marco Rinaldi",
  //     reviewText:
  //       "Ho avuto un’esperienza fantastica in questo negozio! Il personale è stato estremamente gentile e disponibile, pronto a rispondere a tutte le mie domande e a consigliarmi al meglio. La qualità dei prodotti è davvero eccellente e ho trovato esattamente ciò che cercavo. L’ambiente del negozio è accogliente e piacevole, e la consegna dei prodotti è stata veloce e senza problemi. Sicuramente tornerò e consiglierò questo negozio a tutti i miei amici e familiari. Un’esperienza di shopping davvero perfetta!",
  //     rating: Math.floor(Math.random() * 5) + 1,
  //     date: new Date().toISOString(),
  //   },
  // ];

  return Array.from({ length: 10 }, (_, i) => ({
    id: "cwece" + i,
    clientName: "Marco Rinaldi",
    reviewText:
      "Ho avuto un’esperienza fantastica in questo negozio! Il personale è stato estremamente gentile e disponibile, pronto a rispondere a tutte le mie domande e a consigliarmi al meglio. La qualità dei prodotti è davvero eccellente e ho trovato esattamente ciò che cercavo. L’ambiente del negozio è accogliente e piacevole, e la consegna dei prodotti è stata veloce e senza problemi. Sicuramente tornerò e consiglierò questo negozio a tutti i miei amici e familiari. Un’esperienza di shopping davvero perfetta!",
    rating: (Math.floor(Math.random() * 5) + 1).toString(),
    date: new Date().toISOString(),
  })) as GoogleReview[];
}
