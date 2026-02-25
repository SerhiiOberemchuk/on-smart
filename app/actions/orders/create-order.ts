"use server";

import { db } from "@/db/db";
import {
  OrderItemsTypes,
  OrderPaymentTypes,
  OrderTypes,
  orderItemsSchema,
  ordersSchema,
  paymentsSchema,
} from "@/db/schemas/orders.schema";
import { ProductType } from "@/db/schemas/product.schema";
import {
  BasketTypeUseCheckoutStore,
  CheckoutTypesDataFirstStep,
  CheckoutTypesDataStepConsegna,
} from "@/store/checkout-store";
import { makeOrderNumber } from "@/utils/order-number";
import { ulid } from "ulid";
import { sendMailOrders } from "../mail/mail-orders";
import { sendTelegramMessage } from "../telegram/send-message";
import { updateTag } from "next/cache";
import { CACHE_TAG_GET_ORDER_INFO } from "./cache-tags";

export async function createOrderAction({
  dataFirstStep,
  dataCheckoutStepConsegna,
  basket,
  productsInBasket,
  paymentData,
  sendMessages = false,
  customOrderNumberId,
}: {
  customOrderNumberId?: { id: string; number: string };
  sendMessages?: boolean;
  dataFirstStep: CheckoutTypesDataFirstStep;
  dataCheckoutStepConsegna: CheckoutTypesDataStepConsegna;
  basket: BasketTypeUseCheckoutStore;
  productsInBasket: ProductType[];
  paymentData: Omit<
    OrderPaymentTypes,
    "id" | "createdAt" | "updatedAt" | "orderId" | "orderNumber"
  >;
}) {
  if (!basket?.length) return { success: false, error: "Basket is empty" };
  if (!productsInBasket?.length) return { success: false, error: "No products loaded" };
  const data: Omit<OrderTypes, "id" | "createdAt" | "updatedAt" | "orderNumber"> = {
    ...dataFirstStep,
    ...dataCheckoutStepConsegna,
  };
  const orderNumber = customOrderNumberId?.number || makeOrderNumber("OS");
  const orderId = customOrderNumberId?.id || ulid();
  const basketMap = new Map(basket.map((item) => [item.productId, item.quantity]));

  const orderItems: Omit<OrderItemsTypes, "id" | "createdAt" | "updatedAt">[] = productsInBasket
    .filter((product) => basketMap.has(product.id))
    .map((product) => ({
      orderId,
      orderNumber,
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
    await db.transaction(async (tx) => {
      await tx.insert(ordersSchema).values({ ...data, id: orderId, orderNumber });
      await tx.insert(orderItemsSchema).values(orderItems);
      await tx.insert(paymentsSchema).values({ ...paymentData, orderId, orderNumber });
    });
    let isMailSended: boolean = false;

    if (sendMessages) {
      try {
        await sendMailOrders({
          orderNumber,
          customerData: dataFirstStep,
          dataCheckoutStepConsegna,
          dataCheckoutStepPagamento: {
            paymentMethod: paymentData.provider,
            title: paymentData.provider,
          },
          productsInBasket,
          bascket: basket,
        });
        isMailSended = true;
      } catch (mailError) {
        console.error("Order created, but email failed:", mailError);
        isMailSended = false;
      }
      try {
        const telegramResult = await sendTelegramMessage({
          orderNumber,
          orderId,
          customerDisplayName: dataFirstStep.nome || "" + dataFirstStep.cognome,
          total: paymentData.amount,
          paymentMethod: paymentData.provider,
          deliveryMethod: dataFirstStep.deliveryMethod,
          email: dataFirstStep.email,
          numeroTelefono: dataFirstStep.numeroTelefono,
          deliveryPrice:
            dataFirstStep.deliveryMethod === "CONSEGNA_CORRIERE"
              ? dataFirstStep.deliveryPrice.toFixed(2)
              : "0",
        });
        console.log("Telegram message result:", telegramResult);
      } catch (error) {
        console.error("Telegram message bot error: ", error);
      }
    }
    updateTag(CACHE_TAG_GET_ORDER_INFO);

    return {
      success: true,
      orderNumber,
      orderId,
      isMailSended,
    };
  } catch (error) {
    return {
      success: false,
      error,
    };
  }
}
