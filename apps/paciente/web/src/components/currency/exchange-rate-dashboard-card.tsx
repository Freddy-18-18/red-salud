"use client";

import { ArrowRight, DollarSign, TrendingUp, WifiOff } from "lucide-react";

import { useCurrencyRates } from "@/hooks/use-currency";
import { formatBs } from "@/lib/services/currency-service";

export function ExchangeRateDashboardCard() {
  const { officialDollar, loading, isOffline } = useCurrencyRates();

  if (loading) {
    return (
      <div className="flex items-center gap-3 p-3 bg-[hsl(var(--muted))] border border-[hsl(var(--border))] rounded-xl animate-pulse">
        <div className="w-8 h-8 bg-[hsl(var(--border))] rounded-lg" />
        <div className="flex-1 space-y-1">
          <div className="h-3 w-24 bg-[hsl(var(--border))] rounded" />
          <div className="h-3 w-40 bg-[hsl(var(--border))]/60 rounded" />
        </div>
      </div>
    );
  }

  if (!officialDollar) return null;

  return (
    <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
      <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
        <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
            Tasa de cambio
          </p>
          {isOffline && (
            <span title="Datos en cache" className="inline-flex">
              <WifiOff className="h-2.5 w-2.5 text-amber-500" aria-label="Datos en cache" />
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="flex items-center gap-1 text-sm">
            <DollarSign className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs text-[hsl(var(--muted-foreground))]">BCV:</span>
            <span className="font-semibold text-[hsl(var(--foreground))]">
              {formatBs(officialDollar.rate)}
            </span>
          </span>
        </div>
      </div>
      <a
        href="/dashboard/pagos"
        className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium flex-shrink-0"
      >
        Ver mas
        <ArrowRight className="h-3 w-3" />
      </a>
    </div>
  );
}
