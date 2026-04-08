"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";

import type {
  ExpenseSummary,
  ExpenseCategory,
} from "@/lib/services/expense-service";
import {
  EXPENSE_CATEGORIES,
  getCategoryLabel,
  getCategoryMeta,
  formatUsd,
  formatBs,
  MONTH_LABELS,
} from "@/lib/services/expense-service";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface SpendingChartProps {
  summary: ExpenseSummary | undefined;
  loading: boolean;
}

type ChartTab = "mensual" | "categorias" | "tendencia";
type CurrencyDisplay = "usd" | "bs";

/* ------------------------------------------------------------------ */
/*  Custom Tooltip                                                     */
/* ------------------------------------------------------------------ */

function ChartTooltip({ active, payload, label, currency }: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
  currency: CurrencyDisplay;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-lg p-3 text-xs">
      <p className="font-medium text-gray-700 mb-1.5">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-gray-500">{entry.name}:</span>
          <span className="font-semibold text-gray-900">
            {currency === "usd" ? formatUsd(entry.value) : formatBs(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function SpendingChart({ summary, loading }: SpendingChartProps) {
  const [tab, setTab] = useState<ChartTab>("mensual");
  const [currency, setCurrency] = useState<CurrencyDisplay>("usd");

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="h-6 w-40 bg-gray-100 rounded mb-4 animate-pulse" />
        <div className="h-64 bg-gray-50 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!summary) return null;

  const tabs: { value: ChartTab; label: string }[] = [
    { value: "mensual", label: "Mensual" },
    { value: "categorias", label: "Categorias" },
    { value: "tendencia", label: "Tendencia" },
  ];

  // Bar chart data — monthly with stacked categories
  const barData = summary.by_month.map((m) => ({
    name: m.label,
    total: currency === "usd" ? m.total_usd : m.total_bs,
  }));

  // Pie chart data
  const pieData = summary.by_category
    .filter((c) => c.total_usd > 0)
    .map((c) => ({
      name: getCategoryLabel(c.category as ExpenseCategory),
      value: currency === "usd" ? c.total_usd : c.total_bs,
      color: getCategoryMeta(c.category as ExpenseCategory).chartColor,
      percentage: c.percentage,
    }));

  // Line chart data — cumulative spending trend
  let cumulative = 0;
  const lineData = summary.by_month.map((m) => {
    cumulative += currency === "usd" ? m.total_usd : m.total_bs;
    return {
      name: m.label,
      acumulado: Math.round(cumulative * 100) / 100,
      mensual: currency === "usd" ? m.total_usd : m.total_bs,
    };
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {tabs.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTab(t.value)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                tab === t.value
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Currency toggle */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          <button
            type="button"
            onClick={() => setCurrency("usd")}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              currency === "usd"
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            USD
          </button>
          <button
            type="button"
            onClick={() => setCurrency("bs")}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              currency === "bs"
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Bs.
          </button>
        </div>
      </div>

      {/* Chart area */}
      <div className="p-5">
        {tab === "mensual" && (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => currency === "usd" ? `$${v}` : `Bs.${v}`}
              />
              <Tooltip content={(props) => <ChartTooltip {...props} currency={currency} />} />
              <Bar
                dataKey="total"
                name="Total"
                fill="#10b981"
                radius={[6, 6, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        )}

        {tab === "categorias" && (
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={110}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                  labelLine={{ stroke: "#d1d5db", strokeWidth: 1 }}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="white" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) =>
                    currency === "usd" ? formatUsd(value) : formatBs(value)
                  }
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="flex flex-wrap lg:flex-col gap-2 lg:gap-1.5 min-w-[160px]">
              {pieData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-xs text-gray-600 truncate">{entry.name}</span>
                  <span className="text-xs font-medium text-gray-900 ml-auto">
                    {entry.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "tendencia" && (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => currency === "usd" ? `$${v}` : `Bs.${v}`}
              />
              <Tooltip content={(props) => <ChartTooltip {...props} currency={currency} />} />
              <Legend
                wrapperStyle={{ fontSize: 11 }}
                iconType="circle"
              />
              <Line
                type="monotone"
                dataKey="acumulado"
                name="Acumulado"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#10b981" }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="mensual"
                name="Mensual"
                stroke="#8b5cf6"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 3, fill: "#8b5cf6" }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
