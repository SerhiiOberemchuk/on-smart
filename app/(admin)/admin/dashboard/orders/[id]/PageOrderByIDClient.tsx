"use client";

import type { GetOrderFullInfoByIdResponseType } from "@/app/actions/orders/get-order";
import { ORDER_STATUS_LIST } from "@/types/orders.types";
import { use, useMemo, useState, useTransition } from "react";
import { updateOrderInfoByOrderIDAction } from "@/app/actions/orders/udate-order-info";
import { toast } from "react-toastify";

type OrderStatus = (typeof ORDER_STATUS_LIST)[number];

function formatDate(value: Date | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatCurrencyEURFromCents(value: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(value ?? 0);
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case "COMPLETED":
    case "DELIVERED":
      return "bg-green-500/15 text-green-400 border-green-500/40";
    case "SHIPPED":
    case "PROCESSING":
      return "bg-blue-500/15 text-blue-400 border-blue-500/40";
    case "PENDING_PAYMENT":
      return "bg-yellow-500/15 text-yellow-400 border-yellow-500/40";
    case "CANCELED":
    case "FAILED":
      return "bg-red-500/15 text-red-400 border-red-500/40";
    default:
      return "bg-neutral-500/15 text-neutral-300 border-neutral-500/40";
  }
}

function getPaymentStatusBadgeClass(status: string) {
  switch (status) {
    case "SUCCESS":
    case "PAYED":
      return "bg-green-500/15 text-green-400 border-green-500/40";
    case "FAILED":
    case "CANCELED":
      return "bg-red-500/15 text-red-400 border-red-500/40";
    case "PENDING_BONIFICO":
      return "bg-yellow-500/15 text-yellow-400 border-yellow-500/40";
    case "CREATED":
    default:
      return "bg-blue-500/15 text-blue-400 border-blue-500/40";
  }
}

