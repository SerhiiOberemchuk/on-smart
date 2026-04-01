"use server";

import { db } from "@/db/db";
import { orderItemsSchema, ordersSchema } from "@/db/schemas/orders.schema";
import { ProductType, productsSchema } from "@/db/schemas/product.schema";
import { CACHE_TAGS } from "@/types/cache-trigers.constant";
import { ORDER_STATUS_LIST } from "@/types/orders.types";
import { and, desc, eq, gt, inArray, isNull, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

function normalizeTopSalesLimit(limit: number): number {
  if (!Number.isFinite(limit)) {
    return 12;
  }

  return Math.max(1, Math.min(Math.trunc(limit), 30));
}

export async function getTopSalesProducts(limit = 12): Promise<ProductType[]> {
  "use cache";
  const safeLimit = normalizeTopSalesLimit(limit);
  cacheTag(CACHE_TAGS.product.topSales);
  cacheTag(CACHE_TAGS.product.all);
  cacheLife("minutes");
  const effectiveProductId = sql<string>`COALESCE(${productsSchema.parent_product_id}, ${productsSchema.id})`;
  const soldQty = sql<number>`SUM(${orderItemsSchema.quantity})`;

  try {
    const topSales = await db
      .select({
        productId: effectiveProductId,
        soldQty,
      })
      .from(orderItemsSchema)
      .innerJoin(productsSchema, eq(orderItemsSchema.productId, productsSchema.id))
      .innerJoin(ordersSchema, eq(orderItemsSchema.orderId, ordersSchema.id))
      .where(
        and(
          inArray(ordersSchema.orderStatus, ORDER_STATUS_LIST),
          gt(orderItemsSchema.quantity, 0),
          eq(productsSchema.isHidden, false),
        ),
      )
      .groupBy(effectiveProductId)
      .orderBy(desc(soldQty))
      .limit(safeLimit * 3);

    const topProductIds = topSales.map((row) => row.productId).filter(Boolean);

    if (topProductIds.length > 0) {
      const products = await db
        .select()
        .from(productsSchema)
        .where(and(inArray(productsSchema.id, topProductIds), eq(productsSchema.isHidden, false)));

      const productsById = new Map(products.map((item) => [item.id, item]));
      const ordered = topProductIds
        .map((id) => productsById.get(id))
        .filter((item): item is ProductType => Boolean(item))
        .filter((item) => item.inStock > 0)
        .slice(0, safeLimit);

      if (ordered.length > 0) return ordered;
    }

    const fallback = await db
      .select()
      .from(productsSchema)
      .where(
        and(
          gt(productsSchema.inStock, 0),
          isNull(productsSchema.parent_product_id),
          eq(productsSchema.isHidden, false),
        ),
      )
      .orderBy(desc(productsSchema.id))
      .limit(safeLimit);

    return fallback;
  } catch (error) {
    console.error("[getTopSalesProducts]", error);
    return [];
  }
}
