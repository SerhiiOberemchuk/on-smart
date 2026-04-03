import { getOrdersAllAction } from "@/app/actions/admin/orders/queries";
import Spiner from "@/components/Spiner";
import { headers } from "next/headers";
import { Suspense } from "react";
import PageOrdersClient from "./PageOrdersClient";

export default function OrdersPage() {
  return (
    <Suspense fallback={<Spiner />}>
      <GetDataComponent />
    </Suspense>
  );
}

async function GetDataComponent() {
  await headers();
  const orders = await getOrdersAllAction();

  if (orders.error) {
    return <p className="admin-empty">Помилка завантаження даних</p>;
  }

  return <PageOrdersClient serverActionOrders={orders} />;
}
