import { getAllOrdersPaymentAction } from "@/app/actions/payments/payment-order-actions";
import Spiner from "@/components/Spiner";
import { Suspense } from "react";
import PaymentClientComponent from "./PaymentsClientComponent";

export default function Page() {
  const payments = getAllOrdersPaymentAction();
  return (
    <Suspense fallback={<Spiner />}>
      <PaymentClientComponent payments={payments} />
    </Suspense>
  );
}
