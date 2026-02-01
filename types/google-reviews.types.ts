import { ProductType } from "@/db/schemas/product.schema";

export type GoogleReview = {
  id: string;
  clientName: string;
  reviewText: string;
  rating: ProductType["rating"];
  date: string;
  reviewUrl: string;
};
