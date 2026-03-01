"use server";

import { db } from "@/db/db";
import { orderItemsSchema, OrderItemsTypes } from "@/db/schemas/orders.schema";
import { ProductType } from "@/db/schemas/product.schema";
import { BasketTypeUseCheckoutStore } from "@/store/checkout-store";
import { updateTag } from "next/cache";
import { CACHE_TAG_GET_ORDER_INFO } from "./cache-tags";
import { CACHE_TAGS } from "@/types/cache-trigers.constant";

export type CreateOrderItemsResponseType = Promise<{
  success: boolean;
  error: unknown | null;
}>;

export async function createOrderItems({
  basket,
  productsInBasket,
  orderId,
}: {
  basket: BasketTypeUseCheckoutStore;
  productsInBasket: ProductType[];
  orderId: string | undefined;
}): CreateOrderItemsResponseType {
  if (!orderId) {
    return { success: false, error: "Missed orderId!!!" };
  }
  const basketMap = new Map(basket.map((item) => [item.productId, item.quantity]));

  console.log(basketMap);

  const orderItems: Omit<OrderItemsTypes, "id" | "createdAt" | "updatedAt">[] = productsInBasket
    .filter((product) => basketMap.has(product.id))
    .map((product) => ({
      orderId,
      productId: product.id,
      quantity: basketMap.get(product.id)!,
      unitPrice: product.price,
      title: product.nameFull,
      brandName: product.brand_slug ?? null,
      categoryName: product.category_slug ?? null,
      imageUrl: product.imgSrc ?? null,
    }));

  if (!orderItems.length) {
    return { success: false, error: "Basket is empty" };
  }
  try {
    await db.insert(orderItemsSchema).values(orderItems);
    updateTag(CACHE_TAG_GET_ORDER_INFO);
    updateTag(CACHE_TAGS.orders.byId(orderId));
    updateTag(CACHE_TAGS.product.topSales);

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    return { error, success: false };
  }
}
