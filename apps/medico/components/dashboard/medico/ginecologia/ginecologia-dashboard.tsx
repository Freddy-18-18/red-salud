// ============================================
// GYNECOLOGY DASHBOARD
// Main dashboard for gynecology specialty
// Integrated with Specialty KPI System + Supabase
// ============================================

"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  HeartPulse,
  Clock3,
  RefreshCcw,
  AlertTriangle,
  TrendingUp,
  Users,
  CalendarCheck,
  Baby,
  FileSearch,
  ClipboardList,
  BarChart3,
} from "lucide-react";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@red-salud/design-system";
import { useGinecologiaDashboardData } from "@/hooks/dashboard/use-ginecologia-dashboard-data";
import { getGeneratedConfig } from "@/lib/specialties";

// ---- Types ----

interface GinecologiaDashboardProps {
  doctorId?: string;
  subSpecialties?: string[];
}

interface RecentControl {
  id: string;
  controlType: string;
  patientName: string;
  controlDate: string;
  papResult: string | null;
  hpvTest: string | null;
  nextControlDate: string | null;
}

interface ActivePregnancy {
  id: string;
  patientName: string;
  gestationalWeeks: number | null;
  riskLevel: string | null;
  nextControlDate: string | null;
  lastControlDate: string;
  fetalHeartRate: number | null;
}

// ---- Inline Sub-Components ----

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
              trend > 0
                ? "text-green-600"
                : trend < 0
                  ? "text-red-600"
                  : "text-muted-foreground"
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

