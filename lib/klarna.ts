import { ProductType } from "@/db/schemas/product.schema";
import { BasceketStoreStateType } from "@/store/basket-store";
import { DELIVERY_DATA } from "@/types/delivery.data";

export function klarnaBaseUrl() {
  const base = process.env.KLARNA_API_BASE;
  if (!base) throw new Error("KLARNA_API_BASE is missing");
  return base;
}

const toCents = (value: number) => Number((value * 100).toFixed(0));

/**
 * Builds the Klarna order_lines from the basket, plus a shipping line and a
 * payment-commission surcharge line when applicable. The session and the
 * place-order calls must send identical lines, so both go through this helper.
 * The sum of the returned lines' total_amount always equals the order_amount
 * that Klarna validates against.
 */
export function buildKlarnaOrderLines({
  productsInBasket,
  basket,
  deliveryPrice,
  commission,
}: {
  productsInBasket: ProductType[];
  basket: BasceketStoreStateType["basket"];
  deliveryPrice: number;
  commission: number;
}) {
  const lines = productsInBasket.map((product) => {
    const basketItem = basket.find((item) => item.productId === product.id);
    const quantity = basketItem ? basketItem.quantity : 1;
    const unit_price = toCents(Number(product.price));
    return {
      name: product.nameFull,
      quantity,
      unit_price,
      total_amount: toCents(Number(product.price) * quantity),
    };
  });

  if (deliveryPrice > 0) {
    const shippingCents = toCents(deliveryPrice);
    lines.push({
      name: DELIVERY_DATA.SHIPPING_LABEL,
      quantity: 1,
      unit_price: shippingCents,
      total_amount: shippingCents,
    });
  }

  if (commission > 0) {
    const commissionCents = toCents(commission);
    lines.push({
      name: "Commissione pagamento Klarna (5%)",
      quantity: 1,
      unit_price: commissionCents,
      total_amount: commissionCents,
    });
  }

  return lines;
}

export function klarnaAuthHeader() {
  const u = process.env.KLARNA_USERNAME;
  const p = process.env.KLARNA_PASSWORD;
  if (!u || !p) throw new Error("KLARNA_USERNAME or KLARNA_PASSWORD is missing");

  const token = Buffer.from(`${u}:${p}`).toString("base64");
  return `Basic ${token}`;
}
