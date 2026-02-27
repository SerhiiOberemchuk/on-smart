"use server";

import { db } from "@/db/db";
import { orderItemsSchema, ordersSchema } from "@/db/schemas/orders.schema";
import { ProductType, productsSchema } from "@/db/schemas/product.schema";
import { ORDER_STATUS_LIST } from "@/types/orders.types";
import { and, desc, eq, gt, inArray, isNull, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

export async function getTopSalesProducts(limit = 12): Promise<ProductType[]> {
  "use cache";
  cacheTag("top-sales-products");
  cacheLife("minutes");
  try {
    const safeLimit = Math.max(1, Math.min(limit, 30));
    const effectiveProductId = sql<string>`COALESCE(${productsSchema.parent_product_id}, ${productsSchema.id})`;
    const soldQty = sql<number>`SUM(${orderItemsSchema.quantity})`;

    const topSales = await db
      .select({
        productId: effectiveProductId,
        soldQty,
      })
      .from(orderItemsSchema)
      .innerJoin(productsSchema, eq(orderItemsSchema.productId, productsSchema.id))
      .innerJoin(ordersSchema, eq(orderItemsSchema.orderId, ordersSchema.id))
      .where(
        and(inArray(ordersSchema.orderStatus, ORDER_STATUS_LIST), gt(orderItemsSchema.quantity, 0)),
      )
      .groupBy(effectiveProductId)
      .orderBy(desc(soldQty))
      .limit(safeLimit * 3);

    const topProductIds = topSales.map((row) => row.productId).filter(Boolean);

    if (topProductIds.length > 0) {
      const products = await db
        .select()
        .from(productsSchema)
        .where(inArray(productsSchema.id, topProductIds));

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
      .where(and(gt(productsSchema.inStock, 0), isNull(productsSchema.parent_product_id)))
      .orderBy(desc(productsSchema.id))
      .limit(safeLimit);

    return fallback;
  } catch (error) {
    console.error("getTopSalesProducts error:", error);
    return [];
  }
}
