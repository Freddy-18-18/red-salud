"use client";

import { ArrowRight, DollarSign, TrendingUp, WifiOff } from "lucide-react";

import { useCurrencyRates } from "@/hooks/use-currency";
import { formatBs } from "@/lib/services/currency-service";

export function ExchangeRateDashboardCard() {
  const { officialDollar, parallelDollar, loading, isOffline } =
    useCurrencyRates();

  if (loading) {
    return (
      <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl animate-pulse">
        <div className="w-8 h-8 bg-gray-200 rounded-lg" />
        <div className="flex-1 space-y-1">
          <div className="h-3 w-24 bg-gray-200 rounded" />
          <div className="h-3 w-40 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  if (!officialDollar && !parallelDollar) return null;

  return (
    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl">
      <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
        <TrendingUp className="h-4 w-4 text-emerald-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <p className="text-xs font-medium text-emerald-800">
            Tasa de cambio
          </p>
          {isOffline && (
            <span title="Datos en cache" className="inline-flex">
              <WifiOff className="h-2.5 w-2.5 text-amber-500" aria-label="Datos en cache" />
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          {officialDollar && (
            <span className="flex items-center gap-1 text-sm">
              <DollarSign className="h-3 w-3 text-emerald-500" />
              <span className="text-xs text-gray-500">BCV:</span>
              <span className="font-semibold text-gray-900">
                {formatBs(officialDollar.rate)}
              </span>
            </span>
          )}
          {parallelDollar && (
            <>
              <span className="text-gray-300 text-xs">|</span>
              <span className="flex items-center gap-1 text-sm">
                <span className="text-xs text-gray-500">Paralelo:</span>
                <span className="font-semibold text-gray-900">
                  {formatBs(parallelDollar.rate)}
                </span>
              </span>
            </>
          )}
        </div>
      </div>
      <a
        href="/dashboard/pagos"
        className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium flex-shrink-0"
      >
        Ver mas
        <ArrowRight className="h-3 w-3" />
      </a>
    </div>
  );
}
