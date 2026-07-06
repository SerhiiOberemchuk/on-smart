import type { ProductType } from "@/db/schemas/product.schema";
import type {
  BasketTypeUseCheckoutStore,
  CheckoutTypesDataFirstStep,
  CheckoutTypesDataStepConsegna,
} from "@/types/checkout-flow.types";
import type { MetodsPayment } from "@/types/bonifico.data";

/**
 * Data a payment widget needs. Passed as optional props by the single-page
 * account checkout; when omitted (guest wizard), each widget falls back to the
 * Zustand checkout/basket stores — so the guest flow is unchanged.
 */
export type PaymentWidgetData = {
  totalPrice: number;
  basket: BasketTypeUseCheckoutStore;
  productsInBasket: ProductType[];
  dataFirstStep: CheckoutTypesDataFirstStep;
  dataCheckoutStepConsegna: CheckoutTypesDataStepConsegna;
  dataCheckoutStepPagamento: Partial<MetodsPayment>;
};
