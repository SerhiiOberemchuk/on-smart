import { DeliveryMethod } from "@/types/checkout-steps.types";
import { DELIVERY_DATA } from "@/types/delivery.data";

export function getTotalPriceToPay({
  totalPrice,
  deliveryMetod,
}: {
  totalPrice: number;
  deliveryMetod?: DeliveryMethod;
}) {
  if (deliveryMetod === "ritiro_negozio") {
    return totalPrice;
  }
  return totalPrice > DELIVERY_DATA.FREE_THRESHOLD_TOTAL_PRISE
    ? totalPrice
    : totalPrice + DELIVERY_DATA.PRISE_DELIVERY;
}
export function getDeliveryPrice(totalPrice: number) {
  return totalPrice > DELIVERY_DATA.FREE_THRESHOLD_TOTAL_PRISE ? 0 : DELIVERY_DATA.PRISE_DELIVERY;
}

export const getIvaValue = (totalPrice: number) => (totalPrice * 0.22) / 1.22;
