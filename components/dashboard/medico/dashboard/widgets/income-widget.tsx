/**
 * @file income-widget.tsx
 * @description Widget de ingresos mejorado con métricas completas.
 * Muestra ingresos diarios, semanales, mensuales con gráficos y tendencias.
 * 
 * @module Dashboard/Widgets
 */

"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    Calendar,
    Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WidgetWrapper } from "../widget-wrapper";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

// ============================================================================
// TIPOS
// ============================================================================

interface IncomeWidgetProps {
    /** ID del médico */
    doctorId?: string;
    /** Si está siendo arrastrado */
    isDragging?: boolean;
    /** Perfil del médico con precio de consulta */
    profile?: {
        consultation_price?: number;
    };
}

type TimePeriod = "day" | "week" | "month" | "year";

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Formatea un número como moneda USD.
 */
function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("es-VE", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

/**
 * Calcula diferencia porcentual entre dos valores.
 */
function calcPercentChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
}

/**
 * Obtiene el rango de fechas para un período.
 */
function getDateRange(period: TimePeriod): { start: Date; end: Date; prevStart: Date; prevEnd: Date } {
    const now = new Date();
    now.setHours(23, 59, 59, 999);

    const start = new Date(now);
    const prevStart = new Date(now);
    const prevEnd = new Date(now);

    switch (period) {
        case "day":
            start.setHours(0, 0, 0, 0);
            prevStart.setDate(now.getDate() - 1);
            prevStart.setHours(0, 0, 0, 0);
            prevEnd.setDate(now.getDate() - 1);
            prevEnd.setHours(23, 59, 59, 999);
            break;
        case "week":
            start.setDate(now.getDate() - now.getDay());
            start.setHours(0, 0, 0, 0);
            prevStart.setDate(now.getDate() - now.getDay() - 7);
            prevStart.setHours(0, 0, 0, 0);
            prevEnd.setDate(now.getDate() - now.getDay() - 1);
            prevEnd.setHours(23, 59, 59, 999);
            break;
        case "month":
            start.setDate(1);
            start.setHours(0, 0, 0, 0);
            prevStart.setMonth(now.getMonth() - 1, 1);
            prevStart.setHours(0, 0, 0, 0);
            prevEnd.setDate(0); // Último día del mes anterior
            prevEnd.setHours(23, 59, 59, 999);
            break;
        case "year":
            start.setMonth(0, 1);
            start.setHours(0, 0, 0, 0);
            prevStart.setFullYear(now.getFullYear() - 1, 0, 1);
            prevStart.setHours(0, 0, 0, 0);
            prevEnd.setFullYear(now.getFullYear() - 1, 11, 31);
            prevEnd.setHours(23, 59, 59, 999);
            break;
    }

    return { start, end: now, prevStart, prevEnd };
}

/**
 * Nombres de los meses cortos.
 */
const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Widget de ingresos mejorado con métricas completas.
 * 
 * @example
 * <IncomeWidget doctorId="uuid-del-doctor" profile={{ consultation_price: 60 }} />
 */
