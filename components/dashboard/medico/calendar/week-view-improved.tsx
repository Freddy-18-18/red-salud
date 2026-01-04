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
  onMessage?: (appointment: CalendarAppointment) => void;
  onStartVideo?: (appointment: CalendarAppointment) => void;
  startHour?: number;
  endHour?: number;
  // Drag & Drop
  dragState?: {
    isDragging: boolean;
    draggedAppointment: CalendarAppointment | null;
    draggedOver: { date: Date; hour: number } | null;
  };
  onDragStart?: (appointment: CalendarAppointment) => void;
  onDragOver?: (date: Date, hour: number) => void;
  onDragEnd?: () => void;
  onDragCancel?: () => void;
}

export function WeekView({
  date,
  appointments,
  onAppointmentClick,
  onTimeSlotClick,
  startHour = 7,
  endHour = 20,
  dragState,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDragCancel,
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
  const currentMinute = new Date().getMinutes();

  const getAppointmentsForDayAndHour = (day: Date, hour: number) => {
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.fecha_hora);
      return isSameDay(aptDate, day) && aptDate.getHours() === hour;
    });
  };

  const getDayAppointments = (day: Date) => {
    return appointments.filter((apt) => isSameDay(new Date(apt.fecha_hora), day));
  };

  // Calcular posición de la línea de hora actual
  const getCurrentTimePosition = () => {
    if (currentHour < startHour || currentHour > endHour) return null;
    const hoursSinceStart = currentHour - startHour;
    const pixelsPerHour = 96; // h-24 = 96px
    return hoursSinceStart * pixelsPerHour + (currentMinute / 60) * pixelsPerHour;
  };

  const currentTimePosition = getCurrentTimePosition();

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Header - Fixed, NO horizontal scroll */}
      <div className="flex-shrink-0 bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200 sticky top-0 z-30 shadow-md">
        <div className="flex">
          {/* Time column header */}
          <div className="w-16 flex-shrink-0 border-r border-gray-100 bg-white flex items-center justify-center">
            <Clock className="h-4 w-4 text-gray-500" />
          </div>

          {/* Day headers - Grid fixed, NO scroll */}
          <div className="flex-1 grid grid-cols-7 gap-0">
            {weekDays.map((day) => {
              const isCurrentDay = checkIsToday(day);
              const dayAppointments = getDayAppointments(day);

              return (
                <div
                  key={day.toISOString()}
                  className={`flex flex-col items-center justify-center p-3 border-r last:border-r-0 transition-all ${isCurrentDay
                    ? "bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-lg"
                    : "bg-white/80 backdrop-blur-sm hover:bg-blue-50/50"
                    }`}
                >
                  <div className={`text-[10px] font-semibold uppercase tracking-wider mb-0.5 ${isCurrentDay ? "text-blue-100" : "text-gray-600"
                    }`}>
                    {format(day, "EEE", { locale: es })}
                  </div>
                  <div className={`text-2xl font-bold ${isCurrentDay ? "text-white" : "text-gray-900"
                    }`}>
                    {format(day, "d")}
                  </div>
                  {dayAppointments.length > 0 && (
                    <div className={`text-[9px] font-bold mt-1 px-1.5 py-0.5 rounded-full ${isCurrentDay
                      ? "bg-white/20 text-white"
                      : "bg-blue-100 text-blue-700"
                      }`}>
                      {dayAppointments.length}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Time Grid - Solo scroll vertical */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 relative">
        {/* Current time line (absolute positioned) */}
        {currentTimePosition !== null && checkIsToday(date) && (
          <div
            className="absolute left-0 right-0 z-20 pointer-events-none"
            style={{ top: `${currentTimePosition}px` }}
          >
            <div className="flex items-center">
              <div className="w-16 flex justify-center">
                <div className="w-2 h-2 bg-red-500 rounded-full shadow-lg"></div>
              </div>
              <div className="flex-1 h-0.5 bg-red-500 shadow-md"></div>
            </div>
          </div>
        )}

        <div className="flex">
          {/* Time column - Sticky left */}
          <div className="w-16 flex-shrink-0 bg-white border-r border-gray-100 sticky left-0 z-10">
            {hours.map((hour) => {
              const isCurrentHour = hour === currentHour && checkIsToday(date);

              return (
                <div
                  key={hour}
                  className={`h-24 flex items-start justify-center pt-1 border-b border-gray-200 text-[10px] font-semibold transition-colors ${isCurrentHour ? "bg-yellow-50 text-yellow-800" : "text-gray-600"
                    }`}
                >
                  {format(new Date().setHours(hour, 0, 0, 0), "HH:mm")}
                </div>
              );
            })}
          </div>

          {/* Days grid - Grid fixed, NO horizontal scroll */}
          <div className="flex-1 grid grid-cols-7 gap-0">
            {weekDays.map((day) => {
              const isCurrentDay = checkIsToday(day);
              const isPastDay = day < new Date(new Date().setHours(0, 0, 0, 0));

              return (
                <div key={day.toISOString()} className="border-r last:border-r-0">
                  {hours.map((hour) => {
                    const hourAppointments = getAppointmentsForDayAndHour(day, hour);
                    const isCurrentHour = hour === currentHour && isCurrentDay;
                    const slotTime = new Date(day);
                    slotTime.setHours(hour, 0, 0, 0);
                    const isPast = slotTime < new Date();
                    const isDropTarget = dragState?.draggedOver?.date === day && dragState?.draggedOver?.hour === hour;

                    return (
                      <div
                        key={`${day.toISOString()}-${hour}`}
                        data-tour="time-slot"
                        className={`h-24 p-1 border-b border-gray-200 transition-all duration-100 ${isCurrentHour ? "bg-yellow-50/30" : ""
                          } ${isDropTarget ? "bg-green-100 ring-2 ring-green-400" : ""
                          } ${isPast || isPastDay
                            ? "bg-gray-50/50 cursor-not-allowed opacity-50"
                            : "cursor-pointer hover:bg-blue-50 active:bg-blue-100"
                          }`}
                        onClick={() => {
                          if (!isPast && !isPastDay) {
                            onTimeSlotClick?.(day, hour);
                          }
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          if (!isPast && !isPastDay) {
                            onDragOver?.(day, hour);
                          }
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (!isPast && !isPastDay) {
                            onDragEnd?.();
                          }
                        }}
                      >
                        {/* Appointments */}
                        {hourAppointments.length > 0 ? (
                          <div className="space-y-0.5 h-full overflow-y-auto scrollbar-none">
                            {hourAppointments.map((apt) => {
                              const isDragging = dragState?.draggedAppointment?.id === apt.id;

                              return (
                                <div
                                  key={apt.id}
                                  data-tour="appointment-card"
                                  data-type={apt.tipo_cita}
                                  draggable={!isPast && !isPastDay}
                                  onDragStart={(e) => {
                                    e.stopPropagation();
                                    onDragStart?.(apt);
                                  }}
                                  onDragEnd={(e) => {
                                    e.stopPropagation();
                                    if (dragState?.draggedOver) {
                                      // El drop se maneja en el contenedor
                                    } else {
                                      onDragCancel?.();
                                    }
                                  }}
                                  className={`text-[9px] p-1 rounded border-l-2 transition-all hover:shadow-lg ${isDragging ? "opacity-50 scale-95 cursor-grabbing" : "cursor-grab"
                                    } ${apt.status === "pendiente"
                                      ? "bg-yellow-50 border-yellow-400 hover:bg-yellow-100"
                                      : apt.status === "confirmada"
                                        ? "bg-blue-50 border-blue-400 hover:bg-blue-100"
                                        : apt.status === "completada"
                                          ? "bg-green-50 border-green-400 hover:bg-green-100"
                                          : "bg-gray-50 border-gray-400 hover:bg-gray-100"
                                    }`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (!isDragging) {
                                      onAppointmentClick?.(apt);
                                    }
                                  }}
                                >
                                  <div className="font-bold text-gray-900 truncate">
                                    {format(new Date(apt.fecha_hora), "HH:mm")}
                                  </div>
                                  <div className="truncate text-gray-700 font-semibold">
                                    {apt.paciente_nombre}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          !isPast && !isPastDay && (
                            <div className="h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                              <span className="text-[9px] text-gray-400 font-medium">+</span>
                            </div>
                          )
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
    </div>
  );
}
