"use client";

import type { LabOrder } from "@/lib/services/lab-results-service";
import {
  FlaskConical,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
} from "lucide-react";

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; icon: typeof CheckCircle2 }
> = {
  ordenada: {
    label: "Ordenada",
    bg: "bg-gray-50",
    text: "text-gray-600",
    icon: Clock,
  },
  muestra_tomada: {
    label: "Muestra tomada",
    bg: "bg-blue-50",
    text: "text-blue-700",
    icon: Clock,
  },
  en_proceso: {
    label: "En proceso",
    bg: "bg-amber-50",
    text: "text-amber-700",
    icon: Clock,
  },
  completada: {
    label: "Resultados listos",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    icon: CheckCircle2,
  },
  cancelada: {
    label: "Cancelada",
    bg: "bg-red-50",
    text: "text-red-700",
    icon: AlertCircle,
  },
};

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("es-VE", {
      day: "2-digit",
      month: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

interface OrderCardProps {
  order: LabOrder;
}

export function OrderCard({ order }: OrderCardProps) {
  const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.ordenada;
  const StatusIcon = config.icon;
  const testNames = (order.tests || [])
    .map((t) => t.test_type?.name)
    .filter(Boolean)
    .join(" + ");

  return (
    <a
      href={`/dashboard/laboratorio/${order.id}`}
      className="block p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md hover:border-emerald-200 transition-all group"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
          <FlaskConical className="h-6 w-6 text-indigo-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm truncate">
                {testNames || "Examenes de laboratorio"}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5 truncate">
                {(order.laboratory as Record<string, unknown>)?.name as string ||
                  "Laboratorio"}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${config.bg} ${config.text}`}
              >
                <StatusIcon className="h-3 w-3" />
                {config.label}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(order.ordered_at)}
            </div>
            {order.doctor?.nombre_completo && (
              <span className="truncate">
                Dr. {order.doctor.nombre_completo}
              </span>
            )}
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-emerald-500 transition-colors flex-shrink-0 mt-1" />
      </div>
    </a>
  );
}
