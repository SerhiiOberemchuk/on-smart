"use client";

import type {
  AdminCustomerRow,
  AdminCustomersSummary,
} from "@/app/actions/admin/customers/queries";
import { useMemo, useState } from "react";

const euro = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" });
const dateFmt = new Intl.DateTimeFormat("uk-UA", { dateStyle: "short", timeZone: "Europe/Rome" });

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "—";
  return dateFmt.format(new Date(value));
}

function pct(part: number, whole: number) {
  return whole > 0 ? Math.round((part / whole) * 100) : 0;
}

type Segment =
  | "ALL"
  | "WITH_ORDERS"
  | "LEADS"
  | "BUSINESS"
  | "PRIVATE"
  | "UNVERIFIED"
  | "BANNED";

type SortKey = "RECENT" | "SPENT" | "ORDERS" | "LAST_ORDER" | "NAME";

const SEGMENTS: { value: Segment; label: string }[] = [
  { value: "ALL", label: "Усі клієнти" },
  { value: "WITH_ORDERS", label: "З замовленнями" },
  { value: "LEADS", label: "Без замовлень (ліди)" },
  { value: "BUSINESS", label: "Компанії" },
  { value: "PRIVATE", label: "Приватні" },
  { value: "UNVERIFIED", label: "Email не підтверджено" },
  { value: "BANNED", label: "Заблоковані" },
];

const SORTS: { value: SortKey; label: string }[] = [
  { value: "RECENT", label: "Сортувати: найновіші" },
  { value: "SPENT", label: "Сортувати: найбільше витратили" },
  { value: "ORDERS", label: "Сортувати: найбільше замовлень" },
  { value: "LAST_ORDER", label: "Сортувати: останнє замовлення" },
  { value: "NAME", label: "Сортувати: ім'я (А–Я)" },
];

function matchesSegment(row: AdminCustomerRow, segment: Segment) {
  switch (segment) {
    case "WITH_ORDERS":
      return row.ordersCount > 0;
    case "LEADS":
      return row.ordersCount === 0;
    case "BUSINESS":
      return row.clientType === "azienda";
    case "PRIVATE":
      return row.clientType !== "azienda";
    case "UNVERIFIED":
      return !row.emailVerified;
    case "BANNED":
      return row.banned;
    case "ALL":
    default:
      return true;
  }
}

function sortRows(rows: AdminCustomerRow[], sort: SortKey) {
  const copy = [...rows];
  switch (sort) {
    case "SPENT":
      return copy.sort((a, b) => b.totalSpent - a.totalSpent);
    case "ORDERS":
      return copy.sort((a, b) => b.ordersCount - a.ordersCount);
    case "LAST_ORDER":
      return copy.sort(
        (a, b) => (b.lastOrderAt ? new Date(b.lastOrderAt).getTime() : 0) -
          (a.lastOrderAt ? new Date(a.lastOrderAt).getTime() : 0),
      );
    case "NAME":
      return copy.sort((a, b) => a.name.localeCompare(b.name, "uk"));
    case "RECENT":
    default:
      return copy.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }
}

