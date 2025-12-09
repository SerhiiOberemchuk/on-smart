"use server";

import { db } from "@/db/db";
import { ProductDescriptionType, productDescrizioneSchema } from "@/db/schemas/product-details";
import { eq } from "drizzle-orm";

export async function updateProductDescriptionById({
  product_id,
  ...props
}: Pick<ProductDescriptionType, "product_id"> &
  Partial<Omit<ProductDescriptionType, "product_id">>) {
  try {
    const isDescription = await db
      .select()
      .from(productDescrizioneSchema)
      .where(eq(productDescrizioneSchema.product_id, product_id));
    if (isDescription.length === 0) {
      await db
        .insert(productDescrizioneSchema)
        .values({ product_id, title: "", images: [], description: "" });
    }
    if (Object.keys(props).length === 0) {
      return { succes: false, error: "Empty data to update" };
    }
    await db
      .update(productDescrizioneSchema)
      .set(props)
      .where(eq(productDescrizioneSchema.product_id, product_id));
    return {
      success: true,
      error: null,
    };
  } catch (error) {
    return { error, success: false };
  }
}
