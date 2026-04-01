import CompletatoPage from "./PageCompletato";
import { getOrderByNumberAction } from "@/app/actions/orders/get-order";
import { getOrderPaymentByOrderNumberAction } from "@/app/actions/payments/payment-order-actions";

export default async function Page(props: PageProps<"/checkout/completato/[order]">) {
  const { order } = await props.params;

  const [orderInfo, paymentInfo] = await Promise.all([
    getOrderByNumberAction(order),
    getOrderPaymentByOrderNumberAction({ orderNumber: order }),
  ]);

  return (
    <CompletatoPage
      order={orderInfo}
      searchParams={await props.searchParams}
      paymentInfo={paymentInfo}
    />
  );
}
