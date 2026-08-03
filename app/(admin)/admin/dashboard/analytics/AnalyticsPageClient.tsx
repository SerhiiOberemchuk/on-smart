"use client";

import type {
  AdminAnalyticsOverview,
  AnalyticsNameRow,
  AnalyticsPeriod,
  AnalyticsTopProductRow,
} from "@/app/actions/admin/analytics/queries";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";
import AdminBadge from "../AdminBadge";
import AdminStatCard from "../AdminStatCard";
import { NameBarChart, RevenueLineChart } from "./AnalyticsCharts";

const euro = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" });
const number = new Intl.NumberFormat("uk-UA");

const UNITS_COLOR = "#199e70";
const AMBER_COLOR = "#c98500";

const PERIOD_OPTIONS: { value: AnalyticsPeriod; label: string }[] = [
  { value: "7d", label: "7 днів" },
  { value: "30d", label: "30 днів" },
  { value: "90d", label: "90 днів" },
  { value: "365d", label: "Рік" },
  { value: "all", label: "Весь час" },
];

const PERIOD_LABEL: Record<AnalyticsPeriod, string> = {
  "7d": "7 днів",
  "30d": "30 днів",
  "90d": "90 днів",
  "365d": "Рік",
  all: "Весь час",
};

function topEightPlusOthers(rows: AnalyticsNameRow[]): { name: string; value: number }[] {
  const top = rows.slice(0, 8).map((row) => ({ name: row.name, value: row.revenue }));
  const rest = rows.slice(8);
  if (rest.length > 0) {
    const othersRevenue = rest.reduce((sum, row) => sum + row.revenue, 0);
    top.push({ name: "Інші", value: othersRevenue });
  }
  return top;
}

