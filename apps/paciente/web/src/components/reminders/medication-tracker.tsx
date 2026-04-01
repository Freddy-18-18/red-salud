"use client";

import {
  Pill,
  Check,
  Clock,
  X,
  Flame,
  ChevronDown,
  ChevronUp,
  Plus,
} from "lucide-react";
import { useState } from "react";

import type { TodayMedicationEntry } from "@/hooks/use-reminders";

interface MedicationTrackerProps {
  entries: TodayMedicationEntry[];
  adherence: number;
  streak: number;
  loading: boolean;
  onMarkTaken: (reminderId: string, scheduledAt: string) => Promise<unknown>;
  onAddNew: () => void;
}

export function MedicationTracker({
  entries,
  adherence,
  streak,
  loading,
  onMarkTaken,
  onAddNew,
}: MedicationTrackerProps) {
  const [expanded, setExpanded] = useState(true);
  const [marking, setMarking] = useState<string | null>(null);

  const handleMark = async (reminderId: string, scheduledAt: string) => {
    setMarking(`${reminderId}-${scheduledAt}`);
    await onMarkTaken(reminderId, scheduledAt);
    setMarking(null);
  };

  const takenCount = entries.filter((e) => e.status === "taken").length;
  const totalCount = entries.length;

  if (loading) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="skeleton w-10 h-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-36" />
            <div className="skeleton h-3 w-24" />
          </div>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-14 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <Pill className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900 text-sm">
              Medicamentos
            </h3>
            <p className="text-xs text-gray-500">
              {takenCount}/{totalCount} tomados hoy
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {streak > 0 && (
            <span className="flex items-center gap-1 text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
              <Flame className="h-3 w-3" />
              {streak}d
            </span>
          )}
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Adherence bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  adherence >= 80
                    ? "bg-emerald-500"
                    : adherence >= 50
                      ? "bg-amber-500"
                      : "bg-red-500"
                }`}
                style={{ width: `${adherence}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-gray-700 min-w-[3rem] text-right">
              {adherence}%
            </span>
          </div>
          <p className="text-xs text-gray-400">Adherencia esta semana</p>

          {/* Medication entries */}
          {entries.length === 0 ? (
            <div className="text-center py-6">
              <Pill className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                No tienes medicamentos configurados
              </p>
              <button
                type="button"
                onClick={onAddNew}
                className="mt-2 text-sm text-emerald-600 font-medium hover:text-emerald-700"
              >
                Agregar medicamento
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {entries.map((entry) => {
                const key = `${entry.reminder.id}-${entry.scheduledAt}`;
                const isMarking = marking === key;

                return (
                  <div
                    key={key}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                      entry.status === "taken"
                        ? "bg-emerald-50 border-emerald-100"
                        : entry.status === "missed"
                          ? "bg-red-50 border-red-100"
                          : "bg-gray-50 border-gray-100"
                    }`}
                  >
                    {/* Time */}
                    <span className="text-sm font-mono font-medium text-gray-600 min-w-[4rem]">
                      {entry.scheduledTime}
                    </span>

                    {/* Medication info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {entry.reminder.medication_name}
                      </p>
                      {entry.reminder.dosage && (
                        <p className="text-xs text-gray-500">
                          {entry.reminder.dosage}
                        </p>
                      )}
                    </div>

                    {/* Status / Action */}
                    {entry.status === "taken" ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full">
                        <Check className="h-3 w-3" />
                        Tomada
                      </span>
                    ) : entry.status === "missed" ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-red-700 bg-red-100 px-2 py-1 rounded-full">
                        <X className="h-3 w-3" />
                        Perdida
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={isMarking}
                        onClick={() =>
                          handleMark(entry.reminder.id, entry.scheduledAt)
                        }
                        className="flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-100 px-3 py-1.5 rounded-full hover:bg-blue-200 transition-colors disabled:opacity-50"
                      >
                        {isMarking ? (
                          <span className="inline-block w-3 h-3 border-2 border-blue-700 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Clock className="h-3 w-3" />
                        )}
                        {isMarking ? "..." : "Tomar"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Add button */}
          {entries.length > 0 && (
            <button
              type="button"
              onClick={onAddNew}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-sm text-gray-500 hover:text-emerald-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              Agregar medicamento
            </button>
          )}
        </div>
      )}
    </div>
  );
}
