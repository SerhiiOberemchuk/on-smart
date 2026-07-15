"use client";

import {
  getAccountOrders,
  type AccountOrderListItem,
} from "@/app/actions/account/orders/get-account-orders";
import { CustomSelect } from "@/components/CustomSelect";
import { ORDER_STATUS_LIST, type OrderStatusTypes } from "@/types/orders.types";
import clsx from "clsx";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ORDER_CONTROL_CLASS,
  PERIOD_OPTIONS,
  PeriodDateRange,
  type PeriodOption,
  resolvePeriodRange,
} from "../components/order-period";
import { ORDER_STATUS_LABEL, formatOrderDate, orderStatusBadgeClass } from "./order-labels";

type SortOption = "NEWEST" | "OLDEST" | "TOTAL_DESC" | "TOTAL_ASC";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "NEWEST", label: "Più recenti" },
  { value: "OLDEST", label: "Meno recenti" },
  { value: "TOTAL_DESC", label: "Totale: dal più alto" },
  { value: "TOTAL_ASC", label: "Totale: dal più basso" },
];

export default function OrdiniClient({
  initialOrders,
}: {
  initialOrders: AccountOrderListItem[];
}) {
  const [orders, setOrders] = useState(initialOrders);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<OrderStatusTypes | "ALL">("ALL");
  const [sort, setSort] = useState<SortOption>("NEWEST");
  const [period, setPeriod] = useState<PeriodOption>("30D");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // The default 30-day set arrives from the server; only re-fetch when the
  // period changes so we never load every order up front.
  const isFirst = useRef(true);
  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    if (period === "CUSTOM" && !fromDate && !toDate) return;

    let active = true;
    setLoading(true);
    const range = resolvePeriodRange(period, fromDate, toDate);
    getAccountOrders({ fromMs: range.from, toMs: range.to })
      .then((data) => active && setOrders(data))
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [period, fromDate, toDate]);

  // Only offer statuses present in the loaded set.
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
          className={clsx(ORDER_CONTROL_CLASS, "flex-1 sm:min-w-56")}
        />
        <CustomSelect
          variant="box"
          className="w-full sm:w-52"
          value={status}
          onChange={(v) => setStatus(v as OrderStatusTypes | "ALL")}
          options={[
            { value: "ALL", label: "Tutti gli stati" },
            ...statuses.map((option) => ({ value: option, label: ORDER_STATUS_LABEL[option] })),
          ]}
        />
        <CustomSelect
          variant="box"
          className="w-full sm:w-52"
          value={period}
          onChange={(v) => setPeriod(v as PeriodOption)}
          options={PERIOD_OPTIONS}
        />
        <CustomSelect
          variant="box"
          className="w-full sm:w-52"
          value={sort}
          onChange={(v) => setSort(v as SortOption)}
          options={SORT_OPTIONS}
        />
      </div>

      {period === "CUSTOM" && (
        <PeriodDateRange
          fromDate={fromDate}
          toDate={toDate}
          onFromChange={setFromDate}
          onToChange={setToDate}
        />
      )}

      <p className="helper_text">
        {loading
          ? "Caricamento…"
          : filtered.length === orders.length
            ? `${orders.length} ordini`
            : `${filtered.length} di ${orders.length} ordini`}
      </p>

      {!loading && filtered.length === 0 ? (
        <div className="flex flex-col items-start gap-2 rounded-sm border border-stroke-grey p-4 text-text-grey">
          <p>Nessun ordine nel periodo selezionato.</p>
          {period !== "ALL" && (
            <button
              type="button"
              onClick={() => setPeriod("ALL")}
              className="text-yellow-500 underline underline-offset-2"
            >
              Mostra tutti gli ordini
            </button>
          )}
        </div>
      ) : (
        <ul className={clsx("flex flex-col gap-3", loading && "opacity-60")}>
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
