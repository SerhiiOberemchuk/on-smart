// SERVER-ONLY internal helper — NOT a "use server" action, so it is never
// exposed as a callable endpoint to the browser. Marking an order PAID is
// fraud-sensitive and must only happen after a payment provider has been
// verified server-side (PayPal capture / Klarna place-order). Keeping this out
// of the client-reachable action surface is what closes the order IDOR: the
// client can no longer set an arbitrary order's status to PAID.
import { db } from "@/db/db";
import { ordersSchema, paymentsSchema } from "@/db/schemas/orders.schema";
import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { CACHE_TAG_GET_ORDER_INFO } from "../cache-tags";
import { CACHE_TAGS } from "@/types/cache-trigers.constant";

export async function persistPaidOrder({
  orderId,
  orderNumber,
  providerOrderId,
  notes,
}: {
  orderId: string;
  orderNumber: string;
  providerOrderId: string | null;
  notes?: string | null;
}): Promise<boolean> {
  try {
    await db.transaction(async (tx) => {
      await tx
        .update(paymentsSchema)
        .set({ status: "PAYED", providerOrderId, ...(notes !== undefined ? { notes } : {}) })
        .where(eq(paymentsSchema.orderNumber, orderNumber));
      await tx
        .update(ordersSchema)
        .set({ orderStatus: "PAID" })
        .where(eq(ordersSchema.id, orderId));
    });

    updateTag(CACHE_TAG_GET_ORDER_INFO);
    updateTag(CACHE_TAGS.orders.byId(orderId));
    updateTag(CACHE_TAGS.product.topSales);
    return true;
  } catch (error) {
    console.error("persistPaidOrder failed:", error);
    return false;
  }
}