export function IncomeWidget({
    doctorId,
    isDragging,
    profile
}: IncomeWidgetProps) {
    // Estado del período seleccionado
    const [period, setPeriod] = useState<TimePeriod>("week");

    // Datos del dashboard
    const { appointments, isLoading } = useDashboardData(doctorId);

    // Precio de consulta del perfil o valor por defecto
    const consultaPrice = profile?.consultation_price || 60;

    // Calcular métricas por período
    const metrics = useMemo(() => {
        const { start, end, prevStart, prevEnd } = getDateRange(period);

        // Filtrar citas completadas del período actual
        const currentPeriodCompleted = appointments.filter(apt => {
            if (apt.status !== 'completed') return false;
            const aptDate = new Date(apt.appointment_date);
            return aptDate >= start && aptDate <= end;
        });

        // Filtrar citas completadas del período anterior
        const prevPeriodCompleted = appointments.filter(apt => {
            if (apt.status !== 'completed') return false;
            const aptDate = new Date(apt.appointment_date);
            return aptDate >= prevStart && aptDate <= prevEnd;
        });

        const currentIncome = currentPeriodCompleted.length * consultaPrice;
        const prevIncome = prevPeriodCompleted.length * consultaPrice;
        const percentChange = calcPercentChange(currentIncome, prevIncome);

        return {
            currentIncome,
            prevIncome,
            percentChange,
            isPositive: percentChange >= 0,
            appointmentsCount: currentPeriodCompleted.length,
        };
    }, [appointments, period, consultaPrice]);

    // Datos para el gráfico de tendencia (últimos 6 meses)
    const chartData = useMemo(() => {
        const data: { name: string; total: number }[] = [];
        const now = new Date();

        for (let i = 5; i >= 0; i--) {
            const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

            const monthCompleted = appointments.filter(apt => {
                if (apt.status !== 'completed') return false;
                const aptDate = new Date(apt.appointment_date);
                return aptDate >= monthDate && aptDate <= monthEnd;
            });

            data.push({
                name: monthNames[monthDate.getMonth()],
                total: monthCompleted.length * consultaPrice,
            });
        }

        return data;
    }, [appointments, consultaPrice]);

    // Etiquetas de período
    const periodLabels: Record<TimePeriod, string> = {
        day: "Hoy",
        week: "Esta semana",
        month: "Este mes",
        year: "Este año",
    };

    return (
        <WidgetWrapper
            id="income"
            title="Ingresos"
            icon={<DollarSign className="h-4 w-4 text-primary" />}
            isDragging={isDragging}
            showControls={false}
        >
            <div className="space-y-4">
                {/* Estado de carga */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                ) : (
                    <>
                        {/* Selector de período */}
                        <div className="flex items-center gap-1">
                            {(["day", "week", "month", "year"] as TimePeriod[]).map((p) => (
                                <Button
                                    key={p}
                                    variant={period === p ? "default" : "ghost"}
                                    size="sm"
                                    className="h-6 px-2 text-[10px]"
                                    onClick={() => setPeriod(p)}
                                >
                                    {p === "day" ? "Día" : p === "week" ? "Semana" : p === "month" ? "Mes" : "Año"}
                                </Button>
                            ))}
                        </div>

                        {/* Métrica principal */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={period}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-1"
                            >
                                <p className="text-xs text-muted-foreground">{periodLabels[period]}</p>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-2xl font-bold">
                                        {formatCurrency(metrics.currentIncome)}
                                    </h3>
                                    <Badge
                                        variant="outline"
                                        className={metrics.isPositive
                                            ? "text-green-600 bg-green-50 border-green-200"
                                            : "text-red-600 bg-red-50 border-red-200"
                                        }
                                    >
                                        {metrics.isPositive ? (
                                            <TrendingUp className="w-3 h-3 mr-1" />
                                        ) : (
                                            <TrendingDown className="w-3 h-3 mr-1" />
                                        )}
                                        {metrics.percentChange > 0 ? "+" : ""}{metrics.percentChange}%
                                    </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {metrics.appointmentsCount} citas completadas
                                </p>
                            </motion.div>
                        </AnimatePresence>

                        {/* Gráfico de tendencia */}
                        <div className="h-[100px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={(v) => `$${v}`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "hsl(var(--card))",
                                            border: "1px solid hsl(var(--border))",
                                            borderRadius: "8px",
                                            fontSize: "12px",
                                        }}
                                        formatter={(value: number) => [formatCurrency(value), "Ingresos"]}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="total"
                                        stroke="hsl(var(--primary))"
                                        strokeWidth={2}
                                        fill="url(#incomeGradient)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Info adicional */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
                            <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>Últimos 6 meses</span>
                            </div>
                            <span className="font-medium text-foreground">
                                ${consultaPrice}/consulta
                            </span>
                        </div>
                    </>
                )}
            </div>
        </WidgetWrapper>
    );
}
