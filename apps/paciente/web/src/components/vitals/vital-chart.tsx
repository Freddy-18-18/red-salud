"use client";

import { useState, useMemo } from "react";

import type { VitalReading, VitalRange } from "@/lib/services/vitals-service";

// ─── Types ───────────────────────────────────────────────────────────────────

interface VitalChartProps {
  readings: VitalReading[];
  range: VitalRange;
  label: string;
  unit: string;
  /** Height in pixels */
  height?: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

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
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export function VitalChart({
  readings,
  range,
  label,
  unit,
  height = 256,
}: VitalChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const { chartMin, chartMax, yLabels, refTopPct, refHeightPct } = useMemo(() => {
    if (readings.length === 0) {
      return {
        chartMin: range.min * 0.8,
        chartMax: range.max * 1.2,
        yLabels: [] as number[],
        refTopPct: 0,
        refHeightPct: 100,
      };
    }

    const allValues = readings.map((r) => r.value);
    const dataMin = Math.min(...allValues, range.min);
    const dataMax = Math.max(...allValues, range.max);
    const padding = (dataMax - dataMin) * 0.15 || 10;
    const min = Math.floor(dataMin - padding);
    const max = Math.ceil(dataMax + padding);
    const rangeSpan = max - min;

    // 5 Y-axis labels
    const step = rangeSpan / 4;
    const labels = Array.from({ length: 5 }, (_, i) =>
      Math.round((min + step * i) * 10) / 10,
    ).reverse();

    // Reference zone percentages
    const topPct = ((max - range.max) / rangeSpan) * 100;
    const heightPct = ((range.max - range.min) / rangeSpan) * 100;

    return {
      chartMin: min,
      chartMax: max,
      yLabels: labels,
      refTopPct: topPct,
      refHeightPct: heightPct,
    };
  }, [readings, range]);

  const rangeSpan = chartMax - chartMin;

  // Build SVG polyline points for the line
  const linePoints = useMemo(() => {
    if (readings.length === 0) return "";

    return readings
      .map((reading, i) => {
        const x =
          readings.length === 1 ? 50 : (i / (readings.length - 1)) * 100;
        const y = 100 - ((reading.value - chartMin) / rangeSpan) * 100;
        return `${x},${y}`;
      })
      .join(" ");
  }, [readings, chartMin, rangeSpan]);

  // Area fill path (under the line)
  const areaPath = useMemo(() => {
    if (readings.length === 0) return "";

    const points = readings.map((reading, i) => {
      const x =
        readings.length === 1 ? 50 : (i / (readings.length - 1)) * 100;
      const y = 100 - ((reading.value - chartMin) / rangeSpan) * 100;
      return { x, y };
    });

    const firstX = points[0].x;
    const lastX = points[points.length - 1].x;

    let path = `M ${firstX} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    path += ` L ${lastX} 100 L ${firstX} 100 Z`;

    return path;
  }, [readings, chartMin, rangeSpan]);

  if (readings.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-sm text-gray-400"
        style={{ height }}
      >
        No hay datos para graficar
      </div>
    );
  }

  return (
    <div className="select-none">
      {/* Chart header */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-900">
          {label}
          <span className="text-xs text-gray-400 ml-1.5 font-normal">
            ({unit})
          </span>
        </h4>
        <div className="flex items-center gap-2 text-[10px] text-gray-400">
          <span className="flex items-center gap-1">
            <span className="w-3 h-2 bg-emerald-100 border border-emerald-200 rounded-sm" />
            Rango normal
          </span>
        </div>
      </div>

      <div className="flex gap-0">
        {/* Y axis labels */}
        <div
          className="flex flex-col justify-between pr-2 text-right flex-shrink-0 w-10"
          style={{ height }}
        >
          {yLabels.map((label, i) => (
            <span key={i} className="text-[10px] text-gray-400 leading-none">
              {label}
            </span>
          ))}
        </div>

        {/* Chart area */}
        <div
          className="flex-1 relative border-l border-b border-gray-200"
          style={{ height }}
        >
          {/* Reference range zone */}
          {range.max < 999 && (
            <div
              className="absolute left-0 right-0 bg-emerald-50 border-y border-emerald-100 z-0"
              style={{
                top: `${refTopPct}%`,
                height: `${refHeightPct}%`,
              }}
            />
          )}

          {/* Horizontal grid lines */}
          {yLabels.map((_, i) => (
            <div
              key={i}
              className="absolute left-0 right-0 border-t border-gray-50"
              style={{ top: `${(i / (yLabels.length - 1)) * 100}%` }}
            />
          ))}

          {/* SVG chart */}
          <svg
            className="absolute inset-0 w-full h-full z-[5] pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {/* Area fill */}
            <path d={areaPath} fill="rgba(16, 185, 129, 0.08)" />

            {/* Line */}
            <polyline
              points={linePoints}
              fill="none"
              stroke="#10b981"
              strokeWidth="0.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {/* Interactive data points */}
          {readings.map((reading, i) => {
            const x =
              readings.length === 1
                ? 50
                : (i / (readings.length - 1)) * 100;
            const y = ((reading.value - chartMin) / rangeSpan) * 100;
            const isHovered = hoveredIndex === i;

            const isInRange =
              reading.value >= range.min && reading.value <= range.max;
            const dotColor = isInRange ? "bg-emerald-500" : "bg-red-500";
            const ringColor = isInRange ? "ring-emerald-200" : "ring-red-200";

            return (
              <div
                key={reading.id || i}
                className="absolute z-10"
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
                <div
                  className={`w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm cursor-pointer transition-all ${dotColor} ${
                    isHovered ? `ring-4 ${ringColor} scale-150` : ""
                  }`}
                />

                {/* Tooltip */}
                {isHovered && (
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg z-20 pointer-events-none">
                    <p className="font-semibold">
                      {reading.value} {unit}
                    </p>
                    <p className="text-gray-300">
                      {formatFullDate(reading.measured_at)}
                    </p>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Reference range labels */}
          {range.max < 999 && (
            <>
              <div
                className="absolute right-1 text-[9px] text-emerald-600 font-medium z-0"
                style={{
                  top: `${refTopPct}%`,
                  transform: "translateY(-100%)",
                }}
              >
                {range.max}
              </div>
              <div
                className="absolute right-1 text-[9px] text-emerald-600 font-medium z-0"
                style={{ top: `${refTopPct + refHeightPct}%` }}
              >
                {range.min}
              </div>
            </>
          )}
        </div>
      </div>

      {/* X axis labels */}
      <div className="flex justify-between ml-10 mt-1">
        {readings.length <= 8
          ? readings.map((r, i) => (
              <span
                key={i}
                className="text-[10px] text-gray-400 text-center"
                style={{ width: `${100 / readings.length}%` }}
              >
                {formatDate(r.measured_at)}
              </span>
            ))
          : [0, Math.floor(readings.length / 2), readings.length - 1].map(
              (idx) => (
                <span key={idx} className="text-[10px] text-gray-400">
                  {formatDate(readings[idx].measured_at)}
                </span>
              ),
            )}
      </div>
    </div>
  );
}

// ─── Mini Sparkline ──────────────────────────────────────────────────────────

interface SparklineProps {
  values: number[];
  range: VitalRange;
  width?: number;
  height?: number;
}

export function Sparkline({
  values,
  range,
  width = 80,
  height = 28,
}: SparklineProps) {
  if (values.length < 2) {
    return (
      <svg width={width} height={height} className="text-gray-200">
        <line
          x1="0"
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="3,3"
        />
      </svg>
    );
  }

  const allValues = [...values, range.min, range.max];
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const rangeSpan = max - min || 1;
  const padding = 2;

  const points = values
    .map((v, i) => {
      const x = padding + (i / (values.length - 1)) * (width - padding * 2);
      const y =
        padding + (1 - (v - min) / rangeSpan) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  // Reference band
  const refTop =
    padding + (1 - (range.max - min) / rangeSpan) * (height - padding * 2);
  const refBottom =
    padding + (1 - (range.min - min) / rangeSpan) * (height - padding * 2);
  const refHeight = refBottom - refTop;

  const latestValue = values[values.length - 1];
  const inRange = latestValue >= range.min && latestValue <= range.max;
  const lineColor = inRange ? "#10b981" : "#ef4444";

  return (
    <svg width={width} height={height}>
      {/* Reference band */}
      {range.max < 999 && (
        <rect
          x={0}
          y={refTop}
          width={width}
          height={Math.max(refHeight, 1)}
          fill="#10b981"
          fillOpacity="0.08"
        />
      )}

      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke={lineColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Latest point */}
      {(() => {
        const lastX =
          padding +
          ((values.length - 1) / (values.length - 1)) * (width - padding * 2);
        const lastY =
          padding +
          (1 - (latestValue - min) / rangeSpan) * (height - padding * 2);
        return (
          <circle
            cx={lastX}
            cy={lastY}
            r="2.5"
            fill={lineColor}
            stroke="white"
            strokeWidth="1"
          />
        );
      })()}
    </svg>
  );
}
