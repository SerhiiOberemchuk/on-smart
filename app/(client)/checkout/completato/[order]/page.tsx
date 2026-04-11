import type { Metadata } from "next";
import CompletatoPage from "./PageCompletato";
import { getOrderByNumberAction } from "@/app/actions/orders/get-order";
import { getOrderPaymentByOrderNumberAction } from "@/app/actions/payments/payment-order-actions";
import { Suspense } from "react";
import { connection } from "next/server";

export const metadata: Metadata = {
  title: "Ordine completato | OnSmart",
  description: "Conferma completamento ordine OnSmart.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page(props: PageProps<"/checkout/completato/[order]">) {
  return (
    <Suspense fallback={<div>Caricamento...</div>}>
      <CompletionContent params={props.params} />
    </Suspense>
  );
}

async function CompletionContent({
  params,
}: {
  params: PageProps<"/checkout/completato/[order]">["params"];
}) {
  await connection();
  const { order } = await params;
  const [orderInfo, paymentInfo] = await Promise.all([
    getOrderByNumberAction(order),
    getOrderPaymentByOrderNumberAction({ orderNumber: order }),
  ]);

  return <CompletatoPage order={orderInfo} paymentInfo={paymentInfo} />;
}
