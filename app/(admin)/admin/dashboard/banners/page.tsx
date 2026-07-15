import { headers } from "next/headers";
import { Suspense } from "react";

import { getSiteBannerAdmin } from "@/app/actions/admin/site-banner/queries";
import Spiner from "@/components/Spiner";

import BannerPageClient from "./BannerPageClient";

export default function AdminDashboardBannersPage() {
  return (
    <Suspense fallback={<Spiner />}>
      <GetDataComponent />
    </Suspense>
  );
}

async function GetDataComponent() {
  await headers();
  const res = await getSiteBannerAdmin();

  if (!res.success) {
    return <p className="admin-empty">Помилка завантаження даних</p>;
  }

  return <BannerPageClient initialData={res.data} />;
}
