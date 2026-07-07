"use client";

import { updateWithdrawalStatus } from "@/app/actions/admin/withdrawals/update-withdrawal-status";
import type { WithdrawalRequestType } from "@/db/schemas/withdrawal-requests.schema";
import {
  WITHDRAWAL_STATUS_LABEL,
  WITHDRAWAL_STATUS_LIST,
  type WithdrawalStatusType,
} from "@/types/withdrawal.types";
import { useState, useTransition } from "react";
import { toast } from "react-toastify";

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("uk-UA", {
    dateStyle: "short",
    timeStyle: "medium",
    timeZone: "Europe/Rome",
  }).format(new Date(value));
}

export function OrderWithdrawalCard({ withdrawals }: { withdrawals: WithdrawalRequestType[] }) {
  if (!withdrawals.length) return null;

  return (
    <div className="admin-card admin-card-content border border-amber-500/40">
      <div className="mb-3 font-semibold">↩️ Запити на відмову (recesso)</div>
      <div className="space-y-4 text-sm">
        {withdrawals.map((request) => (
          <WithdrawalRow key={request.id} request={request} />
        ))}
      </div>
    </div>
  );
}

function WithdrawalRow({ request }: { request: WithdrawalRequestType }) {
  const [status, setStatus] = useState<WithdrawalStatusType>(request.status);
  const [pending, startTransition] = useTransition();

  function onSave() {
    startTransition(async () => {
      const response = await updateWithdrawalStatus({ id: request.id, status });
      if (!response.success) {
        toast.error(response.errorMessage || "Помилка збереження");
        return;
      }
      toast.success("Статус запиту оновлено");
    });
  }

  return (
    <div className="space-y-2 border-t border-slate-600/45 pt-3 first:border-t-0 first:pt-0">
      <div>
        <div className="text-xs text-neutral-400">Подано (дата і час — юридично значущі)</div>
        <div className="font-medium">{formatDateTime(request.createdAt)}</div>
      </div>
      <div>
        <div className="text-xs text-neutral-400">Ім&apos;я / Email</div>
        <div className="font-medium">{request.nome}</div>
        <div className="text-xs break-all text-neutral-400">{request.email}</div>
      </div>
      {request.message ? (
        <div>
          <div className="text-xs text-neutral-400">Примітка клієнта</div>
          <div className="font-medium whitespace-pre-wrap">{request.message}</div>
        </div>
      ) : null}
      {!request.orderId ? (
        <div className="text-xs text-amber-300">
          ⚠️ Замовлення не верифіковано автоматично (email не збігся) — перевірте вручну
        </div>
      ) : null}
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
          {pending ? "Збереження..." : "Зберегти"}
        </button>
      </div>
    </div>
  );
}
