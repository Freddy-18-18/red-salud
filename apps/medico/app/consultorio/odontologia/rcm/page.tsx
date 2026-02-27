"use client";

import { useSupabaseAuth } from "@red-salud/identity";
import { useOdontologiaRcmData } from "@/hooks/dashboard/use-odontologia-rcm-data";
import { Card, Button, Badge, Input } from "@red-salud/design-system";
import {
    ShieldCheck,
    FileText,
    ArrowUpRight,
    RefreshCcw,
    Search,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Filter,
    Layers,
} from "lucide-react";
import { cn } from "@red-salud/core/utils";

export default function RcmPage() {
    const { user } = useSupabaseAuth();
    const {
        stats,
        claimsByStatus,
        denialsByCause,
        recentClaims,
        recentEligibilityChecks,
        workQueue,
        hasPhase3Integration,
        isLoading,
        error,
        refresh,
    } = useOdontologiaRcmData(user?.id);

    const financialStats = [
        { label: "Ingresos del Mes", value: `$${stats.ingresosMes.toFixed(2)}`, trend: `${claimsByStatus.approvedOrPaid} claims`, type: "up" as const },
        { label: "Pendiente Seguros", value: `$${stats.pendienteSeguros.toFixed(2)}`, trend: `${claimsByStatus.pending} pendientes`, type: "down" as const },
        { label: "Reclamaciones Pagadas", value: `${stats.claimsPagadosRate}%`, trend: `${claimsByStatus.denied} denegadas`, type: "up" as const },
        { label: "Elegibilidad Verificada", value: `${stats.elegibilidadVerificadaRate}%`, trend: `${recentEligibilityChecks.length} validaciones`, type: "up" as const },
    ];

    const queueTypeLabel: Record<string, string> = {
        eligibility: "Elegibilidad",
        denial: "Denial",
        appeal: "Apelación",
        missing_docs: "Docs faltantes",
        followup: "Seguimiento",
    };

    const statusColorMap: Record<string, string> = {
        paid: "text-emerald-500 bg-emerald-500/10",
        approved: "text-emerald-500 bg-emerald-500/10",
        submitted: "text-amber-500 bg-amber-500/10",
        in_review: "text-amber-500 bg-amber-500/10",
        partially_paid: "text-amber-500 bg-amber-500/10",
        appealed: "text-indigo-500 bg-indigo-500/10",
        denied: "text-red-500 bg-red-500/10",
        draft: "text-muted-foreground bg-muted",
    };

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">RCM Dental</h1>
                    <p className="text-muted-foreground">Fase 3: eligibility + lifecycle + work queues con foco operativo.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="gap-2" onClick={() => refresh()} disabled={isLoading}>
                        <RefreshCcw className="w-4 h-4" /> Refrescar
                    </Button>
                    <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                        <ShieldCheck className="w-4 h-4" /> Nueva Verificación
                    </Button>
                </div>
            </div>

            {!hasPhase3Integration && (
                <Card className="p-4 border-amber-500/30 bg-amber-500/5 text-sm text-amber-700 dark:text-amber-400">
                    Tablas de Fase 3 no disponibles todavía en este entorno. Aplica la migración para activar eligibility/lifecycle/queue real.
                </Card>
            )}

            {error && (
                <Card className="p-4 border-destructive/40 bg-destructive/5 text-sm text-destructive">
                    {error}
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {financialStats.map((stat, i) => (
                    <Card key={i} className="p-6 space-y-2 border-primary/5 shadow-sm">
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{stat.label}</p>
                        <div className="flex items-center justify-between pt-1">
                            <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                            <Badge variant="outline" className={cn(
                                "text-[10px] border-none font-bold",
                                stat.type === "up" ? "text-emerald-500 bg-emerald-500/5" : "text-amber-500 bg-amber-500/5"
                            )}>
                                {stat.trend} <ArrowUpRight className="w-2 h-2 ml-0.5" />
                            </Badge>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Claims Management */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <FileText className="w-5 h-5 text-indigo-500" /> Reclamaciones Recientes
                            </h2>
                            <div className="flex items-center gap-2">
                                <Button size="sm" variant="ghost" className="h-8 gap-2 border border-border">
                                    <Filter className="w-3.5 h-3.5" /> Filtrar
                                </Button>
                            </div>
                        </div>

                        <div className="border rounded-xl overflow-hidden">
                            <table className="w-full text-xs">
                                <thead className="bg-muted/50 text-muted-foreground font-bold uppercase tracking-tighter">
                                    <tr>
                                        <th className="p-4 text-left">ID Reclamación</th>
                                        <th className="p-4 text-left">Paciente</th>
                                        <th className="p-4 text-left">Monto</th>
                                        <th className="p-4 text-right">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {recentClaims.length === 0 && (
                                        <tr>
                                            <td className="p-4 text-muted-foreground" colSpan={4}>No hay claims recientes para este médico.</td>
                                        </tr>
                                    )}
                                    {recentClaims.map((claim) => (
                                        <tr key={claim.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="p-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">{claim.id}</td>
                                            <td className="p-4 space-y-0.5">
                                                <p className="font-bold">{claim.patient_id}</p>
                                                <p className="text-[10px] text-muted-foreground">{new Date(claim.claim_date).toLocaleDateString("es-ES")}</p>
                                            </td>
                                            <td className="p-4 font-bold">${Number(claim.total_amount || 0).toFixed(2)}</td>
                                            <td className="p-4 text-right">
                                                <Badge className={cn("text-[10px] border-none font-bold capitalize", statusColorMap[claim.status] || "text-muted-foreground bg-muted")}>
                                                    {claim.status === "paid" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                                                    {["submitted", "in_review", "partially_paid", "appealed"].includes(claim.status) && <Clock className="w-3 h-3 mr-1" />}
                                                    {claim.status === "denied" && <XCircle className="w-3 h-3 mr-1" />}
                                                    {claim.status}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Button variant="link" className="w-full text-indigo-500 font-bold h-auto p-0 text-xs">
                            Ver Todas las Reclamaciones
                        </Button>
                    </Card>

                    <Card className="p-5 border-dashed border-2 border-indigo-500/20 bg-indigo-500/5 space-y-4">
                        <div className="flex items-center gap-2">
                            <Layers className="w-5 h-5 text-indigo-600" />
                            <h3 className="font-bold">Denegaciones por causa</h3>
                        </div>
                        <div className="space-y-2">
                            {denialsByCause.length === 0 && (
                                <p className="text-xs text-muted-foreground">Sin denegaciones registradas en el período.</p>
                            )}
                            {denialsByCause.map((item) => (
                                <div key={item.cause} className="flex items-center justify-between rounded-lg border border-border/50 bg-card p-2 text-xs">
                                    <span className="font-medium truncate pr-2">{item.cause}</span>
                                    <Badge variant="outline">{item.count}</Badge>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Eligibility Check Sidebar */}
                <div className="space-y-6">
                    <Card className="p-6 space-y-6 ring-1 ring-primary/10">
                        <div className="space-y-1">
                            <h3 className="font-bold flex items-center gap-2">
                                <Search className="w-5 h-5 text-primary" /> Verificador Rápido
                            </h3>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold">Elegibilidad Dental</p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-muted-foreground px-1">ID DEL AFILIADO</label>
                                <Input placeholder="Eje: AS-9923-B" className="h-9 text-xs" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-muted-foreground px-1">ASEGURADORA</label>
                                <select className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm shadow-black/5 ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                                    <option>Sanitas Dental</option>
                                    <option>Adeslas</option>
                                    <option>Mapfre Salud</option>
                                </select>
                            </div>
                            <Button className="w-full bg-primary h-10 text-xs font-bold gap-2">
                                <ShieldCheck className="w-4 h-4" /> Verificar Cobertura
                            </Button>
                        </div>

                        <div className="pt-4 border-t border-border/50">
                            <div className="p-3 bg-muted/40 rounded-lg flex items-start gap-3">
                                <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                                <p className="text-[10px] leading-relaxed">
                                    Recuerda que los <strong>Copagos Estimados</strong> pueden variar según el tratamiento final realizado.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Últimas verificaciones</p>
                            {recentEligibilityChecks.length === 0 && (
                                <p className="text-xs text-muted-foreground">Sin verificaciones registradas.</p>
                            )}
                            {recentEligibilityChecks.map((item) => (
                                <div key={item.id} className="rounded-lg border border-border/50 bg-card p-2 text-xs">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="font-medium truncate">{item.payer_name}</span>
                                        <Badge variant="outline" className="capitalize">{item.eligibility_status}</Badge>
                                    </div>
                                    <p className="text-muted-foreground">Copago: ${Number(item.estimated_copay || 0).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className="p-6 border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-transparent space-y-4">
                        <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-indigo-500" />
                            <h3 className="font-bold">Work Queue RCM</h3>
                        </div>
                        <ul className="space-y-2">
                            {workQueue.length === 0 && (
                                <li className="text-xs text-muted-foreground">Sin tareas abiertas en la cola.</li>
                            )}
                            {workQueue.map((item) => (
                                <li key={item.id} className="rounded-lg border border-border/50 bg-card p-2 text-xs space-y-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="font-medium">{queueTypeLabel[item.queue_type] || item.queue_type}</span>
                                        <Badge variant="outline" className="capitalize">{item.priority}</Badge>
                                    </div>
                                    <p className="text-muted-foreground line-clamp-2">{item.reason}</p>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </div>
            </div>
        </div>
    );
}
