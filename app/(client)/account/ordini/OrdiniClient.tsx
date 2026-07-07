"use client";

import type { AccountOrderListItem } from "@/app/actions/account/orders/get-account-orders";
import { ORDER_STATUS_LIST, type OrderStatusTypes } from "@/types/orders.types";
import clsx from "clsx";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ORDER_STATUS_LABEL, formatOrderDate, orderStatusBadgeClass } from "./order-labels";

type SortOption = "NEWEST" | "OLDEST" | "TOTAL_DESC" | "TOTAL_ASC";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "NEWEST", label: "Più recenti" },
  { value: "OLDEST", label: "Meno recenti" },
  { value: "TOTAL_DESC", label: "Totale: dal più alto" },
  { value: "TOTAL_ASC", label: "Totale: dal più basso" },
];

const controlClass =
  "rounded-sm border border-stroke-grey bg-background px-3 py-2 text-sm outline-none transition focus:border-yellow-500";

export default function OrdiniClient({ orders }: { orders: AccountOrderListItem[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<OrderStatusTypes | "ALL">("ALL");
  const [sort, setSort] = useState<SortOption>("NEWEST");

  // Only offer statuses the customer actually has.
  const statuses = useMemo(() => {
    const present = new Set(orders.map((order) => order.orderStatus));
    return ORDER_STATUS_LIST.filter((option) => present.has(option));
  }, [orders]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return orders
      .filter((order) => status === "ALL" || order.orderStatus === status)
      .filter((order) => !normalized || order.orderNumber.toLowerCase().includes(normalized))
      .sort((a, b) => {
        switch (sort) {
          case "OLDEST":
            return +new Date(a.createdAt) - +new Date(b.createdAt);
          case "TOTAL_DESC":
            return b.total - a.total;
          case "TOTAL_ASC":
            return a.total - b.total;
          default:
            return +new Date(b.createdAt) - +new Date(a.createdAt);
        }
      });
  }, [orders, query, status, sort]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cerca per numero ordine…"
          className={clsx(controlClass, "flex-1 sm:min-w-56")}
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as OrderStatusTypes | "ALL")}
          className={controlClass}
        >
          <option value="ALL">Tutti gli stati</option>
          {statuses.map((option) => (
            <option key={option} value={option}>
              {ORDER_STATUS_LABEL[option]}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(event) => setSort(event.target.value as SortOption)}
          className={controlClass}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <p className="helper_text">
        {filtered.length === orders.length
          ? `${orders.length} ordini`
          : `${filtered.length} di ${orders.length} ordini`}
      </p>

      {filtered.length === 0 ? (
        <p className="rounded-sm border border-stroke-grey p-4 text-text-grey">
          Nessun ordine corrisponde ai filtri.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {filtered.map((order) => (
            <li key={order.orderNumber}>
              <Link
                href={`/account/ordini/${order.orderNumber}`}
                className="group flex flex-col gap-2 rounded-sm border border-stroke-grey p-4 transition hover:border-yellow-500/60 hover:bg-white/5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">Ordine {order.orderNumber}</p>
                  <p className="helper_text">
                    {formatOrderDate(order.createdAt)} · {order.itemCount} art.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={clsx(
                      "rounded-full border px-3 py-1 text-xs",
                      orderStatusBadgeClass(order.orderStatus),
                    )}
                  >
                    {ORDER_STATUS_LABEL[order.orderStatus] ?? order.orderStatus}
                  </span>
                  <span className="font-semibold whitespace-nowrap">{order.total.toFixed(2)} €</span>
                  <span
                    aria-hidden
                    className="text-lg text-yellow-500 opacity-0 transition group-hover:opacity-100"
                  >
                    ›
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
