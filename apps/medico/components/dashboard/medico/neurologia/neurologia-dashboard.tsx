// ============================================
// NEUROLOGY DASHBOARD
// Main dashboard for neurology specialty
// Integrated with Specialty KPI System + Supabase
// ============================================

"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Brain,
  Clock3,
  RefreshCcw,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  FileSearch,
  Users,
  CalendarCheck,
  Activity,
  ClipboardList,
} from "lucide-react";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@red-salud/design-system";
import { useNeurologiaDashboardData } from "@/hooks/dashboard/use-neurologia-dashboard-data";
import type { RecentStudy, AssessmentSummary } from "@/hooks/dashboard/use-neurologia-dashboard-data";
import { getGeneratedConfig } from "@/lib/specialties";

// ============================================================================
// TYPES
// ============================================================================

interface NeurologiaDashboardProps {
  doctorId?: string;
  subSpecialties?: string[];
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function MetricItem({
  label,
  value,
  trend,
  status,
}: {
  label: string;
  value: string | number;
  trend?: number;
  status?: "normal" | "warning" | "danger";
}) {
  return (
    <div className={`rounded-lg border p-3 ${
      status === "danger"
        ? "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800"
        : status === "warning"
        ? "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800"
        : "bg-card border-border"
    }`}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="flex items-center justify-between mt-1">
        <p className="text-xl font-semibold">{value}</p>
        {trend !== undefined && (
          <span
            className={`text-xs ${
              trend > 0 ? "text-green-600" : trend < 0 ? "text-red-600" : "text-muted-foreground"
            }`}
          >
            {trend > 0 ? "+" : ""}
            {trend}%
          </span>
        )}
      </div>
    </div>
  );
}

function CriticalAlerts({
  alerts,
}: {
  alerts: Array<{
    patientName: string;
    condition: string;
    priority: "high" | "medium" | "low";
    timeSince: string;
  }>;
}) {
  if (alerts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No hay alertas críticas pendientes</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {alerts.map((alert, i) => (
        <div
          key={i}
          className={`flex items-center gap-3 p-3 rounded-lg border ${
            alert.priority === "high"
              ? "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800"
              : alert.priority === "medium"
              ? "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800"
              : "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
          }`}
        >
          <AlertTriangle
            className={`h-4 w-4 flex-shrink-0 ${
              alert.priority === "high"
                ? "text-red-600"
                : alert.priority === "medium"
                  ? "text-yellow-600"
                  : "text-blue-600"
            }`}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{alert.patientName}</p>
            <p className="text-xs text-muted-foreground truncate">{alert.condition}</p>
          </div>
          <div className="text-xs text-muted-foreground flex-shrink-0">
            {alert.timeSince}
          </div>
        </div>
      ))}
    </div>
  );
}

function RecentStudies({ studies }: { studies: RecentStudy[] }) {
  if (studies.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileSearch className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No hay estudios recientes</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {studies.map((study) => (
        <div
          key={study.id}
          className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-card"
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{study.studyType}</p>
            <p className="text-xs text-muted-foreground">{study.studyDate}</p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {study.isAbnormal && (
              <Badge variant="destructive" className="text-[10px]">
                Anormal
              </Badge>
            )}
            <Badge
              variant={
                study.urgency === "critico"
                  ? "destructive"
                  : study.urgency === "urgente"
                    ? "default"
                    : "secondary"
              }
              className="text-[10px]"
            >
              {study.urgency === "critico"
                ? "Crítico"
                : study.urgency === "urgente"
                  ? "Urgente"
                  : "Normal"}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}

function RecentAssessments({ assessments }: { assessments: AssessmentSummary[] }) {
  if (assessments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <ClipboardList className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No hay evaluaciones recientes</p>
      </div>
    );
  }

  const TrendIcon = ({ trend }: { trend: string | null }) => {
    if (trend === "improving") return <TrendingUp className="h-3.5 w-3.5 text-green-600" />;
    if (trend === "worsening") return <TrendingDown className="h-3.5 w-3.5 text-red-600" />;
    return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
  };

  return (
    <div className="space-y-2">
      {assessments.map((assessment) => (
        <div
          key={assessment.id}
          className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-card"
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{assessment.assessmentType}</p>
            <p className="text-xs text-muted-foreground">
              {assessment.assessmentDate}
              {assessment.totalScore !== null && ` • Puntaje: ${assessment.totalScore}`}
            </p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {assessment.severity && (
              <Badge
                variant={
                  assessment.severity === "severe" || assessment.severity === "critical"
                    ? "destructive"
                    : assessment.severity === "moderate"
                      ? "default"
                      : "secondary"
                }
                className="text-[10px]"
              >
                {assessment.severity === "severe"
                  ? "Severo"
                  : assessment.severity === "critical"
                    ? "Crítico"
                    : assessment.severity === "moderate"
                      ? "Moderado"
                      : assessment.severity === "mild"
                        ? "Leve"
                        : assessment.severity === "normal"
                          ? "Normal"
                          : assessment.severity}
              </Badge>
            )}
            <TrendIcon trend={assessment.trend} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ---- KPI formatting helper ----
function formatKpiValue(value: number, format?: string): string {
  switch (format) {
    case "percentage":
      return `${Math.round(value * 100)}%`;
    case "duration":
      return `${Math.round(value)}h`;
    case "currency":
      return `$${value.toLocaleString("es-VE")}`;
    default:
      return Number.isInteger(value) ? String(value) : value.toFixed(1);
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function NeurologiaDashboard({
  doctorId,
  subSpecialties,
}: NeurologiaDashboardProps) {
  const {
    patientStatus,
    recentStudies,
    recentAssessments,
    criticalAlerts,
    kpiValues,
    todayAppointments,
    refreshedAt,
    isLoading,
    error,
    refresh,
  } = useNeurologiaDashboardData(doctorId);

  // Resolve KPI definitions from the config for label/format info
  const config = useMemo(() => getGeneratedConfig("neurologia"), []);
  const kpiDefs = config?.kpiDefinitions ?? {};

  const primarySubSpecialty = subSpecialties?.[0] ?? null;

  const refreshedLabel = refreshedAt
    ? new Date(refreshedAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
    : "sin sincronizar";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Brain className="h-8 w-8 text-purple-500" />
              Neurología
            </h1>
            {primarySubSpecialty && (
              <Badge variant="outline">{primarySubSpecialty}</Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            Gestión neurológica completa con estudios electrodiagnósticos,
            evaluaciones cognitivas, escalas funcionales y seguimiento clínico.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock3 className="h-3.5 w-3.5" />
          Actualizado: {refreshedLabel}
          <Button variant="outline" size="sm" onClick={() => refresh()} disabled={isLoading} className="gap-1.5 ml-1">
            <RefreshCcw className="h-3.5 w-3.5" />
            Refrescar
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {/* 1. Critical Alerts - High Priority */}
        <Card className="border-red-200 dark:border-red-800/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-4 w-4" />
              Alertas Críticas ({criticalAlerts?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CriticalAlerts alerts={criticalAlerts || []} />
          </CardContent>
        </Card>

        {/* 2. Patient Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Estado de Pacientes
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <MetricItem
              label="Activos"
              value={patientStatus?.active || 0}
              trend={patientStatus?.activeTrend}
            />
            <MetricItem
              label="En seguimiento"
              value={patientStatus?.followUp || 0}
            />
            <MetricItem
              label="Alta prioridad"
              value={patientStatus?.highPriority || 0}
              status={patientStatus?.highPriority > 5 ? "warning" : "normal"}
            />
            <MetricItem
              label="Nuevos este mes"
              value={patientStatus?.newThisMonth || 0}
            />
          </CardContent>
        </Card>

        {/* 3. Recent Studies */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Estudios Recientes
            </CardTitle>
            <Link
              href="/consultorio/neurologia/estudios"
              className="text-xs text-primary hover:underline"
            >
              Ver todos
            </Link>
          </CardHeader>
          <CardContent className="max-h-64 overflow-y-auto">
            <RecentStudies studies={recentStudies || []} />
          </CardContent>
        </Card>

        {/* 4. Recent Assessments */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Evaluaciones Recientes
            </CardTitle>
            <Link
              href="/consultorio/neurologia/evaluaciones"
              className="text-xs text-primary hover:underline"
            >
              Ver todas
            </Link>
          </CardHeader>
          <CardContent className="max-h-72 overflow-y-auto">
            <RecentAssessments assessments={recentAssessments || []} />
          </CardContent>
        </Card>

        {/* 5. Key Metrics from Specialty KPI System */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Métricas Clave
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {/* Today's appointment summary */}
            <MetricItem
              label="Citas hoy"
              value={todayAppointments.total}
              status={todayAppointments.pending > 10 ? "warning" : "normal"}
            />
            <MetricItem
              label="Completadas"
              value={todayAppointments.completed}
            />
            <MetricItem
              label="Pendientes"
              value={todayAppointments.pending}
              status={todayAppointments.pending > 5 ? "warning" : "normal"}
            />

            {/* Dynamic KPIs from specialty system */}
            {config?.prioritizedKpis?.map((kpiKey) => {
              const def = kpiDefs[kpiKey];
              const value = kpiValues[kpiKey];
              if (value === undefined) return null;
              return (
                <MetricItem
                  key={kpiKey}
                  label={def?.label ?? kpiKey}
                  value={formatKpiValue(value, def?.format)}
                />
              );
            })}
          </CardContent>
        </Card>

        {/* Next Appointment */}
        {todayAppointments.nextAppointmentTime && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarCheck className="h-4 w-4" />
                Próxima Cita
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">
                {todayAppointments.nextAppointmentTime}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {todayAppointments.pending} citas restantes hoy
              </p>
            </CardContent>
          </Card>
        )}

        {/* 6. Quick Actions */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Accesos Rápidos</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Button
              variant="outline"
              className="justify-start gap-2"
              asChild
            >
              <Link href="/consultorio/neurologia/estudios">
                <Activity className="h-4 w-4" />
                Estudios Neurológicos
              </Link>
            </Button>
            <Button
              variant="outline"
              className="justify-start gap-2"
              asChild
            >
              <Link href="/consultorio/neurologia/evaluaciones">
                <ClipboardList className="h-4 w-4" />
                Evaluaciones y Escalas
              </Link>
            </Button>
            <Button
              variant="outline"
              className="justify-start gap-2"
              asChild
            >
              <Link href="/consultorio/neurologia/analytics">
                <TrendingUp className="h-4 w-4" />
                Análisis y Reportes
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
