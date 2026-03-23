"use client";

import type { LabResultValue } from "@/lib/services/lab-results-service";
import { ArrowUp, ArrowDown, Minus, AlertTriangle } from "lucide-react";

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string }
> = {
  normal: {
    label: "Normal",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  alto: {
    label: "Alto",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  bajo: {
    label: "Bajo",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  critico: {
    label: "Critico",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
  },
};

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "alto":
      return <ArrowUp className="h-3 w-3" />;
    case "bajo":
      return <ArrowDown className="h-3 w-3" />;
    case "critico":
      return <AlertTriangle className="h-3 w-3" />;
    default:
      return <Minus className="h-3 w-3" />;
  }
}

interface ResultTableProps {
  values: LabResultValue[];
  compact?: boolean;
}

export function ResultTable({ values, compact = false }: ResultTableProps) {
  if (values.length === 0) {
    return (
      <p className="text-sm text-gray-500 py-4 text-center">
        No hay valores disponibles
      </p>
    );
  }

  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left py-2 px-4 text-xs font-medium text-gray-500">
              Parametro
            </th>
            <th className="text-right py-2 px-4 text-xs font-medium text-gray-500">
              Valor
            </th>
            {!compact && (
              <th className="text-right py-2 px-4 text-xs font-medium text-gray-500 hidden sm:table-cell">
                Referencia
              </th>
            )}
            <th className="text-center py-2 px-4 text-xs font-medium text-gray-500">
              Estado
            </th>
          </tr>
        </thead>
        <tbody>
          {values.map((val) => {
            const config = STATUS_CONFIG[val.status] || STATUS_CONFIG.normal;
            return (
              <tr
                key={val.id}
                className={`border-b border-gray-50 ${val.status === "critico" ? "bg-red-50/30" : ""}`}
              >
                <td className="py-2.5 px-4">
                  <span className="font-medium text-gray-900">
                    {val.parameter_name}
                  </span>
                  {compact && (
                    <span className="text-xs text-gray-400 ml-1 sm:hidden">
                      ({val.reference_min}-{val.reference_max})
                    </span>
                  )}
                </td>
                <td className="py-2.5 px-4 text-right">
                  <span className={`font-semibold ${config.text}`}>
                    {val.value}
                  </span>
                  <span className="text-xs text-gray-400 ml-1">{val.unit}</span>
                </td>
                {!compact && (
                  <td className="py-2.5 px-4 text-right text-xs text-gray-500 hidden sm:table-cell">
                    {val.reference_min} - {val.reference_max} {val.unit}
                  </td>
                )}
                <td className="py-2.5 px-4 text-center">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${config.bg} ${config.text}`}
                  >
                    <StatusIcon status={val.status} />
                    {config.label}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
