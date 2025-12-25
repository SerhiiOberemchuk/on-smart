"use server";

import { db } from "@/db/db";
import {
  productSpecificheSchema,
  ProductSpecificheType,
} from "@/db/schemas/product-specifiche.schema";
import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";

export async function updateOrCreateSpecifiche(
  data: Pick<ProductSpecificheType, "product_id"> & Partial<Omit<ProductSpecificheType, "product_id">>,
) {
  const { product_id, ...rest } = data;

  try {
    const existing = await db
      .select()
      .from(productSpecificheSchema)
      .where(eq(productSpecificheSchema.product_id, product_id));

    if (existing.length > 0) {
      await db
        .update(productSpecificheSchema)
        .set(rest)
        .where(eq(productSpecificheSchema.product_id, product_id));
      updateTag("product_details_" + product_id);
      updateTag("getProductDetailsById");
      return { success: true, created: false };
    }

    await db.insert(productSpecificheSchema).values({ product_id, title: "", images: [], groups: [], ...rest });
    updateTag("product_details_" + product_id);
    updateTag("getProductDetailsById");
    return { success: true, created: true };
  } catch (error) {
    console.error(error);
    return { success: false, error };
  }
}
