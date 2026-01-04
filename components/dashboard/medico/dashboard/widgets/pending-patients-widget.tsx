/**
 * @file pending-patients-widget.tsx
 * @description Widget de pacientes en sala de espera con datos reales de Supabase.
 * Muestra los pacientes que tienen citas pendientes del día.
 * 
 * @module Dashboard/Widgets
 */

"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Users, Clock, ChevronRight, UserCheck, Video, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { WidgetWrapper } from "../widget-wrapper";
import { useDashboardData } from "@/hooks/use-dashboard-data";

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Calcula el tiempo de espera de una cita.
 */
function calculateWaitTime(appointmentTime: string): string {
    const now = new Date();
    const [hours, minutes] = appointmentTime.split(":").map(Number);
    const aptTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);

    const diffMs = now.getTime() - aptTime.getTime();
    const diffMins = Math.max(0, Math.floor(diffMs / 60000));

    if (diffMins === 0) return "Ahora";
    if (diffMins < 60) return `${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ${diffMins % 60}min`;
}

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

// ============================================================================
// TIPOS
// ============================================================================

interface PendingPatientsWidgetProps {
    /** ID del médico */
    doctorId?: string;
    /** Si está siendo arrastrado */
    isDragging?: boolean;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Widget de pacientes en sala de espera.
 * Muestra los pacientes con citas pendientes del día actual.
 * 
 * @example
 * <PendingPatientsWidget doctorId="uuid-del-doctor" />
 */
export function PendingPatientsWidget({
    doctorId,
    isDragging
}: PendingPatientsWidgetProps) {
    const router = useRouter();

    // Obtener datos reales del dashboard
    const { todayAppointments, isLoading } = useDashboardData(doctorId);

    // Filtrar solo citas pendientes
    const pendingPatients = useMemo(() => {
        return todayAppointments
            .filter(apt => apt.status === "pending")
            .map(apt => ({
                id: apt.id,
                name: apt.patient,
                patientId: apt.patientId,
                avatar: apt.patientAvatar,
                waitTime: calculateWaitTime(apt.time),
                type: apt.type,
                reason: apt.motivo || "Consulta general",
                time: apt.time,
            }));
    }, [todayAppointments]);

    // Handler para atender paciente
    const handleAttendPatient = (appointmentId: string) => {
        router.push(`/dashboard/medico/consulta/${appointmentId}`);
    };

    return (
        <WidgetWrapper
            id="pending-patients"
            title="Sala de Espera"
            icon={<Users className="h-4 w-4 text-primary" />}
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
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <Badge variant="secondary" className="text-[10px] gap-1">
                                <Clock className="h-2.5 w-2.5" />
                                {pendingPatients.length} en espera
                            </Badge>
                        </div>

                        {/* Patients List */}
                        <div className="space-y-2">
                            {pendingPatients.length > 0 ? (
                                pendingPatients.map((patient, index) => (
                                    <motion.div
                                        key={patient.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={cn(
                                            "flex items-center gap-2 p-2 rounded-lg",
                                            "bg-muted/30 hover:bg-muted/50 transition-colors"
                                        )}
                                    >
                                        {/* Avatar */}
                                        <Avatar className="h-8 w-8">
                                            {patient.avatar ? (
                                                <AvatarImage src={patient.avatar} alt={patient.name} />
                                            ) : null}
                                            <AvatarFallback className="text-xs bg-gradient-to-br from-primary/20 to-secondary/20">
                                                {getInitials(patient.name)}
                                            </AvatarFallback>
                                        </Avatar>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1">
                                                <p className="text-xs font-medium truncate">
                                                    {patient.name}
                                                </p>
                                                {patient.type === "telemedicina" && (
                                                    <Video className="h-3 w-3 text-secondary flex-shrink-0" />
                                                )}
                                            </div>
                                            <p className="text-[10px] text-muted-foreground truncate">
                                                {patient.reason}
                                            </p>
                                        </div>

                                        {/* Wait Time & Action */}
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] font-medium text-muted-foreground">
                                                {patient.waitTime}
                                            </span>
                                            <Button
                                                size="sm"
                                                className="h-5 text-[10px] px-2 mt-1"
                                                onClick={() => handleAttendPatient(patient.id)}
                                            >
                                                <UserCheck className="h-2.5 w-2.5 mr-1" />
                                                Atender
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-6 text-muted-foreground"
                                >
                                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-xs">No hay pacientes en espera</p>
                                </motion.div>
                            )}
                        </div>

                        {/* View All */}
                        {pendingPatients.length > 0 && (
                            <Button variant="outline" className="w-full text-xs h-7" asChild>
                                <a href="/dashboard/medico/pacientes">
                                    Ver todos los pacientes
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
