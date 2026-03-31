"use server";

import { db } from "@/db/db";
import { ProductInsertType, ProductType, productsSchema } from "@/db/schemas/product.schema";
import { CACHE_TAGS } from "@/types/cache-trigers.constant";
import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";

export async function createNewProduct(formData: ProductType) {
  const hasValue = (value: unknown) => value !== null && value !== undefined && `${value}`.trim() !== "";
  if (
    !hasValue(formData.ean) ||
    !hasValue(formData.lengthCm) ||
    !hasValue(formData.widthCm) ||
    !hasValue(formData.heightCm) ||
    !hasValue(formData.weightKg)
  ) {
    return { success: false, id: "", error: "EAN, габарити та вага є обов'язковими" };
  }

  const normalizedFormData: ProductInsertType = {
    ...formData,
    ean: formData.ean.trim(),
    oldPrice: formData.oldPrice ? formData.oldPrice : null,
    isHidden: formData.isHidden ?? false,
    productType: formData.productType ?? "product",
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
      updateTag(CACHE_TAGS.product.all);
      updateTag(CACHE_TAGS.product.byId(res[0].id));
      updateTag(CACHE_TAGS.product.bySlug(normalizedFormData.slug));
      return { success: true, id: res[0].id, error: false };
    }
    return { success: false, id: "", error: false };
  } catch (error) {
    return { success: false, id: "", error };
  }
}
