/**
 * @file widget-renderer.tsx
 * @description Función central para renderizar widgets del dashboard según su ID.
 * Maneja la instanciación de todos los widgets disponibles.
 *
 * @module Dashboard
 */

"use client";

import type { WidgetId } from "@red-salud/types";

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

// Widgets implementados recientemente
import { RevenueAnalyticsWidget } from "./widgets/revenue-analytics-widget";
import { ProductivityScoreWidget } from "./widgets/productivity-score-widget";

// ============================================================================
// TIPOS
// ============================================================================

interface WidgetRenderProps {
  /** ID del médico para datos personalizados */
  doctorId?: string;
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
  const { doctorId } = props;

  switch (id) {
    // Widgets principales
    case "stats-overview":
      return <StatsOverviewWidget doctorId={doctorId} />;

    case "today-timeline":
      return <TodayTimelineWidget doctorId={doctorId} />;

    case "week-calendar":
      return <WeekCalendarWidget doctorId={doctorId} />;

    case "quick-actions":
      return <QuickActionsWidget />;

    case "notifications":
      return <NotificationsWidget doctorId={doctorId} />;

    case "messages":
      return <MessagesWidget doctorId={doctorId} />;

    case "pending-patients":
      return <PendingPatientsWidget doctorId={doctorId} />;

    case "performance-chart":
      return <PerformanceChartWidget doctorId={doctorId} />;

    case "tasks":
      return <TasksWidget doctorId={doctorId} />;

    case "income":
      return <IncomeWidget doctorId={doctorId} />;

    // Nuevos widgets
    case "patient-insights":
      return <PatientInsightsWidget doctorId={doctorId} />;

    // ====================================================================
    // WIDGETS NUEVOS (6 nuevos)
    // ====================================================================

    case "follow-up-reminders":
      return <FollowUpRemindersWidget doctorId={doctorId} />;

    case "satisfaction-metrics":
      return <SatisfactionMetricsWidget doctorId={doctorId} />;

    case "upcoming-telemedicine":
      return <UpcomingTelemedicineWidget doctorId={doctorId} />;

    case "lab-results-pending":
      return <LabResultsPendingWidget doctorId={doctorId} />;

    case "patient-birthdays":
      return <PatientBirthdaysWidget doctorId={doctorId} />;

    case "monthly-goals":
      return <MonthlyGoalsWidget doctorId={doctorId} />;

    // ====================================================================
    // WIDGETS IMPLEMENTADOS RECIENTEMENTE
    // ====================================================================

    case "revenue-analytics":
      return <RevenueAnalyticsWidget doctorId={doctorId} />;

    case "productivity-score":
      return <ProductivityScoreWidget doctorId={doctorId} />;

    default:
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
          Widget no encontrado: {id}
        </div>
      );
  }
}
