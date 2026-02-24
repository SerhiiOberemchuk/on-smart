import { DELIVERY_DATA } from "@/types/delivery.data";
import { DeliveryMethod } from "@/types/orders.types";

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
export function getDeliveryPrice(totalPrice: number) {
  return totalPrice > DELIVERY_DATA.FREE_THRESHOLD_TOTAL_PRISE ? 0 : DELIVERY_DATA.PRISE_DELIVERY;
}

export const getIvaValue = (totalPrice: number) => (totalPrice * 0.22) / 1.22;
