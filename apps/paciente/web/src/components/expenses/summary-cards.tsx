"use client";

import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CalendarDays,
  BarChart3,
  Loader2,
} from "lucide-react";

import type { ExpenseSummary, ExpenseCategory } from "@/lib/services/expense-service";
import { formatUsd, formatBs, getCategoryLabel } from "@/lib/services/expense-service";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface SummaryCardsProps {
  summary: ExpenseSummary | undefined;
  loading: boolean;
  year: number;
  month?: number;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function SummaryCards({ summary, loading, year, month }: SummaryCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse"
          >
            <div className="h-3 w-20 bg-gray-100 rounded mb-3" />
            <div className="h-6 w-28 bg-gray-100 rounded mb-2" />
            <div className="h-3 w-24 bg-gray-50 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!summary) return null;

  // Current month total (if browsing a specific month, use total; else use current calendar month)
  const now = new Date();
  const currentMonth = month ?? now.getMonth() + 1;
  const monthData = summary.by_month.find((m) => m.month === currentMonth);
  const monthTotalUsd = monthData?.total_usd ?? 0;
  const monthTotalBs = monthData?.total_bs ?? 0;

  // Average monthly
  const monthsWithData = summary.by_month.filter((m) => m.total_usd > 0).length;
  const avgMonthlyUsd = monthsWithData > 0 ? summary.total_usd / monthsWithData : 0;

  // Top category
  const topCat = summary.by_category.length > 0 ? summary.by_category[0] : null;

  // Year-over-year
  const yoy = summary.year_over_year;

  const cards = [
    {
      label: month ? `Gasto del mes` : "Gasto este mes",
      valueUsd: monthTotalUsd,
      valueBs: monthTotalBs,
      icon: DollarSign,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      label: `Total ${year}`,
      valueUsd: summary.total_usd,
      valueBs: summary.total_bs,
      icon: CalendarDays,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      label: "Promedio mensual",
      valueUsd: avgMonthlyUsd,
      valueBs: 0,
      icon: BarChart3,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      label: "Categoria principal",
      valueUsd: topCat?.total_usd ?? 0,
      valueBs: topCat?.total_bs ?? 0,
      icon: topCat ? BarChart3 : DollarSign,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      subtitle: topCat ? getCategoryLabel(topCat.category as ExpenseCategory) : "Sin datos",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {card.label}
            </span>
            <div className={`w-8 h-8 rounded-lg ${card.iconBg} flex items-center justify-center`}>
              <card.icon className={`h-4 w-4 ${card.iconColor}`} />
            </div>
          </div>

          <p className="text-xl font-bold text-gray-900">{formatUsd(card.valueUsd)}</p>

          {card.valueBs > 0 && (
            <p className="text-sm text-gray-400 mt-0.5">{formatBs(card.valueBs)}</p>
          )}

          {card.subtitle && (
            <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
          )}

          {/* Year-over-year trend on the annual total card */}
          {i === 1 && yoy && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${
              yoy.change_pct > 0 ? "text-red-500" : yoy.change_pct < 0 ? "text-green-500" : "text-gray-400"
            }`}>
              {yoy.change_pct > 0 ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : yoy.change_pct < 0 ? (
                <TrendingDown className="h-3.5 w-3.5" />
              ) : null}
              <span>
                {yoy.change_pct > 0 ? "+" : ""}
                {yoy.change_pct.toFixed(1)}% vs {year - 1}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
