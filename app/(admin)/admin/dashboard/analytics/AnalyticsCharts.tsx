"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const euro = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" });

const axisTick = { fill: "#93a1b8", fontSize: 12 };
const tooltipStyle = {
  background: "#1a1c22",
  border: "1px solid #62718d",
  borderRadius: 8,
  color: "#f4f7ff",
} as const;

export function RevenueLineChart({ data }: { data: { label: string; revenue: number }[] }) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke="rgba(98,113,141,0.25)" vertical={false} />
          <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} />
          <YAxis tick={axisTick} axisLine={false} tickLine={false} tickFormatter={(v) => "€" + v} />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value) => [euro.format(Number(value)), "Виручка"]}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#3987e5"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function NameBarChart({
  data,
  color,
  valueFormatter,
}: {
  data: { name: string; value: number }[];
  color: string;
  valueFormatter?: (value: number) => string;
}) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical">
          <CartesianGrid stroke="rgba(98,113,141,0.25)" horizontal={false} />
          <XAxis type="number" tick={axisTick} axisLine={false} tickLine={false} hide />
          <YAxis
            type="category"
            dataKey="name"
            width={120}
            tick={axisTick}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value) => [
              valueFormatter ? valueFormatter(Number(value)) : String(value),
              "Значення",
            ]}
          />
          <Bar dataKey="value" fill={color} barSize={14} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
