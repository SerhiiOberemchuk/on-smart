"use server";

import { db } from "@/db/db";
import { ProductType, productsSchema } from "@/db/schemas/product.schema";
import { CACHE_TAGS } from "@/types/cache-trigers.constant";
import { eq, inArray } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

type RelatedProductIdsRow = {
  relatedProductIds: ProductType["relatedProductIds"];
};

function mapSupportProducts(
  relatedIds: string[],
  relatedProducts: ProductType[],
): ProductType[] {
  const productsById = new Map(relatedProducts.map((item) => [item.id, item]));
  const sortedByOrder = relatedIds
    .map((id) => productsById.get(id))
    .filter((item): item is ProductType => Boolean(item));

  return sortedByOrder.filter((item) => item.inStock > 0 && !item.isHidden);
}

export async function getSupportProductById(productId: ProductType["id"]): Promise<ProductType[]> {
  "use cache";

  if (!productId) {
    return [];
  }

  cacheLife("seconds");
  cacheTag(CACHE_TAGS.product.supportById(productId));
  cacheTag(CACHE_TAGS.product.all);

  try {
    const [product] = await db
      .select({ relatedProductIds: productsSchema.relatedProductIds })
      .from(productsSchema)
      .where(eq(productsSchema.id, productId)) as RelatedProductIdsRow[];

    const relatedIds = product?.relatedProductIds ?? [];
    if (relatedIds.length === 0) return [];

    const relatedProducts = await db
      .select()
      .from(productsSchema)
      .where(inArray(productsSchema.id, relatedIds));

    return mapSupportProducts(relatedIds, relatedProducts);
  } catch (error) {
    console.error("[getSupportProductById]", error);
    return [];
  }
}
