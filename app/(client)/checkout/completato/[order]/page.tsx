import { Suspense } from "react";
import CompletatoPage from "./PageCompletato";
import { getOrderByNumberAction } from "@/app/actions/orders/get-order";
import { getOrderPaymentByOrderNumberAction } from "@/app/actions/payments/payment-order-actions";
import Spiner from "@/components/Spiner";

export default async function Page(props: PageProps<"/checkout/completato/[order]">) {
  const { order } = await props.params;
  const searchParams = props.searchParams;
  const orderInfo = getOrderByNumberAction(order);
  const payInfo = getOrderPaymentByOrderNumberAction({ orderNumber: order });
  return (
    <Suspense
      fallback={
        <div>
          <Spiner />
        </div>
      }
    >
      <CompletatoPage order={orderInfo} searchParams={searchParams} paymentInfo={payInfo} />
    </Suspense>
  );
}
