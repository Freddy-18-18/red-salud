/**
 * @file patient-insights-widget.tsx
 * @description Widget de resumen e insights de pacientes.
 * Muestra métricas clave sobre la cartera de pacientes del médico.
 * 
 * @module Dashboard/Widgets
 */

"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
    Users,
    UserPlus,
    UserCheck,
    Clock,
    TrendingUp,
    TrendingDown,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { WidgetWrapper } from "../widget-wrapper";
import { useDashboardData } from "@/hooks/use-dashboard-data";

// ============================================================================
// TIPOS
// ============================================================================

interface PatientInsightsWidgetProps {
    /** ID del médico */
    doctorId?: string;
    /** Si está siendo arrastrado */
    isDragging?: boolean;
}

interface MetricCardProps {
    /** Título de la métrica */
    title: string;
    /** Valor principal */
    value: number;
    /** Icono del componente */
    icon: React.ReactNode;
    /** Cambio vs período anterior (opcional) */
    change?: number;
    /** Color del icono */
    color: string;
    /** Delay de animación */
    delay?: number;
}

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

/**
 * Tarjeta de métrica individual.
 */
function MetricCard({
    title,
    value,
    icon,
    change,
    color,
    delay = 0
}: MetricCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay * 0.1 }}
            className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/30"
        >
            <div className={cn(
                "flex items-center justify-center w-9 h-9 rounded-lg",
                color
            )}>
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground truncate">{title}</p>
                <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-bold">{value}</span>
                    {change !== undefined && change !== 0 && (
                        <Badge
                            variant="outline"
                            className={cn(
                                "text-[9px] px-1 py-0 h-4",
                                change > 0
                                    ? "text-green-600 bg-green-50 border-green-200"
                                    : "text-red-600 bg-red-50 border-red-200"
                            )}
                        >
                            {change > 0 ? (
                                <TrendingUp className="w-2 h-2 mr-0.5" />
                            ) : (
                                <TrendingDown className="w-2 h-2 mr-0.5" />
                            )}
                            {change > 0 ? "+" : ""}{change}
                        </Badge>
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
 * Widget de resumen e insights de pacientes.
 * Muestra métricas clave sobre la cartera de pacientes.
 * 
 * @example
 * <PatientInsightsWidget doctorId="uuid-del-doctor" />
 */
export function PatientInsightsWidget({
    doctorId,
    isDragging
}: PatientInsightsWidgetProps) {
    // Obtener datos del dashboard
    const { appointments, stats, isLoading } = useDashboardData(doctorId);

    // Calcular métricas de pacientes
    const patientMetrics = useMemo(() => {
        const now = new Date();
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Obtener IDs únicos de pacientes
        const allPatientIds = new Set(appointments.map(apt => apt.patient_id));

        // Pacientes con citas este mes
        const thisMonthPatientIds = new Set(
            appointments
                .filter(apt => new Date(apt.appointment_date) >= thisMonth)
                .map(apt => apt.patient_id)
        );

        // Pacientes con citas el mes pasado
        const lastMonthPatientIds = new Set(
            appointments
                .filter(apt => {
                    const date = new Date(apt.appointment_date);
                    return date >= lastMonth && date <= lastMonthEnd;
                })
                .map(apt => apt.patient_id)
        );

        // Pacientes nuevos este mes (no tenían citas antes)
        const newPatientsThisMonth = [...thisMonthPatientIds].filter(id => {
            const firstAppointment = appointments
                .filter(apt => apt.patient_id === id)
                .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())[0];
            return firstAppointment && new Date(firstAppointment.appointment_date) >= thisMonth;
        }).length;

        // Pacientes nuevos el mes pasado
        const newPatientsLastMonth = [...lastMonthPatientIds].filter(id => {
            const firstAppointment = appointments
                .filter(apt => apt.patient_id === id)
                .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())[0];
            return firstAppointment &&
                new Date(firstAppointment.appointment_date) >= lastMonth &&
                new Date(firstAppointment.appointment_date) <= lastMonthEnd;
        }).length;

        // Pacientes recurrentes (más de 1 cita)
        const patientAppointmentCounts = new Map<string, number>();
        appointments.forEach(apt => {
            const count = patientAppointmentCounts.get(apt.patient_id) || 0;
            patientAppointmentCounts.set(apt.patient_id, count + 1);
        });
        const recurringPatients = [...patientAppointmentCounts.values()].filter(count => count > 1).length;

        // Pacientes sin cita en 30+ días
        const patientsWithRecentAppointments = new Set(
            appointments
                .filter(apt => new Date(apt.appointment_date) >= thirtyDaysAgo)
                .map(apt => apt.patient_id)
        );
        const patientsNeedingFollowUp = allPatientIds.size - patientsWithRecentAppointments.size;

        // Tasa de retención (pacientes recurrentes / total)
        const retentionRate = allPatientIds.size > 0
            ? Math.round((recurringPatients / allPatientIds.size) * 100)
            : 0;

        return {
            totalPatients: allPatientIds.size,
            newPatients: newPatientsThisMonth,
            newPatientsChange: newPatientsThisMonth - newPatientsLastMonth,
            activePatients: thisMonthPatientIds.size,
            recurringPatients,
            retentionRate,
            needFollowUp: patientsNeedingFollowUp,
        };
    }, [appointments]);

    return (
        <WidgetWrapper
            id="patient-insights"
            title="Resumen Pacientes"
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
                        {/* Grid de métricas */}
                        <div className="grid grid-cols-2 gap-2">
                            <MetricCard
                                title="Total Pacientes"
                                value={patientMetrics.totalPatients}
                                icon={<Users className="h-4 w-4 text-white" />}
                                color="bg-blue-500"
                                delay={0}
                            />
                            <MetricCard
                                title="Nuevos este mes"
                                value={patientMetrics.newPatients}
                                icon={<UserPlus className="h-4 w-4 text-white" />}
                                change={patientMetrics.newPatientsChange}
                                color="bg-green-500"
                                delay={1}
                            />
                            <MetricCard
                                title="Activos (mes)"
                                value={patientMetrics.activePatients}
                                icon={<UserCheck className="h-4 w-4 text-white" />}
                                color="bg-purple-500"
                                delay={2}
                            />
                            <MetricCard
                                title="Necesitan seguimiento"
                                value={patientMetrics.needFollowUp}
                                icon={<Clock className="h-4 w-4 text-white" />}
                                color="bg-amber-500"
                                delay={3}
                            />
                        </div>

                        {/* Barra de retención */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="p-3 rounded-lg bg-muted/30 border border-border/30"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-muted-foreground">Tasa de retención</span>
                                <span className="text-sm font-bold">{patientMetrics.retentionRate}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-muted overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${patientMetrics.retentionRate}%` }}
                                    transition={{ delay: 0.5, duration: 0.8 }}
                                    className={cn(
                                        "h-full rounded-full",
                                        patientMetrics.retentionRate >= 70 && "bg-green-500",
                                        patientMetrics.retentionRate >= 40 && patientMetrics.retentionRate < 70 && "bg-yellow-500",
                                        patientMetrics.retentionRate < 40 && "bg-red-500"
                                    )}
                                />
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1">
                                {patientMetrics.recurringPatients} pacientes recurrentes
                            </p>
                        </motion.div>
                    </>
                )}
            </div>
        </WidgetWrapper>
    );
}
