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
    <div className="flex flex-col h-full bg-card rounded-lg shadow-sm overflow-hidden">
      {/* Header - Sticky */}
      <div className="border-b-2 p-6 bg-gradient-to-r from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20 sticky top-0 z-20 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold text-foreground">
              {format(date, "MMMM yyyy", { locale: es })}
            </h2>
          </div>

          {/* Stats compactos */}
          <div className="flex gap-3">
            <div className="px-4 py-2 rounded-lg bg-card shadow-sm">
              <div className="text-xs font-medium text-muted-foreground">Total</div>
              <div className="text-2xl font-bold text-foreground">{monthStats.total}</div>
            </div>
            <div className="px-4 py-2 rounded-lg bg-card shadow-sm">
              <div className="text-xs font-medium text-muted-foreground">Pendientes</div>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{monthStats.pendientes}</div>
            </div>
            <div className="px-4 py-2 rounded-lg bg-card shadow-sm">
              <div className="text-xs font-medium text-muted-foreground">Confirmadas</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{monthStats.confirmadas}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Weekday Headers - Sticky */}
      <div className="grid grid-cols-7 border-b-2 bg-muted sticky top-[120px] z-10">
        {weekDays.map((day) => (
          <div
            key={day}
            className="p-3 text-center text-sm font-bold text-muted-foreground border-r border-border last:border-r-0 uppercase tracking-wide"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid - Scrollable */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-muted">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 border-b border-border last:border-b-0">
            {week.map((day) => {
              const dayAppointments = getAppointmentsForDay(day);
              const isCurrentMonth = isSameMonth(day, date);
              const isDayToday = isToday(day);
              const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));

              return (
                <div
                  key={day.toISOString()}
                  className={`h-32 p-2 border-r border-border last:border-r-0 transition-all duration-200 ${!isCurrentMonth ? "bg-muted/50" : ""
                    } ${isDayToday ? "bg-primary/10 ring-2 ring-inset ring-primary/30" : ""} ${isPast
                      ? "bg-muted/30 cursor-not-allowed opacity-60"
                      : "cursor-pointer hover:bg-primary/5 dark:hover:bg-primary/10"
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
                        ? "text-muted-foreground/50"
                        : isDayToday
                          ? "text-primary-foreground bg-primary rounded-full w-7 h-7 flex items-center justify-center shadow-md"
                          : "text-foreground"
                        }`}
                    >
                      {format(day, "d")}
                    </span>
                    {dayAppointments.length > 0 && (
                      <span className="text-[10px] font-bold text-primary-foreground bg-gradient-to-r from-primary to-secondary rounded-full px-2 py-0.5 shadow-sm">
                        {dayAppointments.length}
                      </span>
                    )}
                  </div>

                  {/* Appointments */}
                  <div className="space-y-1 h-[calc(100%-28px)] overflow-y-auto scrollbar-none">
                    {dayAppointments.slice(0, 2).map((apt) => {
                      const statusColors: Record<string, string> = {
                        pendiente: "bg-yellow-50 dark:bg-yellow-900/30 border-yellow-400 dark:border-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900/40",
                        confirmada: "bg-blue-50 dark:bg-blue-900/30 border-blue-400 dark:border-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/40",
                        completada: "bg-green-50 dark:bg-green-900/30 border-green-400 dark:border-green-600 hover:bg-green-100 dark:hover:bg-green-900/40",
                        cancelada: "bg-red-50 dark:bg-red-900/30 border-red-400 dark:border-red-600 hover:bg-red-100 dark:hover:bg-red-900/40",
                        en_espera: "bg-orange-50 dark:bg-orange-900/30 border-orange-400 dark:border-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/40",
                        en_consulta: "bg-purple-50 dark:bg-purple-900/30 border-purple-400 dark:border-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/40",
                        no_asistio: "bg-muted border-muted-foreground hover:bg-muted/80",
                        rechazada: "bg-rose-50 dark:bg-rose-900/30 border-rose-400 dark:border-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/40",
                      };

                      return (
                        <div
                          key={apt.id}
                          className={`text-xs p-1.5 rounded border-l-2 transition-all duration-150 cursor-pointer ${statusColors[apt.status] || "bg-card border-muted-foreground hover:bg-muted"
                            }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onAppointmentClick?.(apt);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="font-semibold text-foreground">
                              {format(new Date(apt.fecha_hora), "HH:mm")}
                            </div>
                            <ChevronRight className="h-3 w-3 text-muted-foreground" />
                          </div>
                          <div className="truncate text-muted-foreground mt-0.5">
                            {apt.paciente_nombre}
                          </div>
                        </div>
                      );
                    })}
                    {dayAppointments.length > 2 && (
                      <div className="text-[10px] font-medium text-primary text-center bg-primary/10 rounded px-1 py-0.5">
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
