"use client";

import { TrendingUp, TrendingDown, Minus, ArrowRight } from "lucide-react";

import type { MonitoredParameter } from "@/lib/services/lab-results-service";

function TrendIcon({ trend }: { trend: "up" | "down" | "stable" }) {
  switch (trend) {
    case "up":
      return <TrendingUp className="h-4 w-4" />;
    case "down":
      return <TrendingDown className="h-4 w-4" />;
    default:
      return <Minus className="h-4 w-4" />;
  }
}

function TrendLabel({ trend }: { trend: "up" | "down" | "stable" }) {
  switch (trend) {
    case "up":
      return "Subiendo";
    case "down":
      return "Bajando";
    default:
      return "Estable";
  }
}

const STATUS_COLORS: Record<string, { dot: string; bar: string }> = {
  normal: { dot: "bg-emerald-500", bar: "bg-emerald-500" },
  alto: { dot: "bg-amber-500", bar: "bg-amber-500" },
  bajo: { dot: "bg-amber-500", bar: "bg-amber-500" },
  critico: { dot: "bg-red-500", bar: "bg-red-500" },
};

interface ParameterCardProps {
  parameter: MonitoredParameter;
}

export function ParameterCard({ parameter }: ParameterCardProps) {
  const colors = STATUS_COLORS[parameter.latest_status] || STATUS_COLORS.normal;

  // Calculate bar percentage relative to reference range
  const rangeSize = parameter.reference_max - parameter.reference_min;
  // Allow bar to go slightly beyond reference range for visual clarity
  const extendedMin = parameter.reference_min - rangeSize * 0.2;
  const extendedMax = parameter.reference_max + rangeSize * 0.2;
  const extendedRange = extendedMax - extendedMin;
  const barPercent = Math.max(
    0,
    Math.min(
      100,
      ((parameter.latest_value - extendedMin) / extendedRange) * 100,
    ),
  );
  // Reference range zone in the bar
  const refStartPercent =
    ((parameter.reference_min - extendedMin) / extendedRange) * 100;
  const refEndPercent =
    ((parameter.reference_max - extendedMin) / extendedRange) * 100;

  const statusLabel =
    parameter.latest_status === "normal"
      ? "Normal"
      : parameter.latest_status === "alto"
        ? "Alto"
        : parameter.latest_status === "bajo"
          ? "Bajo"
          : "Critico";

  return (
    <a
      href={`/dashboard/laboratorio/tendencias?parametro=${encodeURIComponent(parameter.parameter_name)}`}
      className="block p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md hover:border-emerald-200 transition-all group"
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-semibold text-gray-900 text-sm">
            {parameter.parameter_name}
          </h3>
          <p className="text-xs text-gray-500">
            Ref: {parameter.reference_min}-{parameter.reference_max}{" "}
            {parameter.unit}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 text-xs font-medium ${
              parameter.latest_status === "normal"
                ? "text-emerald-600"
                : parameter.latest_status === "critico"
                  ? "text-red-600"
                  : "text-amber-600"
            }`}
          >
            <TrendIcon trend={parameter.trend} />
            <TrendLabel trend={parameter.trend} />
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl font-bold text-gray-900">
          {parameter.latest_value}
        </span>
        <span className="text-sm text-gray-500">{parameter.unit}</span>
        <span
          className={`ml-auto px-2 py-0.5 text-xs font-medium rounded-full ${
            parameter.latest_status === "normal"
              ? "bg-emerald-50 text-emerald-700"
              : parameter.latest_status === "critico"
                ? "bg-red-50 text-red-700"
                : "bg-amber-50 text-amber-700"
          }`}
        >
          {statusLabel}
        </span>
      </div>

      {/* Mini bar visualization */}
      <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
        {/* Reference range zone */}
        <div
          className="absolute top-0 bottom-0 bg-emerald-100 rounded-full"
          style={{
            left: `${refStartPercent}%`,
            width: `${refEndPercent - refStartPercent}%`,
          }}
        />
        {/* Value marker */}
        <div
          className={`absolute top-0 bottom-0 w-1 rounded-full ${colors.bar}`}
          style={{ left: `${barPercent}%` }}
        />
        {/* Value dot */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow-sm ${colors.dot}`}
          style={{ left: `calc(${barPercent}% - 6px)` }}
        />
      </div>
      <div className="flex items-center justify-between mt-1.5">
        <span className="text-[10px] text-gray-400">
          {parameter.reference_min}
        </span>
        <span className="text-[10px] text-gray-400">
          {parameter.reference_max}
        </span>
      </div>

      {/* CTA */}
      <div className="flex items-center gap-1 mt-3 text-xs font-medium text-emerald-600 group-hover:text-emerald-700">
        Ver grafico
        <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </a>
  );
}
