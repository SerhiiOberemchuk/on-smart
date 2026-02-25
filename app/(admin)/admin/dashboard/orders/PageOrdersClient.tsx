"use client";

import type { GetOrdersAllActionResponseType } from "@/app/actions/orders/get-order";
import { OrderTypes } from "@/db/schemas/orders.schema";
import Link from "next/link";
import { use, useMemo, useState } from "react";
import { URL_DASHBOARD } from "../dashboard-admin.types";

type OrderStatus = OrderTypes["orderStatus"];

function formatDate(value: Date | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  return new Intl.DateTimeFormat("it-IT", { dateStyle: "short", timeStyle: "short" }).format(d);
}

function formatCurrencyCents(cents: number, currency = "EUR") {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency }).format(cents ?? 0);
}

function getStatusBadgeClass(status: OrderStatus) {
  switch (status) {
    case "COMPLETED":
      return "bg-green-500/15 text-green-400 border-green-500/40";
    case "SHIPPED":
    case "PAID":
      return "bg-blue-500/15 text-blue-400 border-blue-500/40";
    case "PENDING_PAYMENT":
      return "bg-yellow-500/15 text-yellow-400 border-yellow-500/40";
    case "CANCELED":
    case "REFUNDED":
      return "bg-red-500/15 text-red-400 border-red-500/40";
    default:
      return "bg-neutral-500/15 text-neutral-300 border-neutral-500/40";
  }
}

function getClientLabel(o: OrderTypes) {
  const full = [o.nome, o.cognome].filter(Boolean).join(" ").trim();
  if (full) return full;

  if (o.ragioneSociale) return o.ragioneSociale;

  return o.email;
}

function getShippingLine(o: OrderTypes) {
  const d = o.deliveryAdress;
  // якщо з JSON приходить null — ок
  const indirizzo = d?.indirizzo ?? o.indirizzo ?? "";
  const civico = o.numeroCivico ? `, ${o.numeroCivico}` : "";
  const citta = d?.citta ?? o.citta ?? "";
  const cap = d?.cap ?? o.cap ?? "";
  const provincia = d?.provincia_regione ?? o.provinciaRegione ?? "";
  const parts = [`${indirizzo}${civico}`.trim(), `${cap} ${citta}`.trim(), provincia].filter(
    Boolean,
  );
  return parts.length ? parts.join(" • ") : "—";
}

