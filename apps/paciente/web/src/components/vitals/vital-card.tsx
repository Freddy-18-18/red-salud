"use client";

import {
  Heart,
  Activity,
  Thermometer,
  Droplet,
  Wind,
  Scale,
  TrendingUp,
  TrendingDown,
  Minus,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

import {
  VITAL_DEFINITIONS,
  getVitalStatus,
  type VitalType,
  type VitalReading,
} from "@/lib/services/vitals-service";

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

const STATUS_BG: Record<string, string> = {
  normal: "bg-emerald-50 border-emerald-100",
  borderline: "bg-amber-50 border-amber-100",
  abnormal: "bg-red-50 border-red-100",
};

const STATUS_ICON_BG: Record<string, string> = {
  normal: "bg-emerald-100 text-emerald-600",
  borderline: "bg-amber-100 text-amber-600",
  abnormal: "bg-red-100 text-red-600",
};

const STATUS_VALUE_COLOR: Record<string, string> = {
  normal: "text-emerald-700",
  borderline: "text-amber-700",
  abnormal: "text-red-700",
};

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  normal: {
    label: "Normal",
    className: "bg-emerald-100 text-emerald-700",
  },
  borderline: {
    label: "Limite",
    className: "bg-amber-100 text-amber-700",
  },
  abnormal: {
    label: "Fuera de rango",
    className: "bg-red-100 text-red-700",
  },
};

// ─── Props ───────────────────────────────────────────────────────────────────

interface VitalCardProps {
  vitalType: VitalType;
  latestReading: VitalReading | null;
  trend?: "up" | "down" | "stable";
  onLog: (vitalType: VitalType, value: number) => Promise<void>;
  onViewChart?: (vitalType: VitalType) => void;
  logging?: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function VitalCard({
  vitalType,
  latestReading,
  trend = "stable",
  onLog,
  onViewChart,
  logging = false,
}: VitalCardProps) {
  const [inputValue, setInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const def = VITAL_DEFINITIONS[vitalType];
  const Icon = ICON_MAP[def.icon] || Activity;

  const currentValue = latestReading?.value ?? null;
  const status = currentValue !== null ? getVitalStatus(vitalType, currentValue) : "normal";
  const badge = STATUS_BADGE[status];

  const handleSubmit = async () => {
    const numValue = parseFloat(inputValue);
    if (isNaN(numValue) || numValue <= 0) return;

    setIsSubmitting(true);
    try {
      await onLog(vitalType, numValue);
      setInputValue("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  const trendLabel =
    trend === "up" ? "Subiendo" : trend === "down" ? "Bajando" : "Estable";

  const formattedDate = latestReading
    ? new Date(latestReading.measured_at).toLocaleDateString("es-VE", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div
      className={`rounded-xl border p-4 transition-all ${
        currentValue !== null ? STATUS_BG[status] : "bg-white border-gray-100"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center ${
              currentValue !== null
                ? STATUS_ICON_BG[status]
                : "bg-gray-100 text-gray-400"
            }`}
          >
            <Icon className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{def.label}</p>
            <p className="text-[10px] text-gray-400">
              Rango: {def.range.min} - {def.range.max} {def.unit}
            </p>
          </div>
        </div>

        {currentValue !== null && (
          <span
            className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${badge.className}`}
          >
            {badge.label}
          </span>
        )}
      </div>

      {/* Current Value */}
      {currentValue !== null ? (
        <div className="flex items-end justify-between mb-3">
          <div>
            <p
              className={`text-2xl font-bold ${STATUS_VALUE_COLOR[status]}`}
            >
              {currentValue}
              <span className="text-sm font-normal text-gray-400 ml-1">
                {def.unit}
              </span>
            </p>
            {formattedDate && (
              <p className="text-[10px] text-gray-400 mt-0.5">
                {formattedDate}
              </p>
            )}
          </div>

          <button
            onClick={() => onViewChart?.(vitalType)}
            className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-700 transition-colors"
          >
            <TrendIcon className="h-3.5 w-3.5" />
            <span>{trendLabel}</span>
          </button>
        </div>
      ) : (
        <div className="mb-3">
          <p className="text-sm text-gray-400">Sin registros</p>
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="number"
          inputMode="decimal"
          step="any"
          placeholder={`Ej: ${Math.round((def.range.min + def.range.max) / 2)}`}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder:text-gray-300"
        />
        <button
          onClick={handleSubmit}
          disabled={!inputValue || isSubmitting || logging}
          className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
        >
          {isSubmitting || logging ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            "Registrar"
          )}
        </button>
      </div>
    </div>
  );
}
