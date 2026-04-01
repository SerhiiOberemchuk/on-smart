"use server";

import { cacheTag } from "next/cache";
import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db/db";
import { productDescriptionSchema } from "@/db/schemas/product-details.schema";
import { productDocumentsSchema } from "@/db/schemas/product-documents.schema";
import { productReviewsSchema } from "@/db/schemas/product-reviews.schema";
import { productSpecificheSchema } from "@/db/schemas/product-specifiche.schema";
import { CACHE_TAGS } from "@/types/cache-trigers.constant";
import { Product_Details } from "@/types/product.types";

function buildEmptyProductDetails(id: string): Product_Details {
  return {
    product_id: id,
    characteristics_descrizione: {
      title: "No title",
      description: "",
      images: ["/logo.png"],
    },
    characteristics_specifiche: {
      title: "Specifiche",
      images: ["/logo.png"],
      groups: [],
    },
    characteristics_documenti: {
      documents: [],
    },
    characteristics_valutazione: [],
  };
}

export async function getProductDetailsById(id: string): Promise<Product_Details> {
  "use cache";

  if (!id) {
    console.error("[getProductDetailsById] Product id is required");
    return buildEmptyProductDetails(id);
  }

  cacheTag(CACHE_TAGS.product.details.all);
  cacheTag(CACHE_TAGS.product.details.byId(id));

  try {
    const [descriptionRows, specificheRows, documentsRows, reviews] = await Promise.all([
      db.select().from(productDescriptionSchema).where(eq(productDescriptionSchema.product_id, id)),
      db.select().from(productSpecificheSchema).where(eq(productSpecificheSchema.product_id, id)),
      db.select().from(productDocumentsSchema).where(eq(productDocumentsSchema.product_id, id)),
      db
        .select()
        .from(productReviewsSchema)
        .where(
          and(eq(productReviewsSchema.product_id, id), eq(productReviewsSchema.is_approved, true)),
        )
        .orderBy(desc(productReviewsSchema.created_at)),
    ]);

    const description = descriptionRows[0] ?? null;
    const specifiche = specificheRows[0] ?? null;
    const documents = documentsRows[0] ?? null;

    return {
      product_id: id,
      characteristics_descrizione: {
        title: description?.title ?? "No title",
        description: description?.description ?? "",
        images: description?.images?.length ? description.images : ["/logo.png"],
      },
      characteristics_specifiche: {
        title: specifiche?.title ?? "Specifiche",
        images: specifiche?.images?.length ? specifiche.images : ["/logo.png"],
        groups: specifiche?.groups?.length ? specifiche.groups : [],
      },
      characteristics_documenti: {
        documents: documents?.documents?.length ? documents.documents : [],
      },
      characteristics_valutazione: reviews,
    };
  } catch (error) {
    console.error("[getProductDetailsById]", error);
    return buildEmptyProductDetails(id);
  }
}
