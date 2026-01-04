"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from "lucide-react";
import { format, addDays, addWeeks, addMonths, subDays, subWeeks, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarViewSelector, type CalendarView } from "./calendar-view-selector";
import { DayView } from "./day-view";
import { WeekView } from "./week-view-improved";
import { MonthView } from "./month-view";
import { AppointmentCard } from "./appointment-card";
import type { CalendarAppointment } from "./types";

interface CalendarMainProps {
  appointments: CalendarAppointment[];
  onNewAppointment?: () => void;
  onAppointmentClick?: (appointment: CalendarAppointment) => void;
  onTimeSlotClick?: (date: Date, hour?: number) => void;
  onMessage?: (appointment: CalendarAppointment) => void;
  onStartVideo?: (appointment: CalendarAppointment) => void;
  loading?: boolean;
  currentDate?: Date;
  view?: CalendarView;
  onDateChange?: (date: Date) => void;
  onViewChange?: (view: CalendarView) => void;
  // Drag & Drop
  dragState?: any;
  onDragStart?: (appointment: CalendarAppointment) => void;
  onDragOver?: (date: Date, hour: number) => void;
  onDragEnd?: () => void;
  onDragCancel?: () => void;
}

export function CalendarMain({
  appointments,
  onNewAppointment,
  onAppointmentClick,
  onTimeSlotClick,
  onMessage,
  onStartVideo,
  loading = false,
  currentDate: externalCurrentDate,
  view: externalView,
  onDateChange,
  onViewChange,
  dragState,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDragCancel,
}: CalendarMainProps) {
  const [currentDate, setCurrentDate] = useState(externalCurrentDate || new Date());
  const [filterStatus, setFilterStatus] = useState<"all" | "pendiente" | "confirmada" | "completada">("all");

  // Usar la vista externa directamente si está disponible, sino usar week por defecto
  const view = externalView || "week";

  // Sincronizar fecha con props externas
  useEffect(() => {
    if (externalCurrentDate) setCurrentDate(externalCurrentDate);
  }, [externalCurrentDate]);

  const handleDateChange = (date: Date) => {
    setCurrentDate(date);
    onDateChange?.(date);
  };

  const handleViewChange = (newView: CalendarView) => {
    onViewChange?.(newView);
  };

  const filteredAppointments = appointments.filter((apt) => {
    if (filterStatus === "all") return true;
    return apt.status === filterStatus;
  });

  const handlePrevious = () => {
    let newDate;
    switch (view) {
      case "day":
        newDate = subDays(currentDate, 1);
        break;
      case "week":
        newDate = subWeeks(currentDate, 1);
        break;
      case "month":
        newDate = subMonths(currentDate, 1);
        break;
      default:
        newDate = currentDate;
    }
    handleDateChange(newDate);
  };

  const handleNext = () => {
    let newDate;
    switch (view) {
      case "day":
        newDate = addDays(currentDate, 1);
        break;
      case "week":
        newDate = addWeeks(currentDate, 1);
        break;
      case "month":
        newDate = addMonths(currentDate, 1);
        break;
      default:
        newDate = currentDate;
    }
    handleDateChange(newDate);
  };

  const handleToday = () => {
    handleDateChange(new Date());
  };

  const getDateRangeText = () => {
    switch (view) {
      case "day":
        return format(currentDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
      case "week":
        const weekStart = subDays(currentDate, currentDate.getDay() - 1);
        const weekEnd = addDays(weekStart, 6);
        return `${format(weekStart, "d MMM", { locale: es })} - ${format(weekEnd, "d MMM yyyy", { locale: es })}`;
      case "month":
        return format(currentDate, "MMMM yyyy", { locale: es });
      case "list":
        return "Todas las citas";
      default:
        return "";
    }
  };

  // Estadísticas del día/período actual
  const stats = {
    total: appointments.length,
    pendientes: appointments.filter(a => a.status === "pendiente").length,
    confirmadas: appointments.filter(a => a.status === "confirmada").length,
    completadas: appointments.filter(a => a.status === "completada").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header Controls */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Navigation */}
          <div className="flex items-center gap-2" data-tour="date-navigation">
            <Button variant="outline" size="sm" onClick={handleToday}>
              <CalendarIcon className="h-4 w-4 mr-2" />
              Hoy
            </Button>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" onClick={handlePrevious}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-lg font-semibold text-gray-900 min-w-[200px]">
              {getDateRangeText()}
            </div>
          </div>

          {/* View Selector and Actions */}
          <div className="flex items-center gap-2">
            <div data-tour="calendar-view-buttons">
              <CalendarViewSelector currentView={view} onViewChange={handleViewChange} />
            </div>
            <Button onClick={onNewAppointment} data-tour="new-appointment-btn">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Cita
            </Button>
          </div>
        </div>

        {/* Stats - Clickeable */}
        {view !== "list" && (
          <div className="flex items-center gap-3 mt-4 pt-4 border-t flex-wrap" data-tour="calendar-filters">
            <button
              className={`text-sm px-3 py-1.5 rounded-md transition-colors ${filterStatus === "all" ? "bg-gray-200" : "hover:bg-gray-100"
                }`}
              onClick={() => setFilterStatus("all")}
            >
              <span className="text-gray-600">Total:</span>{" "}
              <span className="font-semibold text-gray-900">{stats.total}</span>
            </button>
            <button
              className={`text-sm px-3 py-1.5 rounded-md transition-colors ${filterStatus === "pendiente" ? "bg-yellow-100" : "hover:bg-yellow-50"
                }`}
              onClick={() => setFilterStatus("pendiente")}
            >
              <span className="text-gray-600">Pendientes:</span>{" "}
              <span className="font-semibold text-yellow-600">{stats.pendientes}</span>
            </button>
            <button
              className={`text-sm px-3 py-1.5 rounded-md transition-colors ${filterStatus === "confirmada" ? "bg-blue-100" : "hover:bg-blue-50"
                }`}
              onClick={() => setFilterStatus("confirmada")}
            >
              <span className="text-gray-600">Confirmadas:</span>{" "}
              <span className="font-semibold text-blue-600">{stats.confirmadas}</span>
            </button>
            <button
              className={`text-sm px-3 py-1.5 rounded-md transition-colors ${filterStatus === "completada" ? "bg-green-100" : "hover:bg-green-50"
                }`}
              onClick={() => setFilterStatus("completada")}
            >
              <span className="text-gray-600">Completadas:</span>{" "}
              <span className="font-semibold text-green-600">{stats.completadas}</span>
            </button>
          </div>
        )}
      </div>

      {/* Calendar Views - Flexible height */}
      <div className="flex-1 min-h-0">
        {view === "day" && (
          <DayView
            date={currentDate}
            appointments={filteredAppointments}
            onAppointmentClick={onAppointmentClick}
            onTimeSlotClick={onTimeSlotClick}
            onMessage={onMessage}
            onStartVideo={onStartVideo}
          />
        )}
        {view === "week" && (
          <WeekView
            date={currentDate}
            appointments={filteredAppointments}
            onAppointmentClick={onAppointmentClick}
            onTimeSlotClick={onTimeSlotClick}
            onMessage={onMessage}
            onStartVideo={onStartVideo}
            dragState={dragState}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
            onDragCancel={onDragCancel}
          />
        )}
        {view === "month" && (
          <MonthView
            date={currentDate}
            appointments={filteredAppointments}
            onDayClick={(date) => {
              setCurrentDate(date);
              handleViewChange("day");
            }}
            onAppointmentClick={onAppointmentClick}
          />
        )}
        {view === "list" && (
          <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 bg-gray-50 rounded-lg p-4">
            {filteredAppointments.length > 0 ? (
              <div className="space-y-3">
                {filteredAppointments.map((apt) => (
                  <AppointmentCard
                    key={apt.id}
                    appointment={apt}
                    onView={onAppointmentClick}
                    onMessage={onMessage}
                    onStartVideo={onStartVideo}
                  />
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300 max-w-md">
                  <CalendarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No hay citas programadas
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Las citas que agendes aparecerán aquí
                  </p>
                  <Button onClick={onNewAppointment} size="lg">
                    <Plus className="h-5 w-5 mr-2" />
                    Agendar Primera Cita
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
