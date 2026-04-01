"use client";

import {
  Activity,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
} from "lucide-react";
import { useState } from "react";

import type { HealthMetricType, HealthMetric } from "@/lib/services/reminders-service";

interface MetricWithLatest {
  metricType: HealthMetricType;
  latest: HealthMetric | null;
}

interface HealthMetricLoggerProps {
  latestMetrics: MetricWithLatest[];
  loading: boolean;
  onLogMetric: (data: {
    metric_type_id: string;
    value: number;
    measured_at: string;
    notes?: string;
  }) => Promise<unknown>;
  onViewHistory: (metricTypeId: string) => void;
}

// Reference ranges for common metric types
const REFERENCE_RANGES: Record<
  string,
  { normal: [number, number]; warning: [number, number]; unit: string; icon: string }
> = {
  "presion_arterial_sistolica": {
    normal: [90, 120],
    warning: [120, 140],
    unit: "mmHg",
    icon: "heart",
  },
  "presion_arterial_diastolica": {
    normal: [60, 80],
    warning: [80, 90],
    unit: "mmHg",
    icon: "heart",
  },
  peso: {
    normal: [50, 100],
    warning: [100, 120],
    unit: "kg",
    icon: "scale",
  },
  glucosa: {
    normal: [70, 100],
    warning: [100, 126],
    unit: "mg/dL",
    icon: "droplet",
  },
  temperatura: {
    normal: [36.1, 37.2],
    warning: [37.2, 38.0],
    unit: "°C",
    icon: "thermometer",
  },
  frecuencia_cardiaca: {
    normal: [60, 100],
    warning: [100, 120],
    unit: "bpm",
    icon: "heart-pulse",
  },
};

function getValueColor(value: number, metricName: string): string {
  const normalized = metricName.toLowerCase().replace(/\s+/g, "_");
  const range = REFERENCE_RANGES[normalized];
  if (!range) return "text-gray-900";

  if (value >= range.normal[0] && value <= range.normal[1]) return "text-emerald-600";
  if (value >= range.warning[0] && value <= range.warning[1]) return "text-amber-600";
  return "text-red-600";
}

function getValueBadge(
  value: number,
  metricName: string,
): { label: string; className: string } | null {
  const normalized = metricName.toLowerCase().replace(/\s+/g, "_");
  const range = REFERENCE_RANGES[normalized];
  if (!range) return null;

  if (value >= range.normal[0] && value <= range.normal[1]) {
    return { label: "Normal", className: "bg-emerald-50 text-emerald-700" };
  }
  if (value >= range.warning[0] && value <= range.warning[1]) {
    return { label: "Atencion", className: "bg-amber-50 text-amber-700" };
  }
  if (value < range.normal[0]) {
    return { label: "Bajo", className: "bg-blue-50 text-blue-700" };
  }
  return { label: "Alto", className: "bg-red-50 text-red-700" };
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `hace ${diffMins}min`;
  if (diffHours < 24) return `hace ${diffHours}h`;
  if (diffDays === 1) return "ayer";
  if (diffDays < 7) return `hace ${diffDays}d`;
  if (diffDays < 30) return `hace ${Math.floor(diffDays / 7)} sem`;
  return `hace ${Math.floor(diffDays / 30)} mes${Math.floor(diffDays / 30) > 1 ? "es" : ""}`;
}

