import { getAllOrdersPaymentAction } from "@/app/actions/payments/payment-order-actions";
import Spiner from "@/components/Spiner";
import { headers } from "next/headers";
import { Suspense } from "react";
import PaymentClientComponent from "./PaymentsClientComponent";

export default function PagePayments() {
  return (
    <Suspense fallback={<Spiner />}>
      <GetDataComponent />
    </Suspense>
  );
}

async function GetDataComponent() {
  await headers();
  const payments = await getAllOrdersPaymentAction();

  if (payments.error) {
    return <p className="admin-empty">Помилка завантаження даних</p>;
  }

  return <PaymentClientComponent payments={payments} />;
}
