import {
  type AnalyticsPeriod,
  getAdminAnalyticsOverview,
} from "@/app/actions/admin/analytics/queries";
import Spiner from "@/components/Spiner";
import { headers } from "next/headers";
import { Suspense } from "react";
import AnalyticsPageClient from "./AnalyticsPageClient";

function isAnalyticsPeriod(value: unknown): value is AnalyticsPeriod {
  return value === "7d" || value === "30d" || value === "90d" || value === "365d" || value === "all";
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period: rawPeriod } = await searchParams;
  const period: AnalyticsPeriod = isAnalyticsPeriod(rawPeriod) ? rawPeriod : "30d";

  return (
    <Suspense key={period} fallback={<Spiner />}>
      <GetDataComponent period={period} />
    </Suspense>
  );
}

async function GetDataComponent({ period }: { period: AnalyticsPeriod }) {
  await headers();
  const overview = await getAdminAnalyticsOverview(period);

  if (overview.error) {
    return <p className="admin-empty">Помилка завантаження даних</p>;
  }

  return <AnalyticsPageClient overview={overview} />;
}
