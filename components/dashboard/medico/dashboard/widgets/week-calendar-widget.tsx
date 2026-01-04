/**
 * @file week-calendar-widget.tsx
 * @description Widget de calendario semanal con navegación temporal y datos reales de Supabase.
 * Muestra la carga de citas por día con capacidad de navegar entre semanas.
 * 
 * @module Dashboard/Widgets
 */

"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, ChevronLeft, ChevronRight, RotateCcw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { WidgetWrapper } from "../widget-wrapper";
import { useDashboardData } from "@/hooks/use-dashboard-data";

// ============================================================================
// TIPOS
// ============================================================================

interface WeekCalendarWidgetProps {
    /** ID del médico */
    doctorId?: string;
    /** Si está siendo arrastrado */
    isDragging?: boolean;
}

interface DayData {
    /** Fecha del día */
    date: Date;
    /** String de fecha YYYY-MM-DD */
    dateStr: string;
    /** Número de citas programadas */
    appointments: number;
    /** Número de citas completadas */
    completed: number;
    /** Si es el día actual */
    isToday: boolean;
    /** Si es un día pasado */
    isPast: boolean;
}

// ============================================================================
// CONSTANTES
// ============================================================================

/** Nombres cortos de los días de la semana */
const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

/** Nombres de meses */
const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Formatea un rango de fechas para mostrar.
 * @example "22-28 Dic" o "28 Dic - 3 Ene"
 */
function formatDateRange(startDate: Date, endDate: Date): string {
    const startDay = startDate.getDate();
    const endDay = endDate.getDate();
    const startMonth = monthNames[startDate.getMonth()];
    const endMonth = monthNames[endDate.getMonth()];

    if (startDate.getMonth() === endDate.getMonth()) {
        return `${startDay}-${endDay} ${startMonth}`;
    }
    return `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
}

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

/**
 * Celda individual de día en el calendario.
 */
function DayCell({
    date,
    dateStr,
    appointments,
    completed,
    isToday,
    isPast,
    index,
    onDayClick
}: DayData & { index: number; onDayClick: (dateStr: string) => void }) {
    const dayName = dayNames[date.getDay()];
    const dayNumber = date.getDate();
    const loadPercentage = Math.min((appointments / 10) * 100, 100);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            onClick={() => onDayClick(dateStr)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onDayClick(dateStr)}
            aria-label={`Ver citas del ${date.getDate()} de ${date.toLocaleDateString('es', { month: 'long' })}`}
            className={cn(
                "relative flex flex-col items-center p-2 rounded-xl cursor-pointer",
                "transition-all duration-200",
                "hover:bg-primary/20 hover:scale-105",
                "focus:outline-none focus:ring-2 focus:ring-primary/50",
                isToday && "bg-primary/10 ring-2 ring-primary/30"
            )}
        >
            {/* Nombre del día */}
            <span className={cn(
                "text-[10px] font-medium uppercase tracking-wide",
                isToday ? "text-primary" : "text-muted-foreground"
            )}>
                {dayName}
            </span>

            {/* Número del día */}
            <span className={cn(
                "text-lg font-bold mt-0.5",
                isToday && "text-primary",
                isPast && !isToday && "text-muted-foreground"
            )}>
                {dayNumber}
            </span>

            {/* Indicador de carga */}
            <div className="w-full mt-2 space-y-1">
                <div className="h-1 rounded-full bg-muted overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${loadPercentage}%` }}
                        transition={{ delay: 0.2 + index * 0.03, duration: 0.4 }}
                        className={cn(
                            "h-full rounded-full",
                            appointments === 0 && "bg-transparent",
                            appointments > 0 && appointments <= 3 && "bg-green-500",
                            appointments > 3 && appointments <= 6 && "bg-yellow-500",
                            appointments > 6 && "bg-red-500"
                        )}
                    />
                </div>

                {/* Conteo de citas */}
                {appointments > 0 && (
                    <div className="text-[10px] text-center text-muted-foreground">
                        {isPast || isToday ? (
                            <span>{completed}/{appointments}</span>
                        ) : (
                            <span>{appointments}</span>
                        )}
                    </div>
                )}
            </div>

            {/* Indicador de día actual */}
            {isToday && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary"
                />
            )}
        </motion.div>
    );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Widget de calendario semanal con navegación temporal.
 * Permite navegar entre semanas pasadas y futuras.
 * 
 * @example
 * <WeekCalendarWidget doctorId="uuid-del-doctor" />
 */
