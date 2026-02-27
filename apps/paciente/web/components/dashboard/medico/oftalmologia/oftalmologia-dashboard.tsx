// ============================================
// OPHTHALMOLOGY DASHBOARD
// Main dashboard for ophthalmology specialty
// Integrated with Specialty KPI System + Supabase
// ============================================

"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Eye,
  Clock3,
  RefreshCcw,
  AlertTriangle,
  TrendingUp,
  FileSearch,
  Users,
  CalendarCheck,
  Activity,
} from "lucide-react";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@red-salud/design-system";
import {
  useOftalmologiaDashboardData,
  type UpcomingProcedure,
} from "@/hooks/dashboard/use-oftalmologia-dashboard-data";
import { getGeneratedConfig } from "@/lib/specialties";

// ---- Types ----

interface RecentExam {
  id: string;
  examType: string;
  patientName: string;
  examDate: string;
  vaOdCc: string | null;
  vaOiCc: string | null;
  iopOd: number | null;
  iopOi: number | null;
}

interface OftalmologiaDashboardProps {
  doctorId?: string;
  subSpecialties?: string[];
}

// ---- Sub-components ----

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
    <div
      className={`rounded-lg border p-3 ${
        status === "danger"
          ? "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800"
          : status === "warning"
            ? "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800"
            : "bg-card border-border"
      }`}
    >
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

function IopValue({ value }: { value: number | null }) {
  if (value === null) return <span className="text-muted-foreground">—</span>;
  const isHigh = value > 21;
  return (
    <span className={isHigh ? "text-red-600 font-semibold dark:text-red-400" : ""}>
      {value} mmHg
      {isHigh && " ⚠"}
    </span>
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
        <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No hay alertas de PIO elevada</p>
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
          <div className="text-xs text-muted-foreground flex-shrink-0">{alert.timeSince}</div>
        </div>
      ))}
    </div>
  );
}

