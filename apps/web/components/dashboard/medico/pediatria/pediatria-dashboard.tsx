// ============================================
// PEDIATRICS DASHBOARD
// Main dashboard for pediatrics specialty
// ============================================

"use client";

import Link from "next/link";
import {
  Baby,
  Syringe,
  TrendingUp,
  Clock3,
  RefreshCcw,
  Calendar,
  AlertCircle,
  Users,
  Video,
} from "lucide-react";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@red-salud/ui";
import { getPrimarySubSpecialty } from "@/lib/specialty-experience/engine";
import { usePediatricsDashboardData } from "@/hooks/dashboard/use-pediatrics-dashboard-data";

interface PediatricsDashboardProps {
  doctorId?: string;
  subSpecialties?: string[];
}

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

function VaccinationTracker({
  vaccinations,
  upcomingVaccines
}: {
  vaccinations: Array<{
    vaccineName: string;
    completed: number;
    scheduled: number;
    coverage: number;
  }>;
  upcomingVaccines: Array<{
    patientName: string;
    vaccine: string;
    scheduledDate: string;
  }>;
}) {
  return (
    <div className="space-y-4">
      {/* Coverage Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {vaccinations.map((vax) => (
          <div key={vax.vaccineName} className="text-center">
            <p className="text-xs text-muted-foreground mb-1">{vax.vaccineName}</p>
            <p className="text-lg font-bold">{vax.coverage}%</p>
            <p className="text-xs text-muted-foreground">
              {vax.completed}/{vax.scheduled}
            </p>
          </div>
        ))}
      </div>

      {/* Upcoming Vaccinations */}
      {upcomingVaccines.length > 0 && (
        <>
          <div className="h-px bg-border my-2" />
          <div className="space-y-2">
            <p className="text-sm font-medium">Próximas Vacunas:</p>
            {upcomingVaccines.map((vax, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <Syringe className="h-3.5 w-3.5 text-primary" />
                <span>{vax.patientName} - {vax.vaccine}</span>
                <span className="text-muted-foreground ml-auto">{vax.scheduledDate}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function GrowthAlerts({
  alerts
}: {
  alerts: Array<{
    patientName: string;
    age: string;
    alert: string;
    severity: "high" | "medium" | "low";
  }>;
}) {
  if (alerts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No alertas de crecimiento</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {alerts.map((alert, i) => (
        <div
          key={i}
          className={`flex items-center gap-3 p-3 rounded-lg border ${
            alert.severity === "high"
              ? "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800"
              : alert.severity === "medium"
              ? "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800"
              : "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
          }`}
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0 text-blue-600" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {alert.patientName}, {alert.age}
            </p>
            <p className="text-xs text-muted-foreground truncate">{alert.alert}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function WellChildSchedule({
  appointments
}: {
  appointments: Array<{
    patientName: string;
    age: string;
    visitType: string;
    scheduledDate: string;
  }>;
}) {
  if (appointments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No visitas programadas hoy</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {appointments.map((apt, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-card"
        >
          <Baby className="h-4 w-4 text-primary flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{apt.patientName}</p>
            <p className="text-xs text-muted-foreground">
              {apt.age} • {apt.visitType}
            </p>
          </div>
          <span className="text-xs text-muted-foreground">{apt.scheduledDate}</span>
        </div>
      ))}
    </div>
  );
}

export default function PediatricsDashboard({
  doctorId,
  subSpecialties,
}: PediatricsDashboardProps) {
  const {
    patientStatus,
    vaccinations,
    growthAlerts,
    wellChildSchedule,
    upcomingVaccines,
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
              Pediatría v1
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
            <GrowthAlerts alerts={growthAlerts || []} />
          </CardContent>
        </Card>

        {/* Well Child Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Visitas de Bienestar Hoy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <WellChildSchedule appointments={wellChildSchedule || []} />
          </CardContent>
        </Card>

        {/* Vaccination Tracker */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Syringe className="h-4 w-4" />
              Cobertura de Vacunación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <VaccinationTracker
              vaccinations={vaccinations || []}
              upcomingVaccines={upcomingVaccines || []}
            />
          </CardContent>
        </Card>

        {/* Patient Stats */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Estadística de Pacientes</CardTitle>
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
              label="Tasa de Cumplimiento"
              value="87%"
              trend={3}
            />
            <MetricItem label="Visitas Well-Child" value="92%" trend={5} />
            <MetricItem label="Vacunación al Día" value="94%" />
            <MetricItem label="Crecimiento Normal" value="89%" />
            <MetricItem label="Alertas Nutricionales" value={patientStatus?.nutritionAlerts || 0} status={patientStatus?.nutritionAlerts > 5 ? "warning" : "normal"} />
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
