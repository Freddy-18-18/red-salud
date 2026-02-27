"use client";

import { useMemo } from "react";
import { format, startOfWeek, addDays, isSameDay, isToday as checkIsToday } from "date-fns";
import { es } from "date-fns/locale";
import type { CalendarAppointment } from "./types";
import { Clock, ArrowLeftRight } from "lucide-react";

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
    draggedOver: { date: Date; hour: number; minute?: number; existingAppointment?: CalendarAppointment } | null;
  };
  onDragStart?: (appointment: CalendarAppointment) => void;
  onDragOver?: (date: Date, hour: number, minute?: number) => void;
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

  // Estructura para agrupar citas por slot de tiempo
  interface TimeSlot {
    startMinute: number; // 0, 15, 30, 45
    endMinute: number; // 15, 30, 45, 60
    appointments: CalendarAppointment[];
  }

  const getAppointmentsForDayAndHour = (day: Date, hour: number) => {
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.fecha_hora);
      return isSameDay(aptDate, day) && aptDate.getHours() === hour;
    });
  };

  // Nueva función para obtener slots de tiempo con citas agrupadas
  const getTimeSlotsForHour = (day: Date, hour: number): TimeSlot[] => {
    const hourAppointments = getAppointmentsForDayAndHour(day, hour);

    if (hourAppointments.length === 0) {
      return [];
    }

    // Ordenar citas por minuto de inicio
    const sortedAppointments = [...hourAppointments].sort((a, b) => {
      const minuteA = new Date(a.fecha_hora).getMinutes();
      const minuteB = new Date(b.fecha_hora).getMinutes();
      return minuteA - minuteB;
    });

    // Crear slots basados en las duraciones de las citas
    const slots: TimeSlot[] = [];

    for (const apt of sortedAppointments) {
      const aptDate = new Date(apt.fecha_hora);
      const startMinute = aptDate.getMinutes();
      const duration = apt.duracion_minutos || 30; // default 30 min
      const endMinute = Math.min(startMinute + duration, 60);

      // Buscar si ya existe un slot que coincida
      const existingSlot = slots.find(
        s => s.startMinute === startMinute && s.endMinute === endMinute
      );

      if (existingSlot) {
        existingSlot.appointments.push(apt);
      } else {
        slots.push({
          startMinute,
          endMinute,
          appointments: [apt]
        });
      }
    }

    // Ordenar slots por minuto de inicio
    return slots.sort((a, b) => a.startMinute - b.startMinute);
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
    <div className="flex-1 min-h-0 flex flex-col bg-card rounded-lg shadow-sm overflow-hidden">
      {/* Header - Fixed, NO horizontal scroll */}
      <div className="flex-shrink-0 bg-gradient-to-r from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20 border-b-2 border-border sticky top-0 z-30 shadow-md">
        <div className="flex">
          {/* Time column header */}
          <div className="w-16 flex-shrink-0 border-r border-border bg-card flex items-center justify-center">
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>

          {/* Day headers - Grid fixed, NO scroll */}
          <div className="flex-1 grid grid-cols-7 gap-0">
            {weekDays.map((day) => {
              const isCurrentDay = checkIsToday(day);
              const dayAppointments = getDayAppointments(day);

              return (
                <div
                  key={day.toISOString()}
                  className={`flex flex-col items-center justify-center p-3 border-r border-border last:border-r-0 transition-all ${isCurrentDay
                    ? "bg-gradient-to-b from-primary to-primary/80 text-primary-foreground shadow-lg"
                    : "bg-card/80 backdrop-blur-sm hover:bg-primary/5"
                    }`}
                >
                  <div className={`text-[10px] font-semibold uppercase tracking-wider mb-0.5 ${isCurrentDay ? "text-primary-foreground/80" : "text-muted-foreground"
                    }`}>
                    {format(day, "EEE", { locale: es })}
                  </div>
                  <div className={`text-2xl font-bold ${isCurrentDay ? "text-primary-foreground" : "text-foreground"
                    }`}>
                    {format(day, "d")}
                  </div>
                  {dayAppointments.length > 0 && (
                    <div className={`text-[9px] font-bold mt-1 px-1.5 py-0.5 rounded-full ${isCurrentDay
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-primary/10 text-primary"
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
      <div className="flex-1 overflow-y-auto scrollbar-hide relative">
        {/* Current time line (absolute positioned) */}
        {currentTimePosition !== null && checkIsToday(date) && (
          <div
            className="absolute left-0 right-0 z-20 pointer-events-none"
            style={{ top: `${currentTimePosition}px` }}
          >
            <div className="flex items-center group pointer-events-auto py-4 -my-4 cursor-help" title={`Hora actual: ${format(new Date(), "HH:mm")}`}>
              <div className="w-16 flex justify-center relative">
                <div className="w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.6)] group-hover:scale-150 transition-transform z-10" />
                {/* Tooltip con la hora actual en hover */}
                <div className="absolute left-[30px] -top-[30px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-red-600/95 backdrop-blur-sm text-white px-2 py-1 rounded-md text-xs font-bold shadow-lg pointer-events-none whitespace-nowrap flex items-center gap-1.5 z-[100] translate-y-1 group-hover:translate-y-0 border border-red-500/30">
                  <Clock className="w-3.5 h-3.5" />
                  {format(new Date(), "HH:mm")}
                </div>
              </div>
              <div className="flex-1 h-0.5 bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.4)] group-hover:h-[3px] transition-all pointer-events-auto" />
            </div>
          </div>
        )}

        <div className="flex">
          {/* Time column - Sticky left */}
          <div className="w-16 flex-shrink-0 bg-card border-r border-border sticky left-0 z-10">
            {hours.map((hour) => {
              const isCurrentHour = hour === currentHour && checkIsToday(date);

              return (
                <div
                  key={hour}
                  className={`h-24 flex items-start justify-center pt-1 border-b border-border text-[10px] font-semibold transition-colors ${isCurrentHour ? "bg-warning/20 text-warning-foreground dark:bg-warning/30" : "text-muted-foreground"
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
                <div key={day.toISOString()} className="border-r border-border last:border-r-0">
                  {hours.map((hour) => {
                    const timeSlots = getTimeSlotsForHour(day, hour);
                    const isCurrentHour = hour === currentHour && isCurrentDay;
                    const slotEnd = new Date(day);
                    slotEnd.setHours(hour + 1, 0, 0, 0);
                    const isPast = slotEnd <= new Date();
                    const isDropTarget = dragState?.draggedOver?.date === day && dragState?.draggedOver?.hour === hour;
                    const willSwap = isDropTarget && dragState?.draggedOver?.existingAppointment;

                    return (
                      <div
                        key={`${day.toISOString()}-${hour}`}
                        data-tour="time-slot"
                        className={`h-24 p-1 border-b border-border transition-all duration-150 ${isCurrentHour ? "bg-warning/10 dark:bg-warning/20" : ""
                          } ${isDropTarget && !willSwap ? "bg-green-100 dark:bg-green-900/30 ring-2 ring-green-400" : ""
                          } ${willSwap ? "bg-amber-100 dark:bg-amber-900/30 ring-2 ring-amber-500" : ""
                          } ${isPast || isPastDay
                            ? "bg-muted/50 cursor-not-allowed opacity-50"
                            : "cursor-pointer hover:bg-primary/5 dark:hover:bg-primary/10 active:bg-primary/10"
                          }`}
                        onClick={() => {
                          onTimeSlotClick?.(day, hour);
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
                        {/* Swap indicator */}
                        {willSwap && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                            <div className="bg-amber-500 text-white px-2 py-1 rounded-md shadow-lg flex items-center gap-1 text-[10px] font-bold">
                              <ArrowLeftRight className="h-3 w-3" />
                              <span>Intercambiar</span>
                            </div>
                          </div>
                        )}

                        {/* Time slots con citas */}
                        {timeSlots.length > 0 ? (
                          <div className="flex flex-col h-full gap-px">
                            {timeSlots.map((slot, slotIndex) => {
                              const slotHeight = ((slot.endMinute - slot.startMinute) / 60) * 100;
                              const duration = slot.endMinute - slot.startMinute;
                              const maxCapacity = duration === 15 ? 1 : duration === 30 ? 1 : 1; // Por slot específico
                              const isFull = slot.appointments.length >= maxCapacity;

                              return (
                                <div
                                  key={`${hour}:${slot.startMinute}`}
                                  className={`flex-shrink-0 relative border-t border-dashed border-border/30 pt-0.5 ${slotIndex === 0 ? 'border-t-0' : ''
                                    }`}
                                  style={{
                                    height: `${slotHeight}%`,
                                    minHeight: '22px'
                                  }}
                                >
                                  {/* Header del slot con tiempo y capacidad */}
                                  <div className="flex items-center justify-between mb-0.5 px-0.5">
                                    <div className="text-[8px] text-muted-foreground/70 font-mono font-semibold">
                                      {String(hour).padStart(2, '0')}:{String(slot.startMinute).padStart(2, '0')}
                                    </div>
                                    {slot.appointments.length > 0 && (
                                      <div className={`text-[7px] px-1 py-0.5 rounded-full font-bold ${isFull
                                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                        }`}>
                                        {slot.appointments.length}/{maxCapacity}
                                      </div>
                                    )}
                                  </div>

                                  {/* Citas en este slot */}
                                  <div className="flex flex-col gap-0.5 overflow-y-auto scrollbar-none h-[calc(100%-16px)]">
                                    {slot.appointments.map((apt, aptIndex) => {
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
                                          className={`text-[9px] p-1.5 rounded-md border-l-[3px] transition-all hover:shadow-md hover:scale-[1.02] ${isDragging ? "opacity-50 scale-95 cursor-grabbing" : "cursor-grab"
                                            } ${apt.status === "pendiente"
                                              ? "bg-yellow-50 dark:bg-yellow-900/30 border-yellow-500 dark:border-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900/40"
                                              : apt.status === "confirmada"
                                                ? "bg-blue-50 dark:bg-blue-900/30 border-blue-500 dark:border-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/40"
                                                : apt.status === "completada"
                                                  ? "bg-green-50 dark:bg-green-900/30 border-green-500 dark:border-green-600 hover:bg-green-100 dark:hover:bg-green-900/40"
                                                  : "bg-muted border-muted-foreground hover:bg-muted/80"
                                            }`}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (!isDragging) {
                                              onAppointmentClick?.(apt);
                                            }
                                          }}
                                        >
                                          <div className="font-bold text-foreground truncate flex items-center justify-between gap-1">
                                            <span className="text-[10px]">{format(new Date(apt.fecha_hora), "HH:mm")}</span>
                                            <div className="flex items-center gap-1">
                                              <span className="text-[7px] px-1 py-0.5 bg-background/50 rounded text-muted-foreground font-mono">
                                                {apt.duracion_minutos}min
                                              </span>
                                            </div>
                                          </div>
                                          <div className="truncate text-muted-foreground font-semibold mt-0.5">
                                            {apt.paciente_nombre}
                                          </div>
                                          {apt.motivo && (
                                            <div className="text-[7px] text-muted-foreground/70 truncate mt-0.5">
                                              {apt.motivo}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>

                                  {/* Indicador de slot vacío */}
                                  {slot.appointments.length === 0 && !isPast && !isPastDay && (
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                      <div className="text-[8px] text-muted-foreground/50 font-medium bg-background/80 px-2 py-1 rounded-md">
                                        Disponible
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          !isPast && !isPastDay && (
                            <div className="h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                              <span className="text-[9px] text-muted-foreground font-medium">+</span>
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
