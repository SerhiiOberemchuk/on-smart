import {
  getAccountOrders,
  hasAccountOrders,
} from "@/app/actions/account/orders/get-account-orders";
import type { Metadata } from "next";
import { connection } from "next/server";
import Link from "next/link";
import { Suspense } from "react";
import OrdiniClient from "./OrdiniClient";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

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
  // Per-user + current time → dynamic; opt in before reading Date.now().
  await connection();
  // Load only the last 30 days by default; the client fetches wider ranges on demand.
  const orders = await getAccountOrders({ fromMs: Date.now() - THIRTY_DAYS_MS, toMs: null });
  const hasAny = orders.length > 0 ? true : await hasAccountOrders();

  if (!hasAny) {
    return (
      <div className="flex flex-col items-start gap-4">
        <p className="helper_text">Non hai ancora effettuato ordini.</p>
        <Link
          href="/catalogo"
          className="rounded-sm bg-yellow-500 px-4 py-2 font-medium text-black transition hover:bg-yellow-400"
        >
          Vai al catalogo
        </Link>
      </div>
    );
  }

  return <OrdiniClient initialOrders={orders} />;
}

function OrdersSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-20 w-full animate-pulse rounded-sm bg-white/10" />
      ))}
    </div>
  );
}
