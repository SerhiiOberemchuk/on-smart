import { getCustomersOverview } from "@/app/actions/admin/customers/queries";
import Spiner from "@/components/Spiner";
import { headers } from "next/headers";
import { Suspense } from "react";
import CustomersClientComponent from "./CustomersClientComponent";

export default function CustomersPage() {
  return (
    <Suspense fallback={<Spiner />}>
      <GetDataComponent />
    </Suspense>
  );
}

async function GetDataComponent() {
  await headers();
  const { customers, summary, error } = await getCustomersOverview();

  if (error) {
    return <p className="admin-empty">Помилка завантаження даних</p>;
  }

  return <CustomersClientComponent customers={customers} summary={summary} />;
}
