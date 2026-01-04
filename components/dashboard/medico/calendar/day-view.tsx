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
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Header - Sticky */}
      <div className={`border-b-2 p-6 sticky top-0 z-20 shadow-md ${isCurrentDay
          ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
          : "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-900"
        }`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Calendar className={`h-6 w-6 ${isCurrentDay ? "text-blue-100" : "text-gray-500"}`} />
              <h2 className={`text-3xl font-bold ${isCurrentDay ? "text-white" : "text-gray-900"}`}>
                {format(date, "EEEE, d 'de' MMMM", { locale: es })}
              </h2>
            </div>
            <p className={`text-sm ml-9 ${isCurrentDay ? "text-blue-100" : "text-gray-600"}`}>
              {dayAppointments.length} cita{dayAppointments.length !== 1 ? "s" : ""} programada{dayAppointments.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Mini Stats */}
          <div className="flex gap-3">
            <div className={`px-4 py-2 rounded-lg ${isCurrentDay ? "bg-white/20 backdrop-blur-sm" : "bg-white shadow-sm"
              }`}>
              <div className={`text-xs font-medium ${isCurrentDay ? "text-blue-100" : "text-gray-600"}`}>Pendientes</div>
              <div className={`text-2xl font-bold ${isCurrentDay ? "text-white" : "text-yellow-600"}`}>{dayStats.pendientes}</div>
            </div>
            <div className={`px-4 py-2 rounded-lg ${isCurrentDay ? "bg-white/20 backdrop-blur-sm" : "bg-white shadow-sm"
              }`}>
              <div className={`text-xs font-medium ${isCurrentDay ? "text-blue-100" : "text-gray-600"}`}>Confirmadas</div>
              <div className={`text-2xl font-bold ${isCurrentDay ? "text-white" : "text-blue-600"}`}>{dayStats.confirmadas}</div>
            </div>
            <div className={`px-4 py-2 rounded-lg ${isCurrentDay ? "bg-white/20 backdrop-blur-sm" : "bg-white shadow-sm"
              }`}>
              <div className={`text-xs font-medium ${isCurrentDay ? "text-blue-100" : "text-gray-600"}`}>Completadas</div>
              <div className={`text-2xl font-bold ${isCurrentDay ? "text-white" : "text-green-600"}`}>{dayStats.completadas}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Time Grid - Fixed height cells for uniformity */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
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
                className={`flex border-b border-gray-200 transition-colors ${isCurrentHour ? "bg-yellow-50/50 border-yellow-300" : "hover:bg-gray-50/50"
                  }`}
              >
                {/* Time Label - Sticky left */}
                <div className={`w-24 flex-shrink-0 p-4 border-r border-gray-200 bg-gray-50/90 backdrop-blur-sm sticky left-0 z-10 ${isCurrentHour ? "bg-yellow-100 border-yellow-300" : ""
                  }`}>
                  <div className="flex items-center gap-2">
                    <Clock className={`h-4 w-4 ${isCurrentHour ? "text-yellow-700" : "text-gray-500"}`} />
                    <div>
                      <div className={`text-sm font-semibold ${isCurrentHour ? "text-yellow-800" : "text-gray-700"}`}>
                        {format(new Date().setHours(hour, 0, 0, 0), "HH:mm")}
                      </div>
                      {isCurrentHour && (
                        <div className="text-[10px] text-yellow-600 font-medium">Ahora</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Content Area - Fixed height */}
                <div
                  data-tour="time-slot"
                  className={`flex-1 p-3 h-28 transition-all duration-200 ${isPast
                      ? "bg-gray-50/70 cursor-not-allowed opacity-60"
                      : "cursor-pointer hover:bg-blue-50 hover:shadow-inner"
                    } ${isCurrentHour ? "ring-2 ring-inset ring-yellow-300/50" : ""
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
                        <div className="text-gray-300 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          Click para agendar una cita
                        </div>
                      ) : (
                        <div className="text-gray-400 text-xs">
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