function RecentExams({ exams }: { exams: RecentExam[] }) {
  if (exams.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileSearch className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No hay exámenes recientes</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {exams.map((exam) => (
        <div
          key={exam.id}
          className="flex flex-col gap-1 p-3 rounded-lg border border-border/60 bg-card"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium truncate">{exam.patientName}</p>
            <Badge variant="outline" className="flex-shrink-0 text-xs">
              {exam.examType}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{exam.examDate}</p>
          <div className="grid grid-cols-2 gap-2 mt-1 text-xs">
            <div>
              <span className="text-muted-foreground">AV OD:</span>{" "}
              <span className="font-medium">{exam.vaOdCc ?? "—"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">AV OI:</span>{" "}
              <span className="font-medium">{exam.vaOiCc ?? "—"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">PIO OD:</span>{" "}
              <IopValue value={exam.iopOd} />
            </div>
            <div>
              <span className="text-muted-foreground">PIO OI:</span>{" "}
              <IopValue value={exam.iopOi} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function UpcomingProcedures({ procedures }: { procedures: UpcomingProcedure[] }) {
  if (procedures.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileSearch className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No hay procedimientos programados</p>
      </div>
    );
  }

  const eyeVariant = (eye: string) => {
    switch (eye) {
      case "OD":
        return "default";
      case "OI":
        return "secondary";
      case "AO":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-2">
      {procedures.map((proc) => (
        <div
          key={proc.id}
          className="flex items-center gap-4 p-3 rounded-lg border border-border/60 bg-card"
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{proc.procedureType}</p>
            <p className="text-xs text-muted-foreground">
              {proc.patientName} • {proc.procedureDate}
            </p>
          </div>
          <Badge variant={eyeVariant(proc.eye)} className="flex-shrink-0">
            {proc.eye}
          </Badge>
          <Badge
            variant={proc.status === "confirmado" ? "default" : "secondary"}
            className="flex-shrink-0"
          >
            {proc.status}
          </Badge>
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

// ---- Main Dashboard ----

export default function OftalmologiaDashboard({
  doctorId,
  subSpecialties,
}: OftalmologiaDashboardProps) {
  const {
    patientStatus,
    recentExams,
    upcomingProcedures,
    criticalAlerts,
    highIopCount,
    kpiValues,
    todayAppointments,
    refreshedAt,
    isLoading,
    error,
    refresh,
  } = useOftalmologiaDashboardData(doctorId);

  // Resolve KPI definitions from the config for label/format info
  const config = useMemo(() => getGeneratedConfig("oftalmologia"), []);
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
              <Eye className="h-8 w-8 text-teal-500" />
              Oftalmología
            </h1>
            {primarySubSpecialty && <Badge variant="outline">{primarySubSpecialty}</Badge>}
          </div>
          <p className="text-muted-foreground">
            Gestión oftalmológica integral con seguimiento de agudeza visual,
            presión intraocular, exámenes y procedimientos quirúrgicos.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock3 className="h-3.5 w-3.5" />
          Actualizado: {refreshedLabel}
          <Button
            variant="outline"
            size="sm"
            onClick={() => refresh()}
            disabled={isLoading}
            className="gap-1.5 ml-1"
          >
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
        {/* Critical Alerts - PIO Elevada */}
        <Card className="border-red-200 dark:border-red-800/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-4 w-4" />
              PIO Elevada ({criticalAlerts?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CriticalAlerts alerts={criticalAlerts || []} />
          </CardContent>
        </Card>

        {/* Patient Status */}
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
              label="PIO elevada"
              value={highIopCount || 0}
              status={(highIopCount || 0) > 0 ? "danger" : "normal"}
            />
            <MetricItem
              label="Nuevos este mes"
              value={patientStatus?.newThisMonth || 0}
            />
          </CardContent>
        </Card>

        {/* Recent Exams */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              Exámenes Recientes
            </CardTitle>
            <Link
              href="/dashboard/medico/oftalmologia/examenes"
              className="text-xs text-primary hover:underline"
            >
              Ver todos
            </Link>
          </CardHeader>
          <CardContent className="max-h-72 overflow-y-auto">
            <RecentExams exams={recentExams || []} />
          </CardContent>
        </Card>

        {/* Upcoming Procedures */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Procedimientos Próximos
            </CardTitle>
            <Link
              href="/dashboard/medico/oftalmologia/procedimientos"
              className="text-xs text-primary hover:underline"
            >
              Ver todos
            </Link>
          </CardHeader>
          <CardContent className="max-h-72 overflow-y-auto">
            <UpcomingProcedures procedures={upcomingProcedures || []} />
          </CardContent>
        </Card>

        {/* Key Metrics from Specialty KPI System */}
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
            <MetricItem label="Completadas" value={todayAppointments.completed} />
            <MetricItem
              label="Pendientes"
              value={todayAppointments.pending}
              status={todayAppointments.pending > 5 ? "warning" : "normal"}
            />

            {/* High IOP count metric */}
            <MetricItem
              label="Casos PIO &gt;21 mmHg"
              value={highIopCount || 0}
              status={(highIopCount || 0) > 0 ? "danger" : "normal"}
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
              <p className="text-3xl font-bold text-teal-600 dark:text-teal-400">
                {todayAppointments.nextAppointmentTime}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {todayAppointments.pending} citas restantes hoy
              </p>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Accesos Rápidos</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Button variant="outline" className="justify-start gap-2" asChild>
              <Link href="/dashboard/medico/oftalmologia/examenes">
                <Eye className="h-4 w-4" />
                Exámenes Oftalmológicos
              </Link>
            </Button>
            <Button variant="outline" className="justify-start gap-2" asChild>
              <Link href="/dashboard/medico/oftalmologia/procedimientos">
                <Activity className="h-4 w-4" />
                Procedimientos
              </Link>
            </Button>
            <Button variant="outline" className="justify-start gap-2" asChild>
              <Link href="/dashboard/medico/oftalmologia/analytics">
                <TrendingUp className="h-4 w-4" />
                Análisis y Estadísticas
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
