/**
 * @file today-timeline-widget.tsx
 * @description Widget de timeline de citas del día con datos reales de Supabase.
 * Muestra las citas programadas para hoy con estados en tiempo real.
 * 
 * @module Dashboard/Widgets
 */

"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    Calendar,
    Clock,
    Video,
    User,
    ChevronRight,
    Play,
    CheckCircle2,
    Loader2,
    XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { WidgetWrapper } from "../widget-wrapper";
import { useDashboardData, type TodayAppointment } from "@/hooks/use-dashboard-data";

// ============================================================================
// TIPOS
// ============================================================================

interface TodayTimelineWidgetProps {
    /** ID del médico para obtener sus citas */
    doctorId?: string;
    /** Si el widget está siendo arrastrado */
    isDragging?: boolean;
    /** Ref para el handle de arrastre */
    /** Listeners para el handle de arrastre */
    /** Atributos para el handle de arrastre */
}

// ============================================================================
// COMPONENTE DE ITEM DE TIMELINE
// ============================================================================

/**
 * Item individual en el timeline de citas.
 */
function TimelineItem({
    appointment,
    index,
    onStartConsultation
}: {
    appointment: TodayAppointment;
    index: number;
    onStartConsultation?: (id: string) => void;
}) {
    const isActive = appointment.status === "in-progress";
    const isCompleted = appointment.status === "completed";
    const isPending = appointment.status === "pending";
    const isCancelled = appointment.status === "cancelled";

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08 }}
            className={cn(
                "relative flex items-start gap-3 pl-6 pb-4",
                "border-l-2 last:border-l-0 last:pb-0",
                isActive && "border-primary",
                isCompleted && "border-green-500",
                isCancelled && "border-red-300",
                isPending && "border-border"
            )}
        >
            {/* Timeline Dot */}
            <div
                className={cn(
                    "absolute left-0 -translate-x-1/2 w-3 h-3 rounded-full border-2",
                    isActive && "bg-primary border-primary animate-pulse",
                    isCompleted && "bg-green-500 border-green-500",
                    isCancelled && "bg-red-400 border-red-400",
                    isPending && "bg-background border-muted-foreground"
                )}
            />

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-mono font-medium text-foreground">
                        {appointment.time}
                    </span>
                    {appointment.type === "telemedicina" && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 gap-1">
                            <Video className="h-2.5 w-2.5" />
                            Video
                        </Badge>
                    )}
                    {isActive && (
                        <Badge className="text-[10px] px-1.5 py-0 bg-primary animate-pulse">
                            En curso
                        </Badge>
                    )}
                    {isCancelled && (
                        <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                            Cancelada
                        </Badge>
                    )}
                </div>

                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        {/* Avatar del paciente */}
                        <Avatar className="h-6 w-6">
                            {appointment.patientAvatar ? (
                                <AvatarImage src={appointment.patientAvatar} alt={appointment.patient} />
                            ) : null}
                            <AvatarFallback className="text-[10px] bg-muted">
                                {appointment.patient.split(" ").map(n => n[0]).join("").slice(0, 2)}
                            </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0">
                            <span className={cn(
                                "text-sm truncate block",
                                isCompleted && "text-muted-foreground line-through",
                                isCancelled && "text-muted-foreground line-through",
                                isActive && "font-medium text-foreground",
                                isPending && "text-foreground"
                            )}>
                                {appointment.patient}
                            </span>
                            {appointment.motivo && (
                                <span className="text-[10px] text-muted-foreground truncate block">
                                    {appointment.motivo}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Action Button */}
                    {isActive && (
                        <Button
                            size="sm"
                            className="h-6 text-xs gap-1"
                            onClick={() => onStartConsultation?.(appointment.id)}
                        >
                            <Play className="h-3 w-3" />
                            Consultar
                        </Button>
                    )}
                    {isCompleted && (
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                    )}
                    {isCancelled && (
                        <XCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                    )}
                    {isPending && (
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Widget de citas del día.
 * Muestra un timeline con todas las citas programadas para hoy,
 * con estados de completado, en progreso y pendiente.
 * 
 * @example
 * <TodayTimelineWidget doctorId="uuid-del-doctor" />
 */
export function TodayTimelineWidget({
    doctorId,
    isDragging
}: TodayTimelineWidgetProps) {
    const router = useRouter();

    // Obtener datos reales del dashboard
    const { todayAppointments, isLoading } = useDashboardData(doctorId);

    // Calcular estadísticas
    const stats = useMemo(() => {
        const completed = todayAppointments.filter(a => a.status === "completed").length;
        const cancelled = todayAppointments.filter(a => a.status === "cancelled").length;
        const total = todayAppointments.length - cancelled; // No contar canceladas en el total
        const inProgress = todayAppointments.find(a => a.status === "in-progress");
        const nextPending = todayAppointments.find(a => a.status === "pending");

        return { completed, total, inProgress, nextPending };
    }, [todayAppointments]);

    // Handler para iniciar consulta
    const handleStartConsultation = (appointmentId: string) => {
        router.push(`/dashboard/medico/consulta/${appointmentId}`);
    };

    return (
        <WidgetWrapper
            id="today-timeline"
            title="Citas de Hoy"
            icon={<Calendar className="h-4 w-4 text-primary" />}
            isDragging={isDragging}
            showControls={false}
        >
            <div className="space-y-4">
                {/* Estado de carga */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                ) : (
                    <>
                        {/* Progress Summary */}
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                                {stats.completed}/{stats.total} completadas
                            </span>
                            <div className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {stats.nextPending ? (
                                    <span>Próxima: {stats.nextPending.time}</span>
                                ) : stats.inProgress ? (
                                    <span className="text-primary">En consulta</span>
                                ) : (
                                    <span>Sin citas pendientes</span>
                                )}
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{
                                    width: stats.total > 0
                                        ? `${(stats.completed / stats.total) * 100}%`
                                        : "0%"
                                }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
                            />
                        </div>

                        {/* Timeline */}
                        <div className="space-y-0 max-h-[280px] overflow-y-auto pr-2 scrollbar-thin">
                            {todayAppointments.length > 0 ? (
                                todayAppointments.map((appointment, index) => (
                                    <TimelineItem
                                        key={appointment.id}
                                        appointment={appointment}
                                        index={index}
                                        onStartConsultation={handleStartConsultation}
                                    />
                                ))
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-8 text-muted-foreground"
                                >
                                    <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No hay citas programadas para hoy</p>
                                    <Button
                                        variant="link"
                                        className="text-xs mt-1"
                                        onClick={() => router.push("/dashboard/medico/citas/nueva")}
                                    >
                                        Programar una cita
                                    </Button>
                                </motion.div>
                            )}
                        </div>

                        {/* View All Button */}
                        {todayAppointments.length > 0 && (
                            <Button variant="outline" className="w-full text-xs h-8" asChild>
                                <a href="/dashboard/medico/citas">
                                    Ver agenda completa
                                    <ChevronRight className="h-3 w-3 ml-1" />
                                </a>
                            </Button>
                        )}
                    </>
                )}
            </div>
        </WidgetWrapper>
    );
}
