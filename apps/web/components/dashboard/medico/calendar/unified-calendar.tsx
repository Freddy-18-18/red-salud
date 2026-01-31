/**
 * @file unified-calendar.tsx
 * @description Calendario unificado compacto con vistas integradas (Día, Semana, Mes, Lista)
 * @module Dashboard/Medico/Calendar
 */

"use client";

import { useState } from "react";
import { Button } from "@red-salud/ui";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, AlignJustify, LayoutGrid, LayoutList } from "lucide-react";
import { format, addDays, addWeeks, addMonths, subDays, subWeeks, subMonths, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, isToday, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import type { CalendarAppointment } from "./types";
import { cn } from "@red-salud/core/utils";
import { AppointmentCard } from "./appointment-card";
import { AppointmentStack } from "./appointment-stack";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@red-salud/ui";

type ViewMode = "day" | "week" | "month" | "list";

interface UnifiedCalendarProps {
  appointments: CalendarAppointment[];
  onNewAppointment?: () => void;
  onAppointmentClick?: (appointment: CalendarAppointment) => void;
  onTimeSlotClick?: (date: Date, hour?: number) => void;
  onMessage?: (appointment: CalendarAppointment) => void;
  onStartVideo?: (appointment: CalendarAppointment) => void;
  loading?: boolean;
}

export function UnifiedCalendar({
  appointments,
  onNewAppointment,
  onAppointmentClick,
  onTimeSlotClick,
  onMessage,
  onStartVideo,
  loading = false,
}: UnifiedCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("week");

  const handlePrevious = () => {
    switch (viewMode) {
      case "day":
        setCurrentDate(subDays(currentDate, 1));
        break;
      case "week":
        setCurrentDate(subWeeks(currentDate, 1));
        break;
      case "month":
        setCurrentDate(subMonths(currentDate, 1));
        break;
    }
  };

  const handleNext = () => {
    switch (viewMode) {
      case "day":
        setCurrentDate(addDays(currentDate, 1));
        break;
      case "week":
        setCurrentDate(addWeeks(currentDate, 1));
        break;
      case "month":
        setCurrentDate(addMonths(currentDate, 1));
        break;
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getDateRangeText = () => {
    switch (viewMode) {
      case "day":
        return format(currentDate, "EEEE, d 'de' MMMM", { locale: es });
      case "week":
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
        // Si el año cambia, mostrarlo. Si no, ocultar por brevedad
        const sameYear = weekStart.getFullYear() === weekEnd.getFullYear();
        return `${format(weekStart, "d MMM", { locale: es })} - ${format(weekEnd, sameYear ? "d MMM" : "d MMM yyyy", { locale: es })}`;
      case "month":
        return format(currentDate, "MMMM yyyy", { locale: es });
      case "list":
        return "Todas las citas";
    }
  };

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(apt => isSameDay(new Date(apt.fecha_hora), date));
  };

  const getAppointmentsForHour = (date: Date, hour: number) => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.fecha_hora);
      return isSameDay(aptDate, date) && aptDate.getHours() === hour;
    });
  };

  const renderDayView = () => {
    const hours = Array.from({ length: 16 }, (_, i) => i + 7); // 7 AM - 10 PM
    const dayAppointments = getAppointmentsForDate(currentDate);

    // Ajuste de ancho responsivo
    return (
      <div className="h-full">
        <div className="min-w-full md:min-w-[600px]">
          {hours.map(hour => {
            const hourAppointments = getAppointmentsForHour(currentDate, hour);
            return (
              <div
                key={hour}
                className="flex border-b border-border hover:bg-muted/30 transition-colors"
                onClick={() => hourAppointments.length === 0 && onTimeSlotClick?.(currentDate, hour)}
              >
                <div className="w-14 md:w-16 flex-shrink-0 p-1 text-xs text-muted-foreground font-medium border-r border-border md:border-none flex items-start justify-center pt-2">
                  {format(new Date().setHours(hour, 0), "HH:mm")}
                </div>
                <div className="flex-1 min-h-[50px] md:min-h-[40px] p-0.5 relative">
                  {hourAppointments.length > 0 ? (
                    <AppointmentStack
                      appointments={hourAppointments}
                      maxVisible={3}
                      compact={false}
                      onAppointmentClick={onAppointmentClick}
                    />
                  ) : (
                    <div className="h-full w-full absolute inset-0 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <Plus className="h-4 w-4 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: endOfWeek(weekStart, { weekStartsOn: 1 }) });
    const hours = Array.from({ length: 16 }, (_, i) => i + 7);

    return (
      <div className="h-full">
        <div className="min-w-[700px] lg:min-w-full">
          {/* Header con días - MÁS COMPACTO */}
          <div className="flex border-b border-border bg-muted sticky top-0 z-10">
            <div className="w-12 flex-shrink-0" />
            {weekDays.map(day => (
              <div key={day.toISOString()} className={cn("flex-1 p-2 text-center border-l border-border/50", isToday(day) && "bg-primary/5")}>
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  {format(day, "EEE", { locale: es })}
                </div>
                <div className={cn(
                  "text-sm font-semibold inline-flex items-center justify-center w-7 h-7 rounded-full mt-0.5",
                  isToday(day) && "bg-primary text-primary-foreground"
                )}>
                  {format(day, "d")}
                </div>
              </div>
            ))}
          </div>

          {/* Grid de horas - MÁS COMPACTO */}
          {hours.map(hour => (
            <div key={hour} className="flex border-b border-border">
              <div className="w-12 flex-shrink-0 p-1 text-[10px] text-muted-foreground font-medium text-center pt-2">
                {format(new Date().setHours(hour, 0), "HH:mm")}
              </div>
              {weekDays.map(day => {
                const hourAppointments = getAppointmentsForHour(day, hour);
                const isDayToday = isToday(day);
                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      "flex-1 min-h-[44px] p-0.5 border-l border-border hover:bg-muted/30 transition-colors cursor-pointer relative",
                      isDayToday && "bg-primary/[0.02]"
                    )}
                    onClick={() => hourAppointments.length === 0 && onTimeSlotClick?.(day, hour)}
                  >
                    {hourAppointments.length > 0 && (
                      <AppointmentStack
                        appointments={hourAppointments}
                        maxVisible={2}
                        compact={true}
                        onAppointmentClick={onAppointmentClick}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    return (
      <div className="h-full flex flex-col">
        {/* Header Days */}
        <div className="grid grid-cols-7 border-b border-border">
          {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map(day => (
            <div key={day} className="bg-muted/30 p-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 grid-rows-5 flex-1 bg-border gap-px overflow-y-auto">
          {calendarDays.map(day => {
            const dayAppointments = getAppointmentsForDate(day);
            const isCurrentMonth = isSameMonth(day, currentDate);

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "bg-card min-h-[80px] p-1.5 cursor-pointer hover:bg-muted/30 transition-colors relative flex flex-col",
                  !isCurrentMonth && "bg-muted/10 text-muted-foreground"
                )}
                onClick={() => {
                  setCurrentDate(day);
                  setViewMode("day");
                }}
              >
                <div className={cn(
                  "text-xs font-medium mb-1 ml-1 w-6 h-6 flex items-center justify-center rounded-full",
                  isToday(day) ? "bg-primary text-primary-foreground" : ""
                )}>
                  {format(day, "d")}
                </div>

                <div className="flex-1 space-y-1 overflow-hidden">
                  {dayAppointments.slice(0, 3).map(apt => (
                    <div key={apt.id} className="text-[10px] truncate px-1 rounded-sm border-l-2 pl-1 bg-muted/40" style={{ borderLeftColor: apt.color }}>
                      {format(parseISO(apt.fecha_hora), 'HH:mm')} {apt.paciente_nombre}
                    </div>
                  ))}
                  {dayAppointments.length > 3 && (
                    <div className="text-[10px] text-muted-foreground pl-1">
                      + {dayAppointments.length - 3} más
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderListView = () => {
    // Group appointments by date
    const groupedAppointments: Record<string, CalendarAppointment[]> = {};

    // Sort all appointments by date
    const sortedAppointments = [...appointments].sort((a, b) =>
      new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime()
    );

    sortedAppointments.forEach(apt => {
      const dateKey = format(parseISO(apt.fecha_hora), 'yyyy-MM-dd');
      if (!groupedAppointments[dateKey]) {
        groupedAppointments[dateKey] = [];
      }
      groupedAppointments[dateKey].push(apt);
    });

    return (
      <div className="h-full p-4 overflow-y-auto">
        {sortedAppointments.length > 0 ? (
          <div className="space-y-6 w-full pb-10">
            {Object.entries(groupedAppointments).map(([dateKey, apts]) => (
              <div key={dateKey} className="space-y-3">
                <div className="sticky top-0 bg-background/95 backdrop-blur-sm p-2 z-10 border-b border-border flex items-center gap-2">
                  <div className={cn(
                    "text-lg font-bold",
                    isToday(parseISO(dateKey)) && "text-primary"
                  )}>
                    {format(parseISO(dateKey), "EEEE d 'de' MMMM", { locale: es })}
                  </div>
                  <div className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {apts.length} {apts.length === 1 ? 'cita' : 'citas'}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pl-2 sm:pl-4">
                  {apts.map(apt => (
                    <AppointmentCard
                      key={apt.id}
                      appointment={apt}
                      onView={onAppointmentClick}
                      onMessage={onMessage}
                      onStartVideo={onStartVideo}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="h-20 w-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarIcon className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No hay citas visibles</h3>
              <p className="text-muted-foreground mb-6 max-w-[250px] mx-auto">
                No hay citas que coincidan con los filtros seleccionados o el rango de fechas.
              </p>
              <Button onClick={onNewAppointment}>
                <Plus className="h-4 w-4 mr-2" />
                Agendar Primera Cita
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Toolbar responsive */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-2 sm:p-3 border-b border-border bg-card gap-3 sm:gap-4 transition-all duration-200">

        {/* Navigation & Date */}
        <div className="flex items-center justify-between sm:justify-start gap-2">
          <div className="flex items-center bg-muted/30 rounded-lg p-0.5">
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-background shadow-none" onClick={handlePrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="h-4 w-[1px] bg-border mx-1" />
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-background shadow-none" onClick={handleNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Button variant="outline" size="sm" className="h-9 hidden md:flex" onClick={handleToday}>
            Hoy
          </Button>

          <span className="text-sm sm:text-base font-semibold text-foreground ml-1 truncate">
            {getDateRangeText()}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-2">
          {/* View Selector Mobile (Dropdown) / Desktop (Tabs) */}
          <div className="sm:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="w-full">
                  {viewMode === 'day' ? 'Día' : viewMode === 'week' ? 'Semana' : viewMode === 'month' ? 'Mes' : 'Lista'}
                  <AlignJustify className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setViewMode("day")}>Día</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setViewMode("week")}>Semana</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setViewMode("month")}>Mes</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setViewMode("list")}>Lista</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="hidden sm:flex items-center bg-muted/30 p-1 rounded-lg">
            <Button
              variant={viewMode === "day" ? "default" : "ghost"}
              size="sm"
              className="h-7 text-xs px-3 shadow-none data-[state=active]:bg-background"
              onClick={() => setViewMode("day")}
            >
              Día
            </Button>
            <Button
              variant={viewMode === "week" ? "default" : "ghost"}
              size="sm"
              className="h-7 text-xs px-3 shadow-none"
              onClick={() => setViewMode("week")}
            >
              Semana
            </Button>
            <Button
              variant={viewMode === "month" ? "default" : "ghost"}
              size="sm"
              className="h-7 text-xs px-3 shadow-none"
              onClick={() => setViewMode("month")}
            >
              Mes
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              className="h-7 text-xs px-3 shadow-none"
              onClick={() => setViewMode("list")}
            >
              Lista
            </Button>
          </div>

          <Button onClick={onNewAppointment} size="sm" className="h-9 px-4 shadow-sm active:scale-95 transition-transform">
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Nueva Cita</span>
          </Button>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden relative">
        {viewMode === "day" && renderDayView()}
        {viewMode === "week" && renderWeekView()}
        {viewMode === "month" && renderMonthView()}
        {viewMode === "list" && renderListView()}
      </div>
    </div>
  );
}
