"use client";

import { useMemo } from "react";
import { format, isSameDay, isToday as checkIsToday } from "date-fns";
import { es } from "date-fns/locale";
import { AppointmentCard } from "./appointment-card";
import type { CalendarAppointment } from "./types";
import { Clock, Calendar } from "lucide-react";

interface DayViewProps {
  date: Date;
  appointments: CalendarAppointment[];
  onAppointmentClick?: (appointment: CalendarAppointment) => void;
  onTimeSlotClick?: (date: Date, hour: number) => void;
  onMessage?: (appointment: CalendarAppointment) => void;
  onStartVideo?: (appointment: CalendarAppointment) => void;
  startHour?: number;
  endHour?: number;
}

export function DayView({
  date,
  appointments,
  onAppointmentClick,
  onTimeSlotClick,
  onMessage,
  onStartVideo,
  startHour = 7,
  endHour = 20,
}: DayViewProps) {
  const hours = useMemo(() => {
    const result = [];
    for (let i = startHour; i <= endHour; i++) {
      result.push(i);
    }
    return result;
  }, [startHour, endHour]);

  const dayAppointments = useMemo(() => {
    return appointments.filter((apt) =>
      isSameDay(new Date(apt.fecha_hora), date)
    );
  }, [appointments, date]);

  const currentHour = new Date().getHours();
  const isCurrentDay = checkIsToday(date);

  const getAppointmentsForHour = (hour: number) => {
    return dayAppointments.filter((apt) => {
      const aptHour = new Date(apt.fecha_hora).getHours();
      return aptHour === hour;
    });
  };

  // Estadísticas del día
  const dayStats = {
    pendientes: dayAppointments.filter(a => a.status === "pendiente").length,
    confirmadas: dayAppointments.filter(a => a.status === "confirmada").length,
    completadas: dayAppointments.filter(a => a.status === "completada").length,
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-lg shadow-sm overflow-hidden">
      {/* Header - Sticky */}
      <div className={`border-b-2 p-6 sticky top-0 z-20 shadow-md ${isCurrentDay
        ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground"
        : "bg-gradient-to-r from-muted to-muted/80 text-foreground"
        }`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Calendar className={`h-6 w-6 ${isCurrentDay ? "text-primary-foreground/80" : "text-muted-foreground"}`} />
              <h2 className={`text-3xl font-bold ${isCurrentDay ? "text-primary-foreground" : "text-foreground"}`}>
                {format(date, "EEEE, d 'de' MMMM", { locale: es })}
              </h2>
            </div>
            <p className={`text-sm ml-9 ${isCurrentDay ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
              {dayAppointments.length} cita{dayAppointments.length !== 1 ? "s" : ""} programada{dayAppointments.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Mini Stats */}
          <div className="flex gap-3">
            <div className={`px-4 py-2 rounded-lg ${isCurrentDay ? "bg-primary-foreground/20 backdrop-blur-sm" : "bg-card shadow-sm"
              }`}>
              <div className={`text-xs font-medium ${isCurrentDay ? "text-primary-foreground/80" : "text-muted-foreground"}`}>Pendientes</div>
              <div className={`text-2xl font-bold ${isCurrentDay ? "text-primary-foreground" : "text-yellow-600 dark:text-yellow-400"}`}>{dayStats.pendientes}</div>
            </div>
            <div className={`px-4 py-2 rounded-lg ${isCurrentDay ? "bg-primary-foreground/20 backdrop-blur-sm" : "bg-card shadow-sm"
              }`}>
              <div className={`text-xs font-medium ${isCurrentDay ? "text-primary-foreground/80" : "text-muted-foreground"}`}>Confirmadas</div>
              <div className={`text-2xl font-bold ${isCurrentDay ? "text-primary-foreground" : "text-blue-600 dark:text-blue-400"}`}>{dayStats.confirmadas}</div>
            </div>
            <div className={`px-4 py-2 rounded-lg ${isCurrentDay ? "bg-primary-foreground/20 backdrop-blur-sm" : "bg-card shadow-sm"
              }`}>
              <div className={`text-xs font-medium ${isCurrentDay ? "text-primary-foreground/80" : "text-muted-foreground"}`}>Completadas</div>
              <div className={`text-2xl font-bold ${isCurrentDay ? "text-primary-foreground" : "text-green-600 dark:text-green-400"}`}>{dayStats.completadas}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Time Grid - Fixed height cells for uniformity */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-muted">
        <div className="min-w-full">
          {hours.map((hour) => {
            const hourAppointments = getAppointmentsForHour(hour);
            const isCurrentHour = hour === currentHour && isCurrentDay;
            const slotTime = new Date(date);
            slotTime.setHours(hour, 0, 0, 0);
            const isPast = slotTime < new Date();

            return (
              <div
                key={hour}
                className={`flex border-b border-border transition-colors ${isCurrentHour ? "bg-warning/10 dark:bg-warning/20" : "hover:bg-muted/50"
                  }`}
              >
                {/* Time Label - Sticky left */}
                <div className={`w-24 flex-shrink-0 p-4 border-r border-border bg-muted/50 backdrop-blur-sm sticky left-0 z-10 ${isCurrentHour ? "bg-warning/20 dark:bg-warning/30" : ""
                  }`}>
                  <div className="flex items-center gap-2">
                    <Clock className={`h-4 w-4 ${isCurrentHour ? "text-warning" : "text-muted-foreground"}`} />
                    <div>
                      <div className={`text-sm font-semibold ${isCurrentHour ? "text-warning" : "text-foreground"}`}>
                        {format(new Date().setHours(hour, 0, 0, 0), "HH:mm")}
                      </div>
                      {isCurrentHour && (
                        <div className="text-[10px] text-warning font-medium">Ahora</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Content Area - Fixed height */}
                <div
                  data-tour="time-slot"
                  className={`flex-1 p-3 h-28 transition-all duration-200 ${isPast
                    ? "bg-muted/50 cursor-not-allowed opacity-60"
                    : "cursor-pointer hover:bg-primary/5 dark:hover:bg-primary/10"
                    } ${isCurrentHour ? "ring-2 ring-inset ring-warning/50" : ""
                    }`}
                  onClick={() => {
                    if (!isPast) {
                      onTimeSlotClick?.(date, hour);
                    }
                  }}
                >
                  {hourAppointments.length > 0 ? (
                    <div className="space-y-2 h-full overflow-y-auto scrollbar-none">
                      {hourAppointments.map((apt) => (
                        <AppointmentCard
                          key={apt.id}
                          appointment={apt}
                          onView={onAppointmentClick}
                          onMessage={onMessage}
                          onStartVideo={onStartVideo}
                          compact
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      {!isPast ? (
                        <div className="text-muted-foreground text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          Click para agendar una cita
                        </div>
                      ) : (
                        <div className="text-muted-foreground/60 text-xs">
                          Horario pasado
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
