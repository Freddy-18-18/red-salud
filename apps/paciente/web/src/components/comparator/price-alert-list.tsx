"use client";

import {
  Bell,
  Trash2,
  DollarSign,
  Calendar,
  Loader2,
  BellOff,
} from "lucide-react";

import { type PriceAlert } from "@/lib/services/medication-comparator-service";

// ─── Types ───────────────────────────────────────────────────────────

interface PriceAlertListProps {
  alerts: PriceAlert[];
  loading?: boolean;
  deletingId?: string | null;
  onDelete: (id: string) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("es-VE", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

const usdFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// ─── Component ───────────────────────────────────────────────────────

export function PriceAlertList({
  alerts,
  loading,
  deletingId,
  onDelete,
}: PriceAlertListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="p-3 bg-white border border-gray-100 rounded-xl animate-pulse"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-gray-200 rounded" />
                <div className="h-3 w-20 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
          <BellOff className="h-6 w-6 text-gray-400" />
        </div>
        <h4 className="text-sm font-semibold text-gray-900 mb-1">
          Sin alertas activas
        </h4>
        <p className="text-xs text-gray-500 max-w-xs">
          Configura alertas de precio para recibir notificaciones cuando un
          medicamento baje de precio
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {alerts.map((alert) => {
        const isDeleting = deletingId === alert.id;

        return (
          <div
            key={alert.id}
            className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl hover:border-gray-200 transition"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
              <Bell className="h-4 w-4 text-amber-500" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {alert.medication_name}
              </p>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                  <DollarSign className="h-3 w-3" />
                  Alerta: $ {usdFormatter.format(alert.target_price_usd)}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                  <Calendar className="h-3 w-3" />
                  {formatDate(alert.created_at)}
                </span>
              </div>
            </div>

            <button
              onClick={() => onDelete(alert.id)}
              disabled={isDeleting}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              title="Eliminar alerta"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}
