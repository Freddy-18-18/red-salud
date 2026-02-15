// ============================================
// PEDIATRICS DASHBOARD
// Main dashboard for pediatrics specialty
// Uses real Supabase data via usePediatricsDashboardData hook
// ============================================

"use client";

import Link from "next/link";
import {
  Baby,
  Syringe,
  TrendingUp,
  Clock3,
  RefreshCcw,
  AlertCircle,
  Users,
  Video,
  Ruler,
  Weight,
} from "lucide-react";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@red-salud/ui";
import { getPrimarySubSpecialty } from "@/lib/specialty-experience/engine";
import {
  usePediatricsDashboardData,
  type GrowthAlert,
  type UpcomingVaccine,
  type RecentGrowthRecord,
} from "@/hooks/dashboard/use-pediatrics-dashboard-data";

interface PediatricsDashboardProps {
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
  icon: Icon,
}: {
  label: string;
  value: string | number;
  trend?: number;
  icon?: React.ComponentType<{ className?: string }>;
  status?: "normal" | "warning" | "danger";
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-card p-3">
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </p>
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

function formatAge(ageMonths: number): string {
  if (ageMonths < 1) return "< 1 mes";
  if (ageMonths < 12) return `${ageMonths} mes${ageMonths === 1 ? "" : "es"}`;
  const years = Math.floor(ageMonths / 12);
  const months = ageMonths % 12;
  if (months === 0) return `${years} año${years === 1 ? "" : "s"}`;
  return `${years}a ${months}m`;
}

function GrowthAlertsList({ alerts }: { alerts: GrowthAlert[] }) {
  if (alerts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No hay alertas de crecimiento</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`flex items-center gap-3 p-3 rounded-lg border ${
            alert.severity === "high"
              ? "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800"
              : alert.severity === "medium"
              ? "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800"
              : "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
          }`}
        >
          <AlertCircle
            className={`h-4 w-4 flex-shrink-0 ${
              alert.severity === "high"
                ? "text-red-600"
                : alert.severity === "medium"
                ? "text-yellow-600"
                : "text-blue-600"
            }`}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {alert.patientName}, {formatAge(alert.ageMonths)}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{alert.nutritionalStatus || "Sin clasificar"}</span>
              {alert.weightPercentile != null && (
                <span>• P{alert.weightPercentile} peso</span>
              )}
              {alert.heightPercentile != null && (
                <span>• P{alert.heightPercentile} talla</span>
              )}
            </div>
          </div>
          <Badge
            variant={alert.severity === "high" ? "destructive" : "secondary"}
            className="text-[10px]"
          >
            {alert.severity}
          </Badge>
        </div>
      ))}
    </div>
  );
}

