"use server";

import { wishlistItemsSchema } from "@/db/schemas/wishlist.schema";
import { db } from "@/db/db";
import { and, eq } from "drizzle-orm";
import { requireCustomerSession } from "../_shared/require-customer-session";

export async function toggleWishlist(productId: string): Promise<{ inWishlist: boolean }> {
  const session = await requireCustomerSession();
  const userId = session.user.id;
  if (!productId) return { inWishlist: false };

  try {
    const [existing] = await db
      .select({ id: wishlistItemsSchema.id })
      .from(wishlistItemsSchema)
      .where(and(eq(wishlistItemsSchema.userId, userId), eq(wishlistItemsSchema.productId, productId)))
      .limit(1);

    if (existing) {
      await db
        .delete(wishlistItemsSchema)
        .where(and(eq(wishlistItemsSchema.userId, userId), eq(wishlistItemsSchema.productId, productId)));
      return { inWishlist: false };
    }

    await db.insert(wishlistItemsSchema).values({ userId, productId });
    return { inWishlist: true };
  } catch (error) {
    // Unique (userId, productId) — a racing double-insert lands here; treat as already saved.
    console.error("[toggleWishlist]", error);
    return { inWishlist: true };
  }
}
