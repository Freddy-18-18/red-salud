"use client";

import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from "recharts";

import {
  type ChronicReading,
  NORMAL_RANGES,
} from "@/lib/services/chronic-service";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Period = "7d" | "30d" | "90d" | "6m" | "1y";

interface TrendChartProps {
  readings: ChronicReading[];
  readingType: string;
  conditionType: string;
  loading?: boolean;
  period: Period;
  onPeriodChange: (period: Period) => void;
}

/* ------------------------------------------------------------------ */
/*  Value classification for color coding                              */
/* ------------------------------------------------------------------ */

function classifyValue(
  value: number,
  readingType: string,
): "normal" | "borderline" | "danger" {
  const range = NORMAL_RANGES[readingType];
  if (!range) return "normal";

  // Danger zones (20% outside normal)
  const dangerHigh = range.max + (range.max - range.min) * 0.4;
  const dangerLow = range.min - (range.max - range.min) * 0.4;

  if (value > dangerHigh || value < dangerLow) return "danger";
  if (value > range.max || value < range.min) return "borderline";
  return "normal";
}

const CLASS_COLORS = {
  normal: "#10B981", // emerald-500
  borderline: "#F59E0B", // amber-500
  danger: "#EF4444", // red-500
};

/* ------------------------------------------------------------------ */
/*  Custom Tooltip                                                     */
/* ------------------------------------------------------------------ */

function ChartTooltip({
  active,
  payload,
  label,
  readingType,
}: {
  active?: boolean;
  payload?: Array<{ value: number; payload: Record<string, unknown> }>;
  label?: string;
  readingType: string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0];
  const value = data.value;
  const value2 = data.payload.value2 as number | null;
  const context = data.payload.context as string | null;
  const classification = classifyValue(value, readingType);
  const range = NORMAL_RANGES[readingType];

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="text-gray-500 text-xs mb-1">{label}</p>
      <p className={`text-lg font-bold`} style={{ color: CLASS_COLORS[classification] }}>
        {readingType === "blood_pressure" && value2 != null
          ? `${Math.round(value)}/${Math.round(value2)} mmHg`
          : `${Number.isInteger(value) ? value : value.toFixed(1)} ${range?.unit ?? ""}`}
      </p>
      {context && (
        <p className="text-xs text-gray-400 mt-0.5 capitalize">{context.replace("_", " ")}</p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Period Selector                                                    */
/* ------------------------------------------------------------------ */

const PERIODS: { value: Period; label: string }[] = [
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
  { value: "90d", label: "3M" },
  { value: "6m", label: "6M" },
  { value: "1y", label: "1A" },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function TrendChart({
  readings,
  readingType,
  loading = false,
  period,
  onPeriodChange,
}: TrendChartProps) {
  const range = NORMAL_RANGES[readingType];

  // Transform data for Recharts
  const chartData = useMemo(() => {
    return readings.map((r) => ({
      date: new Date(r.measured_at).toLocaleDateString("es-VE", {
        day: "2-digit",
        month: "short",
      }),
      value: r.value,
      value2: r.value2,
      context: r.context,
      classification: classifyValue(r.value, readingType),
    }));
  }, [readings, readingType]);

  // Compute domain
  const [yMin, yMax] = useMemo(() => {
    if (chartData.length === 0 && range) {
      return [range.min * 0.8, range.max * 1.2];
    }
    if (chartData.length === 0) return [0, 100];

    const values = chartData.map((d) => d.value);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const padding = (maxVal - minVal) * 0.15 || 10;

    let lo = minVal - padding;
    let hi = maxVal + padding;

    // Include range bounds if they exist
    if (range) {
      lo = Math.min(lo, range.min - padding);
      hi = Math.max(hi, range.max + padding);
    }

    return [Math.max(0, lo), hi];
  }, [chartData, range]);

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div className="h-5 w-32 bg-gray-100 rounded animate-pulse" />
          <div className="flex gap-1">
            {PERIODS.map((p) => (
              <div key={p.value} className="h-7 w-10 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </div>
        <div className="h-64 bg-gray-50 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header with period selector */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-700">
          Tendencia de lecturas
        </h4>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => onPeriodChange(p.value)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                period === p.value
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      {chartData.length === 0 ? (
        <div className="h-48 flex items-center justify-center bg-gray-50 rounded-xl">
          <p className="text-sm text-gray-400">
            Sin datos para este periodo. Registra tu primera lectura.
          </p>
        </div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
            >
              <defs>
                <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#F3F4F6"
                vertical={false}
              />

              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                tickLine={false}
                axisLine={{ stroke: "#E5E7EB" }}
              />

              <YAxis
                domain={[yMin, yMax]}
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                tickLine={false}
                axisLine={false}
              />

              <Tooltip
                content={
                  <ChartTooltip readingType={readingType} />
                }
              />

              {/* Normal range band */}
              {range && (
                <>
                  <ReferenceLine
                    y={range.max}
                    stroke="#10B981"
                    strokeDasharray="4 4"
                    strokeOpacity={0.5}
                    label={{
                      value: `Max ${range.max}`,
                      position: "insideTopRight",
                      fill: "#10B981",
                      fontSize: 10,
                    }}
                  />
                  <ReferenceLine
                    y={range.min}
                    stroke="#10B981"
                    strokeDasharray="4 4"
                    strokeOpacity={0.5}
                    label={{
                      value: `Min ${range.min}`,
                      position: "insideBottomRight",
                      fill: "#10B981",
                      fontSize: 10,
                    }}
                  />
                </>
              )}

              <Area
                type="monotone"
                dataKey="value"
                fill="url(#valueGradient)"
                stroke="none"
              />

              <Line
                type="monotone"
                dataKey="value"
                stroke="#10B981"
                strokeWidth={2.5}
                dot={(props: Record<string, unknown>) => {
                  const { cx, cy, payload } = props as {
                    cx: number;
                    cy: number;
                    payload: { classification: string };
                  };
                  const color =
                    CLASS_COLORS[
                      payload.classification as keyof typeof CLASS_COLORS
                    ] || CLASS_COLORS.normal;
                  return (
                    <circle
                      key={`${cx}-${cy}`}
                      cx={cx}
                      cy={cy}
                      r={4}
                      fill={color}
                      stroke="white"
                      strokeWidth={2}
                    />
                  );
                }}
                activeDot={{
                  r: 6,
                  stroke: "#10B981",
                  strokeWidth: 2,
                  fill: "white",
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Legend */}
      {range && (
        <div className="flex items-center gap-4 text-xs text-gray-500 justify-center">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            Normal ({range.min}-{range.max} {range.unit})
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            Limite
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            Fuera de rango
          </span>
        </div>
      )}
    </div>
  );
}
