"use client";

import { useSupabaseAuth } from "@/components/providers/supabase-auth-provider";
import { useOdontologiaGrowthData } from "@/hooks/dashboard/use-odontologia-growth-data";
import { Card, Button, Badge, Input } from "@red-salud/ui";
import {
    TrendingUp,
    Star,
    Users,
    BarChart3,
    ArrowUpRight,
    Plus,
    Search,
    CheckCircle2,
    Zap,
    RefreshCcw,
    Layers,
} from "lucide-react";
import { cn } from "@red-salud/core/utils";

export default function GrowthPage() {
    const { user } = useSupabaseAuth();
    const {
        kpis,
        topSegments,
        campaignSummary,
        recallCandidates,
        hasPhase3Integration,
        isLoading,
        error,
        refresh,
    } = useOdontologiaGrowthData(user?.id);

    const kpiCards = [
        { label: "Recall Backlog", value: String(kpis.recallBacklog), trend: `${kpis.highRiskCount} alto riesgo`, icon: Star, color: "text-amber-500" },
        { label: "Pacientes Reactivados (90d)", value: String(kpis.reactivation90d), trend: "últimos 90 días", icon: Users, color: "text-emerald-500" },
        { label: "Conversión Closed-Loop", value: `${kpis.closedLoopConversionRate}%`, trend: "booked/sent", icon: Zap, color: "text-indigo-500" },
        { label: "Impacto Económico", value: `$${kpis.economicImpactAmount.toFixed(2)}`, trend: "eventos paid", icon: TrendingUp, color: "text-primary" },
    ];

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Practice Growth CRM</h1>
                    <p className="text-muted-foreground">Suite de crecimiento, reputación y fidelización de pacientes.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="gap-2" onClick={() => refresh()} disabled={isLoading}>
                        <RefreshCcw className="w-4 h-4" /> Refrescar
                    </Button>
                    <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                        <Plus className="w-4 h-4" /> Crear Campaña
                    </Button>
                </div>
            </div>

            {!hasPhase3Integration && (
                <Card className="p-4 border-amber-500/30 bg-amber-500/5 text-sm text-amber-700 dark:text-amber-400">
                    Tablas de segmentación/campañas de Fase 3 no disponibles en este entorno. Aplica la migración para closed-loop real.
                </Card>
            )}

            {error && (
                <Card className="p-4 border-destructive/40 bg-destructive/5 text-sm text-destructive">
                    {error}
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpiCards.map((kpi, i) => (
                    <Card key={i} className="p-6 space-y-2 border-primary/10 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div className={cn("p-2 rounded-lg bg-card border", kpi.color)}>
                                <kpi.icon className="w-5 h-5" />
                            </div>
                            <Badge variant="outline" className="text-[10px] text-emerald-500 bg-emerald-500/5 border-emerald-500/20">
                                {kpi.trend} <ArrowUpRight className="w-2 h-2 ml-0.5" />
                            </Badge>
                        </div>
                        <p className="text-2xl font-bold pt-2">{kpi.value}</p>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{kpi.label}</p>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Active Campaigns */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Zap className="w-5 h-5 text-indigo-500" /> Campañas Closed-Loop
                        </h2>
                    </div>

                    <Card className="p-6 space-y-4">
                        <div className="grid grid-cols-1 gap-3">
                            {campaignSummary.length === 0 && (
                                <p className="text-sm text-muted-foreground">Sin campañas registradas para este médico.</p>
                            )}
                            {campaignSummary.map((campaign) => (
                                <div key={campaign.campaignId} className="rounded-lg border border-border/60 bg-card p-3">
                                    <div className="flex items-center justify-between">
                                        <p className="font-semibold text-sm">{campaign.name}</p>
                                        <Badge variant="outline" className="capitalize">{campaign.status}</Badge>
                                    </div>
                                    <div className="mt-2 grid grid-cols-4 gap-2 text-xs">
                                        <div><span className="text-muted-foreground">Sent</span><p className="font-semibold">{campaign.sent}</p></div>
                                        <div><span className="text-muted-foreground">Booked</span><p className="font-semibold">{campaign.booked}</p></div>
                                        <div><span className="text-muted-foreground">Accepted</span><p className="font-semibold">{campaign.acceptedTreatment}</p></div>
                                        <div><span className="text-muted-foreground">Paid</span><p className="font-semibold">{campaign.paid}</p></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold">Recall inteligente (pacientes objetivo)</h3>
                            <div className="relative w-48">
                                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                <Input placeholder="Buscar paciente..." className="pl-8 h-8 text-xs" />
                            </div>
                        </div>
                        <div className="border rounded-lg overflow-hidden">
                            <table className="w-full text-xs">
                                <thead className="bg-muted text-muted-foreground">
                                    <tr>
                                        <th className="p-3 text-left">Paciente</th>
                                        <th className="p-3 text-left">Última Visita</th>
                                        <th className="p-3 text-left">Inactividad</th>
                                        <th className="p-3 text-right">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {recallCandidates.length === 0 && (
                                        <tr>
                                            <td className="p-3 text-muted-foreground" colSpan={4}>Sin candidatos de recall en este momento.</td>
                                        </tr>
                                    )}
                                    {recallCandidates.map((candidate) => (
                                        <tr key={candidate.patientId} className="hover:bg-muted/30 transition-colors">
                                            <td className="p-3 font-medium">{candidate.patientId}</td>
                                            <td className="p-3 text-muted-foreground">{new Date(candidate.lastVisitAt).toLocaleDateString("es-ES")}</td>
                                            <td className="p-3">{candidate.inactivityDays} días</td>
                                            <td className="p-3 text-right">
                                                <Button size="sm" variant="ghost" className="h-7 text-[10px] text-primary hover:bg-primary/5">
                                                    {candidate.suggestedChannel.toUpperCase()}
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                {/* Reputation Sidebar */}
                <div className="space-y-6">
                    <Card className="p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold flex items-center gap-2">
                                <Layers className="w-5 h-5 text-amber-500" /> Segmentos prioritarios
                            </h3>
                            <span className="text-2xl font-bold">{topSegments.length}</span>
                        </div>

                        <div className="space-y-4">
                            {topSegments.length === 0 && (
                                <p className="text-xs text-muted-foreground">Sin segmentación calculada aún.</p>
                            )}
                            {topSegments.map((segment) => (
                                <div key={segment.label} className="p-3 rounded-xl bg-muted/20 border border-border/50 space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold">{segment.label}</span>
                                        <Badge variant="outline">{segment.patients}</Badge>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground">Pacientes en este segmento objetivo.</p>
                                </div>
                            ))}
                        </div>

                        <Button className="w-full variant-outline h-9 text-xs gap-2">
                            <BarChart3 className="w-3.5 h-3.5" /> Ver segmentación completa
                        </Button>
                    </Card>

                    <Card className="p-6 bg-primary text-primary-foreground space-y-4">
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            <h3 className="font-bold">Insights de Pacientes</h3>
                        </div>
                        <p className="text-xs opacity-90 leading-relaxed italic">
                            "La métrica closed-loop conecta campaña, cita, aceptación y cobro para medir impacto económico real."
                        </p>
                        <div className="pt-2">
                            <Button size="sm" variant="outline" className="w-full bg-white/10 border-white/20 hover:bg-white/20 text-white text-[10px] h-8">
                                Ver impacto por cohorte
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
