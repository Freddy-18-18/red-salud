/**
 * @file performance-chart-widget.tsx
 * @description Super Widget de rendimiento integral.
 * Combina métricas operativas, económicas, demográficas y clínicas.
 * 
 * @module Dashboard/Widgets
 */

"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    BarChart3,
    Loader2,
    CheckCircle2,
    XCircle,
    Activity,
    Wallet,
    Users,
    Stethoscope,
    TrendingUp,
    TrendingDown,
    Calendar,
    Baby,
    PersonStanding
} from "lucide-react";
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { WidgetWrapper } from "../widget-wrapper";
import { useDashboardData } from "@/hooks/use-dashboard-data";

// ============================================================================
// TIPOS
// ============================================================================

interface PerformanceChartWidgetProps {
    doctorId?: string;
    isDragging?: boolean;
    profile?: {
        consultation_price?: number;
    };
}

type TabType = "overview" | "income" | "patients" | "clinical";

// ============================================================================
// HELPERS
// ============================================================================

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("es-VE", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(amount);
}

function calculateAge(birthDateStr?: string): number | null {
    if (!birthDateStr) return null;
    const birthDate = new Date(birthDateStr);
    const ageDifMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function PerformanceChartWidget({
    doctorId,
    isDragging,
    profile
}: PerformanceChartWidgetProps) {
    const [activeTab, setActiveTab] = useState<TabType>("overview");
    const { appointments, isLoading } = useDashboardData(doctorId);
    const consultationPrice = profile?.consultation_price || 60;

    // ------------------------------------------------------------------------
    // DATOS: RESUMEN (Overview)
    // ------------------------------------------------------------------------
    const overviewData = useMemo(() => {
        const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
        const result = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            d.setHours(0, 0, 0, 0);
            const dateStr = d.toISOString().split('T')[0];

            const daysApts = appointments.filter(a => a.appointment_date === dateStr);

            result.push({
                name: days[d.getDay()],
                total: daysApts.length,
                completed: daysApts.filter(a => a.status === 'completed').length,
                cancelled: daysApts.filter(a => a.status === 'cancelled').length,
            });
        }
        return result;
    }, [appointments]);

    const overviewStats = useMemo(() => ({
        total: appointments.length,
        completed: appointments.filter(a => a.status === 'completed').length,
        pending: appointments.filter(a => a.status === 'pending').length,
        cancelled: appointments.filter(a => a.status === 'cancelled').length,
    }), [appointments]);

    // ------------------------------------------------------------------------
    // DATOS: INGRESOS (Income)
    // ------------------------------------------------------------------------
    const incomeData = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // Ingresos este mes
        const thisMonthApts = appointments.filter(a => {
            const d = new Date(a.appointment_date);
            return d.getMonth() === currentMonth &&
                d.getFullYear() === currentYear &&
                a.status === 'completed';
        });
        const currentRef = thisMonthApts.length * consultationPrice;

        // Ingresos mes anterior
        const lastMonthApts = appointments.filter(a => {
            const d = new Date(a.appointment_date);
            // Lógica simple mes anterior
            const isLastMonth = currentMonth === 0
                ? (d.getMonth() === 11 && d.getFullYear() === currentYear - 1)
                : (d.getMonth() === currentMonth - 1 && d.getFullYear() === currentYear);
            return isLastMonth && a.status === 'completed';
        });
        const prevRef = lastMonthApts.length * consultationPrice;

        // Gráfico últimos 6 meses
        const chart = [];
        const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const m = d.getMonth();
            const y = d.getFullYear();

            const monthlyApts = appointments.filter(a => {
                const ad = new Date(a.appointment_date);
                return ad.getMonth() === m && ad.getFullYear() === y && a.status === 'completed';
            });

            chart.push({
                name: monthNames[m],
                value: monthlyApts.length * consultationPrice
            });
        }

        return { current: currentRef, previous: prevRef, chart };
    }, [appointments, consultationPrice]);

    // ------------------------------------------------------------------------
    // DATOS: PACIENTES (Demografía)
    // ------------------------------------------------------------------------
    const demographicsData = useMemo(() => {
        const uniquePatients = new Map();
        appointments.forEach(apt => {
            if (apt.patient && !uniquePatients.has(apt.patient_id)) {
                uniquePatients.set(apt.patient_id, apt.patient);
            }
        });
        const patients = Array.from(uniquePatients.values());

        // Edades
        const ageGroups = { "0-18": 0, "19-35": 0, "36-50": 0, "51+": 0 };
        patients.forEach(p => {
            const age = calculateAge(p.fecha_nacimiento);
            if (age !== null) {
                if (age <= 18) ageGroups["0-18"]++;
                else if (age <= 35) ageGroups["19-35"]++;
                else if (age <= 50) ageGroups["36-50"]++;
                else ageGroups["51+"]++;
            }
        });

        const ageChart = [
            { name: "0-18", value: ageGroups["0-18"], color: "#3b82f6" },
            { name: "19-35", value: ageGroups["19-35"], color: "#8b5cf6" },
            { name: "36-50", value: ageGroups["36-50"], color: "#ec4899" },
            { name: "50+", value: ageGroups["51+"], color: "#f97316" },
        ].filter(d => d.value > 0);

        // Género
        const genderStats = { M: 0, F: 0, Other: 0 };
        patients.forEach(p => {
            const g = p.genero?.toLowerCase() || 'other';
            if (g === 'masculino' || g === 'm' || g === 'hombre') genderStats.M++;
            else if (g === 'femenino' || g === 'f' || g === 'mujer') genderStats.F++;
            else genderStats.Other++;
        });

        return { ageChart, genderStats, total: patients.length };
    }, [appointments]);

    // ------------------------------------------------------------------------
    // DATOS: CLÍNICO (Diagnósticos/Motivos)
    // ------------------------------------------------------------------------
    const clinicalData = useMemo(() => {
        const reasons: Record<string, number> = {};
        appointments.forEach(apt => {
            if (!apt.reason) return;
            // Normalizar motivo básico
            let r = apt.reason.trim();
            // Agrupación super simple por palabras clave si no hay diagnósticos formales
            const lower = r.toLowerCase();
            if (lower.includes("consulta") || lower.includes("control")) r = "Control General";
            else if (lower.includes("dolor") || lower.includes("molestia")) r = "Dolor/Malestar";
            else if (lower.includes("fiebre") || lower.includes("gripe")) r = "Infección/Viral";
            else if (lower.includes("examen") || lower.includes("chequeo")) r = "Exámenes";
            else r = r.length > 15 ? r.substring(0, 15) + "..." : r; // Truncar largos

            reasons[r] = (reasons[r] || 0) + 1;
        });

        return Object.entries(reasons)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5); // Top 5
    }, [appointments]);


    // ------------------------------------------------------------------------
    // RENDER
    // ------------------------------------------------------------------------

    const renderTabTrigger = (value: TabType, label: string, Icon: React.ElementType) => (
        <TabsTrigger
            value={value}
            className="flex items-center gap-1.5 text-[10px] sm:text-xs py-1.5 h-8 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
        >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{label}</span>
        </TabsTrigger>
    );

    return (
        <WidgetWrapper
            id="performance-super"
            title="Rendimiento y Estadísticas"
            icon={<Activity className="h-4 w-4 text-primary" />}
            isDragging={isDragging}
            showControls={false}
        >
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)} className="w-full">
                <TabsList className="w-full h-auto p-1 bg-muted/40 grid grid-cols-4 mb-4">
                    {renderTabTrigger("overview", "Resumen", BarChart3)}
                    {renderTabTrigger("income", "Ingresos", Wallet)}
                    {renderTabTrigger("patients", "Pacientes", Users)}
                    {renderTabTrigger("clinical", "Clínico", Stethoscope)}
                </TabsList>

                {isLoading ? (
                    <div className="flex items-center justify-center h-[200px]">
                        <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
                    </div>
                ) : (
                    <div className="min-h-[220px]">


                        {/* --- VISTA RESUMEN --- */}
                        <TabsContent key="overview" value="overview" className="mt-0 space-y-4 animate-in fade-in-50 zoom-in-95 duration-300">
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { label: "Citas", val: overviewStats.total, color: "text-blue-500", bg: "bg-blue-500/10" },
                                    { label: "Completadas", val: overviewStats.completed, color: "text-green-500", bg: "bg-green-500/10" },
                                    { label: "Canceladas", val: overviewStats.cancelled, color: "text-red-500", bg: "bg-red-500/10" },
                                ].map((s, i) => (
                                    <div key={i} className={cn("flex flex-col items-center justify-center p-2 rounded-lg border border-border/50", s.bg)}>
                                        <span className={cn("text-xl font-bold", s.color)}>{s.val}</span>
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{s.label}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="h-[160px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={overviewData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                                        <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            itemStyle={{ fontSize: '12px' }}
                                        />
                                        <Area type="monotone" dataKey="total" stroke="#3b82f6" fill="url(#colorTotal)" strokeWidth={2} name="Total" />
                                        <Area type="monotone" dataKey="completed" stroke="#22c55e" fill="none" strokeWidth={2} name="Completadas" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </TabsContent>

                        {/* --- VISTA INGRESOS --- */}
                        <TabsContent key="income" value="income" className="mt-0 space-y-4 animate-in fade-in-50 zoom-in-95 duration-300">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/10">
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Ingresos este mes (Est.)</p>
                                    <p className="text-2xl font-bold text-primary">{formatCurrency(incomeData.current)}</p>
                                </div>
                                <div className="text-right">
                                    <Badge variant="outline" className={cn(
                                        "gap-1",
                                        incomeData.current >= incomeData.previous ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
                                    )}>
                                        {incomeData.current >= incomeData.previous ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                        {incomeData.previous > 0 ? Math.round(((incomeData.current - incomeData.previous) / incomeData.previous) * 100) : 0}%
                                    </Badge>
                                    <p className="text-[10px] text-muted-foreground mt-1">vs mes anterior</p>
                                </div>
                            </div>

                            <div className="h-[150px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={incomeData.chart} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                        <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                                        <Tooltip
                                            cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                                            contentStyle={{ borderRadius: '8px' }}
                                            formatter={(value: number) => [formatCurrency(value), "Ingresos"]}
                                        />
                                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </TabsContent>

                        {/* --- VISTA PACIENTES --- */}
                        <TabsContent key="patients" value="patients" className="mt-0 grid grid-cols-2 gap-4 animate-in fade-in-50 zoom-in-95 duration-300">
                            <div className="flex flex-col items-center justify-center p-2 bg-muted/20 rounded-lg">
                                <h4 className="text-xs font-semibold mb-2 flex items-center gap-1">
                                    <Baby className="w-3 h-3" /> Distribución Edad
                                </h4>
                                <div className="h-[120px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={demographicsData.ageChart}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={25}
                                                outerRadius={45}
                                                paddingAngle={2}
                                                dataKey="value"
                                            >
                                                {demographicsData.ageChart.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex flex-wrap justify-center gap-2 mt-2">
                                    {demographicsData.ageChart.map((d, i) => (
                                        <div key={i} className="flex items-center gap-1 text-[9px]">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                                            <span className="text-muted-foreground">{d.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col p-2 bg-muted/20 rounded-lg">
                                <h4 className="text-xs font-semibold mb-3 flex items-center gap-1">
                                    <PersonStanding className="w-3 h-3" /> Género
                                </h4>
                                <div className="space-y-3 flex-1 flex flex-col justify-center">
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-[10px]">
                                            <span>Masculino</span>
                                            <span className="font-bold">{demographicsData.genderStats.M}</span>
                                        </div>
                                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-500 rounded-full"
                                                style={{ width: `${(demographicsData.genderStats.M / Math.max(demographicsData.total, 1)) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-[10px]">
                                            <span>Femenino</span>
                                            <span className="font-bold">{demographicsData.genderStats.F}</span>
                                        </div>
                                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-pink-500 rounded-full"
                                                style={{ width: `${(demographicsData.genderStats.F / Math.max(demographicsData.total, 1)) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* --- VISTA CLÍNICO --- */}
                        <TabsContent key="clinical" value="clinical" className="mt-0 animate-in fade-in-50 zoom-in-95 duration-300">
                            <h4 className="text-xs font-semibold mb-3 text-muted-foreground">Motivos de consulta frecuentes</h4>
                            <div className="space-y-3">
                                {clinicalData.length > 0 ? clinicalData.map((item, index) => (
                                    <div key={index} className="group flex items-center gap-3">
                                        <span className="text-[10px] bg-muted w-5 h-5 flex items-center justify-center rounded-full font-bold text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                            {index + 1}
                                        </span>
                                        <div className="flex-1">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="font-medium group-hover:text-primary transition-colors">{item.name}</span>
                                                <span className="text-muted-foreground">{item.count} citas</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(item.count / Math.max(...clinicalData.map(c => c.count))) * 100}%` }}
                                                    className="h-full bg-primary/70 rounded-full group-hover:bg-primary transition-colors"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-10 text-muted-foreground text-xs">
                                        No hay datos suficientes
                                    </div>
                                )}
                            </div>
                        </TabsContent>


                    </div>
                )}
            </Tabs>
        </WidgetWrapper >
    );
}