function UpcomingVaccinesList({ vaccines }: { vaccines: UpcomingVaccine[] }) {
  if (vaccines.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Syringe className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No hay vacunas próximas</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {vaccines.map((vax) => (
        <div
          key={vax.id}
          className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-card"
        >
          <Syringe className="h-4 w-4 text-green-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{vax.patientName}</p>
            <p className="text-xs text-muted-foreground">
              {vax.vaccineName} • Dosis {vax.doseNumber}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <Badge variant="outline" className="text-[10px]">
              {vax.vaccineType}
            </Badge>
            {vax.nextDoseDate && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {new Date(vax.nextDoseDate).toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "short",
                })}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function RecentGrowthRecordsList({ records }: { records: RecentGrowthRecord[] }) {
  if (records.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Ruler className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No hay registros recientes</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {records.map((record) => (
        <div
          key={record.id}
          className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-card"
        >
          <Baby className="h-4 w-4 text-primary flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{record.patientName}</p>
            <p className="text-xs text-muted-foreground">
              {formatAge(record.ageMonths)} •{" "}
              {record.weightKg != null ? `${record.weightKg} kg` : "—"} •{" "}
              {record.heightCm != null ? `${record.heightCm} cm` : "—"}
              {record.bmi != null && ` • IMC ${record.bmi.toFixed(1)}`}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            {record.nutritionalStatus && (
              <Badge variant="outline" className="text-[10px]">
                {record.nutritionalStatus}
              </Badge>
            )}
            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date(record.measurementDate).toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "short",
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function PediatricsDashboard({
  doctorId,
  subSpecialties,
}: PediatricsDashboardProps) {
  const {
    patientStatus,
    growthAlerts,
    upcomingVaccines,
    recentGrowthRecords,
    pendingVaccines,
    refreshedAt,
    isLoading,
    error,
    refresh,
  } = usePediatricsDashboardData(doctorId);

  const primarySubSpecialty = getPrimarySubSpecialty(subSpecialties);

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
              <Baby className="h-8 w-8 text-green-500" />
              Pediatría
            </h1>
            {primarySubSpecialty && (
              <Badge variant="outline">{primarySubSpecialty}</Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            Cuidado integral infantil con seguimiento de crecimiento, desarrollo,
            vacunación y pediatría preventiva.
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
        {/* Growth Alerts - High Priority */}
        <Card className="border-orange-200 dark:border-orange-800/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
              <TrendingUp className="h-4 w-4" />
              Alertas de Crecimiento ({growthAlerts?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <GrowthAlertsList alerts={growthAlerts || []} />
          </CardContent>
        </Card>

        {/* Upcoming Vaccines */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Syringe className="h-4 w-4 text-green-600" />
              Próximas Vacunas ({upcomingVaccines?.length || 0})
              {pendingVaccines > 0 && (
                <Badge variant="secondary" className="text-[10px] ml-auto">
                  {pendingVaccines} pendientes
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <UpcomingVaccinesList vaccines={upcomingVaccines || []} />
          </CardContent>
        </Card>

        {/* Recent Growth Records */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Ruler className="h-4 w-4 text-blue-600" />
              Registros de Crecimiento Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RecentGrowthRecordsList records={recentGrowthRecords || []} />
          </CardContent>
        </Card>

        {/* Patient Stats */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Estadísticas de Pacientes</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricItem
              label="Pacientes Activos"
              value={patientStatus?.active || 0}
              icon={Users}
            />
            <MetricItem
              label="Nuevos Este Mes"
              value={patientStatus?.newThisMonth || 0}
              icon={Baby}
            />
            <MetricItem
              label="En Seguimiento"
              value={patientStatus?.followUp || 0}
            />
            <MetricItem
              label="Alta Prioridad"
              value={patientStatus?.highPriority || 0}
              icon={AlertCircle}
            />
            <MetricItem
              label="Alertas Nutricionales"
              value={patientStatus?.nutritionAlerts || 0}
              icon={Weight}
            />
            <MetricItem
              label="Vacunas Pendientes"
              value={pendingVaccines || 0}
              icon={Syringe}
            />
            <MetricItem
              label="Alertas Crecimiento"
              value={growthAlerts?.length || 0}
              icon={TrendingUp}
            />
            <MetricItem
              label="Tendencia Activos"
              value={patientStatus?.active || 0}
              trend={patientStatus?.activeTrend || 0}
            />
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Accesos Rápidos</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="justify-start gap-2"
              asChild
            >
              <Link href="/dashboard/medico/pediatria/crecimiento">
                <TrendingUp className="h-4 w-4" />
                Curvas de Crecimiento
              </Link>
            </Button>
            <Button
              variant="outline"
              className="justify-start gap-2"
              asChild
            >
              <Link href="/dashboard/medico/pediatria/vacunacion">
                <Syringe className="h-4 w-4" />
                Calendario de Vacunas
              </Link>
            </Button>
            <Button
              variant="outline"
              className="justify-start gap-2"
              asChild
            >
              <Link href="/dashboard/medico/pediatria/neurodesarrollo">
                <Baby className="h-4 w-4" />
                Neurodesarrollo
              </Link>
            </Button>
            <Button
              variant="outline"
              className="justify-start gap-2"
              asChild
            >
              <Link href="/dashboard/medico/pediatria/adolescentes">
                <Users className="h-4 w-4" />
                Adolescentes
              </Link>
            </Button>
            <Button
              variant="outline"
              className="justify-start gap-2"
              asChild
            >
              <Link href="/dashboard/medico/pediatria/portal-padres">
                <Users className="h-4 w-4" />
                Portal de Padres
              </Link>
            </Button>
            <Button
              variant="outline"
              className="justify-start gap-2"
              asChild
            >
              <Link href="/dashboard/medico/pediatria/telemedicina">
                <Video className="h-4 w-4" />
                Telepediatría
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
