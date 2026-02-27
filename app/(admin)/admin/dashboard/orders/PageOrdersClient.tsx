"use client";

import type { GetOrdersAllActionResponseType, OrderListItem } from "@/app/actions/orders/get-order";
import { OrderTypes } from "@/db/schemas/orders.schema";
import Link from "next/link";
import { use, useMemo, useState } from "react";
import { URL_DASHBOARD } from "../dashboard-admin.types";
import { getDeliveryMethodLabel, getOrderStatusLabel } from "./[id]/_order-details/formatters";

type OrderStatus = OrderTypes["orderStatus"];

type DateFilterOption =
  | "ALL"
  | "TODAY"
  | "LAST_7_DAYS"
  | "LAST_30_DAYS"
  | "THIS_MONTH"
  | "THIS_YEAR";

type SortOption = "NEWEST" | "OLDEST" | "TOTAL_DESC" | "TOTAL_ASC";

const DATE_FILTER_OPTIONS: { value: DateFilterOption; label: string }[] = [
  { value: "ALL", label: "Усі дати" },
  { value: "TODAY", label: "За сьогодні" },
  { value: "LAST_7_DAYS", label: "За 7 днів" },
  { value: "LAST_30_DAYS", label: "За 30 днів" },
  { value: "THIS_MONTH", label: "За поточний місяць" },
  { value: "THIS_YEAR", label: "За поточний рік" },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "NEWEST", label: "Нові спочатку" },
  { value: "OLDEST", label: "Старі спочатку" },
  { value: "TOTAL_DESC", label: "Сума: більша -> менша" },
  { value: "TOTAL_ASC", label: "Сума: менша -> більша" },
];

function formatDate(value: Date | null | undefined) {
  if (!value) return "-";
  const date = new Date(value);
  return new Intl.DateTimeFormat("uk-UA", { dateStyle: "short", timeStyle: "short" }).format(date);
}

function formatCurrency(value: number, currency = "EUR") {
  return new Intl.NumberFormat("uk-UA", { style: "currency", currency }).format(value ?? 0);
}

function getStatusBadgeClass(status: OrderStatus) {
  switch (status) {
    case "COMPLETED":
      return "border-green-500/40 bg-green-500/15 text-green-300";
    case "SHIPPED":
    case "PAID":
      return "border-blue-500/40 bg-blue-500/15 text-blue-300";
    case "PENDING_PAYMENT":
      return "border-yellow-500/40 bg-yellow-500/15 text-yellow-200";
    case "CANCELED":
    case "REFUNDED":
      return "border-red-500/40 bg-red-500/15 text-red-300";
    default:
      return "border-neutral-500/40 bg-neutral-500/15 text-neutral-300";
  }
}

function getClientLabel(order: OrderTypes) {
  const fullName = [order.nome, order.cognome].filter(Boolean).join(" ").trim();
  if (fullName) return fullName;
  if (order.ragioneSociale) return order.ragioneSociale;
  return order.email;
}

function getShippingLine(order: OrderTypes) {
  const deliveryAddress = order.deliveryAdress;
  const address = deliveryAddress?.indirizzo ?? order.indirizzo ?? "";
  const houseNumber = order.numeroCivico ? `, ${order.numeroCivico}` : "";
  const city = deliveryAddress?.citta ?? order.citta ?? "";
  const postalCode = deliveryAddress?.cap ?? order.cap ?? "";
  const province = deliveryAddress?.provincia_regione ?? order.provinciaRegione ?? "";

  const parts = [`${address}${houseNumber}`.trim(), `${postalCode} ${city}`.trim(), province].filter(Boolean);
  return parts.length ? parts.join(" | ") : "-";
}

function isWithinPeriod(value: Date | null | undefined, period: DateFilterOption) {
  if (period === "ALL") return true;
  if (!value) return false;

  const currentDate = new Date();
  const date = new Date(value);

  if (period === "TODAY") {
    const startOfDay = new Date(currentDate);
    startOfDay.setHours(0, 0, 0, 0);
    return date.getTime() >= startOfDay.getTime();
  }

  if (period === "LAST_7_DAYS") {
    const threshold = new Date(currentDate);
    threshold.setDate(threshold.getDate() - 7);
    return date.getTime() >= threshold.getTime();
  }

  if (period === "LAST_30_DAYS") {
    const threshold = new Date(currentDate);
    threshold.setDate(threshold.getDate() - 30);
    return date.getTime() >= threshold.getTime();
  }

  if (period === "THIS_MONTH") {
    return (
      date.getFullYear() === currentDate.getFullYear() &&
      date.getMonth() === currentDate.getMonth()
    );
  }

  if (period === "THIS_YEAR") {
    return date.getFullYear() === currentDate.getFullYear();
  }

  return true;
}

