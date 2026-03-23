"use client";

import { useState, useMemo } from "react";
import type { ParameterHistory } from "@/lib/services/lab-results-service";

interface TrendChartProps {
  history: ParameterHistory;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("es-VE", {
      day: "2-digit",
      month: "short",
    });
  } catch {
    return dateStr;
  }
}

function formatFullDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("es-VE", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

const STATUS_COLORS: Record<string, string> = {
  normal: "bg-emerald-500",
  alto: "bg-amber-500",
  bajo: "bg-amber-500",
  critico: "bg-red-500",
};

const STATUS_RING: Record<string, string> = {
  normal: "ring-emerald-200",
  alto: "ring-amber-200",
  bajo: "ring-amber-200",
  critico: "ring-red-200",
};

export function TrendChart({ history }: TrendChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { points, reference_min, reference_max, unit } = history;

  const { chartMin, chartMax, yLabels, refTopPct, refHeightPct } =
    useMemo(() => {
      if (points.length === 0) {
        return {
          chartMin: reference_min * 0.8,
          chartMax: reference_max * 1.2,
          yLabels: [],
          refTopPct: 0,
          refHeightPct: 100,
        };
      }

      const allValues = points.map((p) => p.value);
      const dataMin = Math.min(...allValues, reference_min);
      const dataMax = Math.max(...allValues, reference_max);
      const padding = (dataMax - dataMin) * 0.15 || 10;
      const min = Math.floor(dataMin - padding);
      const max = Math.ceil(dataMax + padding);
      const range = max - min;

      // Generate 5 Y-axis labels
      const step = range / 4;
      const labels = Array.from({ length: 5 }, (_, i) =>
        Math.round(min + step * i),
      ).reverse();

      // Reference zone percentage positions
      const topPct = ((max - reference_max) / range) * 100;
      const heightPct =
        ((reference_max - reference_min) / range) * 100;

      return {
        chartMin: min,
        chartMax: max,
        yLabels: labels,
        refTopPct: topPct,
        refHeightPct: heightPct,
      };
    }, [points, reference_min, reference_max]);

  const range = chartMax - chartMin;

  if (points.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-gray-400">
        No hay datos para graficar
      </div>
    );
  }

  return (
    <div className="select-none">
      <div className="flex gap-0">
        {/* Y axis labels */}
        <div className="flex flex-col justify-between h-64 pr-2 text-right flex-shrink-0 w-12">
          {yLabels.map((label, i) => (
            <span key={i} className="text-[10px] text-gray-400 leading-none">
              {label}
            </span>
          ))}
        </div>

        {/* Chart area */}
        <div className="flex-1 relative h-64 border-l border-b border-gray-200">
          {/* Reference range zone (green) */}
          <div
            className="absolute left-0 right-0 bg-emerald-50 border-y border-emerald-100 z-0"
            style={{
              top: `${refTopPct}%`,
              height: `${refHeightPct}%`,
            }}
          />

          {/* Horizontal grid lines */}
          {yLabels.map((_, i) => (
            <div
              key={i}
              className="absolute left-0 right-0 border-t border-gray-100"
              style={{ top: `${(i / (yLabels.length - 1)) * 100}%` }}
            />
          ))}

          {/* Data points and connectors */}
          <div className="absolute inset-0 flex items-end z-10">
            {points.map((point, i) => {
              const x = points.length === 1 ? 50 : (i / (points.length - 1)) * 100;
              const y = ((point.value - chartMin) / range) * 100;
              const isHovered = hoveredIndex === i;
              const color = STATUS_COLORS[point.status] || STATUS_COLORS.normal;
              const ring = STATUS_RING[point.status] || STATUS_RING.normal;

              return (
                <div
                  key={i}
                  className="absolute group"
                  style={{
                    left: `${x}%`,
                    bottom: `${y}%`,
                    transform: "translate(-50%, 50%)",
                  }}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onTouchStart={() => setHoveredIndex(i)}
                  onTouchEnd={() => setHoveredIndex(null)}
                >
                  {/* Point */}
                  <div
                    className={`w-3 h-3 rounded-full border-2 border-white shadow-sm cursor-pointer transition-all ${color} ${
                      isHovered ? `ring-4 ${ring} scale-150` : ""
                    }`}
                  />

                  {/* Tooltip */}
                  {isHovered && (
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg z-20 pointer-events-none">
                      <p className="font-semibold">
                        {point.value} {unit}
                      </p>
                      <p className="text-gray-300">{formatFullDate(point.date)}</p>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* SVG overlay for connecting lines */}
          <svg
            className="absolute inset-0 w-full h-full z-[5] pointer-events-none"
            preserveAspectRatio="none"
          >
            {points.map((point, i) => {
              if (i >= points.length - 1) return null;
              const nextPoint = points[i + 1];

              const x1 = points.length === 1 ? 50 : (i / (points.length - 1)) * 100;
              const x2 =
                points.length === 1
                  ? 50
                  : ((i + 1) / (points.length - 1)) * 100;
              const y1 = 100 - ((point.value - chartMin) / range) * 100;
              const y2 = 100 - ((nextPoint.value - chartMin) / range) * 100;

              return (
                <line
                  key={i}
                  x1={`${x1}%`}
                  y1={`${y1}%`}
                  x2={`${x2}%`}
                  y2={`${y2}%`}
                  stroke="#94a3b8"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              );
            })}
          </svg>

          {/* Reference range labels */}
          <div
            className="absolute right-1 text-[9px] text-emerald-600 font-medium z-0"
            style={{ top: `${refTopPct}%`, transform: "translateY(-100%)" }}
          >
            {reference_max}
          </div>
          <div
            className="absolute right-1 text-[9px] text-emerald-600 font-medium z-0"
            style={{
              top: `${refTopPct + refHeightPct}%`,
            }}
          >
            {reference_min}
          </div>
        </div>
      </div>

      {/* X axis labels */}
      <div className="flex justify-between ml-12 mt-1">
        {points.length <= 8
          ? points.map((p, i) => (
              <span
                key={i}
                className="text-[10px] text-gray-400 text-center"
                style={{ width: `${100 / points.length}%` }}
              >
                {formatDate(p.date)}
              </span>
            ))
          : // Show first, middle, last for many points
            [0, Math.floor(points.length / 2), points.length - 1].map(
              (idx) => (
                <span key={idx} className="text-[10px] text-gray-400">
                  {formatDate(points[idx].date)}
                </span>
              ),
            )}
      </div>
    </div>
  );
}
