import {
  getAllOrdersPaymentAction,
  type GetAllOrdersPaymentActionResponseTypes,
} from "@/app/actions/payments/payment-order-actions";
import Spiner from "@/components/Spiner";
import { Suspense } from "react";
import PaymentClientComponent from "./PaymentsClientComponent";

export default function PagePayments() {
  const paymentsPromise: GetAllOrdersPaymentActionResponseTypes = getAllOrdersPaymentAction();

  return (
    <Suspense fallback={<Spiner />}>
      <PaymentClientComponent paymentsPromise={paymentsPromise} />
    </Suspense>
  );
}
