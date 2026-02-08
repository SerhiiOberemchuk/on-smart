"use server";

import { Product_Details } from "@/types/product.types";
import { getProductDescriptionById } from "../product-details.ts/get-product-description";
import { getProductSpecificheById } from "../product-specifiche/get-product-specifiche";
import { getProductDocumentsById } from "../product-documents/get-product-documents";
import { getProductReviews } from "../product-reviews/get-product-reviews";
import { cacheTag } from "next/cache";
import { CACHE_TRIGGERS_TAGS } from "@/types/cache-trigers.constant";

export async function getProductDetailsById(id: string): Promise<Product_Details> {
  "use cache";
  cacheTag(CACHE_TRIGGERS_TAGS.product.PRODUCT_DETAILS_BY_ID);
  const [description, specifiche, documents, reviews] = await Promise.all([
    getProductDescriptionById({ id }),
    getProductSpecificheById(id),
    getProductDocumentsById({ product_id: id }),
    getProductReviews(id),
  ]);
  return {
    product_id: id,

    characteristics_descrizione: {
      title: description?.data?.title ?? "No title",
      description: description?.data?.description ?? "",
      images: description?.data?.images?.length ? description.data.images : ["/logo.png"],
    },

    characteristics_specifiche: {
      title: specifiche?.data?.title ?? "Specifiche",
      images: specifiche?.data?.images?.length ? specifiche.data.images : ["/logo.png"],
      groups: specifiche?.data?.groups?.length
        ? specifiche.data.groups
        : [{ name: "-", value: "-", position: 0 }],
    },

    characteristics_documenti: {
      documents: documents?.data?.documents?.length
        ? documents.data.documents
        : [{ title: "Document example", link: "/logo.png" }],
    },

    characteristics_valutazione: reviews.reviews ? reviews.reviews : [],
  };
}
