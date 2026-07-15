"use client";

import {
  getAccountWithdrawalOrders,
  type WithdrawalOrderOption,
} from "@/app/actions/account/withdrawal/get-account-withdrawal-orders";
import { CustomSelect } from "@/components/CustomSelect";
import WithdrawalForm from "@/components/WithdrawalForm";
import {
  WITHDRAWAL_STATUS_LABEL_IT,
  WITHDRAWAL_STATUS_TEXT_CLASS,
} from "@/types/withdrawal.types";
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

type RecessoFilter = "ALL" | "ELIGIBLE" | "REQUESTED";

const RECESSO_FILTER_OPTIONS: { value: RecessoFilter; label: string }[] = [
  { value: "ALL", label: "Tutti gli ordini" },
  { value: "ELIGIBLE", label: "Recesso disponibile" },
  { value: "REQUESTED", label: "Recesso già richiesto" },
];

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("it-IT", { dateStyle: "long", timeZone: "Europe/Rome" }).format(
    new Date(value),
  );
}

export default function RecessoClient({
  nome,
  email,
  orders: initialOrders,
}: {
  nome: string;
  email: string;
  orders: WithdrawalOrderOption[];
}) {
  const [orders, setOrders] = useState(initialOrders);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [recessoFilter, setRecessoFilter] = useState<RecessoFilter>("ALL");
  const [period, setPeriod] = useState<PeriodOption>("30D");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selected, setSelected] = useState<WithdrawalOrderOption | null>(null);

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
    getAccountWithdrawalOrders({ fromMs: range.from, toMs: range.to })
      .then((data) => active && setOrders(data.orders))
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [period, fromDate, toDate]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return orders
      .filter((order) =>
        recessoFilter === "ALL"
          ? true
          : recessoFilter === "ELIGIBLE"
            ? order.withdrawalStatus === null
            : order.withdrawalStatus !== null,
      )
      .filter(
        (order) =>
          !normalized || `${order.orderNumber} ${order.summary}`.toLowerCase().includes(normalized),
      )
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }, [orders, query, recessoFilter]);

  // Reflect a submitted statement in the list without a full refetch.
  const handleSuccess = (orderNumber?: string) => {
    if (!orderNumber) return;
    setOrders((prev) =>
      prev.map((order) =>
        order.orderNumber === orderNumber ? { ...order, withdrawalStatus: "RECEIVED" } : order,
      ),
    );
  };

  // Modal: lock body scroll + close on Escape.
  useEffect(() => {
    if (!selected) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [selected]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cerca ordine per numero o prodotto…"
          className={clsx(ORDER_CONTROL_CLASS, "flex-1 sm:min-w-56")}
        />
        <CustomSelect
          variant="box"
          className="w-full sm:w-56"
          value={recessoFilter}
          onChange={(v) => setRecessoFilter(v as RecessoFilter)}
          options={RECESSO_FILTER_OPTIONS}
        />
        <CustomSelect
          variant="box"
          className="w-full sm:w-52"
          value={period}
          onChange={(v) => setPeriod(v as PeriodOption)}
          options={PERIOD_OPTIONS}
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
            <li
              key={order.orderNumber}
              className="flex flex-col gap-3 rounded-sm border border-stroke-grey p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-medium">Ordine {order.orderNumber}</p>
                <p className="helper_text truncate">
                  {formatDate(order.createdAt)}
                  {order.summary ? ` · ${order.summary}` : ""}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <Link
                  href={`/account/ordini/${order.orderNumber}`}
                  className="helper_text text-yellow-500 underline underline-offset-2"
                >
                  Dettagli
                </Link>

                {order.withdrawalStatus === null ? (
                  <button
                    type="button"
                    onClick={() => setSelected(order)}
                    className="rounded-sm border border-yellow-500/60 px-3 py-1.5 text-sm font-medium text-yellow-500 transition hover:bg-yellow-500/10"
                  >
                    Richiedi recesso
                  </button>
                ) : (
                  <span
                    className={clsx(
                      "rounded-full border border-stroke-grey px-3 py-1 text-xs",
                      WITHDRAWAL_STATUS_TEXT_CLASS[order.withdrawalStatus],
                    )}
                  >
                    Recesso: {WITHDRAWAL_STATUS_LABEL_IT[order.withdrawalStatus]}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-100 flex items-start justify-center overflow-auto bg-black/70 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label={`Richiesta di recesso — Ordine ${selected.orderNumber}`}
          onClick={(event) => {
            if (event.target === event.currentTarget) setSelected(null);
          }}
        >
          <div className="w-full max-w-lg rounded-sm border border-stroke-grey bg-header-footer-100 p-5 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="H5">Richiesta di recesso</h2>
                <p className="helper_text">Ordine {selected.orderNumber}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Chiudi"
                className="rounded-sm p-1 text-2xl leading-none text-text-grey transition hover:text-white"
              >
                ×
              </button>
            </div>

            <WithdrawalForm
              defaultNome={nome}
              defaultEmail={email}
              orderNumber={selected.orderNumber}
              onSuccess={handleSuccess}
            />
          </div>
        </div>
      )}
    </div>
  );
}
