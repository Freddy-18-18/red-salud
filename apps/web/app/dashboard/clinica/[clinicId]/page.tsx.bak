/**
 * Página principal del dashboard de clínica (Overview)
 */

"use client";

import { useParams } from "next/navigation";
import { useClinicScope } from "@/components/dashboard/clinica/clinic-scope-provider";
import { useClinicOverview } from "@/hooks/use-clinic-overview";
import { StatsGrid } from "@/components/dashboard/clinica/stats-grid";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, RefreshCw, Building2 } from "lucide-react";
import Link from "next/link";

export default function ClinicOverviewPage() {
  const params = useParams();
  const clinicId = params?.clinicId as string;
  const { selectedLocationIds } = useClinicScope();

  const {
    currentClinic,
    locations,
    stats,
    criticalAlerts,
    warningAlerts,
    isLoading,
    refetchStats,
    refetchAlerts,
  } = useClinicOverview(clinicId, selectedLocationIds);

  if (isLoading || !currentClinic || !stats) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Cargando...</h2>
        </div>
      </div>
    );
  }

  const handleRefresh = () => {
    refetchStats();
    refetchAlerts();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {currentClinic.name}
          </h2>
          <p className="text-muted-foreground">Panel de control ejecutivo</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Sedes seleccionadas */}
      <div className="flex items-center gap-2 flex-wrap">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Sedes activas:</span>
        {selectedLocationIds.map((locId) => {
          const location = locations?.find((l) => l.id === locId);
          return location ? (
            <Badge key={locId} variant="outline">
              {location.name}
            </Badge>
          ) : null;
        })}
      </div>

      {/* Alertas Críticas */}
      {criticalAlerts.length > 0 && (
        <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
          <CardHeader>
            <CardTitle className="flex items-center text-red-700 dark:text-red-300">
              <AlertCircle className="h-5 w-5 mr-2" />
              Alertas Críticas ({criticalAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {criticalAlerts.slice(0, 3).map((alert) => (
                <li key={alert.id} className="flex items-start">
                  <span className="font-medium mr-2">{alert.title}:</span>
                  <span className="text-sm">{alert.message}</span>
                </li>
              ))}
            </ul>
            {criticalAlerts.length > 3 && (
              <Button variant="link" size="sm" className="mt-2 p-0" asChild>
                <Link href={`/dashboard/clinica/${clinicId}/operaciones`}>
                  Ver todas las alertas
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Grid de Estadísticas */}
      <StatsGrid
        stats={{
          todayAppointments: stats.today_appointments,
          todayRevenue: stats.today_revenue,
          occupancyRate: stats.occupancy_rate,
          activeClaims: stats.active_claims,
          pendingPayments: stats.pending_payments,
          internationalPatients: stats.international_patients,
          availableResources: stats.available_resources,
          alertsCount: stats.alerts_count,
        }}
        currency={
          (currentClinic.metadata?.currency as string | undefined) || "MXN"
        }
      />

      {/* Accesos Rápidos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href={`/dashboard/clinica/${clinicId}/operaciones`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle>Operaciones</CardTitle>
              <CardDescription>
                Gestión de recursos, turnos y métricas operacionales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {stats.available_resources} recursos disponibles
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/dashboard/clinica/${clinicId}/rcm`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle>RCM & Finanzas</CardTitle>
              <CardDescription>
                Claims, facturación, pagos y KPIs financieros
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {stats.active_claims} claims activos
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/dashboard/clinica/${clinicId}/pacientes`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle>Pacientes Internacionales</CardTitle>
              <CardDescription>
                Registro, documentos y seguimiento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {stats.international_patients} en tratamiento
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Avisos / Alertas de Advertencia */}
      {warningAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-yellow-700 dark:text-yellow-300">
              Advertencias ({warningAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {warningAlerts.slice(0, 5).map((alert) => (
                <li key={alert.id} className="text-sm flex items-start">
                  <Badge variant="outline" className="mr-2 shrink-0">
                    {alert.type}
                  </Badge>
                  <span>
                    <strong>{alert.title}:</strong> {alert.message}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