export default function AnalyticsPageClient({ overview }: { overview: AdminAnalyticsOverview }) {
  const router = useRouter();
  const pathname = usePathname();

  const brandChartData = useMemo(() => topEightPlusOthers(overview.byBrand), [overview.byBrand]);
  const categoryChartData = useMemo(() => topEightPlusOthers(overview.byCategory), [overview.byCategory]);

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div className="min-w-0">
          <h1 className="admin-title">Аналітика</h1>
          <p className="admin-subtitle">Продажі, товари, бренди та категорії</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {PERIOD_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => router.push(`${pathname}?period=${option.value}`)}
              className={
                option.value === overview.period ? "admin-btn-primary" : "admin-btn-secondary"
              }
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <AdminStatCard
          label="Виручка"
          value={euro.format(overview.kpi.revenue)}
          hint={`${number.format(overview.kpi.paidOrdersCount)} оплачених`}
        />
        <AdminStatCard
          label="Замовлень"
          value={number.format(overview.kpi.ordersCount)}
          hint={`${number.format(overview.kpi.paidOrdersCount)} оплачених`}
        />
        <AdminStatCard label="Середній чек" value={euro.format(overview.kpi.aov)} />
        <AdminStatCard label="Продано одиниць" value={number.format(overview.kpi.unitsSold)} />
        <AdminStatCard
          label="Період"
          value={PERIOD_LABEL[overview.period]}
          hint={overview.granularity === "day" ? "по днях" : "по місяцях"}
        />
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">Динаміка виручки</h2>
        </div>
        <div className="admin-card-content">
          {overview.revenueSeries.length ? (
            <RevenueLineChart data={overview.revenueSeries} />
          ) : (
            <div className="admin-empty">Немає даних за період</div>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <TopProductsCard title="Топ товарів за кількістю" rows={overview.topByUnits} metric="units" />
        <TopProductsCard title="Топ товарів за виручкою" rows={overview.topByRevenue} metric="revenue" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <NameBreakdownCard title="По брендах" rows={overview.byBrand} chartData={brandChartData} color={UNITS_COLOR} />
        <NameBreakdownCard
          title="По категоріях"
          rows={overview.byCategory}
          chartData={categoryChartData}
          color={AMBER_COLOR}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ZeroSalesCard rows={overview.zeroSales} />
        <LowStockCard rows={overview.lowStock} />
      </div>
    </section>
  );
}

function TopProductsCard({
  title,
  rows,
  metric,
}: {
  title: string;
  rows: AnalyticsTopProductRow[];
  metric: "units" | "revenue";
}) {
  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h2 className="admin-card-title">{title}</h2>
      </div>
      <div className="admin-card-content">
        {!rows.length ? (
          <div className="admin-empty">Немає даних за період</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>№</th>
                  <th>Фото</th>
                  <th>Назва</th>
                  <th>К-сть</th>
                  <th>Виручка</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={row.productId ?? `title:${row.title}`}>
                    <td className="whitespace-nowrap">{index + 1}</td>
                    <td>
                      {row.imgSrc ? (
                        <Image
                          src={row.imgSrc}
                          alt={row.title}
                          width={44}
                          height={44}
                          className="h-11 w-11 rounded-md border border-slate-600/70 object-cover"
                        />
                      ) : (
                        <div className="h-11 w-11 rounded-md border border-slate-600/70 bg-[#181a1f]" />
                      )}
                    </td>
                    <td className="max-w-64">
                      {row.productId ? (
                        <Link
                          href={`/admin/dashboard/products/${row.productId}`}
                          className="admin-link-action font-medium hover:underline"
                        >
                          {row.title}
                        </Link>
                      ) : (
                        <span className="font-medium">{row.title}</span>
                      )}
                      <div className="mt-1 flex flex-wrap gap-1">
                        {row.isHidden ? <AdminBadge tone="amber">приховано</AdminBadge> : null}
                        {row.isBundle ? <AdminBadge tone="neutral">комплект</AdminBadge> : null}
                      </div>
                    </td>
                    <td className={`whitespace-nowrap ${metric === "units" ? "font-medium" : ""}`}>
                      {number.format(row.units)}
                    </td>
                    <td className={`whitespace-nowrap ${metric === "revenue" ? "font-medium" : ""}`}>
                      {euro.format(row.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function NameBreakdownCard({
  title,
  rows,
  chartData,
  color,
}: {
  title: string;
  rows: AnalyticsNameRow[];
  chartData: { name: string; value: number }[];
  color: string;
}) {
  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h2 className="admin-card-title">{title}</h2>
      </div>
      <div className="admin-card-content">
        {!rows.length ? (
          <div className="admin-empty">Немає даних за період</div>
        ) : (
          <>
            <NameBarChart data={chartData} color={color} valueFormatter={(value) => euro.format(value)} />
            <div className="admin-table-wrap mt-4">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Назва</th>
                    <th>Замовлень</th>
                    <th>К-сть</th>
                    <th>Виручка</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.name}>
                      <td className="font-medium">{row.name}</td>
                      <td className="whitespace-nowrap">{number.format(row.ordersCount)}</td>
                      <td className="whitespace-nowrap">{number.format(row.units)}</td>
                      <td className="whitespace-nowrap font-medium">{euro.format(row.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="admin-muted mt-2 text-xs">Суми по товарних позиціях, без доставки</p>
          </>
        )}
      </div>
    </div>
  );
}

function ZeroSalesCard({ rows }: { rows: AdminAnalyticsOverview["zeroSales"] }) {
  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h2 className="admin-card-title">Без продажів за період</h2>
      </div>
      <div className="admin-card-content">
        {!rows.length ? (
          <div className="admin-empty">Немає товарів без продажів</div>
        ) : (
          <>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Назва</th>
                    <th>Бренд</th>
                    <th>Категорія</th>
                    <th>Склад</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <Link
                          href={`/admin/dashboard/products/${row.id}`}
                          className="admin-link-action font-medium hover:underline"
                        >
                          {row.nameFull}
                        </Link>
                        {row.isHidden ? (
                          <div className="mt-1">
                            <AdminBadge tone="amber">приховано</AdminBadge>
                          </div>
                        ) : null}
                      </td>
                      <td className="whitespace-nowrap">{row.brand_slug}</td>
                      <td className="whitespace-nowrap">{row.category_slug}</td>
                      <td className="whitespace-nowrap">{number.format(row.inStock)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {rows.length === 50 ? (
              <p className="admin-muted mt-2 text-xs">Показано перші 50</p>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

function LowStockCard({ rows }: { rows: AdminAnalyticsOverview["lowStock"] }) {
  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h2 className="admin-card-title">Закінчуються на складі</h2>
      </div>
      <div className="admin-card-content">
        {!rows.length ? (
          <div className="admin-empty">Немає товарів із низьким залишком</div>
        ) : (
          <>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Назва</th>
                    <th>Залишок</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <Link
                          href={`/admin/dashboard/products/${row.id}`}
                          className="admin-link-action font-medium hover:underline"
                        >
                          {row.nameFull}
                        </Link>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {row.isHidden ? <AdminBadge tone="amber">приховано</AdminBadge> : null}
                          {row.isOnOrder ? <AdminBadge tone="blue">під замовлення</AdminBadge> : null}
                        </div>
                      </td>
                      <td className="whitespace-nowrap font-medium">{number.format(row.inStock)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {rows.length === 50 ? (
              <p className="admin-muted mt-2 text-xs">Показано перші 50</p>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
