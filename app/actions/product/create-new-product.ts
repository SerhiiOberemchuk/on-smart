"use server";

import { db } from "@/db/db";
import { ProductType, productsSchema } from "@/db/schemas/product.schema";
import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";

export async function createNewProduct(formData: ProductType) {
  const normalizedFormData: ProductType = {
    ...formData,
    oldPrice: formData.oldPrice ? formData.oldPrice : null,
  };

  try {
    const isSlug = await db
      .select()
      .from(productsSchema)
      .where(eq(productsSchema.slug, formData.slug));
    if (isSlug[0]) {
      return { success: false, id: "", error: "Такий слаг існує" };
    }
    const res = await db.insert(productsSchema).values(normalizedFormData).$returningId();
    if (res[0].id) {
      updateTag("get_all_product");
      return { success: true, id: res[0].id, error: false };
    }
    return { success: false, id: "", error: false };
  } catch (error) {
    return { success: false, id: "", error };
  }
}
