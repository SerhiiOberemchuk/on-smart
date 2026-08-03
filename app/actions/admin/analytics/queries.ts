"use server";

import { db } from "@/db/db";
import { orderItemsSchema, ordersSchema, paymentsSchema } from "@/db/schemas/orders.schema";
import { productsSchema } from "@/db/schemas/product.schema";
import { PAID_ORDER_STATUS_LIST, type OrderStatusTypes } from "@/types/orders.types";
import { PAID_PAYMENT_STATUS_LIST, type PaymentStatusTypes } from "@/types/payments.types";
import { withRetrySelective } from "@/utils/with-retry-selective";
import { gte } from "drizzle-orm";
import { requireAdminSession } from "../_shared/require-admin-session";

const ANALYTICS_READ_RETRY_OPTIONS = { tries: 10, delayMs: 800, linearBackoffMs: 250 } as const;

// Same "what counts as revenue" rules as the customers overview — kept in sync
// with app/actions/admin/customers/queries.ts on purpose.
const PAID_ORDER_STATUSES = new Set<OrderStatusTypes>(PAID_ORDER_STATUS_LIST);
const PAID_PAYMENT_STATUSES = new Set<PaymentStatusTypes>(PAID_PAYMENT_STATUS_LIST);

const ROME_TZ = "Europe/Rome";
const dayKeyFmt = new Intl.DateTimeFormat("sv-SE", { timeZone: ROME_TZ }); // "YYYY-MM-DD"
const dayLabelFmt = new Intl.DateTimeFormat("uk-UA", { day: "numeric", month: "numeric", timeZone: ROME_TZ });
const monthLabelFmt = new Intl.DateTimeFormat("uk-UA", { month: "2-digit", year: "2-digit", timeZone: ROME_TZ });

export type AnalyticsPeriod = "7d" | "30d" | "90d" | "365d" | "all";

const PERIOD_DAYS: Record<Exclude<AnalyticsPeriod, "all">, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "365d": 365,
};

export type AnalyticsTopProductRow = {
  productId: string | null;
  title: string;
  imgSrc: string | null;
  units: number;
  revenue: number;
  isBundle: boolean;
  isHidden: boolean;
};

export type AnalyticsNameRow = { name: string; revenue: number; units: number; ordersCount: number };

export type AdminAnalyticsOverview = {
  period: AnalyticsPeriod;
  granularity: "day" | "month";
  kpi: { revenue: number; ordersCount: number; paidOrdersCount: number; aov: number; unitsSold: number };
  revenueSeries: { bucket: string; label: string; revenue: number; orders: number }[];
  topByUnits: AnalyticsTopProductRow[];
  topByRevenue: AnalyticsTopProductRow[];
  byBrand: AnalyticsNameRow[];
  byCategory: AnalyticsNameRow[];
  zeroSales: {
    id: string;
    nameFull: string;
    brand_slug: string;
    category_slug: string;
    inStock: number;
    isHidden: boolean;
    price: string;
  }[];
  lowStock: {
    id: string;
    nameFull: string;
    inStock: number;
    isHidden: boolean;
    isOnOrder: boolean;
    parent_product_id: string | null;
  }[];
  error: unknown | null;
};

// --- calendar-day / calendar-month bucket helpers -------------------------
// Bucket keys are plain "YYYY-MM-DD" / "YYYY-MM" strings (already resolved to
// Europe/Rome). We iterate them via UTC-midnight Date objects so day/month
// math never drifts across DST boundaries, then re-format with the same
// Rome-timezone formatters (always +1/+2h from UTC midnight, never rolls the
// calendar date backwards) to get zero-fill labels — all on the server, so
// the client never does date math (hydration safety).

function dayKeyToUtcDate(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function utcDateToDayKey(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function monthKeyToUtcDate(key: string): Date {
  const [y, m] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1));
}

