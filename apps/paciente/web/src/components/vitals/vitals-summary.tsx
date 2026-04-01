"use client";

import {
  Heart,
  Activity,
  Thermometer,
  Droplet,
  Wind,
  Scale,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";

import {
  VITAL_DEFINITIONS,
  DASHBOARD_VITALS,
  getVitalStatus,
  type VitalType,
  type VitalReading,
} from "@/lib/services/vitals-service";

import { Sparkline } from "./vital-chart";

// ─── Icon Mapping ────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, LucideIcon> = {
  heart: Heart,
  activity: Activity,
  thermometer: Thermometer,
  droplet: Droplet,
  wind: Wind,
  scale: Scale,
  lungs: Wind,
};

// ─── Status Colors ───────────────────────────────────────────────────────────

const STATUS_DOT: Record<string, string> = {
  normal: "bg-emerald-500",
  borderline: "bg-amber-500",
  abnormal: "bg-red-500",
};

// ─── Props ───────────────────────────────────────────────────────────────────

interface VitalsSummaryProps {
  latestVitals: Record<VitalType, VitalReading | null>;
  /** History values per vital type (last N readings) for sparklines */
  historyMap?: Record<VitalType, number[]>;
  onSelectVital?: (vitalType: VitalType) => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function VitalsSummary({
  latestVitals,
  historyMap = {} as Record<VitalType, number[]>,
  onSelectVital,
}: VitalsSummaryProps) {
  // Collect alerts (out-of-range values)
  const alerts: { vitalType: VitalType; value: number; status: string }[] = [];

  for (const vt of DASHBOARD_VITALS) {
    const reading = latestVitals[vt];
    if (!reading) continue;
    const status = getVitalStatus(vt, reading.value);
    if (status !== "normal") {
      alerts.push({ vitalType: vt, value: reading.value, status });
    }
  }

  return (
    <div className="space-y-4">
      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <p className="text-sm font-semibold text-red-800">
              Valores fuera de rango
            </p>
          </div>
          <div className="space-y-1.5">
            {alerts.map((alert) => {
              const def = VITAL_DEFINITIONS[alert.vitalType];
              return (
                <button
                  key={alert.vitalType}
                  onClick={() => onSelectVital?.(alert.vitalType)}
                  className="w-full flex items-center justify-between text-left px-2 py-1.5 rounded-lg hover:bg-red-100/50 transition-colors"
                >
                  <span className="text-xs text-red-700">{def.label}</span>
                  <span className="text-xs font-semibold text-red-800">
                    {alert.value} {def.unit}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {DASHBOARD_VITALS.map((vt) => {
          const def = VITAL_DEFINITIONS[vt];
          const reading = latestVitals[vt];
          const Icon = ICON_MAP[def.icon] || Activity;
          const value = reading?.value ?? null;
          const status =
            value !== null ? getVitalStatus(vt, value) : "normal";
          const sparkValues = historyMap[vt] || [];

          const formattedDate = reading
            ? new Date(reading.measured_at).toLocaleDateString("es-VE", {
                day: "2-digit",
                month: "short",
              })
            : null;

          return (
            <button
              key={vt}
              onClick={() => onSelectVital?.(vt)}
              className="bg-white border border-gray-100 rounded-xl p-3 text-left hover:border-gray-200 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                  <span className="text-[10px] font-medium text-gray-500 truncate">
                    {def.label}
                  </span>
                </div>
                {value !== null && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[status]}`}
                  />
                )}
              </div>

              {value !== null ? (
                <>
                  <p className="text-lg font-bold text-gray-900">
                    {value}
                    <span className="text-[10px] font-normal text-gray-400 ml-0.5">
                      {def.unit}
                    </span>
                  </p>

                  {/* Sparkline */}
                  {sparkValues.length >= 2 && (
                    <div className="mt-1.5">
                      <Sparkline
                        values={sparkValues}
                        range={def.range}
                        width={80}
                        height={24}
                      />
                    </div>
                  )}

                  {formattedDate && (
                    <p className="text-[9px] text-gray-300 mt-1">
                      {formattedDate}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-xs text-gray-300 mt-1">--</p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
