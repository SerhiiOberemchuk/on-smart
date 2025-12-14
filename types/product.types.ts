import { ProductDescriptionType } from "@/db/schemas/product-details";
import { ProductDocumentsType } from "@/db/schemas/product-documents";
import { ProductSpecificheType } from "@/db/schemas/product-specifiche";

export type Product_Details = {
  product_id: string;
  characteristics_descrizione: Omit<ProductDescriptionType, "product_id">;
  characteristics_specifiche: Omit<ProductSpecificheType, "product_id">;
  characteristics_documenti: Omit<ProductDocumentsType, "product_id">;
  characteristics_valutazione: {
    recensioni: {
      clientName: string;
      rating: 0 | 1 | 2 | 3 | 4 | 5;
      comment: string;
      date: string;
    }[];
  };
};
