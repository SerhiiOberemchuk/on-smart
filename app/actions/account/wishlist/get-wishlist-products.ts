"use server";

import { getProductsByIds } from "@/app/actions/product/get-products-by-array-ids";
import type { ProductType } from "@/db/schemas/product.schema";
import { wishlistItemsSchema } from "@/db/schemas/wishlist.schema";
import { db } from "@/db/db";
import { desc, eq } from "drizzle-orm";
import { requireCustomerSession } from "../_shared/require-customer-session";

export async function getWishlistProducts(): Promise<ProductType[]> {
  const session = await requireCustomerSession();

  try {
    const rows = await db
      .select({ productId: wishlistItemsSchema.productId })
      .from(wishlistItemsSchema)
      .where(eq(wishlistItemsSchema.userId, session.user.id))
      .orderBy(desc(wishlistItemsSchema.createdAt));

    const ids = rows.map((row) => row.productId);
    if (!ids.length) return [];

    // Product data is public and cached by ids (§17: cached public data + uncached per-user id list).
    const result = await getProductsByIds(ids, { includeOutOfStock: true, includeHidden: false });
    return result.data ?? [];
  } catch (error) {
    console.error("[getWishlistProducts]", error);
    return [];
  }
}