function csvCell(value: string) {
  return /[",\n;]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function exportCsv(rows: AdminCustomerRow[]) {
  const header = [
    "Ім'я",
    "Email",
    "Телефон",
    "Тип",
    "Компанія",
    "Місто",
    "Реєстрація",
    "Замовлень",
    "Оплачених",
    "Витрачено (EUR)",
    "Останнє замовлення",
    "Вподобань",
  ];
  const body = rows.map((row) => [
    row.name,
    row.email,
    row.phone ?? "",
    row.clientType === "azienda" ? "Компанія" : "Приватний",
    row.companyName ?? "",
    row.city ?? "",
    formatDate(row.createdAt),
    String(row.ordersCount),
    String(row.paidOrdersCount),
    row.totalSpent.toFixed(2),
    row.lastOrderAt ? formatDate(row.lastOrderAt) : "",
    String(row.wishlistCount),
  ]);
  const csv = [header, ...body].map((cols) => cols.map(csvCell).join(",")).join("\n");
  // Prepend a UTF-8 BOM so Excel renders Cyrillic/accented names correctly.
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `clienti-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function CustomersClientComponent({
  customers,
  summary,
}: {
  customers: AdminCustomerRow[];
  summary: AdminCustomersSummary;
}) {
  const [query, setQuery] = useState("");
  const [segment, setSegment] = useState<Segment>("ALL");
  const [sort, setSort] = useState<SortKey>("RECENT");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const bySegment = customers.filter((row) => matchesSegment(row, segment));
    const bySearch = normalized
      ? bySegment.filter((row) =>
          [row.name, row.email, row.phone, row.companyName, row.city]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(normalized),
        )
      : bySegment;
    return sortRows(bySearch, sort);
  }, [customers, query, segment, sort]);

  const avgLtv = summary.withOrders > 0 ? summary.totalRevenue / summary.withOrders : 0;

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div className="min-w-0">
          <h1 className="admin-title">Клієнти</h1>
          <p className="admin-subtitle">
            Всього: {summary.total}
            {filtered.length !== summary.total ? ` • Показано: ${filtered.length}` : ""}
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Пошук за іменем, email, телефоном, компанією..."
            className="admin-input w-full min-w-0 sm:w-80"
          />
          <select
            value={segment}
            onChange={(event) => setSegment(event.target.value as Segment)}
            className="admin-select w-full min-w-0 sm:w-55"
          >
            {SEGMENTS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortKey)}
            className="admin-select w-full min-w-0 sm:w-60"
          >
            {SORTS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => exportCsv(filtered)}
            disabled={!filtered.length}
            className="admin-btn-secondary"
          >
            Експорт CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Всього клієнтів"
          value={String(summary.total)}
          hint={`${summary.business} компаній • ${summary.total - summary.business} приватних`}
        />
        <StatCard
          label="Нові за 30 днів"
          value={String(summary.newLast30)}
          hint={`${pct(summary.newLast30, summary.total)}% бази`}
        />
        <StatCard
          label="Підтвердили email"
          value={String(summary.verified)}
          hint={`${pct(summary.verified, summary.total)}% бази`}
        />
        <StatCard
          label="З замовленнями"
          value={String(summary.withOrders)}
          hint={`конверсія ${pct(summary.withOrders, summary.total)}%`}
        />
        <StatCard
          label="Загальна виручка"
          value={euro.format(summary.totalRevenue)}
          hint={`середній LTV ${euro.format(avgLtv)}`}
        />
        <StatCard
          label="Ліди без покупок"
          value={String(summary.total - summary.withOrders)}
          hint={`${pct(summary.total - summary.withOrders, summary.total)}% бази`}
        />
      </div>

      {!filtered.length ? <div className="admin-empty">Клієнтів не знайдено.</div> : null}

      {filtered.length ? (
        <div className="admin-table-wrap hidden xl:block">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Клієнт</th>
                <th>Тип</th>
                <th>Телефон</th>
                <th>Місто</th>
                <th>Реєстрація</th>
                <th>Замовлень</th>
                <th>Витрачено</th>
                <th>Останнє</th>
                <th>♥</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id}>
                  <td>
                    <div className="font-medium">{row.name}</div>
                    <a
                      href={`mailto:${row.email}`}
                      className="text-xs break-all text-slate-400 hover:text-amber-300 hover:underline"
                    >
                      {row.email}
                    </a>
                    <div className="mt-1 flex flex-wrap gap-1">
                      <VerifiedBadge verified={row.emailVerified} />
                      {row.banned ? <Badge tone="red">заблок.</Badge> : null}
                    </div>
                  </td>
                  <td>
                    <ClientTypeChip clientType={row.clientType} />
                    {row.companyName ? (
                      <div className="mt-1 text-xs text-slate-400">{row.companyName}</div>
                    ) : null}
                  </td>
                  <td className="whitespace-nowrap">
                    {row.phone ? (
                      <a href={`tel:${row.phone}`} className="hover:text-amber-300 hover:underline">
                        {row.phone}
                      </a>
                    ) : (
                      <span className="admin-muted">—</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap">{row.city ?? <span className="admin-muted">—</span>}</td>
                  <td className="whitespace-nowrap">{formatDate(row.createdAt)}</td>
                  <td className="whitespace-nowrap">
                    <span className="font-medium">{row.paidOrdersCount}</span>
                    {row.ordersCount !== row.paidOrdersCount ? (
                      <span className="admin-muted"> / {row.ordersCount}</span>
                    ) : null}
                  </td>
                  <td className="whitespace-nowrap font-medium">{euro.format(row.totalSpent)}</td>
                  <td className="whitespace-nowrap">{formatDate(row.lastOrderAt)}</td>
                  <td className="whitespace-nowrap">
                    {row.wishlistCount || <span className="admin-muted">0</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {filtered.length ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:hidden">
          {filtered.map((row) => (
            <article key={row.id} className="admin-card admin-card-content">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate font-semibold">{row.name}</div>
                  <a
                    href={`mailto:${row.email}`}
                    className="text-xs break-all text-slate-400 hover:text-amber-300 hover:underline"
                  >
                    {row.email}
                  </a>
                </div>
                <ClientTypeChip clientType={row.clientType} />
              </div>

              <div className="mt-2 flex flex-wrap gap-1">
                <VerifiedBadge verified={row.emailVerified} />
                {row.banned ? <Badge tone="red">заблоковано</Badge> : null}
                {row.companyName ? <Badge tone="neutral">{row.companyName}</Badge> : null}
              </div>

              <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-slate-600/45 pt-3 text-sm">
                <Metric label="Витрачено" value={euro.format(row.totalSpent)} />
                <Metric
                  label="Замовлень"
                  value={
                    row.ordersCount !== row.paidOrdersCount
                      ? `${row.paidOrdersCount} / ${row.ordersCount}`
                      : String(row.paidOrdersCount)
                  }
                />
                <Metric label="Реєстрація" value={formatDate(row.createdAt)} />
                <Metric label="Останнє замовлення" value={formatDate(row.lastOrderAt)} />
                {row.phone ? <Metric label="Телефон" value={row.phone} /> : null}
                {row.city ? <Metric label="Місто" value={row.city} /> : null}
                {row.wishlistCount ? <Metric label="У вподобаннях" value={String(row.wishlistCount)} /> : null}
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="admin-card admin-card-content">
      <div className="text-xs font-medium tracking-wide uppercase admin-muted">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      {hint ? <div className="mt-0.5 text-xs admin-muted">{hint}</div> : null}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-xs admin-muted">{label}</div>
      <div className="truncate font-medium">{value}</div>
    </div>
  );
}

function Badge({ tone, children }: { tone: "green" | "red" | "amber" | "neutral"; children: React.ReactNode }) {
  const toneClass =
    tone === "green"
      ? "border-green-500/40 bg-green-500/15 text-green-300"
      : tone === "red"
        ? "border-red-500/40 bg-red-500/15 text-red-300"
        : tone === "amber"
          ? "border-yellow-500/40 bg-yellow-500/15 text-yellow-200"
          : "border-slate-500/40 bg-slate-500/15 text-slate-300";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[0.68rem] ${toneClass}`}
    >
      {children}
    </span>
  );
}

function VerifiedBadge({ verified }: { verified: boolean }) {
  return verified ? (
    <Badge tone="green">✓ email</Badge>
  ) : (
    <Badge tone="amber">email не підтв.</Badge>
  );
}

function ClientTypeChip({ clientType }: { clientType: AdminCustomerRow["clientType"] }) {
  return clientType === "azienda" ? (
    <Badge tone="amber">Компанія</Badge>
  ) : (
    <Badge tone="neutral">Приватний</Badge>
  );
}
