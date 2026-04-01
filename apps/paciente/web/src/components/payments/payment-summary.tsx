"use client";

import {
  DollarSign,
  TrendingUp,
  Clock,
  ShieldCheck,
  Wallet,
  PieChart,
} from "lucide-react";

import {
  type PaymentStats,
  formatBs,
  formatUsd,
  getPaymentTypeLabel,
} from "@/lib/services/payments-service";
import { Skeleton } from "@/components/ui/skeleton";

interface PaymentSummaryProps {
  stats: PaymentStats | null;
  exchangeRate: number | null;
  exchangeRateUpdatedAt: string | null;
  loading?: boolean;
}

export function PaymentSummary({
  stats,
  exchangeRate,
  exchangeRateUpdatedAt,
  loading = false,
}: PaymentSummaryProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-20 rounded-xl" />
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const insurancePct =
    stats.insurance_covered_total + stats.out_of_pocket_total > 0
      ? Math.round(
          (stats.insurance_covered_total /
            (stats.insurance_covered_total + stats.out_of_pocket_total)) *
            100
        )
      : 0;

  const outOfPocketPct = 100 - insurancePct;

  return (
    <div className="space-y-4">
      {/* Exchange rate banner */}
      {exchangeRate && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-blue-50 border border-blue-100 rounded-xl">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              Tasa BCV
            </span>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-blue-900">
              1 USD = Bs. {exchangeRate.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
            </p>
            {exchangeRateUpdatedAt && (
              <p className="text-[10px] text-blue-500">
                Actualizado:{" "}
                {new Date(exchangeRateUpdatedAt).toLocaleDateString("es-VE", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Monthly spent */}
        <div className="p-3 bg-white border border-gray-100 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </div>
            <span className="text-xs text-gray-500">Este mes</span>
          </div>
          <p className="text-lg font-bold text-gray-900">
            {formatUsd(stats.total_spent_month_usd)}
          </p>
          <p className="text-xs text-gray-400">
            {formatBs(stats.total_spent_month_bs)}
          </p>
        </div>

        {/* Yearly spent */}
        <div className="p-3 bg-white border border-gray-100 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
            <span className="text-xs text-gray-500">Este ano</span>
          </div>
          <p className="text-lg font-bold text-gray-900">
            {formatUsd(stats.total_spent_year_usd)}
          </p>
          <p className="text-xs text-gray-400">
            {formatBs(stats.total_spent_year_bs)}
          </p>
        </div>

        {/* Pending balance */}
        <div className="p-3 bg-white border border-gray-100 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <span className="text-xs text-gray-500">Pendiente</span>
          </div>
          <p className="text-lg font-bold text-gray-900">
            {formatUsd(stats.pending_balance_usd)}
          </p>
          <p className="text-xs text-gray-400">
            {formatBs(stats.pending_balance_bs)}
          </p>
        </div>

        {/* Top category */}
        <div className="p-3 bg-white border border-gray-100 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
              <PieChart className="h-4 w-4 text-purple-600" />
            </div>
            <span className="text-xs text-gray-500">Mas frecuente</span>
          </div>
          <p className="text-lg font-bold text-gray-900">
            {stats.top_category
              ? getPaymentTypeLabel(stats.top_category)
              : "—"}
          </p>
          <p className="text-xs text-gray-400">
            {stats.payments_count} pago{stats.payments_count !== 1 ? "s" : ""} total
          </p>
        </div>
      </div>

      {/* Insurance vs out-of-pocket */}
      {(stats.insurance_covered_total > 0 || stats.out_of_pocket_total > 0) && (
        <div className="p-4 bg-white border border-gray-100 rounded-xl space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-semibold text-gray-900">
              Cobertura de seguro vs. Gasto propio
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden flex">
            {insurancePct > 0 && (
              <div
                className="h-full bg-emerald-500 rounded-l-full transition-all"
                style={{ width: `${insurancePct}%` }}
              />
            )}
            {outOfPocketPct > 0 && (
              <div
                className="h-full bg-amber-400 transition-all"
                style={{
                  width: `${outOfPocketPct}%`,
                  borderRadius: insurancePct === 0 ? "9999px 0 0 9999px" : undefined,
                }}
              />
            )}
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-gray-600">
                Seguro: {formatUsd(stats.insurance_covered_total)} ({insurancePct}%)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="text-gray-600">
                Propio: {formatUsd(stats.out_of_pocket_total)} ({outOfPocketPct}%)
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
