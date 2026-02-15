"use client";

import Link from "next/link";
import { Activity, Clock3, FileSearch, RefreshCcw } from "lucide-react";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@red-salud/ui";
import { getPrimarySubSpecialty } from "@/lib/specialty-experience/engine";
import { useOdontologiaDashboardData } from "@/hooks/dashboard/use-odontologia-dashboard-data";

interface OdontologyDashboardProps {
    doctorId?: string;
    subSpecialties?: string[];
}

function MetricItem({
    label,
    value,
}: {
    label: string;
    value: string | number;
}) {
    return (
        <div className="rounded-lg border border-border/60 bg-card p-3">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-xl font-semibold mt-1">{value}</p>
        </div>
    );
}

export default function OdontologyDashboard({ doctorId, subSpecialties }: OdontologyDashboardProps) {
    const {
        morningHuddle,
        clinicalBoard,
        productionBoard,
        rcmBoard,
        growthBoard,
        imagingBoard,
        refreshedAt,
        isLoading,
        error,
        refresh,
    } = useOdontologiaDashboardData(doctorId);

    const primarySubSpecialty = getPrimarySubSpecialty(subSpecialties);

    const refreshedLabel = refreshedAt
        ? new Date(refreshedAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
        : "sin sincronizar";

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-3xl font-bold tracking-tight">Odontología v1</h1>
                        {primarySubSpecialty && (
                            <Badge variant="outline">{primarySubSpecialty}</Badge>
                        )}
                    </div>
                    <p className="text-muted-foreground">
                        Operación diaria conectada a citas y RCM, con estructura lista para subespecialidades.
                    </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock3 className="h-3.5 w-3.5" />
                    Actualizado: {refreshedLabel}
                    <Button variant="outline" size="sm" onClick={() => refresh()} disabled={isLoading} className="gap-1.5 ml-1">
                        <RefreshCcw className="h-3.5 w-3.5" /> Refrescar
                    </Button>
                </div>
            </div>

            {error && (
                <Card className="border-destructive/40 bg-destructive/5">
                    <CardContent className="p-4 text-sm text-destructive">
                        {error}
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>1. Morning Huddle Dental</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        <MetricItem label="Citas del día" value={morningHuddle.citasHoy} />
                        <MetricItem label="No-shows en riesgo" value={morningHuddle.noShowEnRiesgo} />
                        <MetricItem label="Sin próxima cita" value={morningHuddle.pacientesSinProximaCita} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>2. Clinical Board</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        <MetricItem label="Hallazgos críticos" value={clinicalBoard.hallazgosCriticosNuevos} />
                        <MetricItem label="Perio alerts" value={clinicalBoard.alertasPerio} />
                        <MetricItem label="Pendientes por completar" value={clinicalBoard.tratamientosPendientes} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>3. Production Board</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-3">
                        <MetricItem label="Producción día" value={`$${productionBoard.produccionDia.toFixed(2)}`} />
                        <MetricItem label="Producción semana" value={`$${productionBoard.produccionSemana.toFixed(2)}`} />
                        <MetricItem label="Producción mes" value={`$${productionBoard.produccionMes.toFixed(2)}`} />
                        <MetricItem label="Ticket promedio" value={`$${productionBoard.ticketPromedio.toFixed(2)}`} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <CardTitle>4. RCM Board</CardTitle>
                        <Link href="/dashboard/medico/odontologia/rcm" className="text-xs text-primary hover:underline">
                            Abrir módulo
                        </Link>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-3">
                        <MetricItem label="Claims pendientes" value={rcmBoard.claimsPendientes} />
                        <MetricItem label="Claims denegados" value={rcmBoard.claimsDenegados} />
                        <MetricItem label="Aging > 30 días" value={rcmBoard.agingMayor30Dias} />
                        <MetricItem label="First-pass" value={`${rcmBoard.firstPassRate}%`} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <CardTitle>5. Growth Board</CardTitle>
                        <Link href="/dashboard/medico/odontologia/growth" className="text-xs text-primary hover:underline">
                            Abrir módulo
                        </Link>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-3">
                        <MetricItem label="Recall backlog" value={growthBoard.recallBacklog} />
                        <MetricItem label="Reactivación 30d" value={growthBoard.reactivacion30Dias} />
                        <MetricItem label="Reactivación 60d" value={growthBoard.reactivacion60Dias} />
                        <MetricItem label="Reactivación 90d" value={growthBoard.reactivacion90Dias} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-4 w-4" /> 6. Imaging/AI Board
                        </CardTitle>
                        <Link href="/dashboard/medico/odontologia/imaging" className="text-xs text-primary hover:underline">
                            Abrir módulo
                        </Link>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                            <MetricItem label="Estudios hoy" value={imagingBoard.estudiosHoy} />
                            <MetricItem label="Pendientes validación" value={imagingBoard.findingsPendientesValidacion} />
                            <MetricItem label="T. validación (min)" value={imagingBoard.tiempoValidacionPromedioMin} />
                        </div>

                        {!imagingBoard.hasRealIntegration && (
                            <div className="rounded-lg border border-border/60 bg-muted/40 p-3 text-xs text-muted-foreground flex items-center gap-2">
                                <FileSearch className="h-3.5 w-3.5" />
                                Integración clínica de imaging/AI aún pendiente de conexión E2E en esta fase.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
