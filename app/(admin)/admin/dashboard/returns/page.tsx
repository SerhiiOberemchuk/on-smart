import { getAllWithdrawalRequests } from "@/app/actions/admin/withdrawals/get-all-withdrawals";
import Spiner from "@/components/Spiner";
import { headers } from "next/headers";
import { Suspense } from "react";
import ReturnsClientComponent from "./ReturnsClientComponent";

export default function ReturnsPage() {
  return (
    <Suspense fallback={<Spiner />}>
      <GetDataComponent />
    </Suspense>
  );
}

async function GetDataComponent() {
  await headers();
  const { withdrawals, error } = await getAllWithdrawalRequests();

  if (error) {
    return <p className="admin-empty">Помилка завантаження даних</p>;
  }

  return <ReturnsClientComponent withdrawals={withdrawals} />;
}
