"use client";

import { useState } from "react";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Filter,
  Clock,
} from "lucide-react";
import type { RewardTransaction } from "@/lib/services/rewards-service";

interface PointsHistoryProps {
  transactions: RewardTransaction[];
}

type FilterType = "all" | "earned" | "redeemed";

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Ahora";
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `Hace ${diffDays} dias`;

  return date.toLocaleDateString("es-VE", {
    day: "numeric",
    month: "short",
  });
}

export function PointsHistory({ transactions }: PointsHistoryProps) {
  const [filter, setFilter] = useState<FilterType>("all");

  const filtered = transactions.filter((t) => {
    if (filter === "earned") return t.points > 0;
    if (filter === "redeemed") return t.points < 0;
    return true;
  });

  // Running total
  let runningTotal = 0;
  const withRunning = [...filtered].reverse().map((t) => {
    runningTotal += t.points;
    return { ...t, runningTotal };
  });
  withRunning.reverse();

  const FILTER_OPTIONS: { key: FilterType; label: string }[] = [
    { key: "all", label: "Todos" },
    { key: "earned", label: "Ganados" },
    { key: "redeemed", label: "Canjeados" },
  ];

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">
          Historial de Puntos
        </h3>
        <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-0.5">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setFilter(opt.key)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                filter === opt.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">
            {filter === "all"
              ? "Aun no tenes transacciones"
              : filter === "earned"
                ? "No ganaste puntos todavia"
                : "No canjeaste puntos todavia"}
          </p>
        </div>
      ) : (
        <div className="space-y-1 max-h-80 overflow-y-auto">
          {filtered.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  tx.points > 0
                    ? "bg-emerald-50 text-emerald-500"
                    : "bg-red-50 text-red-500"
                }`}
              >
                {tx.points > 0 ? (
                  <ArrowUpCircle className="h-4 w-4" />
                ) : (
                  <ArrowDownCircle className="h-4 w-4" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 truncate">
                  {tx.description}
                </p>
                <p className="text-xs text-gray-400">
                  {formatRelativeDate(tx.created_at)}
                </p>
              </div>

              <span
                className={`text-sm font-semibold flex-shrink-0 ${
                  tx.points > 0 ? "text-emerald-600" : "text-red-500"
                }`}
              >
                {tx.points > 0 ? "+" : ""}
                {tx.points}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
