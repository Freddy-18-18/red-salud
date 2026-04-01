"use client";

import { ArrowLeft, Loader2, Clock } from "lucide-react";

import type { TimeSlotGroup } from "@/lib/services/booking-service";

interface TimeSlotGridProps {
  groups: TimeSlotGroup[];
  loading: boolean;
  selectedSlot: { start: string; end: string } | null;
  dateLabel: string;
  onSelect: (slot: { start: string; end: string }) => void;
  onBack: () => void;
  onContinue: () => void;
}

const SECTION_ICONS: Record<string, string> = {
  Manana: "🌅",
  Tarde: "☀️",
  Noche: "🌙",
};

export function TimeSlotGrid({
  groups,
  loading,
  selectedSlot,
  dateLabel,
  onSelect,
  onBack,
  onContinue,
}: TimeSlotGridProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <Loader2 className="h-8 w-8 animate-spin mb-3" />
        <p className="text-sm">Cargando horarios disponibles...</p>
      </div>
    );
  }

  const allSlots = groups.flatMap((g) => g.slots);
  const availableSlots = allSlots.filter((s) => s.available);

  return (
    <div className="space-y-5">
      <div>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          Cambiar fecha
        </button>
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          Selecciona la hora
        </h2>
        <p className="text-gray-500 text-sm">
          {availableSlots.length} horario{availableSlots.length !== 1 ? "s" : ""}{" "}
          disponible{availableSlots.length !== 1 ? "s" : ""} para {dateLabel}
        </p>
      </div>

      {availableSlots.length === 0 ? (
        <div className="text-center py-16">
          <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Sin horarios disponibles
          </h3>
          <p className="text-gray-500 mb-4">
            No hay cupos disponibles para esta fecha. Intenta con otro dia.
          </p>
          <button
            onClick={onBack}
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Elegir otra fecha
          </button>
        </div>
      ) : (
        <>
          {/* Time slot groups */}
          <div className="space-y-6">
            {groups.map((group) => {
              const available = group.slots.filter((s) => s.available);
              if (available.length === 0) return null;

              return (
                <div key={group.label}>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span>{SECTION_ICONS[group.label] || ""}</span>
                    {group.label}
                    <span className="text-gray-400 font-normal lowercase">
                      ({available.length} disponible
                      {available.length !== 1 ? "s" : ""})
                    </span>
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                    {group.slots.map((slot) => {
                      if (!slot.available) return null;

                      const isSelected =
                        selectedSlot?.start === slot.start &&
                        selectedSlot?.end === slot.end;

                      return (
                        <button
                          key={slot.start}
                          onClick={() =>
                            onSelect({ start: slot.start, end: slot.end })
                          }
                          className={`py-3 px-2 rounded-xl text-sm font-medium transition-all ${
                            isSelected
                              ? "bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-200"
                              : "border border-gray-200 text-gray-700 hover:border-emerald-300 hover:bg-emerald-50"
                          }`}
                        >
                          {slot.start}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onBack}
              className="flex-1 py-3 px-4 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition"
            >
              Atras
            </button>
            <button
              onClick={onContinue}
              disabled={!selectedSlot}
              className="flex-1 py-3 px-4 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continuar
            </button>
          </div>
        </>
      )}
    </div>
  );
}
