"use client";

import clsx from "clsx";

export type PeriodOption = "ALL" | "30D" | "90D" | "6M" | "12M" | "THIS_YEAR" | "CUSTOM";

export const PERIOD_OPTIONS: { value: PeriodOption; label: string }[] = [
  { value: "ALL", label: "Tutte le date" },
  { value: "30D", label: "Ultimi 30 giorni" },
  { value: "90D", label: "Ultimi 3 mesi" },
  { value: "6M", label: "Ultimi 6 mesi" },
  { value: "12M", label: "Ultimo anno" },
  { value: "THIS_YEAR", label: "Quest'anno" },
  { value: "CUSTOM", label: "Periodo personalizzato" },
];

export const ORDER_CONTROL_CLASS =
  "rounded-sm border border-stroke-grey bg-background px-3 py-2 text-sm outline-none transition focus:border-yellow-500";

/** Resolves the selected preset (or custom inputs) to a [from, to] ms range. */
export function resolvePeriodRange(
  period: PeriodOption,
  fromDate: string,
  toDate: string,
): { from: number | null; to: number | null } {
  if (period === "CUSTOM") {
    return {
      from: fromDate ? new Date(`${fromDate}T00:00:00`).getTime() : null,
      to: toDate ? new Date(`${toDate}T23:59:59.999`).getTime() : null,
    };
  }
  if (period === "ALL") return { from: null, to: null };

  const start = new Date();
  switch (period) {
    case "30D":
      start.setDate(start.getDate() - 30);
      break;
    case "90D":
      start.setDate(start.getDate() - 90);
      break;
    case "6M":
      start.setMonth(start.getMonth() - 6);
      break;
    case "12M":
      start.setFullYear(start.getFullYear() - 1);
      break;
    case "THIS_YEAR":
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      break;
  }
  return { from: start.getTime(), to: null };
}

/** Whether a date (ms) falls inside the resolved range. */
export function isInPeriod(time: number, range: { from: number | null; to: number | null }) {
  if (range.from !== null && time < range.from) return false;
  if (range.to !== null && time > range.to) return false;
  return true;
}

/** Two date inputs for the "Periodo personalizzato" option. */
export function PeriodDateRange({
  fromDate,
  toDate,
  onFromChange,
  onToChange,
}: {
  fromDate: string;
  toDate: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-3">
      <label className="helper_text flex flex-1 flex-col gap-1">
        Da
        <input
          type="date"
          value={fromDate}
          max={toDate || undefined}
          onChange={(event) => onFromChange(event.target.value)}
          style={{ colorScheme: "dark" }}
          className={clsx(ORDER_CONTROL_CLASS, "w-full")}
        />
      </label>
      <label className="helper_text flex flex-1 flex-col gap-1">
        A
        <input
          type="date"
          value={toDate}
          min={fromDate || undefined}
          onChange={(event) => onToChange(event.target.value)}
          style={{ colorScheme: "dark" }}
          className={clsx(ORDER_CONTROL_CLASS, "w-full")}
        />
      </label>
    </div>
  );
}
