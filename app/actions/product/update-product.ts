"use server";

import { db } from "@/db/db";
import { ProductType, productsSchema } from "@/db/schemas/product.schema";
import { CACHE_TAGS } from "@/types/cache-trigers.constant";
import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";

export async function updateProductById({
  id,
  data,
}: {
  id: ProductType["id"];
  data: Partial<Omit<ProductType, "id">>;
}) {
  try {
    const [existingProduct] = await db
      .select({ slug: productsSchema.slug })
      .from(productsSchema)
      .where(eq(productsSchema.id, id));

    await db.update(productsSchema).set(data).where(eq(productsSchema.id, id));

    updateTag(CACHE_TAGS.product.all);
    updateTag(CACHE_TAGS.product.byId(id));
    updateTag(CACHE_TAGS.product.supportById(id));
    if (existingProduct?.slug) {
      updateTag(CACHE_TAGS.product.bySlug(existingProduct.slug));
    }
    if (typeof data.slug === "string" && data.slug.length > 0) {
      updateTag(CACHE_TAGS.product.bySlug(data.slug));
    }
    return { success: true, error: false };
  } catch (error) {
    return { success: false, error };
  }
}
