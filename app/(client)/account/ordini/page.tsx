import { getAccountOrders } from "@/app/actions/account/orders/get-account-orders";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ORDER_STATUS_LABEL, formatOrderDate } from "./order-labels";

export const metadata: Metadata = {
  title: "I miei ordini — On-Smart",
  robots: { index: false, follow: false },
};

export default function OrdiniPage() {
  return (
    <section>
      <h1 className="H2 mb-6">I miei ordini</h1>
      <Suspense fallback={<OrdersSkeleton />}>
        <OrdersList />
      </Suspense>
    </section>
  );
}

async function OrdersList() {
  const orders = await getAccountOrders();

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4">
        <p className="helper_text">Non hai ancora effettuato ordini.</p>
        <Link href="/catalogo" className="rounded-md bg-yellow-500 px-4 py-2 font-medium text-black">
          Vai al catalogo
        </Link>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {orders.map((order) => (
        <li key={order.orderNumber}>
          <Link
            href={`/account/ordini/${order.orderNumber}`}
            className="flex flex-col gap-2 rounded-md border border-stroke-grey p-4 transition hover:bg-black/5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium">Ordine {order.orderNumber}</p>
              <p className="helper_text">
                {formatOrderDate(order.createdAt)} · {order.itemCount} art.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="helper_text">
                {ORDER_STATUS_LABEL[order.orderStatus] ?? order.orderStatus}
              </span>
              <span className="font-medium">{order.total.toFixed(2)} €</span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function OrdersSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-20 w-full animate-pulse rounded-md bg-black/10" />
      ))}
    </div>
  );
}
