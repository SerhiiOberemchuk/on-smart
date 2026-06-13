import { DELIVERY_DATA } from "@/types/delivery.data";
import { DeliveryMethod } from "@/types/orders.types";
import { PaymentProviderTypes } from "@/types/payments.types";

export const PAYPAL_COMMISSION_RATE = 0.04;
export const PAYPAL_COMMISSION_LABEL = "+4% commissione";

export function getTotalPriceToPay({
  totalPrice,
  deliveryMetod,
}: {
  totalPrice: number;
  deliveryMetod?: DeliveryMethod;
}) {
  if (deliveryMetod === "RITIRO_NEGOZIO") {
    return totalPrice;
  }
  return totalPrice > DELIVERY_DATA.FREE_THRESHOLD_TOTAL_PRISE
    ? totalPrice
    : totalPrice + DELIVERY_DATA.PRISE_DELIVERY;
}

/**
 * Commission applied on top of the amount for the selected payment method.
 * Currently only PayPal carries a 4% surcharge (also covers PayPal's "paga in rate").
 */
export function getPaymentCommission({
  amount,
  paymentMethod,
}: {
  amount: number;
  paymentMethod?: PaymentProviderTypes;
}) {
  return paymentMethod === "paypal" ? amount * PAYPAL_COMMISSION_RATE : 0;
}

/**
 * Final amount the customer pays for the selected payment method,
 * including delivery and any payment-method commission.
 */
export function getTotalPriceToPayWithCommission({
  totalPrice,
  deliveryMetod,
  paymentMethod,
}: {
  totalPrice: number;
  deliveryMetod?: DeliveryMethod;
  paymentMethod?: PaymentProviderTypes;
}) {
  const base = getTotalPriceToPay({ totalPrice, deliveryMetod });
  return base + getPaymentCommission({ amount: base, paymentMethod });
}
export function getDeliveryPrice(totalPrice: number) {
  return totalPrice > DELIVERY_DATA.FREE_THRESHOLD_TOTAL_PRISE ? 0 : DELIVERY_DATA.PRISE_DELIVERY;
}

export const getIvaValue = (totalPrice: number) => (totalPrice * 0.22) / 1.22;