function sortOrders(left: OrderListItem, right: OrderListItem, sort: SortOption) {
  const leftCreated = left.createdAt ? new Date(left.createdAt).getTime() : 0;
  const rightCreated = right.createdAt ? new Date(right.createdAt).getTime() : 0;

  switch (sort) {
    case "OLDEST":
      return leftCreated - rightCreated;
    case "TOTAL_DESC":
      return (right.orderTotal ?? 0) - (left.orderTotal ?? 0);
    case "TOTAL_ASC":
      return (left.orderTotal ?? 0) - (right.orderTotal ?? 0);
    case "NEWEST":
    default:
      return rightCreated - leftCreated;
  }
}

function getDeliveryPrice(order: OrderTypes) {
  return order.deliveryMethod === "RITIRO_NEGOZIO" ? 0 : Number(order.deliveryPrice ?? 0) || 0;
}

export default function PageOrdersClient({
  serverActionOrders,
}: {
  serverActionOrders: GetOrdersAllActionResponseType;
}) {
  const { orders, error } = use(serverActionOrders);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<OrderStatus | "ALL">("ALL");
  const [dateFilter, setDateFilter] = useState<DateFilterOption>("ALL");
  const [sortBy, setSortBy] = useState<SortOption>("NEWEST");

  const statuses = useMemo(() => {
    const statusSet = new Set<OrderStatus>();
    (orders ?? []).forEach((order) => statusSet.add(order.orderStatus));

    return [
      "ALL" as const,
      ...Array.from(statusSet).sort((a, b) => getOrderStatusLabel(a).localeCompare(getOrderStatusLabel(b), "uk")),
    ];
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return [...(orders ?? [])]
      .filter((order) => {
        const hasStatus = status === "ALL" ? true : order.orderStatus === status;
        const hasPeriod = isWithinPeriod(order.createdAt, dateFilter);
        if (!hasStatus || !hasPeriod) return false;

        if (!normalizedQuery) return true;

        const searchableText = [
          order.orderNumber,
          order.email,
          order.numeroTelefono,
          order.nome,
          order.cognome,
          order.ragioneSociale,
          order.trackingNumber,
          order.carrier,
          order.citta,
          order.cap,
          order.provinciaRegione,
          getClientLabel(order),
          String(order.orderTotal ?? ""),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(normalizedQuery);
      })
      .sort((left, right) => sortOrders(left, right, sortBy));
  }, [orders, query, status, dateFilter, sortBy]);

  const allOrdersCount = orders?.length ?? 0;
  const filteredOrdersCount = filteredOrders.length;

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div className="min-w-0">
          <h1 className="admin-title">Замовлення</h1>
          <p className="admin-subtitle">
            Всього: {allOrdersCount}
            {filteredOrdersCount !== allOrdersCount ? ` • Відфільтровано: ${filteredOrdersCount}` : ""}
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:max-w-full sm:flex-row sm:flex-wrap sm:justify-end">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Пошук за номером, email, телефоном, трекінгом..."
            className="admin-input w-full min-w-0 sm:w-[320px] lg:w-[420px]"
          />

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as OrderStatus | "ALL")}
            className="admin-select w-full min-w-0 sm:w-[220px]"
          >
            {statuses.map((option) => (
              <option key={option} value={option}>
                {option === "ALL" ? "Усі статуси" : getOrderStatusLabel(option)}
              </option>
            ))}
          </select>

          <select
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value as DateFilterOption)}
            className="admin-select w-full min-w-0 sm:w-[220px]"
          >
            {DATE_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as SortOption)}
            className="admin-select w-full min-w-0 sm:w-[220px]"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          Помилка завантаження замовлень
        </div>
      ) : null}

      {!filteredOrdersCount ? <div className="admin-empty">Замовлень не знайдено.</div> : null}

      {filteredOrdersCount ? (
        <div className="admin-table-wrap hidden xl:block">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Замовлення</th>
                <th>Клієнт</th>
                <th>Статус</th>
                <th>Доставка</th>
                <th>Трекінг</th>
                <th>Сума замовлення</th>
                <th>Вартість доставки</th>
                <th>Створено</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <Link
                      href={URL_DASHBOARD.DASHBOARD + URL_DASHBOARD.SUB_DASHBOARD.ORDERS + "/" + order.id}
                      className="font-semibold text-amber-300 hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                  </td>

                  <td>
                    <div className="font-medium">{getClientLabel(order)}</div>
                    <div className="text-xs text-slate-400">{order.email}</div>
                    <div className="text-xs text-slate-500">{order.numeroTelefono}</div>
                  </td>

                  <td>
                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs ${getStatusBadgeClass(
                        order.orderStatus,
                      )}`}
                    >
                      {getOrderStatusLabel(order.orderStatus)}
                    </span>
                  </td>

                  <td>
                    <div>{getDeliveryMethodLabel(order.deliveryMethod)}</div>
                    <div className="mt-1 text-xs text-slate-400">{getShippingLine(order)}</div>
                  </td>

                  <td>
                    <div>{order.carrier || "-"}</div>
                    <div className="text-xs break-all text-slate-400">{order.trackingNumber || "-"}</div>
                    <div className="mt-1 text-xs text-slate-500">
                      Відправлено: {formatDate(order.shippedAt)} | Доставлено: {formatDate(order.deliveredAt)}
                    </div>
                  </td>

                  <td className="font-semibold text-emerald-300">{formatCurrency(order.orderTotal ?? 0, "EUR")}</td>
                  <td>{formatCurrency(getDeliveryPrice(order), "EUR")}</td>
                  <td className="text-slate-400">{formatDate(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {filteredOrdersCount ? (
        <div className="grid grid-cols-1 gap-3 xl:hidden">
          {filteredOrders.map((order) => (
            <article key={order.id} className="admin-card admin-card-content">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link
                    href={URL_DASHBOARD.DASHBOARD + URL_DASHBOARD.SUB_DASHBOARD.ORDERS + "/" + order.id}
                    className="text-base font-semibold text-amber-300 hover:underline"
                  >
                    #{order.orderNumber}
                  </Link>
                  <div className="mt-1 text-xs break-all text-slate-500">{order.id}</div>
                </div>

                <span
                  className={`inline-flex shrink-0 items-center rounded-full border px-3 py-1 text-xs ${getStatusBadgeClass(
                    order.orderStatus,
                  )}`}
                >
                  {getOrderStatusLabel(order.orderStatus)}
                </span>
              </div>

              <div className="mt-3 space-y-1 text-sm">
                <div className="font-medium">{getClientLabel(order)}</div>
                <div className="text-xs text-slate-400">{order.email}</div>
                <div className="text-xs text-slate-500">{order.numeroTelefono}</div>
              </div>

              <div className="mt-3 border-t border-slate-600/45 pt-3">
                <div className="text-xs text-slate-400">Доставка</div>
                <div className="text-sm">{getDeliveryMethodLabel(order.deliveryMethod)}</div>
                <div className="mt-1 text-xs text-slate-500">{getShippingLine(order)}</div>
              </div>

              <div className="mt-3 border-t border-slate-600/45 pt-3">
                <div className="text-xs text-slate-400">Трекінг</div>
                <div className="text-sm">{order.carrier || "-"}</div>
                <div className="text-xs break-all text-slate-400">{order.trackingNumber || "-"}</div>
                <div className="mt-1 text-xs text-slate-500">
                  Відправлено: {formatDate(order.shippedAt)} | Доставлено: {formatDate(order.deliveredAt)}
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 border-t border-slate-600/45 pt-3 sm:grid-cols-2">
                <div>
                  <div className="text-xs text-slate-400">Сума замовлення</div>
                  <div className="text-sm font-semibold text-emerald-300">
                    {formatCurrency(order.orderTotal ?? 0, "EUR")}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Вартість доставки</div>
                  <div className="text-sm">{formatCurrency(getDeliveryPrice(order), "EUR")}</div>
                </div>
              </div>

              <div className="mt-3 border-t border-slate-600/45 pt-3 text-xs text-slate-500">
                Створено: {formatDate(order.createdAt)}
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
