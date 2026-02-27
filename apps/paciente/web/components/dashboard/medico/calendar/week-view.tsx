"use client";

import { useMemo } from "react";
import { format, startOfWeek, addDays, isSameDay, isToday as checkIsToday } from "date-fns";
import { es } from "date-fns/locale";

import type { CalendarAppointment } from "./types";
import { Clock } from "lucide-react";

interface WeekViewProps {
  date: Date;
  appointments: CalendarAppointment[];
  onAppointmentClick?: (appointment: CalendarAppointment) => void;
  onTimeSlotClick?: (date: Date, hour: number) => void;
  onStartVideo?: (appointment: CalendarAppointment) => void;
  startHour?: number;
  endHour?: number;
}

export function WeekView({
  date,
  appointments,
  onAppointmentClick,
  onTimeSlotClick,
  startHour = 7,
  endHour = 20,
}: WeekViewProps) {
  const weekStart = useMemo(() => startOfWeek(date, { weekStartsOn: 1 }), [date]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  const hours = useMemo(() => {
    const result = [];
    for (let i = startHour; i <= endHour; i++) {
      result.push(i);
    }
    return result;
  }, [startHour, endHour]);

  const currentHour = new Date().getHours();
  const today = new Date();

  const getAppointmentsForDayAndHour = (day: Date, hour: number) => {
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.fecha_hora);
      return isSameDay(aptDate, day) && aptDate.getHours() === hour;
    });
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Header with Days - Sticky */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200 sticky top-0 z-20 shadow-sm">
        <div className="flex">
          {/* Time column header */}
          <div className="w-20 flex-shrink-0 border-r border-blue-200 bg-white/90 backdrop-blur-sm flex items-center justify-center">
            <Clock className="h-5 w-5 text-gray-500" />
          </div>

          {/* Day headers */}
          {weekDays.map((day) => {
            const isCurrentDay = checkIsToday(day);
            return (
              <div
                key={day.toISOString()}
                className={`flex-1 p-4 text-center border-r border-blue-100 last:border-r-0 transition-all ${isCurrentDay
                    ? "bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-lg scale-105"
                    : "bg-white/80 backdrop-blur-sm hover:bg-blue-50/50"
                  }`}
              >
                <div className={`text-xs font-semibold uppercase tracking-wider ${isCurrentDay ? "text-blue-100" : "text-gray-600"
                  }`}>
                  {format(day, "EEE", { locale: es })}
                </div>
                <div className={`text-3xl font-bold mt-1 ${isCurrentDay ? "text-white" : "text-gray-900"
                  }`}>
                  {format(day, "d")}
                </div>
                <div className={`text-xs mt-0.5 ${isCurrentDay ? "text-blue-100" : "text-gray-500"
                  }`}>
                  {format(day, "MMM", { locale: es })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Time Grid - Scrollable with fixed height cells */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <div className="min-w-full">
          {hours.map((hour) => {
            const isCurrentHourRow = hour === currentHour && isSameDay(today, date);

            return (
              <div
                key={hour}
                className={`flex border-b border-gray-200 transition-colors ${isCurrentHourRow ? "bg-yellow-50/50 border-yellow-300" : ""
                  }`}
              >
                {/* Time Label - Sticky left */}
                <div className={`w-20 flex-shrink-0 p-3 text-sm font-semibold border-r border-gray-200 bg-gray-50/90 backdrop-blur-sm sticky left-0 z-10 flex items-start justify-center ${isCurrentHourRow ? "bg-yellow-100 text-yellow-800" : "text-gray-700"
                  }`}>
                  <div className="text-center">
                    <div>{format(new Date().setHours(hour, 0, 0, 0), "HH:mm")}</div>
                    {isCurrentHourRow && (
                      <div className="text-[10px] text-yellow-600 font-normal mt-0.5">Ahora</div>
                    )}
                  </div>
                </div>

                {/* Day Columns - Fixed height for uniformity */}
                {weekDays.map((day) => {
                  const dayAppointments = getAppointmentsForDayAndHour(day, hour);
                  const slotTime = new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour);
                  const isPast = slotTime < new Date();
                  const isCurrentDay = checkIsToday(day);

                  return (
                    <div
                      key={`${day.toISOString()}-${hour}`}
                      className={`flex-1 p-2 h-24 border-r border-gray-200 last:border-r-0 transition-all duration-200 ${isCurrentDay ? "bg-blue-50/30" : ""
                        } ${isPast
                          ? "bg-gray-50/70 cursor-not-allowed opacity-60"
                          : "cursor-pointer hover:bg-blue-50 hover:shadow-inner"
                        } ${isCurrentHourRow ? "ring-2 ring-inset ring-yellow-300/50" : ""
                        }`}
                      onClick={() => {
                        if (!isPast) {
                          onTimeSlotClick?.(day, hour);
                        }
                      }}
                    >
                      {dayAppointments.length > 0 ? (
                        <div className="space-y-1.5 h-full overflow-y-auto scrollbar-none">
                          {dayAppointments.map((apt) => (
                            <div
                              key={apt.id}
                              className="group p-2 rounded-md text-xs border-l-4 bg-white shadow-sm hover:shadow-md transition-all cursor-pointer transform hover:scale-[1.02]"
                              style={{ borderLeftColor: apt.color }}
                              onClick={(e) => {
                                e.stopPropagation();
                                onAppointmentClick?.(apt);
                              }}
                            >
                              <div className="font-semibold truncate text-gray-900 group-hover:text-blue-600 transition-colors">
                                {apt.paciente_nombre}
                              </div>
                              <div className="text-gray-500 truncate mt-0.5 text-[11px]">
                                {apt.motivo}
                              </div>
                              <div className="flex items-center gap-1 mt-1">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${apt.status === "confirmada" ? "bg-green-100 text-green-700" :
                                    apt.status === "pendiente" ? "bg-yellow-100 text-yellow-700" :
                                      apt.status === "completada" ? "bg-blue-100 text-blue-700" :
                                        "bg-gray-100 text-gray-600"
                                  }`}>
                                  {apt.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          {!isPast && (
                            <div className="text-gray-300 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                              + Agregar
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
