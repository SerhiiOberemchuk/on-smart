"use server";

import { db } from "@/db/db";
import { ProductType, productsSchema } from "@/db/schemas/product.schema";
import { eq } from "drizzle-orm";

export async function getProductBySlug(slug: ProductType["slug"]) {
  if (!slug) {
    return { success: false, error: "Id as requared!" };
  }
  try {
    const rows = await db.select().from(productsSchema).where(eq(productsSchema.slug, slug));

    const product = rows[0] ?? null;

    if (!product) {
      return {
        success: false,
        data: null,
        error: "Товар не знайдено",
      };
    }

    return {
      success: true,
      data: product,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error,
    };
  }
}
