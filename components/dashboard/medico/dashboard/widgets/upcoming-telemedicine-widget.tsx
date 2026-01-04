/**
 * @file upcoming-telemedicine-widget.tsx
 * @description Widget de próximas videoconsultas del día.
 * Muestra las citas de telemedicina con acceso rápido a iniciar videollamada.
 * 
 * @module Dashboard/Widgets
 */

"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    Video,
    Clock,
    ChevronRight,
    Loader2,
    Play,
    User,
    Calendar,
    VideoOff
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { WidgetWrapper } from "../widget-wrapper";
import { useDashboardData } from "@/hooks/use-dashboard-data";

// ============================================================================
// TIPOS
// ============================================================================

interface UpcomingTelemedicineWidgetProps {
    /** ID del médico */
    doctorId?: string;
    /** Si está siendo arrastrado */
    isDragging?: boolean;
}

interface TelemedicineAppointment {
    /** ID de la cita */
    id: string;
    /** Hora de la cita (HH:mm) */
    time: string;
    /** Nombre del paciente */
    patientName: string;
    /** ID del paciente */
    patientId: string;
    /** Avatar del paciente */
    patientAvatar?: string;
    /** Motivo de consulta */
    reason?: string;
    /** Estado de la cita */
    status: "pending" | "in-progress" | "completed" | "cancelled";
    /** URL de la videollamada */
    meetingUrl?: string;
    /** Minutos hasta la cita (negativo si ya pasó) */
    minutesUntil: number;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Obtiene las iniciales de un nombre.
 */
function getInitials(name: string): string {
    return name
        .split(" ")
        .map(n => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

/**
 * Calcula los minutos hasta una hora específica.
 */
function calculateMinutesUntil(time: string): number {
    const now = new Date();
    const [hours, minutes] = time.split(":").map(Number);
    const aptTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
    return Math.floor((aptTime.getTime() - now.getTime()) / 60000);
}

/**
 * Formatea el tiempo restante para mostrar.
 */
function formatTimeUntil(minutes: number): string {
    if (minutes < -30) return "Atrasada";
    if (minutes < 0) return "Ahora";
    if (minutes < 60) return `En ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `En ${hours}h ${mins}m` : `En ${hours}h`;
}

/**
 * Obtiene el estado visual basado en minutos hasta la cita.
 */
function getTimeStatus(minutes: number): { color: string; urgent: boolean } {
    if (minutes < 0) return { color: "text-amber-600 dark:text-amber-400", urgent: true };
    if (minutes <= 15) return { color: "text-red-600 dark:text-red-400", urgent: true };
    if (minutes <= 30) return { color: "text-amber-600 dark:text-amber-400", urgent: false };
    return { color: "text-muted-foreground", urgent: false };
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Widget de próximas videoconsultas.
 * Muestra las citas de telemedicina del día con acceso rápido.
 * 
 * @example
 * <UpcomingTelemedicineWidget doctorId="uuid-del-doctor" />
 */
export function UpcomingTelemedicineWidget({
    doctorId,
    isDragging
}: UpcomingTelemedicineWidgetProps) {
    const router = useRouter();
    const { todayAppointments, isLoading } = useDashboardData(doctorId);

    // Filtrar solo citas de telemedicina pendientes o en progreso
    const telemedicineCitas = useMemo<TelemedicineAppointment[]>(() => {
        return todayAppointments
            .filter(apt =>
                apt.type === "telemedicina" &&
                (apt.status === "pending" || apt.status === "in-progress")
            )
            .map(apt => ({
                id: apt.id,
                time: apt.time,
                patientName: apt.patient,
                patientId: apt.patientId,
                patientAvatar: apt.patientAvatar,
                reason: apt.motivo,
                status: apt.status,
                meetingUrl: undefined, // Se obtiene del registro completo
                minutesUntil: calculateMinutesUntil(apt.time)
            }))
            .sort((a, b) => a.minutesUntil - b.minutesUntil);
    }, [todayAppointments]);

    // Handler para iniciar videollamada
    const handleStartCall = (appointmentId: string) => {
        router.push(`/dashboard/medico/telemedicina/sala/${appointmentId}`);
    };

    // Handler para ver detalles del paciente
    const handleViewPatient = (patientId: string) => {
        router.push(`/dashboard/medico/pacientes/${patientId}`);
    };

    // Encontrar la próxima cita urgente
    const nextUrgent = telemedicineCitas.find(c => c.minutesUntil <= 15 && c.minutesUntil >= -30);

    return (
        <WidgetWrapper
            id="upcoming-telemedicine"
            title="Videoconsultas"
            icon={<Video className="h-4 w-4 text-teal-500" />}
            isDragging={isDragging}
            showControls={false}
        >
            <div className="space-y-3">
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                ) : (
                    <>
                        {/* Header con conteo */}
                        <div className="flex items-center justify-between">
                            <Badge
                                variant="secondary"
                                className={cn(
                                    "text-[10px] gap-1",
                                    nextUrgent && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                )}
                            >
                                <Video className="h-2.5 w-2.5" />
                                {telemedicineCitas.length} hoy
                            </Badge>
                            {nextUrgent && (
                                <Badge
                                    variant="destructive"
                                    className="text-[10px] gap-1 animate-pulse"
                                >
                                    <Clock className="h-2.5 w-2.5" />
                                    {formatTimeUntil(nextUrgent.minutesUntil)}
                                </Badge>
                            )}
                        </div>

                        {/* Lista de citas */}
                        <div className="space-y-2">
                            {telemedicineCitas.length > 0 ? (
                                telemedicineCitas.slice(0, 4).map((cita, index) => {
                                    const timeStatus = getTimeStatus(cita.minutesUntil);
                                    const isNow = cita.minutesUntil <= 5 && cita.minutesUntil >= -30;

                                    return (
                                        <motion.div
                                            key={cita.id}
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className={cn(
                                                "flex items-center gap-2 p-2 rounded-lg",
                                                "bg-muted/30 hover:bg-muted/50 transition-colors",
                                                isNow && "ring-1 ring-teal-500/50 bg-teal-500/5"
                                            )}
                                        >
                                            {/* Avatar */}
                                            <div className="relative">
                                                <Avatar className="h-8 w-8">
                                                    {cita.patientAvatar ? (
                                                        <AvatarImage src={cita.patientAvatar} alt={cita.patientName} />
                                                    ) : null}
                                                    <AvatarFallback className="text-xs bg-gradient-to-br from-teal-500/20 to-cyan-500/20">
                                                        {getInitials(cita.patientName)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                {cita.status === "in-progress" && (
                                                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-background animate-pulse" />
                                                )}
                                            </div>

                                            {/* Información */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1">
                                                    <p className="text-xs font-medium truncate">
                                                        {cita.patientName}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px]">
                                                    <span className="text-muted-foreground">
                                                        {cita.time}
                                                    </span>
                                                    <span className={cn("font-medium", timeStatus.color)}>
                                                        {formatTimeUntil(cita.minutesUntil)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Botón de acción */}
                                            <Button
                                                size="sm"
                                                className={cn(
                                                    "h-7 text-[10px] px-2",
                                                    isNow && "bg-teal-600 hover:bg-teal-700"
                                                )}
                                                onClick={() => handleStartCall(cita.id)}
                                            >
                                                <Play className="h-2.5 w-2.5 mr-1" />
                                                {cita.status === "in-progress" ? "Continuar" : "Iniciar"}
                                            </Button>
                                        </motion.div>
                                    );
                                })
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-6 text-muted-foreground"
                                >
                                    <VideoOff className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-xs">Sin videoconsultas hoy</p>
                                    <p className="text-[10px] mt-1">Las citas virtuales aparecerán aquí</p>
                                </motion.div>
                            )}
                        </div>

                        {/* Ver agenda completa */}
                        {telemedicineCitas.length > 0 && (
                            <Button
                                variant="outline"
                                className="w-full text-xs h-7"
                                onClick={() => router.push("/dashboard/medico/telemedicina")}
                            >
                                <Video className="h-3 w-3 mr-1" />
                                Ir a telemedicina
                                <ChevronRight className="h-3 w-3 ml-1" />
                            </Button>
                        )}
                    </>
                )}
            </div>
        </WidgetWrapper>
    );
}
