/**
 * @file widget-renderer.tsx
 * @description Función central para renderizar widgets del dashboard según su ID.
 * Maneja la instanciación de todos los widgets disponibles.
 * 
 * @module Dashboard
 */

"use client";

import type { WidgetId } from "@/lib/types/dashboard-types";

// Widget Components - Principales
import { StatsOverviewWidget } from "./widgets/stats-overview-widget";
import { TodayTimelineWidget } from "./widgets/today-timeline-widget";
import { WeekCalendarWidget } from "./widgets/week-calendar-widget";
import { QuickActionsWidget } from "./widgets/quick-actions-widget";
import { NotificationsWidget } from "./widgets/notifications-widget";
import { MessagesWidget } from "./widgets/messages-widget";
import { PendingPatientsWidget } from "./widgets/pending-patients-widget";
import { PerformanceChartWidget } from "./widgets/performance-chart-widget";
import { TasksWidget } from "./widgets/tasks-widget";
import { IncomeWidget } from "./widgets/income-widget";
import { PatientInsightsWidget } from "./widgets/patient-insights-widget";

// Widget Components - Nuevos
import { FollowUpRemindersWidget } from "./widgets/follow-up-reminders-widget";
import { SatisfactionMetricsWidget } from "./widgets/satisfaction-metrics-widget";
import { UpcomingTelemedicineWidget } from "./widgets/upcoming-telemedicine-widget";
import { LabResultsPendingWidget } from "./widgets/lab-results-pending-widget";
import { PatientBirthdaysWidget } from "./widgets/patient-birthdays-widget";
import { MonthlyGoalsWidget } from "./widgets/monthly-goals-widget";

// Placeholder para widgets en desarrollo
import { WidgetWrapper } from "./widget-wrapper";
import { TrendingUp, Gauge } from "lucide-react";

// ============================================================================
// TIPOS
// ============================================================================

interface WidgetRenderProps {
    /** ID del médico para datos personalizados */
    doctorId?: string;
    /** Estadísticas pre-cargadas (opcional) */
    stats?: any;
    /** Perfil del médico */
    profile?: any;
}

// ============================================================================
// FUNCIÓN PRINCIPAL
// ============================================================================

/**
 * Renderiza un widget específico según su ID.
 * 
 * @param id - Identificador del widget a renderizar
 * @param props - Props a pasar al widget
 * @returns Componente del widget o mensaje de error
 * 
 * @example
 * renderWidget("stats-overview", { doctorId: "uuid" });
 */
export function renderWidget(id: WidgetId, props: WidgetRenderProps) {
    const { doctorId, stats, profile } = props;

    switch (id) {
        // Widgets principales
        case "stats-overview":
            return (
                <StatsOverviewWidget
                    doctorId={doctorId}
                    stats={stats}
                />
            );

        case "today-timeline":
            return (
                <TodayTimelineWidget
                    doctorId={doctorId}
                />
            );

        case "week-calendar":
            return (
                <WeekCalendarWidget
                    doctorId={doctorId}
                />
            );

        case "quick-actions":
            return (
                <QuickActionsWidget
                />
            );

        case "notifications":
            return (
                <NotificationsWidget
                    doctorId={doctorId}
                />
            );

        case "messages":
            return (
                <MessagesWidget
                    doctorId={doctorId}
                />
            );

        case "pending-patients":
            return (
                <PendingPatientsWidget
                    doctorId={doctorId}
                />
            );

        case "performance-chart":
            return (
                <PerformanceChartWidget
                    doctorId={doctorId}
                />
            );

        case "tasks":
            return (
                <TasksWidget
                    doctorId={doctorId}
                />
            );

        case "income":
            return (
                <IncomeWidget
                    doctorId={doctorId}
                    profile={profile}
                />
            );

        // Nuevos widgets
        case "patient-insights":
            return (
                <PatientInsightsWidget
                    doctorId={doctorId}
                />
            );

        // ====================================================================
        // WIDGETS NUEVOS (6 nuevos)
        // ====================================================================

        case "follow-up-reminders":
            return (
                <FollowUpRemindersWidget
                    doctorId={doctorId}
                />
            );

        case "satisfaction-metrics":
            return (
                <SatisfactionMetricsWidget
                    doctorId={doctorId}
                />
            );

        case "upcoming-telemedicine":
            return (
                <UpcomingTelemedicineWidget
                    doctorId={doctorId}
                />
            );

        case "lab-results-pending":
            return (
                <LabResultsPendingWidget
                    doctorId={doctorId}
                />
            );

        case "patient-birthdays":
            return (
                <PatientBirthdaysWidget
                    doctorId={doctorId}
                />
            );

        case "monthly-goals":
            return (
                <MonthlyGoalsWidget
                    doctorId={doctorId}
                />
            );

        // ====================================================================
        // WIDGETS PLACEHOLDER (en desarrollo)
        // ====================================================================

        case "revenue-analytics":
            return (
                <WidgetWrapper
                    id="revenue-analytics"
                    title="Análisis Financiero"
                    icon={<TrendingUp className="h-4 w-4 text-primary" />}
                >
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm py-8">
                        <TrendingUp className="h-8 w-8 mb-2 opacity-50" />
                        <p>Widget en desarrollo</p>
                    </div>
                </WidgetWrapper>
            );

        case "productivity-score":
            return (
                <WidgetWrapper
                    id="productivity-score"
                    title="Productividad"
                    icon={<Gauge className="h-4 w-4 text-primary" />}
                >
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm py-8">
                        <Gauge className="h-8 w-8 mb-2 opacity-50" />
                        <p>Widget en desarrollo</p>
                    </div>
                </WidgetWrapper>
            );

        default:
            return (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                    Widget no encontrado: {id}
                </div>
            );
    }
}
