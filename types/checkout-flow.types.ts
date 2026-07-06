import type { OrderItemsTypes, OrderTypes } from "@/db/schemas/orders.schema";

export type BasketTypeUseCheckoutStore = Pick<OrderItemsTypes, "productId" | "quantity">[];
export type TotalPriseTypeuseCheckoutStore = number;
export type CheckoutTypesDataFirstStep = Omit<
  OrderTypes,
  "id" | "createdAt" | "updatedAt" | "orderNumber" | "deliveryAdress" | "sameAsBilling"
>;
export type CheckoutTypesDataStepConsegna = Pick<OrderTypes, "deliveryAdress" | "sameAsBilling">;
