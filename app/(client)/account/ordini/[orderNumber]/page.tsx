import { getAccountOrderDetail } from "@/app/actions/account/orders/get-account-order-detail";
import { bonificoData } from "@/types/bonifico.data";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ORDER_STATUS_LABEL, PAYMENT_STATUS_LABEL, formatOrderDate } from "../order-labels";

export const metadata: Metadata = {
  title: "Dettaglio ordine — On-Smart",
  robots: { index: false, follow: false },
};

export default function OrderDetailPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  return (
    <section className="flex flex-col gap-6">
      <Link href="/account/ordini" className="text-yellow-primary underline">
        ← Torna agli ordini
      </Link>
      <Suspense fallback={<div className="h-64 w-full animate-pulse rounded-md bg-black/10" />}>
        <OrderDetail params={params} />
      </Suspense>
    </section>
  );
}

async function OrderDetail({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;
  const data = await getAccountOrderDetail(orderNumber);
  if (!data) notFound();

  const { order, items, payment } = data;
  const isPickup = order.deliveryMethod === "RITIRO_NEGOZIO";
  const delivery = isPickup ? 0 : Number(order.deliveryPrice) || 0;
  const subtotal = items.reduce(
    (acc, item) => acc + (Number(item.unitPrice) || 0) * (Number(item.quantity) || 0),
    0,
  );
  const total = payment ? Number(payment.amount) : subtotal + delivery;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="H2">Ordine {order.orderNumber}</h1>
        <p className="helper_text mt-1">
          {formatOrderDate(order.createdAt)} · {ORDER_STATUS_LABEL[order.orderStatus] ?? order.orderStatus}
        </p>
      </div>

      <div className="rounded-md border border-stroke-grey">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-4 border-b border-stroke-grey p-4 last:border-b-0"
          >
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="helper_text">
                {item.brandName ? `${item.brandName} · ` : ""}
                {item.quantity} × {Number(item.unitPrice).toFixed(2)} €
              </p>
            </div>
            <span className="font-medium">
              {(Number(item.unitPrice) * item.quantity).toFixed(2)} €
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-1 self-end text-right">
        <p className="helper_text">Subtotale: {subtotal.toFixed(2)} €</p>
        <p className="helper_text">Spedizione: {delivery.toFixed(2)} €</p>
        <p className="text-lg font-medium">Totale: {total.toFixed(2)} €</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <h2 className="H5 mb-1">Consegna</h2>
          <p className="helper_text">{isPickup ? "Ritiro in negozio (Avellino)" : "Corriere"}</p>
          {!isPickup && order.deliveryAdress ? (
            <p className="helper_text">
              {order.deliveryAdress.indirizzo}, {order.deliveryAdress.citta} {order.deliveryAdress.cap} (
              {order.deliveryAdress.provincia_regione})
            </p>
          ) : !isPickup ? (
            <p className="helper_text">
              {order.indirizzo} {order.numeroCivico}, {order.citta} {order.cap} ({order.provinciaRegione})
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="H5 mb-1">Fatturazione</h2>
          <p className="helper_text">
            {order.clientType === "azienda"
              ? order.ragioneSociale
              : `${order.nome ?? ""} ${order.cognome ?? ""}`.trim()}
          </p>
          <p className="helper_text">{order.email}</p>
          {order.partitaIva && <p className="helper_text">P. IVA: {order.partitaIva}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <h2 className="H5 mb-1">Pagamento</h2>
        <p className="helper_text">
          {payment ? payment.provider : "—"}
          {payment ? ` · ${PAYMENT_STATUS_LABEL[payment.status] ?? payment.status}` : ""}
        </p>

        {payment?.status === "PENDING_BONIFICO" && (
          <div className="mt-2 flex flex-col gap-1 rounded-md border border-stroke-grey p-4">
            <p className="font-medium">Dati per il bonifico</p>
            {bonificoData.map((row) => (
              <p key={row.title} className="helper_text">
                <strong>{row.title}:</strong> {row.value}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
