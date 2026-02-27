"use server";

import { db } from "@/db/db";
import { ProductType, productsSchema } from "@/db/schemas/product.schema";
import { eq, inArray } from "drizzle-orm";

export async function getSupportProductById(productId: ProductType["id"]) {
  try {
    const [product] = await db
      .select({ relatedProductIds: productsSchema.relatedProductIds })
      .from(productsSchema)
      .where(eq(productsSchema.id, productId));

    const relatedIds = product?.relatedProductIds ?? [];
    if (relatedIds.length === 0) return [];

    const relatedProducts = await db
      .select()
      .from(productsSchema)
      .where(inArray(productsSchema.id, relatedIds));

    const productsById = new Map(relatedProducts.map((item) => [item.id, item]));
    const sortedByOrder = relatedIds
      .map((id) => productsById.get(id))
      .filter((item): item is ProductType => Boolean(item));

    return sortedByOrder.filter((item) => item.inStock > 0);
  } catch (error) {
    console.error("getSupportProductById error:", error);
    return [];
  }
}