export default function PageOrdersClient({
  serverActionOrders,
}: {
  serverActionOrders: GetOrdersAllActionResponseType;
}) {
  const { orders, error } = use(serverActionOrders);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<OrderStatus | "ALL">("ALL");

  const statuses = useMemo(() => {
    const set = new Set<OrderStatus>();
    (orders ?? []).forEach((o) => set.add(o.orderStatus));
    return ["ALL" as const, ...Array.from(set)];
  }, [orders]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (orders ?? []).filter((o) => {
      const matchStatus = status === "ALL" ? true : o.orderStatus === status;

      if (!q) return matchStatus;

      const hay = [
        o.orderNumber,
        o.email,
        o.numeroTelefono,
        o.nome,
        o.cognome,
        o.ragioneSociale,
        o.trackingNumber,
        o.carrier,
        o.citta,
        o.cap,
        o.provinciaRegione,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchStatus && hay.includes(q);
    });
  }, [orders, query, status]);

  return (
    <section className="p-6 text-white">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Ordini</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Totale: <span className="text-neutral-200">{orders?.length ?? 0}</span>
            {filtered.length !== (orders?.length ?? 0) ? (
              <>
                {" "}
                • Filtrati: <span className="text-neutral-200">{filtered.length}</span>
              </>
            ) : null}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cerca: ordine, email, telefono, tracking…"
              className="w-[320px] max-w-[80vw] rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-neutral-600"
            />
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus | "ALL")}
            className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-neutral-600"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s === "ALL" ? "Tutti gli stati" : s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? (
        <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
          Errore nel caricamento ordini
        </div>
      ) : null}

      {!filtered.length ? (
        <div className="mt-6 rounded-xl border border-neutral-800 bg-neutral-900 p-8 text-center">
          <div className="text-lg font-medium">Nessun ordine trovato</div>
          <div className="mt-2 text-sm text-neutral-400">Prova a cambiare filtri o la ricerca.</div>
        </div>
      ) : null}

      {filtered.length ? (
        <div className="mt-6 hidden overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-900 xl:block">
          <table className="w-full text-sm">
            <thead className="bg-neutral-800 text-xs tracking-wider text-neutral-400 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Ordine</th>
                <th className="px-4 py-3 text-left">Cliente</th>
                <th className="px-4 py-3 text-left">Stato</th>
                <th className="px-4 py-3 text-left">Consegna</th>
                <th className="px-4 py-3 text-left">Tracking</th>
                <th className="px-4 py-3 text-left">Prezzo consegna</th>
                <th className="px-4 py-3 text-left">Creato</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((o) => (
                <tr
                  key={o.id}
                  className="border-t border-neutral-800 transition-colors hover:bg-neutral-800/60"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={
                        URL_DASHBOARD.DASHBOARD + URL_DASHBOARD.SUB_DASHBOARD.ORDERS + "/" + o.id
                      }
                      className="hover:text-yellow-600"
                    >
                      {" "}
                      <div className="font-medium">{o.orderNumber}</div>{" "}
                    </Link>
                  </td>

                  <td className="px-4 py-3">
                    <div className="font-medium">{getClientLabel(o)}</div>
                    <div className="text-xs text-neutral-400">{o.email}</div>
                    <div className="text-xs text-neutral-500">{o.numeroTelefono}</div>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs ${getStatusBadgeClass(
                        o.orderStatus,
                      )}`}
                    >
                      {o.orderStatus}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <div className="text-neutral-200">{o.deliveryMethod}</div>
                    <div className="mt-1 text-xs text-neutral-400">{getShippingLine(o)}</div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="text-neutral-200">
                      {" "}
                      {o.carrier ? o.carrier : "Corriere /-/"}
                    </div>
                    <div className="text-xs break-all text-neutral-400">
                      {o.trackingNumber ? o.trackingNumber : "Numero spediziene"}
                    </div>
                    <div className="mt-1 text-xs text-neutral-500">
                      Spedito: {formatDate(o.shippedAt)}
                      {" • "}
                      Consegnato: {formatDate(o.deliveredAt)}
                    </div>
                  </td>

                  <td className="px-4 py-3">{formatCurrencyCents(o.deliveryPrice ?? 0, "EUR")}</td>

                  <td className="px-4 py-3 text-neutral-400">{formatDate(o.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {filtered.length ? (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:hidden">
          {filtered.map((o) => (
            <div
              key={o.id}
              className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 transition-colors hover:border-neutral-700"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold">#{o.orderNumber}</div>
                  <div className="text-xs break-all text-neutral-500">{o.id}</div>
                </div>

                <span
                  className={`inline-flex shrink-0 items-center rounded-full border px-3 py-1 text-xs ${getStatusBadgeClass(
                    o.orderStatus,
                  )}`}
                >
                  {o.orderStatus}
                </span>
              </div>

              <div className="mt-3">
                <div className="text-sm font-medium text-neutral-300">{getClientLabel(o)}</div>
                <div className="text-xs text-neutral-400">{o.email}</div>
                <div className="text-xs text-neutral-500">{o.numeroTelefono}</div>
              </div>

              <div className="mt-3 border-t border-neutral-800 pt-3">
                <div className="text-xs text-neutral-400">Consegna</div>
                <div className="text-sm text-neutral-200">{o.deliveryMethod}</div>
                <div className="mt-1 text-xs text-neutral-500">{getShippingLine(o)}</div>
                <div className="mt-2 text-sm text-neutral-200">
                  {formatCurrencyCents(o.deliveryPrice ?? 0, "EUR")}
                  <span className="text-xs text-neutral-500"> • prezzo consegna</span>
                </div>
              </div>

              <div className="mt-3 border-t border-neutral-800 pt-3">
                <div className="text-xs text-neutral-400">Tracking</div>
                <div className="text-sm text-neutral-200">{o.carrier ?? "—"}</div>
                <div className="text-xs break-all text-neutral-400">{o.trackingNumber ?? "—"}</div>
                <div className="mt-1 text-xs text-neutral-500">
                  Spedito: {formatDate(o.shippedAt)} • Consegnato: {formatDate(o.deliveredAt)}
                </div>
              </div>

              <div className="mt-3 text-xs text-neutral-500">
                Creato: {formatDate(o.createdAt)} • Aggiornato: {formatDate(o.updatedAt)}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
