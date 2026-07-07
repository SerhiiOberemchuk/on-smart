"use client";

import { updateWithdrawalStatus } from "@/app/actions/admin/withdrawals/update-withdrawal-status";
import type { WithdrawalRequestType } from "@/db/schemas/withdrawal-requests.schema";
import {
  WITHDRAWAL_STATUS_LABEL,
  WITHDRAWAL_STATUS_LIST,
  type WithdrawalStatusType,
} from "@/types/withdrawal.types";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { toast } from "react-toastify";
import { URL_DASHBOARD } from "../dashboard-admin.types";

function formatDateTime(value: Date | null | undefined) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("uk-UA", {
    dateStyle: "short",
    timeStyle: "medium",
    timeZone: "Europe/Rome",
  }).format(new Date(value));
}

function getStatusBadgeClass(status: WithdrawalStatusType) {
  switch (status) {
    case "ACCEPTED":
      return "border-green-500/40 bg-green-500/15 text-green-300";
    case "PROCESSING":
      return "border-blue-500/40 bg-blue-500/15 text-blue-300";
    case "REJECTED":
      return "border-red-500/40 bg-red-500/15 text-red-300";
    case "RECEIVED":
    default:
      return "border-yellow-500/40 bg-yellow-500/15 text-yellow-200";
  }
}

function orderHref(orderId: string) {
  return URL_DASHBOARD.DASHBOARD + URL_DASHBOARD.SUB_DASHBOARD.ORDERS + "/" + orderId;
}

export default function ReturnsClientComponent({
  withdrawals,
}: {
  withdrawals: WithdrawalRequestType[];
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<WithdrawalStatusType | "ALL">("ALL");

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return withdrawals.filter((request) => {
      if (status !== "ALL" && request.status !== status) return false;
      if (!normalizedQuery) return true;
      return [request.orderNumber, request.email, request.nome, request.message]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [withdrawals, query, status]);

  const total = withdrawals.length;
  const filteredCount = filtered.length;

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div className="min-w-0">
          <h1 className="admin-title">Відмови (recesso)</h1>
          <p className="admin-subtitle">
            Всього: {total}
            {filteredCount !== total ? ` • Відфільтровано: ${filteredCount}` : ""}
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Пошук за номером, email, іменем..."
            className="admin-input w-full min-w-0 sm:w-[320px]"
          />
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as WithdrawalStatusType | "ALL")}
            className="admin-select w-full min-w-0 sm:w-[220px]"
          >
            <option value="ALL">Усі статуси</option>
            {WITHDRAWAL_STATUS_LIST.map((option) => (
              <option key={option} value={option}>
                {WITHDRAWAL_STATUS_LABEL[option]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!filteredCount ? <div className="admin-empty">Запитів на відмову не знайдено.</div> : null}

      {filteredCount ? (
        <div className="admin-table-wrap hidden xl:block">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Подано</th>
                <th>Замовлення</th>
                <th>Клієнт</th>
                <th>Примітка</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((request) => (
                <tr key={request.id}>
                  <td className="whitespace-nowrap">{formatDateTime(request.createdAt)}</td>
                  <td>
                    {request.orderId ? (
                      <Link
                        href={orderHref(request.orderId)}
                        className="font-semibold text-amber-300 hover:underline"
                      >
                        {request.orderNumber}
                      </Link>
                    ) : (
                      <div>
                        <div className="font-semibold">{request.orderNumber}</div>
                        <div className="text-xs text-amber-300">⚠️ не верифіковано</div>
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="font-medium">{request.nome}</div>
                    <div className="text-xs break-all text-slate-400">{request.email}</div>
                  </td>
                  <td className="max-w-[260px] text-xs whitespace-pre-wrap text-slate-300">
                    {request.message || "-"}
                  </td>
                  <td>
                    <StatusControl request={request} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {filteredCount ? (
        <div className="grid grid-cols-1 gap-3 xl:hidden">
          {filtered.map((request) => (
            <article key={request.id} className="admin-card admin-card-content">
              <div className="flex items-start justify-between gap-3">
                <div>
                  {request.orderId ? (
                    <Link
                      href={orderHref(request.orderId)}
                      className="text-base font-semibold text-amber-300 hover:underline"
                    >
                      #{request.orderNumber}
                    </Link>
                  ) : (
                    <div className="text-base font-semibold">#{request.orderNumber}</div>
                  )}
                  <div className="mt-1 text-xs text-slate-500">{formatDateTime(request.createdAt)}</div>
                </div>
                <span
                  className={`inline-flex shrink-0 items-center rounded-full border px-3 py-1 text-xs ${getStatusBadgeClass(
                    request.status,
                  )}`}
                >
                  {WITHDRAWAL_STATUS_LABEL[request.status]}
                </span>
              </div>

              <div className="mt-3 space-y-1 text-sm">
                <div className="font-medium">{request.nome}</div>
                <div className="text-xs break-all text-slate-400">{request.email}</div>
                {!request.orderId ? (
                  <div className="text-xs text-amber-300">⚠️ замовлення не верифіковано</div>
                ) : null}
              </div>

              {request.message ? (
                <div className="mt-3 border-t border-slate-600/45 pt-3">
                  <div className="text-xs text-slate-400">Примітка</div>
                  <div className="text-sm whitespace-pre-wrap">{request.message}</div>
                </div>
              ) : null}

              <div className="mt-3 border-t border-slate-600/45 pt-3">
                <StatusControl request={request} />
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function StatusControl({ request }: { request: WithdrawalRequestType }) {
  const [status, setStatus] = useState<WithdrawalStatusType>(request.status);
  const [pending, startTransition] = useTransition();

  function onSave() {
    startTransition(async () => {
      const response = await updateWithdrawalStatus({ id: request.id, status });
      if (!response.success) {
        toast.error(response.errorMessage || "Помилка збереження");
        return;
      }
      toast.success("Статус оновлено");
    });
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={status}
        onChange={(event) => setStatus(event.target.value as WithdrawalStatusType)}
        className="admin-select"
      >
        {WITHDRAWAL_STATUS_LIST.map((option) => (
          <option key={option} value={option}>
            {WITHDRAWAL_STATUS_LABEL[option]}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={onSave}
        disabled={pending || status === request.status}
        className="rounded-lg border border-slate-600/45 px-3 py-1.5 text-sm transition hover:bg-white/5 disabled:pointer-events-none disabled:opacity-50"
      >
        {pending ? "..." : "Зберегти"}
      </button>
    </div>
  );
}