function utcDateToMonthKey(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function generateDayBuckets(fromKey: string, toKey: string): string[] {
  const buckets: string[] = [];
  let cursor = dayKeyToUtcDate(fromKey);
  const end = dayKeyToUtcDate(toKey);
  while (cursor <= end) {
    buckets.push(utcDateToDayKey(cursor));
    cursor = new Date(cursor.getTime() + 24 * 60 * 60 * 1000);
  }
  return buckets;
}

function generateMonthBuckets(fromKey: string, toKey: string): string[] {
  const buckets: string[] = [];
  let cursor = monthKeyToUtcDate(fromKey);
  const end = monthKeyToUtcDate(toKey);
  while (cursor <= end) {
    buckets.push(utcDateToMonthKey(cursor));
    cursor = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 1));
  }
  return buckets;
}

/**
 * One-shot analytics overview (revenue trend, top products, brand/category
 * breakdown, zero-sales & low-stock flags) for the given period. Mirrors the
 * fan-out + JS-aggregation architecture of getCustomersOverview: a single
 * Promise.all read, paid/revenue resolved from payments first and order
 * status as a fallback, every decimal coerced with Number() since mysql2
 * returns strings. All date math (bucketing, labels) happens here so the
 * client only renders — no hydration-unsafe date work in the browser.
 */
