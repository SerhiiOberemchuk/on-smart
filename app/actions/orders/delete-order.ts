"use server";

import { db } from "@/db/db";
import {
  orderItemsSchema,
  ordersSchema,
  OrderTypes,
  paymentsSchema,
} from "@/db/schemas/orders.schema";
import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { CACHE_TAGS } from "@/types/cache-trigers.constant";
import { CACHE_TAG_GET_ORDER_INFO } from "./cache-tags";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export type DeleteOrderResult =
  | {
      success: true;
      errorCode: null;
      errorMessage: null;
    }
  | {
      success: false;
      errorCode: "INVALID_INPUT" | "DB_ERROR" | "UNAUTHORIZED" | "NOT_DELETABLE";
      errorMessage: string;
    };

// Callable from the checkout widgets (PayPal/Klarna) to roll back a draft order
// when the payment is canceled or fails. It must therefore stay client-callable,
// so it authorizes every call itself: only the authenticated owner may delete,
// and only while the order is still an unpaid draft (PENDING_PAYMENT). This is
// what prevents the IDOR where any id could delete any (even paid) order.
export async function deleteOrderByOrderId({
  id,
}: Pick<OrderTypes, "id">): Promise<DeleteOrderResult> {
  if (!id) {
    return {
      success: false,
      errorCode: "INVALID_INPUT",
      errorMessage: "Order id is required",
    };
  }

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return {
      success: false,
      errorCode: "UNAUTHORIZED",
      errorMessage: "Authentication required",
    };
  }

  const existing = await db
    .select({ userId: ordersSchema.userId, orderStatus: ordersSchema.orderStatus })
    .from(ordersSchema)
    .where(eq(ordersSchema.id, id));
  const order = existing[0];

  // Already gone — treat as success so rollback stays idempotent.
  if (!order) {
    return { success: true, errorCode: null, errorMessage: null };
  }

  if (order.userId !== session.user.id) {
    return {
      success: false,
      errorCode: "UNAUTHORIZED",
      errorMessage: "You are not allowed to delete this order",
    };
  }

  if (order.orderStatus !== "PENDING_PAYMENT") {
    return {
      success: false,
      errorCode: "NOT_DELETABLE",
      errorMessage: "Only unpaid draft orders can be deleted",
    };
  }

  try {
    await db.transaction(async (tx) => {
      await tx.delete(orderItemsSchema).where(eq(orderItemsSchema.orderId, id));
      await tx.delete(paymentsSchema).where(eq(paymentsSchema.orderId, id));
      await tx.delete(ordersSchema).where(eq(ordersSchema.id, id));
    });
    updateTag(CACHE_TAG_GET_ORDER_INFO);
    updateTag(CACHE_TAGS.orders.byId(id));
    updateTag(CACHE_TAGS.product.topSales);
    return { success: true, errorCode: null, errorMessage: null };
  } catch (error) {
    return {
      success: false,
      errorCode: "DB_ERROR",
      errorMessage: error instanceof Error ? error.message : "Failed to delete order",
    };
  }
}
