// ============================================
// TRAUMATOLOGY DASHBOARD
// Main dashboard for traumatology specialty
// Integrated with Specialty KPI System + Supabase
// ============================================

"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Bone,
  Clock3,
  RefreshCcw,
  AlertTriangle,
  TrendingUp,
  Users,
  CalendarCheck,
  Syringe,
  Activity,
  Dumbbell,
} from "lucide-react";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@red-salud/ui";
import {
  useTraumatologiaDashboardData,
  type ActiveInjury,
  type RehabSession,
} from "@/hooks/dashboard/use-traumatologia-dashboard-data";
import { getGeneratedConfig } from "@/lib/specialties";

// ---- Types ----

interface TraumatologiaDashboardProps {
  doctorId?: string;
  subSpecialties?: string[];
}

// ---- Shared sub-components ----

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
            ? "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800"
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
        <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Sin alertas críticas pendientes</p>
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
                ? "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800"
                : "bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-800"
          }`}
        >
          <AlertTriangle
            className={`h-4 w-4 flex-shrink-0 ${
              alert.priority === "high"
                ? "text-red-600"
                : alert.priority === "medium"
                  ? "text-amber-600"
                  : "text-orange-600"
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

function ActiveInjuriesList({ injuries }: { injuries: ActiveInjury[] }) {
  if (injuries.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Bone className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No hay lesiones activas registradas</p>
      </div>
    );
  }

  const severityVariant = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "grave":
      case "severa":
        return "destructive" as const;
      case "moderada":
        return "default" as const;
      default:
        return "secondary" as const;
    }
  };

  return (
    <div className="space-y-2">
      {injuries.map((injury) => (
        <div
          key={injury.id}
          className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-card"
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{injury.patientName}</p>
            <p className="text-xs text-muted-foreground truncate">
              {injury.injuryType} • {injury.anatomicalZone}
              {injury.laterality ? ` (${injury.laterality})` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {injury.surgeryRequired && (
              <Badge variant="destructive" className="gap-1">
                <Syringe className="h-3 w-3" />
                Cirugía
              </Badge>
            )}
            <Badge variant={severityVariant(injury.severity ?? "")}>{injury.severity ?? "—"}</Badge>
          </div>
        </div>
      ))}
    </div>
  );
}

function RehabSessionsList({ sessions }: { sessions: RehabSession[] }) {
  if (sessions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Dumbbell className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No hay sesiones de rehabilitación recientes</p>
      </div>
    );
  }

  const painDelta = (pre: number, post: number) => {
    const diff = post - pre;
    if (diff < 0)
      return <span className="text-green-600 text-xs font-medium">{diff}</span>;
    if (diff > 0)
      return <span className="text-red-600 text-xs font-medium">+{diff}</span>;
    return <span className="text-muted-foreground text-xs">=</span>;
  };

  return (
    <div className="space-y-2">
      {sessions.map((session) => {
        const formattedDate = new Date(session.sessionDate).toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "short",
        });

        return (
          <div
            key={session.id}
            className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-card"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{session.patientName}</p>
              <p className="text-xs text-muted-foreground truncate">
                {session.rehabType} • Sesión {session.sessionNumber}/{session.totalSessions ?? "?"}
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0 text-xs">
              <div className="text-center">
                <p className="text-muted-foreground">Dolor</p>
                <p className="font-medium">
                  {session.painLevelPre ?? "—"}→{session.painLevelPost ?? "—"}{" "}
                  {session.painLevelPre != null && session.painLevelPost != null
                    ? painDelta(session.painLevelPre, session.painLevelPost)
                    : null}
                </p>
              </div>
              <div className="text-muted-foreground">{formattedDate}</div>
            </div>
          </div>
        );
      })}
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

export default function TraumatologiaDashboard({
  doctorId,
  subSpecialties,
}: TraumatologiaDashboardProps) {
  const {
    patientStatus,
    activeInjuries,
    recentRehabSessions,
    criticalAlerts,
    pendingSurgeries,
    kpiValues,
    todayAppointments,
    refreshedAt,
    isLoading,
    error,
    refresh,
  } = useTraumatologiaDashboardData(doctorId);

  const config = useMemo(() => getGeneratedConfig("traumatologia"), []);
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
              <Bone className="h-8 w-8 text-amber-500" />
              Traumatología
            </h1>
            {primarySubSpecialty && <Badge variant="outline">{primarySubSpecialty}</Badge>}
          </div>
          <p className="text-muted-foreground">
            Gestión de lesiones musculoesqueléticas, fracturas, rehabilitación
            y seguimiento quirúrgico.
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
        {/* Critical Alerts */}
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
            <MetricItem label="En seguimiento" value={patientStatus?.followUp || 0} />
            <MetricItem
              label="Cirugías pendientes"
              value={pendingSurgeries ?? 0}
              status={
                (pendingSurgeries ?? 0) > 3
                  ? "warning"
                  : "normal"
              }
            />
            <MetricItem label="Nuevos este mes" value={patientStatus?.newThisMonth || 0} />
          </CardContent>
        </Card>

        {/* Active Injuries */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2">
              <Bone className="h-4 w-4 text-amber-600" />
              Lesiones Activas ({activeInjuries?.length || 0})
            </CardTitle>
            <Link
              href="/dashboard/medico/traumatologia/lesiones"
              className="text-xs text-primary hover:underline"
            >
              Ver todas
            </Link>
          </CardHeader>
          <CardContent className="max-h-64 overflow-y-auto">
            <ActiveInjuriesList injuries={activeInjuries || []} />
          </CardContent>
        </Card>

        {/* Recent Rehab Sessions */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4 text-orange-500" />
              Rehabilitación Reciente
            </CardTitle>
            <Link
              href="/dashboard/medico/traumatologia/rehabilitacion"
              className="text-xs text-primary hover:underline"
            >
              Ver todas
            </Link>
          </CardHeader>
          <CardContent className="max-h-72 overflow-y-auto">
            <RehabSessionsList sessions={recentRehabSessions || []} />
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
            <MetricItem
              label="Cirugías pendientes"
              value={pendingSurgeries ?? 0}
              status={(pendingSurgeries ?? 0) > 5 ? "danger" : "normal"}
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
              <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
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
              <Link href="/dashboard/medico/traumatologia/lesiones">
                <Bone className="h-4 w-4" />
                Gestión de Lesiones
              </Link>
            </Button>
            <Button variant="outline" className="justify-start gap-2" asChild>
              <Link href="/dashboard/medico/traumatologia/rehabilitacion">
                <Dumbbell className="h-4 w-4" />
                Rehabilitación
              </Link>
            </Button>
            <Button variant="outline" className="justify-start gap-2" asChild>
              <Link href="/dashboard/medico/traumatologia/analytics">
                <Activity className="h-4 w-4" />
                Análisis
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
