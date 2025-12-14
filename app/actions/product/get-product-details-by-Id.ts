"use server";

import { db } from "@/db/db";
import { productDescriptionSchema } from "@/db/schemas/product-details";
import { productDocumentsSchema } from "@/db/schemas/product-documents";
import { productSpecificheSchema } from "@/db/schemas/product-specifiche";
import { Product_Details } from "@/types/product.types";
import { eq } from "drizzle-orm";
import { cacheTag } from "next/cache";

export async function getProductDetailsById(id: string): Promise<Product_Details> {
  "use cache";
  cacheTag("product_details_" + id);
  const [descr] = await db
    .select()
    .from(productDescriptionSchema)
    .where(eq(productDescriptionSchema.product_id, id))
    .limit(1);

  const [specifiche] = await db
    .select()
    .from(productSpecificheSchema)
    .where(eq(productSpecificheSchema.product_id, id))
    .limit(1);

  const [documents] = await db
    .select()
    .from(productDocumentsSchema)
    .where(eq(productDocumentsSchema.product_id, id));

  return {
    product_id: id,

    characteristics_descrizione: {
      title: descr?.title ?? "No title",
      description: descr?.description ?? "",
      images: descr?.images?.length ? descr.images : ["/logo.png"],
    },

    characteristics_specifiche: {
      title: specifiche?.title ?? "Specifiche",
      images: specifiche?.images?.length ? specifiche.images : ["/logo.png"],
      groups: specifiche?.groups?.length
        ? specifiche.groups
        : [
            {
              groupTitle: "Specifiche",
              items: [{ name: "-", value: "-" }],
            },
          ],
    },

    characteristics_documenti: {
      documents: documents?.documents?.length
        ? documents.documents
        : [{ title: "Document example", link: "/logo.png" }],
    },

    characteristics_valutazione: {
      recensioni: [],
    },
  };
}
