"use server";
import { Product_Details } from "@/types/product.types";

export async function getProductDetailsById(id: string): Promise<Product_Details> {
  return {
    product_id: id,
    characteristics_descrizione: {
      images: [
        "/products/product-details/image1.jpg",
        "/products/product-details/image2.jpg",
        "/products/product-details/image3.jpg",
        "/products/product-details/image4.jpg",
      ],
      title: "Ajax CombiProtect Fibra",
      description:
        "Longse progetta telecamere HD per fornire immagini ad alta definizione per i centri di sorveglianza. La sua semplicità di connessione e funzionamento è più facile da accettare per gli ingegneri della sicurezza tradizionali.",
    },
    characteristics_specifiche: {
      images: [
        "/products/product-details/image1.jpg",
        "/products/product-details/image2.jpg",
        "/products/product-details/image3.jpg",
        "/products/product-details/image4.jpg",
      ],
      title: "Specifiche Tecniche",
      description: [
        {
          title: "Dimensioni",
          items: [
            { name: "Altezza", value: "10 cm" },
            {
              name: "Profondità",
              value: "3 cm",
            },
            { name: "Lunghezza", value: "15 cm" },
          ],
        },
        {
          title: "Dimensioni",
          items: [
            { name: "Larghezza", value: "5 cm" },
            {
              name: "Altezza con supporto",
              value: "12 cm",
            },
            {
              name: "Lunghezza con supporto",
              value: "18 cm",
            },
          ],
        },
        {
          title: "Peso",
          items: [
            { name: "Peso netto", value: "200 g" },
            {
              name: "Peso con imballo",
              value: "300 g",
            },
          ],
        },
      ],
    },
    characteristics_documenti: {
      link: ["/products/product-details/image1.jpg"],
      title: "Technical Information",
    },
    characteristics_valutazione: {
      recensioni: [
        {
          clientName: "John Doe",
          rating: 5,
          comment: "Great product!",
          date: "2024-04-01",
        },
        {
          clientName: "Jane Smith",
          rating: 5,
          comment: "Exceeded my expectations.",
          date: "2024-04-02",
        },
        {
          clientName: "Alice Johnson",
          rating: 3,
          comment: "Good, but could be improved.",
          date: "2024-04-03",
        },
        {
          clientName: "Bob Brown",
          rating: 4,
          comment: "Very satisfied with my purchase.",
          date: "2024-04-04",
        },
      ],
    },
  };
}