function centsFromAny(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export default function PageOrderByID({
  orderInfoAction,
}: {
  orderInfoAction: GetOrderFullInfoByIdResponseType;
}) {
  const { order, orderItems, payments, error } = use(orderInfoAction);

  const [pending, startTransition] = useTransition();
  const [saveError, setSaveError] = useState<string | null>(null);

  const totals = useMemo(() => {
    const itemsSubtotal = (orderItems ?? []).reduce((acc, it) => {
      const unit = centsFromAny(it.unitPrice);
      return acc + unit * (it.quantity ?? 0);
    }, 0);

    const delivery =
      order?.deliveryMethod === "RITIRO_NEGOZIO" ? 0 : centsFromAny(order?.deliveryPrice ?? 0);
    const total = itemsSubtotal + delivery;

    return { itemsSubtotal, delivery, total };
  }, [orderItems, order]);

  const [status, setStatus] = useState<OrderStatus | "">(order?.orderStatus ?? "");
  const [carrier, setCarrier] = useState<string>(order?.carrier ?? "");
  const [trackingNumber, setTrackingNumber] = useState<string>(order?.trackingNumber ?? "");
  const [requestInvoice, setRequestInvoice] = useState<boolean>(order?.requestInvoice ?? false);

  const [shippedAt, setShippedAt] = useState<string>(() => {
    if (!order?.shippedAt) return "";
    const d = new Date(order.shippedAt);
    return d.toISOString().slice(0, 16);
  });

  const [deliveredAt, setDeliveredAt] = useState<string>(() => {
    if (!order?.deliveredAt) return "";
    const d = new Date(order.deliveredAt);
    return d.toISOString().slice(0, 16);
  });

  if (error) {
    return (
      <section className="p-6 text-white">
        <h1 className="text-2xl font-semibold">Ordine</h1>
        <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
          Errore nel caricamento ordine
        </div>
      </section>
    );
  }

  if (!order) {
    return (
      <section className="p-6 text-white">
        <h1 className="text-2xl font-semibold">Ordine</h1>
        <div className="mt-6 rounded-xl border border-neutral-800 bg-neutral-900 p-6 text-neutral-300">
          Ordine non trovato
        </div>
      </section>
    );
  }

  const clientName = [order.nome, order.cognome].filter(Boolean).join(" ").trim();
  const isCompany = order.clientType === "azienda";

  const delivery = order.deliveryAdress;
  const deliveryLine = [
    delivery?.indirizzo ?? order.indirizzo ?? "",
    order.numeroCivico ? `, ${order.numeroCivico}` : "",
  ].join("");
  const cityLine = [
    delivery?.cap ?? order.cap ?? "",
    delivery?.citta ?? order.citta ?? "",
    delivery?.provincia_regione ?? order.provinciaRegione ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  function onSave() {
    setSaveError(null);

    startTransition(async () => {
      if (!order?.id) {
        toast.error("Order ID undefined!!!");
        return;
      }
      const res = await updateOrderInfoByOrderIDAction({
        orderId: order.id,
        dataToUpdate: {
          orderStatus: status || undefined,
          carrier: carrier.trim() ? carrier.trim() : null,
          trackingNumber: trackingNumber.trim() ? trackingNumber.trim() : null,
          requestInvoice,
          shippedAt: shippedAt ? new Date(shippedAt) : null,
          deliveredAt: deliveredAt ? new Date(deliveredAt) : null,
        },
      });

      if (!res.succes) {
        toast.error(String(res.error) ?? "Errore salvataggio");
        return;
      }

      toast.success("Salvato");
      //   router.refresh();
    });
  }

  return (
    <section className="p-6 text-white">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">
            Ordine <span className="text-neutral-300">#{order.orderNumber}</span>
          </h1>
          <div className="mt-1 text-sm text-neutral-400">
            Creato: {formatDate(order.createdAt)} • Aggiornato: {formatDate(order.updatedAt)}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs ${getStatusBadgeClass(
              order.orderStatus,
            )}`}
          >
            {order.orderStatus}
          </span>

          <button
            onClick={onSave}
            disabled={pending}
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
          >
            {pending ? "Salvataggio…" : "Salva modifiche"}
          </button>
        </div>
      </div>

      {saveError ? (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          {saveError}
        </div>
      ) : null}

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900">
            <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-3">
              <div className="font-semibold">Prodotti</div>
              <div className="text-xs text-neutral-500">{orderItems?.length ?? 0} righe</div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-800/60 text-xs tracking-wider text-neutral-400 uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Articolo</th>
                    <th className="px-4 py-3 text-left">Q.tà</th>
                    <th className="px-4 py-3 text-left">Prezzo</th>
                    <th className="px-4 py-3 text-left">Totale</th>
                  </tr>
                </thead>
                <tbody>
                  {(orderItems ?? []).map((it) => {
                    const unit = centsFromAny(it.unitPrice);
                    const rowTotal = unit * (it.quantity ?? 0);

                    return (
                      <tr key={it.id} className="border-t border-neutral-800">
                        <td className="px-4 py-3">
                          <div className="font-medium">{it.title}</div>
                          <div className="text-xs text-neutral-500">
                            {it.brandName ?? "—"} • {it.categoryName ?? "—"}
                          </div>
                        </td>
                        <td className="px-4 py-3">{it.quantity}</td>
                        <td className="px-4 py-3">{formatCurrencyEURFromCents(unit)}</td>
                        <td className="px-4 py-3">{formatCurrencyEURFromCents(rowTotal)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="border-t border-neutral-800 p-4 text-sm">
              <div className="flex justify-end">
                <div className="w-full max-w-sm space-y-2">
                  <div className="flex justify-between text-neutral-300">
                    <span>Subtotale</span>
                    <span>{formatCurrencyEURFromCents(totals.itemsSubtotal)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-300">
                    <span>Consegna</span>
                    <span>{formatCurrencyEURFromCents(totals.delivery)}</span>
                  </div>
                  <div className="flex justify-between border-t border-neutral-800 pt-2 font-semibold text-white">
                    <span>Totale</span>
                    <span>{formatCurrencyEURFromCents(totals.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900">
            <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-3">
              <div className="font-semibold">Pagamenti</div>
              <div className="text-xs text-neutral-500">{payments ? 1 : 0}</div>
            </div>

            {!payments ? (
              <div className="p-4 text-sm text-neutral-400">Nessun pagamento</div>
            ) : (
              <div className="divide-y divide-neutral-800">
                {
                  <div
                    key={payments.id}
                    className="flex flex-col gap-2 p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <div className="font-medium capitalize">{payments.provider}</div>
                      <div className="text-xs break-all text-neutral-500">
                        Provider ID: {payments.providerOrderId ?? "—"}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {formatDate(payments.createdAt)} • {formatDate(payments.updatedAt)}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-sm font-semibold">
                        {formatCurrencyEURFromCents(centsFromAny(payments.amount))}
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs ${getPaymentStatusBadgeClass(
                          payments.status,
                        )}`}
                      >
                        {payments.status}
                      </span>
                    </div>
                  </div>
                }
              </div>
            )}
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
            <div className="mb-3 font-semibold">Gestione ordine</div>

            <label className="mb-1 block text-xs text-neutral-400">Stato ordine</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as OrderStatus)}
              className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-neutral-600"
            >
              {ORDER_STATUS_LIST.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <div className="mt-4 grid grid-cols-1 gap-3">
              <div>
                <label className="mb-1 block text-xs text-neutral-400">Carrier</label>
                <input
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-neutral-600"
                  placeholder="es. GLS / BRT / UPS…"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs text-neutral-400">Tracking number</label>
                <input
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-neutral-600"
                  placeholder="Inserisci tracking…"
                />
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-neutral-400">Shipped at</label>
                  <input
                    type="datetime-local"
                    value={shippedAt}
                    onChange={(e) => setShippedAt(e.target.value)}
                    className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-neutral-600"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-neutral-400">Delivered at</label>
                  <input
                    type="datetime-local"
                    value={deliveredAt}
                    onChange={(e) => setDeliveredAt(e.target.value)}
                    className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-neutral-600"
                  />
                </div>
              </div>

              <label className="mt-2 flex items-center gap-2 text-sm text-neutral-300">
                <input
                  type="checkbox"
                  checked={requestInvoice}
                  onChange={(e) => setRequestInvoice(e.target.checked)}
                />
                Richiede fattura
              </label>
            </div>

            <button
              onClick={onSave}
              disabled={pending}
              className="mt-4 w-full rounded-lg bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
            >
              {pending ? "Salvataggio…" : "Salva"}
            </button>
          </div>

          {/* Customer */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
            <div className="mb-3 font-semibold">Cliente</div>

            <div className="text-sm">
              <div className="text-xs text-neutral-400">Tipo</div>
              <div className="font-medium">{order.clientType}</div>
            </div>

            <div className="mt-3 text-sm">
              <div className="text-xs text-neutral-400">Nome / Azienda</div>
              <div className="font-medium">{clientName || order.ragioneSociale || "—"}</div>
            </div>

            <div className="mt-3 text-sm">
              <div className="text-xs text-neutral-400">Email</div>
              <div className="font-medium break-all">{order.email}</div>
            </div>

            <div className="mt-3 text-sm">
              <div className="text-xs text-neutral-400">Telefono</div>
              <div className="font-medium">{order.numeroTelefono}</div>
            </div>

            {isCompany ? (
              <div className="mt-4 space-y-2 border-t border-neutral-800 pt-4 text-sm">
                <div>
                  <div className="text-xs text-neutral-400">Ragione sociale</div>
                  <div className="font-medium">{order.ragioneSociale ?? "—"}</div>
                </div>
                <div>
                  <div className="text-xs text-neutral-400">Partita IVA</div>
                  <div className="font-medium">{order.partitaIva ?? "—"}</div>
                </div>
                <div>
                  <div className="text-xs text-neutral-400">PEC</div>
                  <div className="font-medium break-all">{order.pecAzzienda ?? "—"}</div>
                </div>
                <div>
                  <div className="text-xs text-neutral-400">Codice univoco</div>
                  <div className="font-medium">{order.codiceUnico ?? "—"}</div>
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-2 border-t border-neutral-800 pt-4 text-sm">
                <div>
                  <div className="text-xs text-neutral-400">Codice fiscale</div>
                  <div className="font-medium">{order.codiceFiscale ?? "—"}</div>
                </div>
              </div>
            )}
          </div>

          {/* Shipping */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
            <div className="mb-3 font-semibold">Spedizione</div>

            <div className="text-sm">
              <div className="text-xs text-neutral-400">Metodo</div>
              <div className="font-medium">{order.deliveryMethod}</div>
            </div>

            <div className="mt-3 text-sm">
              <div className="text-xs text-neutral-400">Indirizzo</div>
              <div className="font-medium">{deliveryLine || "—"}</div>
              <div className="mt-1 text-xs text-neutral-500">{cityLine || "—"}</div>
              <div className="mt-1 text-xs text-neutral-500">
                Nazione: {delivery?.nazione ?? order.nazione ?? "—"}
              </div>
            </div>

            <div className="mt-3 text-sm">
              <div className="text-xs text-neutral-400">Prezzo consegna</div>
              <div className="font-medium">
                {formatCurrencyEURFromCents(centsFromAny(order.deliveryPrice))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
