"use client";

import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CalendarX,
} from "lucide-react";
import { useMemo } from "react";
import { useState } from "react";

import type { AvailableDate } from "@/lib/services/booking-service";

const DAYS_SHORT = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"];
const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

interface CalendarPickerProps {
  availableDates: AvailableDate[];
  loading: boolean;
  selectedDate: string | null;
  doctorName: string;
  onSelectDate: (date: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

export function CalendarPicker({
  availableDates,
  loading,
  selectedDate,
  doctorName,
  onSelectDate,
  onBack,
  onContinue,
}: CalendarPickerProps) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  // Build a set of available date strings for quick lookup
  const availableSet = useMemo(() => {
    const set = new Set<string>();
    availableDates
      .filter((d) => d.hasSlots)
      .forEach((d) => set.add(d.date));
    return set;
  }, [availableDates]);

  // Build the calendar grid for viewMonth/viewYear
  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const startDow = firstDay.getDay(); // 0=Sunday
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const days: (number | null)[] = [];

    // Leading blanks
    for (let i = 0; i < startDow; i++) {
      days.push(null);
    }
    // Actual days
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(d);
    }

    return days;
  }, [viewMonth, viewYear]);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const canGoPrev =
    viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth > today.getMonth());

  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const canGoNext =
    viewYear < maxDate.getFullYear() ||
    (viewYear === maxDate.getFullYear() &&
      viewMonth < maxDate.getMonth());

  const getDayDateStr = (day: number) => {
    const m = String(viewMonth + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${viewYear}-${m}-${d}`;
  };

  const isDayInPast = (day: number) => {
    const dateStr = getDayDateStr(day);
    const todayStr = today.toISOString().split("T")[0];
    return dateStr < todayStr;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <Loader2 className="h-8 w-8 animate-spin mb-3" />
        <p className="text-sm">Cargando disponibilidad...</p>
      </div>
    );
  }

  const noAvailability = availableDates.length === 0 || availableSet.size === 0;

  return (
    <div className="space-y-5">
      <div>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          Cambiar doctor
        </button>
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          Selecciona la fecha
        </h2>
        <p className="text-gray-500 text-sm">
          Disponibilidad de Dr. {doctorName} en los proximos 30 dias
        </p>
      </div>

      {noAvailability ? (
        <div className="text-center py-16">
          <CalendarX className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Sin disponibilidad
          </h3>
          <p className="text-gray-500 mb-4">
            Este doctor no tiene horarios disponibles en los proximos 30 dias
          </p>
          <button
            onClick={onBack}
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Elegir otro doctor
          </button>
        </div>
      ) : (
        <>
          {/* Calendar */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6 max-w-sm mx-auto w-full">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={prevMonth}
                disabled={!canGoPrev}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              <h3 className="font-semibold text-gray-900">
                {MONTHS[viewMonth]} {viewYear}
              </h3>
              <button
                onClick={nextMonth}
                disabled={!canGoNext}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS_SHORT.map((d) => (
                <div
                  key={d}
                  className="text-center text-xs font-semibold text-gray-400 py-1"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, idx) => {
                if (day === null) {
                  return <div key={`blank-${idx}`} />;
                }

                const dateStr = getDayDateStr(day);
                const isPast = isDayInPast(day);
                const isAvailable = availableSet.has(dateStr);
                const isSelected = dateStr === selectedDate;
                const isToday = dateStr === today.toISOString().split("T")[0];

                const disabled = isPast || !isAvailable;

                return (
                  <button
                    key={dateStr}
                    onClick={() => !disabled && onSelectDate(dateStr)}
                    disabled={disabled}
                    className={`relative aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
                      isSelected
                        ? "bg-emerald-600 text-white shadow-sm"
                        : disabled
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
                    } ${isToday && !isSelected ? "ring-2 ring-emerald-200" : ""}`}
                  >
                    {day}
                    {isAvailable && !isSelected && !isPast && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-500 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 justify-center mt-4 text-xs text-gray-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                Disponible
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-gray-200 rounded-full" />
                No disponible
              </div>
            </div>
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
              disabled={!selectedDate}
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
