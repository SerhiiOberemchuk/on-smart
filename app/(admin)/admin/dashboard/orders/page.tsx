import { getOrdersAllAction } from "@/app/actions/orders/get-order";
import Spiner from "@/components/Spiner";
import { Suspense } from "react";
import PageOrdersClient from "./PageOrdersClient";

export default function Page() {
  const orders = getOrdersAllAction();
  return (
    <Suspense fallback={<Spiner />}>
      <PageOrdersClient serverActionOrders={orders} />
    </Suspense>
  );
}
