"use client";

import {
  ArrowDown,
  ArrowUp,
  DollarSign,
  Euro,
  RefreshCw,
  TrendingUp,
  WifiOff,
} from "lucide-react";

import { useCurrencyRates } from "@/hooks/use-currency";
import type { ExchangeRate, HistoricalRate } from "@/lib/services/currency-service";
import { formatBs } from "@/lib/services/currency-service";

// ─── Mini Sparkline (pure SVG) ───────────────────────────────────────

function Sparkline({
  data,
  width = 80,
  height = 24,
}: {
  data: HistoricalRate[];
  width?: number;
  height?: number;
}) {
  if (data.length < 2) return null;

  const values = data.map((d) => d.rate);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");

  const isUp = values[values.length - 1] > values[0];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="inline-block"
    >
      <polyline
        fill="none"
        stroke={isUp ? "#ef4444" : "#10b981"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

// ─── Rate Row ────────────────────────────────────────────────────────

function RateRow({
  label,
  rate,
  icon: Icon,
  trend,
}: {
  label: string;
  rate: ExchangeRate | null;
  icon: typeof DollarSign;
  trend?: "up" | "down" | null;
}) {
  if (!rate) return null;

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center">
          <Icon className="h-3.5 w-3.5 text-gray-500" />
        </div>
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-sm font-semibold text-gray-900">
            {formatBs(rate.rate)}
          </p>
        </div>
      </div>
      {trend && (
        <div
          className={`flex items-center gap-0.5 text-xs font-medium ${
            trend === "up" ? "text-red-500" : "text-emerald-500"
          }`}
        >
          {trend === "up" ? (
            <ArrowUp className="h-3 w-3" />
          ) : (
            <ArrowDown className="h-3 w-3" />
          )}
        </div>
      )}
    </div>
  );
}

// ─── Compact Variant ─────────────────────────────────────────────────

export function ExchangeRateCompact() {
  const { officialDollar, parallelDollar, loading, isOffline } =
    useCurrencyRates();

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-400 animate-pulse">
        <DollarSign className="h-3 w-3" />
        <span>Cargando tasas...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 text-xs">
      {isOffline && (
        <span title="Datos en cache" className="inline-flex">
          <WifiOff className="h-3 w-3 text-amber-500" aria-label="Datos en cache" />
        </span>
      )}
      {officialDollar && (
        <span className="text-gray-600">
          <span className="font-medium text-gray-500">BCV:</span>{" "}
          <span className="font-semibold text-gray-800">
            {formatBs(officialDollar.rate)}
          </span>
        </span>
      )}
      {parallelDollar && (
        <>
          <span className="text-gray-300">|</span>
          <span className="text-gray-600">
            <span className="font-medium text-gray-500">Paralelo:</span>{" "}
            <span className="font-semibold text-gray-800">
              {formatBs(parallelDollar.rate)}
            </span>
          </span>
        </>
      )}
    </div>
  );
}

// ─── Full Widget ─────────────────────────────────────────────────────

export function ExchangeRateWidget({
  className = "",
}: {
  className?: string;
}) {
  const {
    rates,
    officialDollar,
    parallelDollar,
    history,
    loading,
    error,
    isOffline,
    refetch,
  } = useCurrencyRates();

  const officialEuro =
    rates.find(
      (r) =>
        r.currency === "EUR" &&
        (r.source === "BCV" || r.name.toLowerCase().includes("oficial"))
    ) ?? null;

  const parallelEuro =
    rates.find(
      (r) =>
        r.currency === "EUR" &&
        r.source !== "BCV" &&
        !r.name.toLowerCase().includes("oficial")
    ) ?? null;

  // Determine trend from history
  const trend: "up" | "down" | null =
    history.length >= 2
      ? history[history.length - 1].rate > history[0].rate
        ? "up"
        : "down"
      : null;

  if (loading) {
    return (
      <div
        className={`bg-white border border-gray-100 rounded-xl p-4 animate-pulse ${className}`}
      >
        <div className="h-4 w-32 bg-gray-100 rounded mb-3" />
        <div className="space-y-3">
          <div className="h-8 bg-gray-50 rounded" />
          <div className="h-8 bg-gray-50 rounded" />
          <div className="h-8 bg-gray-50 rounded" />
          <div className="h-8 bg-gray-50 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white border border-gray-100 rounded-xl p-4 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-emerald-600" />
          <h3 className="text-sm font-semibold text-gray-900">
            Tasas de Cambio
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {isOffline && (
            <span className="flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
              <WifiOff className="h-2.5 w-2.5" />
              Cache
            </span>
          )}
          <button
            onClick={refetch}
            className="p-1 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition"
            title="Actualizar"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {error && !rates.length && (
        <p className="text-xs text-red-500 mb-2">{error}</p>
      )}

      {/* Dollar rates */}
      <div className="divide-y divide-gray-50">
        <RateRow
          label="Dolar Oficial (BCV)"
          rate={officialDollar}
          icon={DollarSign}
          trend={trend}
        />
        <RateRow
          label="Dolar Paralelo"
          rate={parallelDollar}
          icon={DollarSign}
        />
        <RateRow
          label="Euro Oficial (BCV)"
          rate={officialEuro}
          icon={Euro}
        />
        <RateRow
          label="Euro Paralelo"
          rate={parallelEuro}
          icon={Euro}
        />
      </div>

      {/* Sparkline */}
      {history.length >= 2 && (
        <div className="mt-3 pt-3 border-t border-gray-50">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400">
              Tendencia 7 dias (BCV)
            </span>
            <Sparkline data={history} width={80} height={20} />
          </div>
        </div>
      )}

      {/* Last updated */}
      {officialDollar?.lastUpdated && (
        <p className="text-[10px] text-gray-400 mt-2">
          Actualizado:{" "}
          {new Date(officialDollar.lastUpdated).toLocaleString("es-VE", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      )}
    </div>
  );
}
