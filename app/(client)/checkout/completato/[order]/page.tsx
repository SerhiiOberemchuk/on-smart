import { Suspense } from "react";
import CompletatoPage from "./PageCompletato";
import { getOrderByNumberAction } from "@/app/actions/orders/get-order";
import { getOrderPaymentByOrderNumberAction } from "@/app/actions/payments/payment-order-actions";

export default async function Page(props: PageProps<"/checkout/completato/[order]">) {
  const { order } = await props.params;
  const orderInfo = getOrderByNumberAction(order);
  const payInfo = getOrderPaymentByOrderNumberAction({ orderNumber: order });
  return (
    <Suspense fallback={<div>Caricamento...</div>}>
      <CompletatoPage order={orderInfo} paymentInfo={payInfo} />
    </Suspense>
  );
}
