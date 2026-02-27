"use client";

import { GetAllOrdersPaymentActionResponseTypes } from "@/app/actions/payments/payment-order-actions";
import Link from "next/link";
import { use } from "react";
import { URL_DASHBOARD } from "../dashboard-admin.types";

function formatCurrency(amount: string, currency: string) {
  return new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency,
  }).format(Number(amount));
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("uk-UA", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(date));
}

function getProviderLabel(provider: string) {
  switch (provider) {
    case "bonifico":
      return "Банківський переказ";
    case "paypal":
      return "PayPal";
    case "sumup":
      return "SumUp";
    case "klarna":
      return "Klarna";
    default:
      return provider || "-";
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "CREATED":
      return "Створено";
    case "SUCCESS":
    case "PAYED":
      return "Оплачено";
    case "FAILED":
      return "Помилка";
    case "CANCELED":
      return "Скасовано";
    case "PENDING_BONIFICO":
      return "Очікує банківський переказ";
    case "PENDING":
      return "Очікує";
    default:
      return status || "-";
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "SUCCESS":
    case "PAYED":
      return "bg-green-500/15 text-green-300 border-green-500/40";
    case "FAILED":
    case "CANCELED":
      return "bg-red-500/15 text-red-300 border-red-500/40";
    case "PENDING_BONIFICO":
      return "bg-yellow-500/15 text-yellow-200 border-yellow-500/40";
    case "CREATED":
    default:
      return "bg-blue-500/15 text-blue-300 border-blue-500/40";
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
      <section className="admin-page">
        <div className="admin-page-header">
          <div>
            <h1 className="admin-title">Оплати</h1>
          </div>
        </div>
        <div className="admin-empty">Оплат не знайдено.</div>
      </section>
    );
  }

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-title">Оплати</h1>
          <p className="admin-subtitle">Історія оплат замовлень</p>
        </div>
      </div>

      <div className="admin-table-wrap hidden xl:block">
        <table className="admin-table">
          <thead>
              <tr>
                <th>Замовлення</th>
                <th>Провайдер</th>
                <th>Сума</th>
                <th>Статус</th>
                <th>Дата</th>
                <th>ID провайдера</th>
              </tr>
            </thead>

          <tbody>
            {clientPayments.payments.map((payment) => (
              <tr key={payment.id}>
                <td className="font-medium">
                  <Link
                    href={
                      URL_DASHBOARD.DASHBOARD +
                      URL_DASHBOARD.SUB_DASHBOARD.ORDERS +
                      "/" +
                      payment.orderId
                    }
                    className="text-amber-300 hover:underline"
                  >
                    #{payment.orderNumber}
                  </Link>
                </td>

                <td>{getProviderLabel(payment.provider)}</td>
                <td>{formatCurrency(payment.amount, payment.currency)}</td>

                <td>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs ${getStatusColor(payment.status)}`}
                  >
                    {getStatusLabel(payment.status)}
                  </span>
                </td>

                <td className="text-slate-400">{formatDate(payment.createdAt)}</td>
                <td className="text-xs break-all text-slate-500">{payment.providerOrderId ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:hidden">
        {clientPayments.payments.map((payment) => (
          <article key={payment.id} className="admin-card admin-card-content">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Link
                  href={
                    URL_DASHBOARD.DASHBOARD + URL_DASHBOARD.SUB_DASHBOARD.ORDERS + "/" + payment.orderId
                  }
                  className="text-base font-semibold text-amber-300 hover:underline"
                >
                  #{payment.orderNumber}
                </Link>
                <p className="mt-1 text-xs text-slate-400">{getProviderLabel(payment.provider)}</p>
              </div>

              <span
                className={`rounded-full border px-3 py-1 text-xs ${getStatusColor(payment.status)}`}
              >
                {getStatusLabel(payment.status)}
              </span>
            </div>

                <div className="mt-3 text-sm">
              <div>{formatCurrency(payment.amount, payment.currency)}</div>
              <div className="mt-1 text-xs text-slate-400">{formatDate(payment.createdAt)}</div>
              <div className="mt-1 text-xs break-all text-slate-500">
                ID провайдера: {payment.providerOrderId ?? "-"}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
