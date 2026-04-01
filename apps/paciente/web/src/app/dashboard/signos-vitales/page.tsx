"use client";

import { ArrowLeft, HeartPulse } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

import { VitalCard } from "@/components/vitals/vital-card";
import { VitalChart } from "@/components/vitals/vital-chart";
import { VitalsSummary } from "@/components/vitals/vitals-summary";
import { Skeleton } from "@/components/ui/skeleton";
import { useVitalsDashboard, useVitalHistory, useVitalStats } from "@/hooks/use-vitals";
import {
  VITAL_DEFINITIONS,
  DASHBOARD_VITALS,
  getVitalHistory as fetchVitalHistory,
  type VitalType,
} from "@/lib/services/vitals-service";

// ─── Date Range Options ──────────────────────────────────────────────────────

type DateRange = 7 | 30 | 90;

const DATE_RANGES: { label: string; value: DateRange }[] = [
  { label: "7 dias", value: 7 },
  { label: "30 dias", value: 30 },
  { label: "90 dias", value: 90 },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function SignosVitalesPage() {
  const { userId, initialLoading, latest, logVital } = useVitalsDashboard();

  const [selectedVital, setSelectedVital] = useState<VitalType | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>(30);
  const [historyMap, setHistoryMap] = useState<Record<VitalType, number[]>>(
    {} as Record<VitalType, number[]>,
  );

  // Fetch sparkline data for the summary
  useEffect(() => {
    if (!userId) return;

    const loadSparklines = async () => {
      const results: Record<VitalType, number[]> = {} as Record<VitalType, number[]>;

      await Promise.all(
        DASHBOARD_VITALS.map(async (vt) => {
          const result = await fetchVitalHistory(userId, vt, 30);
          if (result.success) {
            results[vt] = result.data.map((r) => r.value);
          }
        }),
      );

      setHistoryMap(results);
    };

    loadSparklines();
  }, [userId, latest.vitals]);

  // Chart data for selected vital
  const { readings: chartReadings, loading: chartLoading } = useVitalHistory(
    userId,
    selectedVital ?? undefined,
    dateRange,
  );

  const { stats, loading: statsLoading } = useVitalStats(
    userId,
    selectedVital ?? undefined,
    dateRange,
  );

  const handleLog = useCallback(
    async (vitalType: VitalType, value: number) => {
      await logVital.log(vitalType, value);
    },
    [logVital],
  );

  const handleSelectVital = useCallback((vt: VitalType) => {
    setSelectedVital((prev) => (prev === vt ? null : vt));
  }, []);

  // ─── Loading State ───────────────────────────────────────────────────────

  if (initialLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-6 w-64" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const selectedDef = selectedVital ? VITAL_DEFINITIONS[selectedVital] : null;

  return (
    <div className="space-y-4 pb-4">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <a
          href="/dashboard"
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
        >
          <ArrowLeft className="h-5 w-5" />
        </a>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <HeartPulse className="h-5 w-5 text-emerald-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Signos Vitales
            </h1>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            Registra y monitorea tus signos vitales
          </p>
        </div>
      </div>

      {/* Summary Overview */}
      <VitalsSummary
        latestVitals={latest.vitals}
        historyMap={historyMap}
        onSelectVital={handleSelectVital}
      />

      {/* Selected Vital Chart + Stats */}
      {selectedVital && selectedDef && (
        <div className="space-y-3">
          {/* Date range selector */}
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">
              {selectedDef.label}
            </h2>
            <div className="flex gap-1 bg-gray-100 p-0.5 rounded-lg">
              {DATE_RANGES.map((range) => (
                <button
                  key={range.value}
                  onClick={() => setDateRange(range.value)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                    dateRange === range.value
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chart */}
          <div className="p-4 bg-white border border-gray-100 rounded-xl">
            {chartLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <VitalChart
                readings={chartReadings}
                range={selectedDef.range}
                label={selectedDef.label}
                unit={selectedDef.unit}
              />
            )}
          </div>

          {/* Stats */}
          {!statsLoading && stats.count > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="p-3 bg-white border border-gray-100 rounded-xl">
                <p className="text-[10px] text-gray-500">Minimo</p>
                <p className="text-lg font-bold text-gray-900">{stats.min}</p>
                <p className="text-[10px] text-gray-400">{selectedDef.unit}</p>
              </div>
              <div className="p-3 bg-white border border-gray-100 rounded-xl">
                <p className="text-[10px] text-gray-500">Maximo</p>
                <p className="text-lg font-bold text-gray-900">{stats.max}</p>
                <p className="text-[10px] text-gray-400">{selectedDef.unit}</p>
              </div>
              <div className="p-3 bg-white border border-gray-100 rounded-xl">
                <p className="text-[10px] text-gray-500">Promedio</p>
                <p className="text-lg font-bold text-gray-900">
                  {stats.average}
                </p>
                <p className="text-[10px] text-gray-400">{selectedDef.unit}</p>
              </div>
              <div className="p-3 bg-white border border-gray-100 rounded-xl">
                <p className="text-[10px] text-gray-500">Registros</p>
                <p className="text-lg font-bold text-gray-900">
                  {stats.count}
                </p>
                <p className="text-[10px] text-gray-400">en {dateRange} dias</p>
              </div>
            </div>
          )}

          {/* Reference range info */}
          {selectedDef.range.max < 999 && (
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
              <div className="flex items-start gap-2">
                <div className="w-3 h-3 rounded bg-emerald-200 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-emerald-800">
                    Rango de referencia
                  </p>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    {selectedDef.range.min} - {selectedDef.range.max}{" "}
                    {selectedDef.unit}. Los valores dentro de esta zona se
                    consideran normales.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick-Log Cards */}
      <div>
        <h2 className="text-sm font-semibold text-gray-900 mb-3">
          Registrar lectura
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {DASHBOARD_VITALS.map((vt) => {
            const reading = latest.vitals[vt] ?? null;
            // Compute trend from sparkline data
            const sparkValues = historyMap[vt] || [];
            let trend: "up" | "down" | "stable" = "stable";
            if (sparkValues.length >= 2) {
              const last = sparkValues[sparkValues.length - 1];
              const prev = sparkValues[sparkValues.length - 2];
              const delta = last - prev;
              const threshold = Math.abs(prev) * 0.03;
              if (delta > threshold) trend = "up";
              else if (delta < -threshold) trend = "down";
            }

            return (
              <VitalCard
                key={vt}
                vitalType={vt}
                latestReading={reading}
                trend={trend}
                onLog={handleLog}
                onViewChart={handleSelectVital}
                logging={logVital.logging}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