export async function getAdminAnalyticsOverview(period: AnalyticsPeriod): Promise<AdminAnalyticsOverview> {
  await requireAdminSession();

  const granularity: "day" | "month" = period === "365d" || period === "all" ? "month" : "day";

  const emptyOverview: AdminAnalyticsOverview = {
    period,
    granularity,
    kpi: { revenue: 0, ordersCount: 0, paidOrdersCount: 0, aov: 0, unitsSold: 0 },
    revenueSeries: [],
    topByUnits: [],
    topByRevenue: [],
    byBrand: [],
    byCategory: [],
    zeroSales: [],
    lowStock: [],
    error: null,
  };

  try {
    const from = period === "all" ? null : new Date(Date.now() - PERIOD_DAYS[period] * 24 * 60 * 60 * 1000);

    const [orders, allOrderItems, payments, products] = await withRetrySelective(
      () =>
        Promise.all([
          db
            .select({
              id: ordersSchema.id,
              orderStatus: ordersSchema.orderStatus,
              deliveryMethod: ordersSchema.deliveryMethod,
              deliveryPrice: ordersSchema.deliveryPrice,
              createdAt: ordersSchema.createdAt,
            })
            .from(ordersSchema)
            .where(from ? gte(ordersSchema.createdAt, from) : undefined),
          db
            .select({
              orderId: orderItemsSchema.orderId,
              productId: orderItemsSchema.productId,
              quantity: orderItemsSchema.quantity,
              unitPrice: orderItemsSchema.unitPrice,
              title: orderItemsSchema.title,
              brandName: orderItemsSchema.brandName,
              categoryName: orderItemsSchema.categoryName,
            })
            .from(orderItemsSchema),
          db
            .select({
              orderId: paymentsSchema.orderId,
              status: paymentsSchema.status,
              amount: paymentsSchema.amount,
            })
            .from(paymentsSchema),
          db
            .select({
              id: productsSchema.id,
              nameFull: productsSchema.nameFull,
              imgSrc: productsSchema.imgSrc,
              parent_product_id: productsSchema.parent_product_id,
              productType: productsSchema.productType,
              inStock: productsSchema.inStock,
              isHidden: productsSchema.isHidden,
              isOnOrder: productsSchema.isOnOrder,
              brand_slug: productsSchema.brand_slug,
              category_slug: productsSchema.category_slug,
              price: productsSchema.price,
              hasVariants: productsSchema.hasVariants,
            })
            .from(productsSchema),
        ]),
      ANALYTICS_READ_RETRY_OPTIONS,
    );

    const orderIds = new Set(orders.map((order) => order.id));
    const orderItems = allOrderItems.filter((item) => orderIds.has(item.orderId));

    const productById = new Map(products.map((product) => [product.id, product]));

    // Best captured amount per order (an order may have several payment attempts).
    const paidAmountByOrder = new Map<string, number>();
    for (const payment of payments) {
      if (!PAID_PAYMENT_STATUSES.has(payment.status)) continue;
      const amount = Number(payment.amount) || 0;
      paidAmountByOrder.set(payment.orderId, Math.max(paidAmountByOrder.get(payment.orderId) ?? 0, amount));
    }

    const itemsSubtotalByOrder = new Map<string, number>();
    for (const item of orderItems) {
      const price = Number(item.unitPrice) || 0;
      const quantity = Number(item.quantity) || 0;
      itemsSubtotalByOrder.set(
        item.orderId,
        (itemsSubtotalByOrder.get(item.orderId) ?? 0) + price * quantity,
      );
    }

    const revenueOrderIds = new Set<string>();
    const orderRevenueById = new Map<string, number>();
    for (const order of orders) {
      const paidAmount = paidAmountByOrder.get(order.id);
      const isRevenue = paidAmount !== undefined || PAID_ORDER_STATUSES.has(order.orderStatus);
      if (!isRevenue) continue;

      const delivery = order.deliveryMethod === "RITIRO_NEGOZIO" ? 0 : Number(order.deliveryPrice) || 0;
      const amount = paidAmount ?? (itemsSubtotalByOrder.get(order.id) ?? 0) + delivery;
      revenueOrderIds.add(order.id);
      orderRevenueById.set(order.id, amount);
    }

    const revenueItems = orderItems.filter((item) => revenueOrderIds.has(item.orderId));

    // --- KPI ----------------------------------------------------------
    const revenue = orders.reduce(
      (sum, order) => sum + (revenueOrderIds.has(order.id) ? (orderRevenueById.get(order.id) ?? 0) : 0),
      0,
    );
    const ordersCount = orders.length;
    const paidOrdersCount = revenueOrderIds.size;
    const aov = paidOrdersCount ? revenue / paidOrdersCount : 0;
    const unitsSold = revenueItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

    // --- revenue series (zero-filled, server-computed labels) ---------
    const bucketKeyForOrder = (createdAt: Date) => {
      const dayKey = dayKeyFmt.format(createdAt);
      return granularity === "day" ? dayKey : dayKey.slice(0, 7);
    };

    const revenueByBucket = new Map<string, number>();
    const ordersByBucket = new Map<string, number>();
    for (const order of orders) {
      if (!revenueOrderIds.has(order.id)) continue;
      const key = bucketKeyForOrder(order.createdAt);
      revenueByBucket.set(key, (revenueByBucket.get(key) ?? 0) + (orderRevenueById.get(order.id) ?? 0));
      ordersByBucket.set(key, (ordersByBucket.get(key) ?? 0) + 1);
    }

    let seriesFrom: Date;
    if (from) {
      seriesFrom = from;
    } else if (orders.length > 0) {
      seriesFrom = new Date(Math.min(...orders.map((order) => order.createdAt.getTime())));
    } else {
      seriesFrom = new Date();
    }

    const todayDayKey = dayKeyFmt.format(new Date());
    const seriesFromDayKey = dayKeyFmt.format(seriesFrom);

    const bucketKeys =
      granularity === "day"
        ? generateDayBuckets(seriesFromDayKey, todayDayKey)
        : generateMonthBuckets(seriesFromDayKey.slice(0, 7), todayDayKey.slice(0, 7));

    const revenueSeries = bucketKeys.map((key) => ({
      bucket: key,
      label:
        granularity === "day"
          ? dayLabelFmt.format(dayKeyToUtcDate(key))
          : monthLabelFmt.format(monthKeyToUtcDate(key)),
      revenue: revenueByBucket.get(key) ?? 0,
      orders: ordersByBucket.get(key) ?? 0,
    }));

    // --- top products (by units / by revenue) --------------------------
    type TopAcc = {
      productId: string | null;
      title: string;
      imgSrc: string | null;
      units: number;
      revenue: number;
      isBundle: boolean;
      isHidden: boolean;
    };
    const topAcc = new Map<string, TopAcc>();

    for (const item of revenueItems) {
      const product = item.productId ? productById.get(item.productId) : undefined;
      const effectiveId = product ? (product.parent_product_id ?? product.id) : null;
      const key = effectiveId ?? `title:${item.title}`;
      const effectiveProduct = effectiveId ? productById.get(effectiveId) : undefined;

      const quantity = Number(item.quantity) || 0;
      const lineRevenue = (Number(item.unitPrice) || 0) * quantity;

      let acc = topAcc.get(key);
      if (!acc) {
        acc = {
          productId: effectiveId,
          title: effectiveProduct?.nameFull ?? item.title,
          imgSrc: effectiveProduct?.imgSrc ?? null,
          units: 0,
          revenue: 0,
          isBundle: effectiveProduct?.productType === "bundle",
          isHidden: effectiveProduct?.isHidden ?? false,
        };
        topAcc.set(key, acc);
      }
      acc.units += quantity;
      acc.revenue += lineRevenue;
    }

    const topAccValues = Array.from(topAcc.values());
    const topByUnits = [...topAccValues].sort((a, b) => b.units - a.units).slice(0, 10);
    const topByRevenue = [...topAccValues].sort((a, b) => b.revenue - a.revenue).slice(0, 10);

    // --- by brand / by category -----------------------------------------
    function aggregateByName(keyFn: (item: (typeof revenueItems)[number]) => string): AnalyticsNameRow[] {
      const map = new Map<string, { revenue: number; units: number; orderIds: Set<string> }>();
      for (const item of revenueItems) {
        const name = keyFn(item);
        const entry = map.get(name) ?? { revenue: 0, units: 0, orderIds: new Set<string>() };
        const quantity = Number(item.quantity) || 0;
        entry.revenue += (Number(item.unitPrice) || 0) * quantity;
        entry.units += quantity;
        entry.orderIds.add(item.orderId);
        map.set(name, entry);
      }
      return Array.from(map.entries())
        .map(([name, value]) => ({
          name,
          revenue: value.revenue,
          units: value.units,
          ordersCount: value.orderIds.size,
        }))
        .sort((a, b) => b.revenue - a.revenue);
    }

    const byBrand = aggregateByName((item) => item.brandName ?? "Без бренду");
    const byCategory = aggregateByName((item) => item.categoryName ?? "Без категорії");

    // --- zero sales / low stock -----------------------------------------
    const soldUnitsByProductId = new Map<string, number>();
    for (const acc of topAccValues) {
      if (acc.productId) soldUnitsByProductId.set(acc.productId, acc.units);
    }

    const zeroSales = products
      .filter((product) => product.parent_product_id === null && product.productType === "product")
      .filter((product) => (soldUnitsByProductId.get(product.id) ?? 0) === 0)
      .sort((a, b) => b.inStock - a.inStock)
      .slice(0, 50)
      .map((product) => ({
        id: product.id,
        nameFull: product.nameFull,
        brand_slug: product.brand_slug,
        category_slug: product.category_slug,
        inStock: product.inStock,
        isHidden: product.isHidden,
        price: product.price,
      }));

    const lowStock = products
      .filter((product) => product.productType !== "bundle")
      .filter((product) => !(product.parent_product_id === null && product.hasVariants))
      .filter((product) => product.inStock <= 3)
      .sort((a, b) => a.inStock - b.inStock)
      .slice(0, 50)
      .map((product) => ({
        id: product.id,
        nameFull: product.nameFull,
        inStock: product.inStock,
        isHidden: product.isHidden,
        isOnOrder: product.isOnOrder,
        parent_product_id: product.parent_product_id,
      }));

    return {
      period,
      granularity,
      kpi: { revenue, ordersCount, paidOrdersCount, aov, unitsSold },
      revenueSeries,
      topByUnits,
      topByRevenue,
      byBrand,
      byCategory,
      zeroSales,
      lowStock,
      error: null,
    };
  } catch (error) {
    console.error("[getAdminAnalyticsOverview]", error);
    return { ...emptyOverview, error };
  }
}
