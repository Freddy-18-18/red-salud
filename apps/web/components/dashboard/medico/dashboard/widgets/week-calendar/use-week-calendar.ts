/**
 * @file use-week-calendar.ts
 * @description Hook con la lógica de calendario semanal.
 *
 * @module Hooks/Calendar
 */

import { useState, useMemo, useCallback } from "react";

export interface DayData {
  date: Date;
  dateStr: string;
  appointments: number;
  completed: number;
  isToday: boolean;
  isPast: boolean;
}

export interface UseWeekCalendarProps {
  /** Fecha de referencia (hoy) */
  today?: Date;
  /** Citas para contar por día */
  appointments?: Array<{ appointment_date: string; status: string }>;
}

/** Nombres cortos de los días de la semana */
const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

/** Nombres de meses */
const MONTH_NAMES = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

/**
 * Formatea un rango de fechas para mostrar
 */
function formatDateRange(startDate: Date, endDate: Date): string {
  const startDay = startDate.getDate();
  const endDay = endDate.getDate();
  const startMonth = MONTH_NAMES[startDate.getMonth()];
  const endMonth = MONTH_NAMES[endDate.getMonth()];

  if (startDate.getMonth() === endDate.getMonth()) {
    return `${startDay}-${endDay} ${startMonth}`;
  }
  return `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
}

/**
 * Hook para manejar la lógica del calendario semanal
 */
export function useWeekCalendar({ today, appointments = [] }: UseWeekCalendarProps) {
  const todayRef = useMemo(
    () => {
      const d = today || new Date();
      d.setHours(0, 0, 0, 0);
      return d;
    },
    [today]
  );

  // Estado para offset de semana (0 = semana actual, -1 = semana pasada)
  const [weekOffset, setWeekOffset] = useState(0);

  // Calcular inicio y fin de la semana actual + offset
  const { startOfWeek, endOfWeek, dateRange } = useMemo(() => {
    const start = new Date(todayRef);
    const day = todayRef.getDay();

    start.setDate(todayRef.getDate() - day);
    start.setDate(start.getDate() + weekOffset * 7);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return {
      startOfWeek: start,
      endOfWeek: end,
      dateRange: formatDateRange(start, end),
    };
  }, [todayRef, weekOffset]);

  // Calcular datos de la semana
  const weekData = useMemo(() => {
    const days: DayData[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);

      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      const dateStr = `${yyyy}-${mm}-${dd}`;

      const dayAppointments = appointments.filter(
        (apt) => apt.appointment_date === dateStr
      );

      const completedCount = dayAppointments.filter(
        (apt) => apt.status === "completed"
      ).length;

      days.push({
        date,
        dateStr,
        appointments: dayAppointments.length,
        completed: completedCount,
        isToday: date.toDateString() === todayRef.toDateString(),
        isPast: date < todayRef,
      });
    }

    return days;
  }, [appointments, startOfWeek, todayRef]);

  // Calcular totales de la semana
  const totalThisWeek = weekData.reduce((sum, d) => sum + d.appointments, 0);

  // Navegación
  const goToPreviousWeek = useCallback(() => {
    setWeekOffset((prev) => prev - 1);
  }, []);

  const goToNextWeek = useCallback(() => {
    setWeekOffset((prev) => prev + 1);
  }, []);

  const goToCurrentWeek = useCallback(() => {
    setWeekOffset(0);
  }, []);

  const isCurrentWeek = weekOffset === 0;

  return {
    // Estado
    weekOffset,
    setWeekOffset,
    isCurrentWeek,

    // Datos
    todayRef,
    startOfWeek,
    endOfWeek,
    dateRange,
    weekData,
    totalThisWeek,
    dayNames: DAY_NAMES,
    monthNames: MONTH_NAMES,

    // Navegación
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
  };
}