export function WeekCalendarWidget({
    doctorId,
    isDragging
}: WeekCalendarWidgetProps) {
    // Router para navegación
    const router = useRouter();

    // Estado para offset de semana (0 = semana actual, -1 = semana pasada, 1 = próxima)
    const [weekOffset, setWeekOffset] = useState(0);

    // Obtener datos reales del dashboard
    const { appointments, isLoading } = useDashboardData(doctorId);

    // Fecha de hoy (referencia fija)
    const today = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);

    // Calcular inicio y fin de la semana actual + offset
    const { startOfWeek, endOfWeek, dateRange } = useMemo(() => {
        // Obtenemos el domingo de la semana actual
        const start = new Date(today);
        const day = today.getDay(); // 0 (Dom) a 6 (Sáb)

        // Ajustamos al domingo de la semana base (esta semana)
        start.setDate(today.getDate() - day);

        // Aplicamos el offset de semanas
        start.setDate(start.getDate() + (weekOffset * 7));
        start.setHours(0, 0, 0, 0);

        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);

        return {
            startOfWeek: start,
            endOfWeek: end,
            dateRange: formatDateRange(start, end),
        };
    }, [today, weekOffset]);

    // Calcular datos de la semana
    const weekData = useMemo(() => {
        const days: DayData[] = [];

        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);

            // IMPORTANTE: Usar formato local YYYY-MM-DD para comparar con la base de datos
            // sin desfases de UTC
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const dd = String(date.getDate()).padStart(2, '0');
            const dateStr = `${yyyy}-${mm}-${dd}`;

            // Filtrar citas para este día
            const dayAppointments = appointments.filter(apt =>
                apt.appointment_date === dateStr
            );

            const completedCount = dayAppointments.filter(apt =>
                apt.status === 'completed'
            ).length;

            days.push({
                date,
                dateStr,
                appointments: dayAppointments.length,
                completed: completedCount,
                isToday: date.toDateString() === today.toDateString(),
                isPast: date < today,
            });
        }

        return days;
    }, [appointments, startOfWeek, today]);

    // Calcular totales de la semana
    const totalThisWeek = weekData.reduce((sum, d) => sum + d.appointments, 0);

    // Handlers de navegación
    const goToPreviousWeek = useCallback(() => {
        setWeekOffset(prev => prev - 1);
    }, []);

    const goToNextWeek = useCallback(() => {
        setWeekOffset(prev => prev + 1);
    }, []);

    const goToCurrentWeek = useCallback(() => {
        setWeekOffset(0);
    }, []);

    // ¿Estamos en la semana actual?
    const isCurrentWeek = weekOffset === 0;

    /**
     * Handler para navegar a la página de citas con la fecha seleccionada
     * @param dateStr - Fecha en formato YYYY-MM-DD
     */
    const handleDayClick = useCallback((dateStr: string) => {
        router.push(`/dashboard/medico/citas?date=${dateStr}&view=day`);
    }, [router]);

    return (
        <WidgetWrapper
            id="week-calendar"
            title="Calendario Semanal"
            icon={<CalendarDays className="h-4 w-4 text-primary" />}
            isDragging={isDragging}
            showControls={false}
        >
            <div className="space-y-3">
                {/* Estado de carga */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                ) : (
                    <>
                        {/* Header con navegación */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{dateRange}</span>
                                {!isCurrentWeek && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-5 px-1.5 text-[10px] gap-1"
                                        onClick={goToCurrentWeek}
                                    >
                                        <RotateCcw className="h-3 w-3" />
                                        Hoy
                                    </Button>
                                )}
                            </div>
                            <div className="flex items-center gap-0.5">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={goToPreviousWeek}
                                    aria-label="Semana anterior"
                                >
                                    <ChevronLeft className="h-3 w-3" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={goToNextWeek}
                                    aria-label="Semana siguiente"
                                >
                                    <ChevronRight className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>

                        {/* Stats rápidos */}
                        <div className="text-xs text-muted-foreground">
                            <span className="font-medium text-foreground">{totalThisWeek}</span> citas
                            {isCurrentWeek ? " esta semana" : ""}
                        </div>

                        {/* Grid de la semana con animación */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={weekOffset}
                                initial={{ opacity: 0, x: weekOffset > 0 ? 20 : -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: weekOffset > 0 ? -20 : 20 }}
                                transition={{ duration: 0.2 }}
                                className="grid grid-cols-7 gap-1"
                            >
                                {weekData.map((day, index) => (
                                    <DayCell
                                        key={day.dateStr}
                                        date={day.date}
                                        dateStr={day.dateStr}
                                        appointments={day.appointments}
                                        completed={day.completed}
                                        isToday={day.isToday}
                                        isPast={day.isPast}
                                        index={index}
                                        onDayClick={handleDayClick}
                                    />
                                ))}
                            </motion.div>
                        </AnimatePresence>

                        {/* Leyenda */}
                        <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                <span>1-3</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                <span>4-6</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-red-500" />
                                <span>7+</span>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </WidgetWrapper>
    );
}
