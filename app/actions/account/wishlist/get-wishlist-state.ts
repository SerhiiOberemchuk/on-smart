"use server";

import { wishlistItemsSchema } from "@/db/schemas/wishlist.schema";
import { db } from "@/db/db";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

// Guest-safe (does NOT require a session): used to hydrate the client wishlist store.
export async function getWishlistState(): Promise<{ isAuthenticated: boolean; ids: string[] }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { isAuthenticated: false, ids: [] };

  try {
    const rows = await db
      .select({ productId: wishlistItemsSchema.productId })
      .from(wishlistItemsSchema)
      .where(eq(wishlistItemsSchema.userId, session.user.id));

    return { isAuthenticated: true, ids: rows.map((row) => row.productId) };
  } catch (error) {
    console.error("[getWishlistState]", error);
    return { isAuthenticated: true, ids: [] };
  }
}