function getPapBadgeVariant(result: string | null): {
  label: string;
  className: string;
} {
  if (!result) return { label: "Sin resultado", className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" };

  const normalized = result.toLowerCase().trim();

  if (normalized === "normal" || normalized === "negativo") {
    return { label: result, className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" };
  }
  if (normalized === "ascus" || normalized === "lsil") {
    return { label: result, className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" };
  }
  if (["hsil", "agc", "carcinoma"].includes(normalized)) {
    return { label: result, className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" };
  }
  if (normalized === "pendiente") {
    return { label: result, className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" };
  }

  return { label: result, className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" };
}

function getHpvBadgeVariant(result: string | null): {
  label: string;
  className: string;
} {
  if (!result) return { label: "No realizado", className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" };

  const normalized = result.toLowerCase().trim();

  if (normalized === "negativo") {
    return { label: "Negativo", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" };
  }
  if (normalized === "positivo-bajo-riesgo" || normalized === "positivo bajo riesgo") {
    return { label: "Positivo (bajo riesgo)", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" };
  }
  if (normalized === "positivo-alto-riesgo" || normalized === "positivo alto riesgo") {
    return { label: "Positivo (alto riesgo)", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" };
  }
  if (normalized === "no-realizado" || normalized === "no realizado") {
    return { label: "No realizado", className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" };
  }

  return { label: result, className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" };
}

function getRiskBadgeVariant(riskLevel: string | null): {
  label: string;
  className: string;
} {
  if (!riskLevel) return { label: "Sin clasificar", className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" };

  const normalized = riskLevel.toLowerCase().trim();

  if (normalized === "bajo") {
    return { label: "Bajo", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" };
  }
  if (normalized === "medio") {
    return { label: "Medio", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" };
  }
  if (normalized === "alto") {
    return { label: "Alto", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" };
  }

  return { label: riskLevel, className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" };
}

function CriticalAlerts({
  highRiskPregnancies,
  positiveHpvCount,
}: {
  highRiskPregnancies: number;
  positiveHpvCount: number;
}) {
  const hasAlerts = highRiskPregnancies > 0 || positiveHpvCount > 0;

  if (!hasAlerts) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <HeartPulse className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No hay alertas críticas pendientes</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {highRiskPregnancies > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-lg border bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 text-red-600" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Embarazos de alto riesgo</p>
            <p className="text-xs text-muted-foreground">
              {highRiskPregnancies} paciente{highRiskPregnancies !== 1 ? "s" : ""} requiere{highRiskPregnancies !== 1 ? "n" : ""} seguimiento prioritario
            </p>
          </div>
          <Badge variant="destructive" className="flex-shrink-0">
            {highRiskPregnancies}
          </Badge>
        </div>
      )}
      {positiveHpvCount > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-lg border bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 text-yellow-600" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">HPV Positivo</p>
            <p className="text-xs text-muted-foreground">
              {positiveHpvCount} resultado{positiveHpvCount !== 1 ? "s" : ""} positivo{positiveHpvCount !== 1 ? "s" : ""} pendiente{positiveHpvCount !== 1 ? "s" : ""} de seguimiento
            </p>
          </div>
          <Badge variant="default" className="flex-shrink-0 bg-yellow-600 hover:bg-yellow-700">
            {positiveHpvCount}
          </Badge>
        </div>
      )}
    </div>
  );
}

function ActivePregnancyList({ pregnancies }: { pregnancies: ActivePregnancy[] }) {
  if (!pregnancies || pregnancies.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Baby className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No hay embarazos activos registrados</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {pregnancies.map((pregnancy) => {
        const risk = getRiskBadgeVariant(pregnancy.riskLevel);
        return (
          <div
            key={pregnancy.id}
            className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-card"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{pregnancy.patientName}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs text-muted-foreground">
                  {pregnancy.gestationalWeeks != null
                    ? `${pregnancy.gestationalWeeks} semanas`
                    : "Semanas no registradas"}
                </p>
                {pregnancy.fetalHeartRate != null && (
                  <span className="text-xs text-pink-600 dark:text-pink-400 flex items-center gap-0.5">
                    <HeartPulse className="h-3 w-3" />
                    {pregnancy.fetalHeartRate} lpm
                  </span>
                )}
              </div>
              {pregnancy.nextControlDate && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Próximo control: {pregnancy.nextControlDate}
                </p>
              )}
            </div>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium flex-shrink-0 ${risk.className}`}
            >
              {risk.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function RecentControlsList({ controls }: { controls: RecentControl[] }) {
  if (!controls || controls.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileSearch className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No hay controles recientes</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {controls.map((control) => {
        const pap = getPapBadgeVariant(control.papResult);
        const hpv = getHpvBadgeVariant(control.hpvTest);
        return (
          <div
            key={control.id}
            className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-card"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{control.patientName}</p>
              <p className="text-xs text-muted-foreground">
                {control.controlType} • {control.controlDate}
              </p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${pap.className}`}
                title={`PAP: ${pap.label}`}
              >
                PAP: {pap.label}
              </span>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${hpv.className}`}
                title={`HPV: ${hpv.label}`}
              >
                HPV: {hpv.label}
              </span>
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

// ---- Main Component ----

export default function GinecologiaDashboard({
  doctorId,
  subSpecialties,
}: GinecologiaDashboardProps) {
  const {
    patientStatus,
    recentControls,
    activePregnancies,
    criticalAlerts,
    highRiskPregnancies,
    pendingPapResults,
    kpiValues,
    todayAppointments,
    refreshedAt,
    isLoading,
    error,
    refresh,
  } = useGinecologiaDashboardData(doctorId);

  // Resolve KPI definitions from the config for label/format info
  const config = useMemo(() => getGeneratedConfig("ginecologia"), []);
  const kpiDefs = config?.kpiDefinitions ?? {};

  const primarySubSpecialty = subSpecialties?.[0] ?? null;

  // Count positive HPV results from recent controls for alert purposes
  const positiveHpvCount = useMemo(() => {
    if (!recentControls) return 0;
    return recentControls.filter((c) => {
      const hpv = c.hpvTest?.toLowerCase().trim();
      return hpv === "positivo-alto-riesgo" || hpv === "positivo alto riesgo"
        || hpv === "positivo-bajo-riesgo" || hpv === "positivo bajo riesgo";
    }).length;
  }, [recentControls]);

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
              <HeartPulse className="h-8 w-8 text-pink-500" />
              Ginecología
            </h1>
            {primarySubSpecialty && (
              <Badge variant="outline">{primarySubSpecialty}</Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            Control ginecológico integral con seguimiento obstétrico, citología cervical y salud reproductiva.
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
        {/* 1. Critical Alerts */}
        <Card className="border-pink-200 dark:border-pink-800/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-pink-600 dark:text-pink-400">
              <AlertTriangle className="h-4 w-4" />
              Alertas Críticas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CriticalAlerts
              highRiskPregnancies={highRiskPregnancies ?? 0}
              positiveHpvCount={positiveHpvCount}
            />
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
              label="Activas"
              value={patientStatus?.active || 0}
              trend={patientStatus?.activeTrend}
            />
            <MetricItem
              label="En seguimiento"
              value={patientStatus?.followUp || 0}
            />
            <MetricItem
              label="Alta prioridad"
              value={(patientStatus?.highPriority || 0) + (highRiskPregnancies ?? 0)}
              status={
                (patientStatus?.highPriority || 0) + (highRiskPregnancies ?? 0) > 5
                  ? "warning"
                  : "normal"
              }
            />
            <MetricItem
              label="Nuevas este mes"
              value={patientStatus?.newThisMonth || 0}
            />
          </CardContent>
        </Card>

        {/* 3. Active Pregnancies */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2">
              <Baby className="h-4 w-4 text-pink-500" />
              Embarazos Activos ({activePregnancies?.length || 0})
            </CardTitle>
            <Link
              href="/consultorio/ginecologia/obstetricia"
              className="text-xs text-primary hover:underline"
            >
              Ver todos
            </Link>
          </CardHeader>
          <CardContent className="max-h-64 overflow-y-auto">
            <ActivePregnancyList pregnancies={activePregnancies || []} />
          </CardContent>
        </Card>

        {/* 4. Recent Controls */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Controles Recientes
            </CardTitle>
            <Link
              href="/consultorio/ginecologia/controles"
              className="text-xs text-primary hover:underline"
            >
              Ver todos
            </Link>
          </CardHeader>
          <CardContent className="max-h-72 overflow-y-auto">
            <RecentControlsList controls={recentControls || []} />
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

            {/* Gynecology-specific fixed metrics */}
            <MetricItem
              label="Embarazos alto riesgo"
              value={highRiskPregnancies ?? 0}
              status={(highRiskPregnancies ?? 0) > 0 ? "danger" : "normal"}
            />
            <MetricItem
              label="PAP pendientes"
              value={pendingPapResults ?? 0}
              status={(pendingPapResults ?? 0) > 10 ? "warning" : "normal"}
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
              <p className="text-3xl font-bold text-pink-600 dark:text-pink-400">
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
            <Button variant="outline" className="justify-start gap-2" asChild>
              <Link href="/consultorio/ginecologia/controles">
                <ClipboardList className="h-4 w-4" />
                Controles Ginecológicos
              </Link>
            </Button>
            <Button variant="outline" className="justify-start gap-2" asChild>
              <Link href="/consultorio/ginecologia/obstetricia">
                <Baby className="h-4 w-4" />
                Obstetricia
              </Link>
            </Button>
            <Button variant="outline" className="justify-start gap-2" asChild>
              <Link href="/consultorio/ginecologia/analytics">
                <BarChart3 className="h-4 w-4" />
                Análisis
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
