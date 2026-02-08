"use server";

import { db } from "@/db/db";
import {
  productDescriptionSchema,
  ProductDescriptionType,
} from "@/db/schemas/product-details.schema";
import { CACHE_TRIGGERS_TAGS } from "@/types/cache-trigers.constant";
import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";

export async function updateProductDescriptionById({
  product_id,
  ...props
}: Pick<ProductDescriptionType, "product_id"> &
  Partial<Omit<ProductDescriptionType, "product_id">>) {
  try {
    const isDescription = await db
      .select()
      .from(productDescriptionSchema)
      .where(eq(productDescriptionSchema.product_id, product_id));
    if (isDescription.length === 0) {
      await db
        .insert(productDescriptionSchema)
        .values({ product_id, title: "", images: [], description: "" });
    }
    if (Object.keys(props).length === 0) {
      return { succes: false, error: "Empty data to update" };
    }
    await db
      .update(productDescriptionSchema)
      .set(props)
      .where(eq(productDescriptionSchema.product_id, product_id));
    updateTag(CACHE_TRIGGERS_TAGS.product.byId(product_id));
    updateTag(CACHE_TRIGGERS_TAGS.product.PRODUCT_DETAILS_BY_ID);
    
    return {
      success: true,
      error: null,
    };
  } catch (error) {
    return { error, success: false };
  }
}
