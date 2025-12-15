import { ProductDescriptionType } from "@/db/schemas/product-details.schema";
import { ProductDocumentsType } from "@/db/schemas/product-documents.schema";
import { ProductReviewType } from "@/db/schemas/product-reviews.schema";
import { ProductSpecificheType } from "@/db/schemas/product-specifiche.schema";

export type Product_Details = {
  product_id: string;
  characteristics_descrizione: Omit<ProductDescriptionType, "product_id">;
  characteristics_specifiche: Omit<ProductSpecificheType, "product_id">;
  characteristics_documenti: Omit<ProductDocumentsType, "product_id">;
  characteristics_valutazione: ProductReviewType[];
};
