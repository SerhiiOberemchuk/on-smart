import { getOrdersAllAction, type GetOrdersAllActionResponseType } from "@/app/actions/orders/get-order";
import Spiner from "@/components/Spiner";
import { Suspense } from "react";
import PageOrdersClient from "./PageOrdersClient";

export default function OrdersPage() {
  const ordersPromise: GetOrdersAllActionResponseType = getOrdersAllAction();

  return (
    <Suspense fallback={<Spiner />}>
      <PageOrdersClient serverActionOrdersPromise={ordersPromise} />
    </Suspense>
  );
}
