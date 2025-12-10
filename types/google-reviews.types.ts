import { Product } from "@/db/schemas/product";

export type GoogleReview = {
  id: string;
  clientName: string;
  reviewText: string;
  rating: Product["rating"];
  date: string;
};
