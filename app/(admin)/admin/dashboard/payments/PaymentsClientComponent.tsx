"use client";

import { GetAllOrdersPaymentActionResponseTypes } from "@/app/actions/payments/payment-order-actions";
import Link from "next/link";
import { use } from "react";
import { URL_DASHBOARD } from "../dashboard-admin.types";

function formatCurrency(amount: string, currency: string) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency,
  }).format(Number(amount));
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(date));
}

function getStatusColor(status: string) {
  switch (status) {
    case "SUCCESS":
    case "PAYED":
      return "bg-green-500/15 text-green-400 border-green-500/40";
    case "FAILED":
    case "CANCELED":
      return "bg-red-500/15 text-red-400 border-red-500/40";
    case "PENDING_BONIFICO":
      return "bg-yellow-500/15 text-yellow-400 border-yellow-500/40";
    case "CREATED":
    default:
      return "bg-blue-500/15 text-blue-400 border-blue-500/40";
  }
}

export default function PaymentClientComponent({
  payments,
}: {
  payments: GetAllOrdersPaymentActionResponseTypes;
}) {
  const clientPayments = use(payments);

  if (!clientPayments.payments?.length) {
    return (
      <section className="p-6">
        <h1 className="mb-4 text-xl font-semibold text-white">Pagamenti</h1>
        <div className="text-gray-400">Nessun pagamento trovato</div>
      </section>
    );
  }

  return (
    <section className="p-6 text-white">
      <h1 className="mb-6 text-2xl font-semibold">Pagamenti</h1>

      <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-900">
        <table className="w-full text-sm">
          <thead className="bg-neutral-800 text-xs tracking-wider text-neutral-400 uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Ordine</th>
              <th className="px-4 py-3 text-left">Provider</th>
              <th className="px-4 py-3 text-left">Importo</th>
              <th className="px-4 py-3 text-left">Stato</th>
              <th className="px-4 py-3 text-left">Data</th>
              <th className="px-4 py-3 text-left">Provider ID</th>
            </tr>
          </thead>

          <tbody>
            {clientPayments.payments.map((payment) => (
              <tr
                key={payment.id}
                className="border-t border-neutral-800 transition-colors hover:bg-neutral-800/60"
              >
                <td className="px-4 py-3 font-medium">
                  <Link
                    href={
                      URL_DASHBOARD.DASHBOARD +
                      URL_DASHBOARD.SUB_DASHBOARD.ORDERS +
                      "/" +
                      payment.orderId
                    }
                  >
                    #{payment.orderNumber}
                  </Link>{" "}
                </td>

                <td className="px-4 py-3 capitalize">{payment.provider}</td>

                <td className="px-4 py-3">{formatCurrency(payment.amount, payment.currency)}</td>

                <td className="px-4 py-3">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs ${getStatusColor(
                      payment.status,
                    )}`}
                  >
                    {payment.status}
                  </span>
                </td>

                <td className="px-4 py-3 text-neutral-400">{formatDate(payment.createdAt)}</td>

                <td className="px-4 py-3 text-xs break-all text-neutral-500">
                  {payment.providerOrderId ?? "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
