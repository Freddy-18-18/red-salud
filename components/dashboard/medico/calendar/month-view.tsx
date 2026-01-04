"use client";

import { useMemo } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday } from "date-fns";
import { es } from "date-fns/locale";
import type { CalendarAppointment } from "./types";
import { Calendar, ChevronRight } from "lucide-react";

interface MonthViewProps {
  date: Date;
  appointments: CalendarAppointment[];
  onDayClick?: (date: Date) => void;
  onAppointmentClick?: (appointment: CalendarAppointment) => void;
}

export function MonthView({
  date,
  appointments,
  onDayClick,
  onAppointmentClick,
}: MonthViewProps) {
  const monthStart = useMemo(() => startOfMonth(date), [date]);
  const monthEnd = useMemo(() => endOfMonth(date), [date]);
  const calendarStart = useMemo(() => startOfWeek(monthStart, { weekStartsOn: 1 }), [monthStart]);
  const calendarEnd = useMemo(() => endOfWeek(monthEnd, { weekStartsOn: 1 }), [monthEnd]);

  const calendarDays = useMemo(() => {
    const days = [];
    let currentDay = calendarStart;
    while (currentDay <= calendarEnd) {
      days.push(currentDay);
      currentDay = addDays(currentDay, 1);
    }
    return days;
  }, [calendarStart, calendarEnd]);

  const weeks = useMemo(() => {
    const result = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      result.push(calendarDays.slice(i, i + 7));
    }
    return result;
  }, [calendarDays]);

  const getAppointmentsForDay = (day: Date) => {
    return appointments.filter((apt) =>
      isSameDay(new Date(apt.fecha_hora), day)
    );
  };

  const monthStats = useMemo(() => {
    const monthAppointments = appointments.filter(apt =>
      isSameMonth(new Date(apt.fecha_hora), date)
    );
    return {
      total: monthAppointments.length,
      pendientes: monthAppointments.filter(a => a.status === "pendiente").length,
      confirmadas: monthAppointments.filter(a => a.status === "confirmada").length,
      completadas: monthAppointments.filter(a => a.status === "completada").length,
    };
  }, [appointments, date]);

  const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Header - Sticky */}
      <div className="border-b-2 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 sticky top-0 z-20 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="h-6 w-6 text-blue-600" />
            <h2 className="text-3xl font-bold text-gray-900">
              {format(date, "MMMM yyyy", { locale: es })}
            </h2>
          </div>

          {/* Stats compactos */}
          <div className="flex gap-3">
            <div className="px-4 py-2 rounded-lg bg-white shadow-sm">
              <div className="text-xs font-medium text-gray-600">Total</div>
              <div className="text-2xl font-bold text-gray-900">{monthStats.total}</div>
            </div>
            <div className="px-4 py-2 rounded-lg bg-white shadow-sm">
              <div className="text-xs font-medium text-gray-600">Pendientes</div>
              <div className="text-2xl font-bold text-yellow-600">{monthStats.pendientes}</div>
            </div>
            <div className="px-4 py-2 rounded-lg bg-white shadow-sm">
              <div className="text-xs font-medium text-gray-600">Confirmadas</div>
              <div className="text-2xl font-bold text-blue-600">{monthStats.confirmadas}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Weekday Headers - Sticky */}
      <div className="grid grid-cols-7 border-b-2 bg-gray-50 sticky top-[120px] z-10">
        {weekDays.map((day) => (
          <div
            key={day}
            className="p-3 text-center text-sm font-bold text-gray-700 border-r last:border-r-0 uppercase tracking-wide"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid - Scrollable */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 border-b last:border-b-0">
            {week.map((day) => {
              const dayAppointments = getAppointmentsForDay(day);
              const isCurrentMonth = isSameMonth(day, date);
              const isDayToday = isToday(day);
              const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));

              return (
                <div
                  key={day.toISOString()}
                  className={`h-32 p-2 border-r last:border-r-0 transition-all duration-200 ${!isCurrentMonth ? "bg-gray-50/70" : ""
                    } ${isDayToday ? "bg-blue-50 ring-2 ring-inset ring-blue-300" : ""} ${isPast
                      ? "bg-gray-100/50 cursor-not-allowed opacity-60"
                      : "cursor-pointer hover:bg-blue-50 hover:shadow-inner"
                    }`}
                  onClick={() => {
                    if (!isPast) {
                      onDayClick?.(day);
                    }
                  }}
                >
                  {/* Day Number */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-sm font-bold transition-all ${!isCurrentMonth
                          ? "text-gray-400"
                          : isDayToday
                            ? "text-white bg-blue-600 rounded-full w-7 h-7 flex items-center justify-center shadow-md"
                            : "text-gray-900"
                        }`}
                    >
                      {format(day, "d")}
                    </span>
                    {dayAppointments.length > 0 && (
                      <span className="text-[10px] font-bold text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full px-2 py-0.5 shadow-sm">
                        {dayAppointments.length}
                      </span>
                    )}
                  </div>

                  {/* Appointments */}
                  <div className="space-y-1 h-[calc(100%-28px)] overflow-y-auto scrollbar-none">
                    {dayAppointments.slice(0, 2).map((apt) => {
                      const statusColors: Record<string, string> = {
                        pendiente: "bg-yellow-50 border-yellow-400 hover:bg-yellow-100",
                        confirmada: "bg-blue-50 border-blue-400 hover:bg-blue-100",
                        completada: "bg-green-50 border-green-400 hover:bg-green-100",
                        cancelada: "bg-red-50 border-red-400 hover:bg-red-100",
                        en_espera: "bg-orange-50 border-orange-400 hover:bg-orange-100",
                        en_consulta: "bg-purple-50 border-purple-400 hover:bg-purple-100",
                        no_asistio: "bg-gray-50 border-gray-400 hover:bg-gray-100",
                        rechazada: "bg-rose-50 border-rose-400 hover:bg-rose-100",
                      };

                      return (
                        <div
                          key={apt.id}
                          className={`text-xs p-1.5 rounded border-l-2 transition-all duration-150 cursor-pointer ${statusColors[apt.status] || "bg-white border-gray-400 hover:bg-gray-100"
                            }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onAppointmentClick?.(apt);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="font-semibold text-gray-900">
                              {format(new Date(apt.fecha_hora), "HH:mm")}
                            </div>
                            <ChevronRight className="h-3 w-3 text-gray-400" />
                          </div>
                          <div className="truncate text-gray-700 mt-0.5">
                            {apt.paciente_nombre}
                          </div>
                        </div>
                      );
                    })}
                    {dayAppointments.length > 2 && (
                      <div className="text-[10px] font-medium text-blue-600 text-center bg-blue-50 rounded px-1 py-0.5">
                        +{dayAppointments.length - 2} más
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