export function HealthMetricLogger({
  latestMetrics,
  loading,
  onLogMetric,
  onViewHistory,
}: HealthMetricLoggerProps) {
  const [expanded, setExpanded] = useState(true);
  const [activeInput, setActiveInput] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (metricTypeId: string) => {
    const value = parseFloat(inputValue);
    if (isNaN(value)) return;

    setSubmitting(true);
    await onLogMetric({
      metric_type_id: metricTypeId,
      value,
      measured_at: new Date().toISOString(),
    });
    setInputValue("");
    setActiveInput(null);
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="skeleton w-10 h-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-40" />
            <div className="skeleton h-3 w-28" />
          </div>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-16 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
            <Activity className="h-5 w-5 text-purple-600" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900 text-sm">
              Mediciones pendientes
            </h3>
            <p className="text-xs text-gray-500">
              {latestMetrics.length} metricas disponibles
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-2">
          {latestMetrics.length === 0 ? (
            <div className="text-center py-6">
              <Activity className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                No hay metricas configuradas
              </p>
            </div>
          ) : (
            latestMetrics.map(({ metricType, latest }) => {
              const isActive = activeInput === metricType.id;
              const badge = latest
                ? getValueBadge(latest.value, metricType.name)
                : null;

              return (
                <div
                  key={metricType.id}
                  className="p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {metricType.name}
                        </p>
                        {badge && (
                          <span
                            className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                        )}
                      </div>

                      {latest ? (
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className={`text-sm font-semibold ${getValueColor(latest.value, metricType.name)}`}
                          >
                            {latest.value} {metricType.unit}
                          </span>
                          <span className="flex items-center text-xs text-gray-400">
                            <Clock className="h-3 w-3 mr-0.5" />
                            {timeAgo(latest.measured_at)}
                          </span>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 mt-0.5">
                          Sin mediciones
                        </p>
                      )}
                    </div>

                    {!isActive && (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveInput(metricType.id);
                          setInputValue("");
                        }}
                        className="text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition-colors flex-shrink-0"
                      >
                        Registrar
                      </button>
                    )}
                  </div>

                  {/* Inline input */}
                  {isActive && (
                    <div className="mt-3 flex items-center gap-2">
                      <input
                        type="number"
                        step="any"
                        autoFocus
                        placeholder={`Valor en ${metricType.unit}`}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSubmit(metricType.id);
                          if (e.key === "Escape") setActiveInput(null);
                        }}
                        className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        disabled={submitting || !inputValue}
                        onClick={() => handleSubmit(metricType.id)}
                        className="px-3 py-2 text-sm font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
                      >
                        {submitting ? "..." : "Guardar"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveInput(null)}
                        className="px-2 py-2 text-sm text-gray-400 hover:text-gray-600"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}

                  {/* Mini trend indicator */}
                  {latest && (
                    <button
                      type="button"
                      onClick={() => onViewHistory(metricType.id)}
                      className="mt-1 text-[11px] text-gray-400 hover:text-emerald-600 transition-colors"
                    >
                      Ver historial
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

// ─── Trend Chart (simple div-based bars) ─────────────────────────────────────

interface TrendChartProps {
  metrics: HealthMetric[];
  metricType: HealthMetricType;
  onClose: () => void;
}

export function MetricTrendChart({
  metrics,
  metricType,
  onClose,
}: TrendChartProps) {
  if (metrics.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30">
        <div className="bg-white w-full sm:max-w-lg sm:rounded-xl rounded-t-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">{metricType.name}</h3>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              Cerrar
            </button>
          </div>
          <p className="text-sm text-gray-500 text-center py-8">
            No hay datos suficientes para mostrar tendencia
          </p>
        </div>
      </div>
    );
  }

  const values = metrics.map((m) => m.value);
  const maxVal = Math.max(...values);
  const minVal = Math.min(...values);
  const range = maxVal - minVal || 1;

  // Trend direction
  const lastFive = values.slice(-5);
  const trend =
    lastFive.length >= 2
      ? lastFive[lastFive.length - 1] > lastFive[0]
        ? "up"
        : lastFive[lastFive.length - 1] < lastFive[0]
          ? "down"
          : "stable"
      : "stable";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-xl rounded-t-xl p-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900">{metricType.name}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-gray-500">
                Ultimos 30 dias - {metricType.unit}
              </span>
              <span
                className={`flex items-center gap-0.5 text-xs font-medium ${
                  trend === "up"
                    ? "text-red-500"
                    : trend === "down"
                      ? "text-emerald-500"
                      : "text-gray-400"
                }`}
              >
                {trend === "up" ? (
                  <TrendingUp className="h-3 w-3" />
                ) : trend === "down" ? (
                  <TrendingDown className="h-3 w-3" />
                ) : (
                  <Minus className="h-3 w-3" />
                )}
                {trend === "up" ? "Subiendo" : trend === "down" ? "Bajando" : "Estable"}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            Cerrar
          </button>
        </div>

        {/* Bar chart */}
        <div className="flex items-end gap-1 h-40 mt-4">
          {metrics.map((m, _i) => {
            const height = ((m.value - minVal) / range) * 100;
            const barHeight = Math.max(height, 4); // Minimum visible bar
            const badge = getValueBadge(m.value, metricType.name);
            const barColor = badge
              ? badge.label === "Normal"
                ? "bg-emerald-400"
                : badge.label === "Atencion"
                  ? "bg-amber-400"
                  : badge.label === "Alto"
                    ? "bg-red-400"
                    : "bg-blue-400"
              : "bg-gray-300";

            return (
              <div
                key={m.id}
                className="flex-1 flex flex-col items-center gap-1 group relative"
              >
                {/* Tooltip */}
                <div className="hidden group-hover:block absolute bottom-full mb-1 bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-10">
                  {m.value} {metricType.unit}
                  <br />
                  {new Date(m.measured_at).toLocaleDateString("es", {
                    day: "numeric",
                    month: "short",
                  })}
                </div>
                <div
                  className={`w-full rounded-t ${barColor} transition-all hover:opacity-80`}
                  style={{ height: `${barHeight}%` }}
                />
              </div>
            );
          })}
        </div>

        {/* X axis labels */}
        <div className="flex justify-between mt-1 text-[10px] text-gray-400">
          {metrics.length > 0 && (
            <>
              <span>
                {new Date(metrics[0].measured_at).toLocaleDateString("es", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
              <span>
                {new Date(
                  metrics[metrics.length - 1].measured_at,
                ).toLocaleDateString("es", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <p className="text-xs text-gray-500">Minimo</p>
            <p className="text-sm font-semibold text-gray-900">
              {minVal} {metricType.unit}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Promedio</p>
            <p className="text-sm font-semibold text-gray-900">
              {(values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)}{" "}
              {metricType.unit}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Maximo</p>
            <p className="text-sm font-semibold text-gray-900">
              {maxVal} {metricType.unit}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
