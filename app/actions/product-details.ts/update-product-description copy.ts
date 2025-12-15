"use server";

import { db } from "@/db/db";
import {
  productDescriptionSchema,
  ProductDescriptionType,
} from "@/db/schemas/product-details.schema";
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
    updateTag("product_details_" + product_id);
    return {
      success: true,
      error: null,
    };
  } catch (error) {
    return { error, success: false };
  }
}
