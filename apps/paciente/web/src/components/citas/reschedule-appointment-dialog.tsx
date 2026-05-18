"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Calendar,
  CalendarClock,
  Clock,
  Loader2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  bookingService,
  type TimeSlotGroup,
} from "@/lib/services/booking-service";
import type { Appointment } from "@/lib/services/appointments/appointments.types";

interface RescheduleResult {
  success: boolean;
  error: string | null;
}

interface RescheduleAppointmentDialogProps {
  appointment: Appointment;
  onConfirm: (scheduledAtIso: string) => Promise<RescheduleResult>;
  onClose: () => void;
  loading?: boolean;
}

const MAX_DAYS_AHEAD = 60;

function toDateInputValue(iso: string): string {
  // "YYYY-MM-DD" in local time. The native <input type="date"> always works in
  // local TZ, so we mirror that — converting via toISOString here would shift
  // by the user's offset and surprise them.
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function todayDateInput(): string {
  return toDateInputValue(new Date().toISOString());
}

function maxDateInput(): string {
  const d = new Date();
  d.setDate(d.getDate() + MAX_DAYS_AHEAD);
  return toDateInputValue(d.toISOString());
}

function buildScheduledAtIso(date: string, time: string): string {
  // `${date}T${time}` is parsed in the browser's local TZ. The API stores it
  // as a `timestamptz`, so toISOString() converts to UTC for the wire.
  const local = new Date(`${date}T${time}:00`);
  return local.toISOString();
}

function formatTimeLabel(time: string): string {
  // "HH:MM" → "10:30 AM" in es-VE
  const [h, m] = time.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return time;
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString("es-VE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function RescheduleAppointmentDialog({
  appointment,
  onConfirm,
  onClose,
  loading = false,
}: RescheduleAppointmentDialogProps) {
  const initialDate = useMemo(
    () => toDateInputValue(appointment.scheduled_at),
    [appointment.scheduled_at],
  );

  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const minDate = todayDateInput();
  const maxDate = maxDateInput();

  // Reset selected slot whenever date changes — slot only matches its date.
  useEffect(() => {
    setSelectedTime(null);
    setError(null);
  }, [selectedDate]);

  const slotsQuery = useQuery({
    queryKey: ["timeSlots", "groups", appointment.doctor_id, selectedDate],
    queryFn: () =>
      bookingService.getAvailableSlots(appointment.doctor_id, selectedDate),
    enabled: !!appointment.doctor_id && !!selectedDate,
  });

  const groups: TimeSlotGroup[] = slotsQuery.data ?? [];

  // ESC closes — disabled while a request is in flight to avoid orphaning a
  // half-submitted reschedule.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [loading, onClose]);

  const handleSubmit = async () => {
    if (!selectedTime) {
      setError("Selecciona un horario disponible.");
      return;
    }
    setError(null);
    const newIso = buildScheduledAtIso(selectedDate, selectedTime);
    const result = await onConfirm(newIso);
    if (!result.success) {
      setError(result.error ?? "No se pudo reagendar la cita. Intenta de nuevo.");
    }
  };

  const totalSlots = groups.reduce((sum, g) => sum + (g.slots?.length ?? 0), 0);
  const noSlots = !slotsQuery.isLoading && totalSlots === 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reschedule-dialog-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={loading ? undefined : onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-lg mx-4 bg-white rounded-2xl overflow-hidden shadow-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-3 border-b border-gray-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <CalendarClock className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h3
                id="reschedule-dialog-title"
                className="text-base font-semibold text-gray-900"
              >
                Reagendar cita
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Con Dr. {appointment.doctor?.full_name ?? "tu médico"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4 overflow-y-auto">
          {/* Date picker */}
          <div className="space-y-1.5">
            <label
              htmlFor="reschedule-date"
              className="block text-xs font-medium text-gray-600"
            >
              <Calendar className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
              Nueva fecha
            </label>
            <input
              id="reschedule-date"
              type="date"
              value={selectedDate}
              min={minDate}
              max={maxDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:opacity-50"
            />
          </div>

          {/* Time slots */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-gray-600">
              <Clock className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
              Horario disponible
            </label>

            {slotsQuery.isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            )}

            {slotsQuery.error && (
              <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                No pudimos cargar los horarios. Intenta otra fecha.
              </p>
            )}

            {noSlots && !slotsQuery.error && (
              <p className="text-xs text-gray-500 bg-gray-50 px-3 py-3 rounded-lg">
                No hay horarios disponibles para esta fecha. Probá otro día.
              </p>
            )}

            {!slotsQuery.isLoading &&
              totalSlots > 0 &&
              groups.map((group) => (
                <div key={group.label} className="pt-2">
                  <p className="text-xs font-medium text-gray-500 mb-2">
                    {group.label}
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {group.slots
                      .filter((s) => s.available)
                      .map((slot) => {
                        const time = slot.start;
                        const isCurrent =
                          selectedDate === initialDate &&
                          new Date(appointment.scheduled_at)
                            .toLocaleTimeString("en-US", {
                              hour12: false,
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                            .startsWith(time);
                        const isSelected = selectedTime === time;
                        return (
                          <button
                            key={`${group.label}-${time}`}
                            type="button"
                            onClick={() => setSelectedTime(time)}
                            disabled={loading || isCurrent}
                            title={
                              isCurrent
                                ? "Horario actual de la cita"
                                : undefined
                            }
                            className={`px-2 py-2 text-xs font-medium rounded-lg border transition ${
                              isSelected
                                ? "bg-emerald-500 text-white border-emerald-500"
                                : isCurrent
                                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                  : "bg-white text-gray-700 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50"
                            }`}
                          >
                            {formatTimeLabel(time)}
                          </button>
                        );
                      })}
                  </div>
                </div>
              ))}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-700 leading-relaxed">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
          >
            Volver
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !selectedTime}
            className="flex-1 px-4 py-3 text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 transition border-l border-emerald-600 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-emerald-300"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Reagendando...
              </>
            ) : (
              "Confirmar nuevo horario"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
