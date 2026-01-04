/**
 * @file follow-up-reminders-widget.tsx
 * @description Widget de recordatorios de seguimiento.
 * Muestra pacientes que necesitan seguimiento basado en su última cita.
 * 
 * @module Dashboard/Widgets
 */

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Bell,
    Calendar,
    ChevronRight,
    Loader2,
    User,
    Clock,
    Send,
    CheckCircle,
    AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "@/components/ui/tooltip";
import { WidgetWrapper } from "../widget-wrapper";
import { useDashboardData } from "@/hooks/use-dashboard-data";

// ============================================================================
// TIPOS
// ============================================================================

interface FollowUpRemindersWidgetProps {
    /** ID del médico */
    doctorId?: string;
    /** Si está siendo arrastrado */
    isDragging?: boolean;
}

interface FollowUpPatient {
    /** ID único del paciente */
    id: string;
    /** Nombre completo */
    name: string;
    /** URL del avatar */
    avatar?: string;
    /** Fecha de última cita */
    lastAppointmentDate: Date;
    /** Días desde última cita */
    daysSinceLastVisit: number;
    /** Motivo de la última cita */
    lastReason?: string;
    /** Nivel de urgencia: normal, moderate, urgent */
    urgency: "normal" | "moderate" | "urgent";
    /** Si ya se envió recordatorio */
    reminderSent?: boolean;
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
 * Formatea cuántos días han pasado en texto legible.
 */
function formatDaysAgo(days: number): string {
    if (days === 0) return "Hoy";
    if (days === 1) return "Ayer";
    if (days < 7) return `Hace ${days} días`;
    if (days < 30) {
        const weeks = Math.floor(days / 7);
        return `Hace ${weeks} ${weeks === 1 ? "semana" : "semanas"}`;
    }
    if (days < 365) {
        const months = Math.floor(days / 30);
        return `Hace ${months} ${months === 1 ? "mes" : "meses"}`;
    }
    const years = Math.floor(days / 365);
    return `Hace ${years} ${years === 1 ? "año" : "años"}`;
}

/**
 * Calcula nivel de urgencia basado en días desde última visita.
 */
function calculateUrgency(days: number): "normal" | "moderate" | "urgent" {
    if (days >= 90) return "urgent";
    if (days >= 60) return "moderate";
    return "normal";
}

/**
 * Configuración de colores por nivel de urgencia.
 */
const urgencyConfig = {
    normal: {
        badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
        dot: "bg-emerald-500",
        text: "text-emerald-600 dark:text-emerald-400"
    },
    moderate: {
        badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
        dot: "bg-amber-500",
        text: "text-amber-600 dark:text-amber-400"
    },
    urgent: {
        badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        dot: "bg-red-500 animate-pulse",
        text: "text-red-600 dark:text-red-400"
    }
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Widget de recordatorios de seguimiento.
 * Muestra pacientes que no han visitado en mucho tiempo y necesitan seguimiento.
 * 
 * @example
 * <FollowUpRemindersWidget doctorId="uuid-del-doctor" />
 */
export function FollowUpRemindersWidget({
    doctorId,
    isDragging
}: FollowUpRemindersWidgetProps) {
    const router = useRouter();
    const { appointments, isLoading } = useDashboardData(doctorId);
    const [sentReminders, setSentReminders] = useState<Set<string>>(new Set());

    // Calcular pacientes que necesitan seguimiento
    const followUpPatients = useMemo<FollowUpPatient[]>(() => {
        if (!appointments || appointments.length === 0) return [];

        // Agrupar citas por paciente y encontrar la más reciente
        const patientLastVisit = new Map<string, {
            id: string;
            name: string;
            avatar?: string;
            lastDate: Date;
            lastReason?: string;
        }>();

        appointments.forEach((apt: any) => {
            // Solo contar citas completadas
            if (apt.status !== "completed") return;

            const patientId = apt.patient_id;
            const aptDate = new Date(`${apt.appointment_date}T${apt.appointment_time || "00:00:00"}`);

            const existing = patientLastVisit.get(patientId);
            if (!existing || aptDate > existing.lastDate) {
                patientLastVisit.set(patientId, {
                    id: patientId,
                    name: apt.patient?.nombre_completo || "Paciente",
                    avatar: apt.patient?.avatar_url,
                    lastDate: aptDate,
                    lastReason: apt.reason
                });
            }
        });

        // Convertir a array y calcular días
        const now = new Date();
        const patients: FollowUpPatient[] = [];

        patientLastVisit.forEach((patient) => {
            const diffTime = now.getTime() - patient.lastDate.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            // Solo incluir pacientes con más de 30 días sin visita
            if (diffDays >= 30) {
                patients.push({
                    id: patient.id,
                    name: patient.name,
                    avatar: patient.avatar,
                    lastAppointmentDate: patient.lastDate,
                    daysSinceLastVisit: diffDays,
                    lastReason: patient.lastReason,
                    urgency: calculateUrgency(diffDays),
                    reminderSent: sentReminders.has(patient.id)
                });
            }
        });

        // Ordenar por urgencia y días
        return patients.sort((a, b) => {
            const urgencyOrder = { urgent: 0, moderate: 1, normal: 2 };
            if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
                return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
            }
            return b.daysSinceLastVisit - a.daysSinceLastVisit;
        }).slice(0, 5); // Máximo 5 pacientes

    }, [appointments, sentReminders]);

    // Handler para enviar recordatorio
    const handleSendReminder = async (patientId: string) => {
        // TODO: Integrar con sistema de notificaciones real
        setSentReminders(prev => new Set([...prev, patientId]));
    };

    // Handler para agendar cita
    const handleScheduleAppointment = (patientId: string) => {
        router.push(`/dashboard/medico/citas/nueva?paciente=${patientId}`);
    };

    return (
        <WidgetWrapper
            id="follow-up-reminders"
            title="Seguimiento Pacientes"
            icon={<Bell className="h-4 w-4 text-primary" />}
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
                        {/* Header con conteo */}
                        <div className="flex items-center justify-between">
                            <Badge
                                variant="secondary"
                                className={cn(
                                    "text-[10px] gap-1",
                                    followUpPatients.some(p => p.urgency === "urgent") &&
                                    "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                )}
                            >
                                <AlertCircle className="h-2.5 w-2.5" />
                                {followUpPatients.length} pendientes
                            </Badge>
                            {followUpPatients.some(p => p.urgency === "urgent") && (
                                <Badge variant="destructive" className="text-[10px] animate-pulse">
                                    !Urgente
                                </Badge>
                            )}
                        </div>

                        {/* Lista de pacientes */}
                        <div className="space-y-2">
                            <AnimatePresence mode="popLayout">
                                {followUpPatients.length > 0 ? (
                                    followUpPatients.map((patient, index) => (
                                        <motion.div
                                            key={patient.id}
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            transition={{ delay: index * 0.05 }}
                                            className={cn(
                                                "flex items-center gap-2 p-2 rounded-lg",
                                                "bg-muted/30 hover:bg-muted/50 transition-colors",
                                                "border-l-2",
                                                patient.urgency === "urgent" && "border-l-red-500",
                                                patient.urgency === "moderate" && "border-l-amber-500",
                                                patient.urgency === "normal" && "border-l-emerald-500"
                                            )}
                                        >
                                            {/* Avatar con indicador de urgencia */}
                                            <div className="relative">
                                                <Avatar className="h-8 w-8">
                                                    {patient.avatar ? (
                                                        <AvatarImage src={patient.avatar} alt={patient.name} />
                                                    ) : null}
                                                    <AvatarFallback className="text-xs bg-gradient-to-br from-primary/20 to-secondary/20">
                                                        {getInitials(patient.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div
                                                    className={cn(
                                                        "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background",
                                                        urgencyConfig[patient.urgency].dot
                                                    )}
                                                />
                                            </div>

                                            {/* Información del paciente */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium truncate">
                                                    {patient.name}
                                                </p>
                                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                    <Clock className="h-2.5 w-2.5" />
                                                    <span className={urgencyConfig[patient.urgency].text}>
                                                        {formatDaysAgo(patient.daysSinceLastVisit)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Acciones */}
                                            <div className="flex items-center gap-1">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className={cn(
                                                                    "h-6 w-6",
                                                                    patient.reminderSent && "text-emerald-500"
                                                                )}
                                                                onClick={() => handleSendReminder(patient.id)}
                                                                disabled={patient.reminderSent}
                                                            >
                                                                {patient.reminderSent ? (
                                                                    <CheckCircle className="h-3 w-3" />
                                                                ) : (
                                                                    <Send className="h-3 w-3" />
                                                                )}
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            {patient.reminderSent
                                                                ? "Recordatorio enviado"
                                                                : "Enviar recordatorio"
                                                            }
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>

                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6"
                                                                onClick={() => handleScheduleAppointment(patient.id)}
                                                            >
                                                                <Calendar className="h-3 w-3" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            Agendar cita
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-center py-6 text-muted-foreground"
                                    >
                                        <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50 text-emerald-500" />
                                        <p className="text-xs">¡Todos los pacientes al día!</p>
                                        <p className="text-[10px] mt-1">No hay seguimientos pendientes</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Ver todos */}
                        {followUpPatients.length > 0 && (
                            <Button
                                variant="outline"
                                className="w-full text-xs h-7"
                                onClick={() => router.push("/dashboard/medico/pacientes?filter=follow-up")}
                            >
                                Ver todos los seguimientos
                                <ChevronRight className="h-3 w-3 ml-1" />
                            </Button>
                        )}
                    </>
                )}
            </div>
        </WidgetWrapper>
    );
}
