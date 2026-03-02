import { getOrdersAllAction } from "@/app/actions/orders/get-order";
import Spiner from "@/components/Spiner";
import { headers } from "next/headers";
import { Suspense } from "react";
import PageOrdersClient from "./PageOrdersClient";

export default async function Page() {
  await headers();
  const orders = await getOrdersAllAction();
  return (
    <Suspense fallback={<Spiner />}>
      <PageOrdersClient serverActionOrders={orders} />
    </Suspense>
  );
}
