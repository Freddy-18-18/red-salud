"use client";

import { motion } from "framer-motion";
import { Users, Calendar, Activity, TrendingUp } from "lucide-react";
import { Card } from "@red-salud/design-system";
import { useEffect, useState } from "react";
import { createStatisticsService } from "@/lib/supabase/services/statistics-service";

interface StatsBentoGridProps {
    doctorId?: string;
}

export function StatsBentoGrid({ doctorId }: StatsBentoGridProps) {
    const [stats, setStats] = useState({
        patients: 0,
        appointments: 0,
        completion: 0,
        growth: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!doctorId) return;

        const fetchStats = async () => {
            try {
                const statsService = createStatisticsService(doctorId);
                const today = new Date();
                const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

                // Get real metrics
                const demographics = await statsService.getPatientDemographics({ start: startOfMonth, end: today });
                const efficiency = await statsService.getEfficiencyMetrics({ start: startOfMonth, end: today });
                const retention = await statsService.getPatientRetention({ start: startOfMonth, end: today });

                setStats({
                    patients: demographics.totalPatients || 0,
                    appointments: Math.round(efficiency.appointmentsPerDay) || 0,
                    completion: Math.round(efficiency.occupancyRate) || 0,
                    growth: Math.round(retention.retentionRate30d) || 0, // Simplified growth metric for now
                });
            } catch (error) {
                console.error("Error fetching doctor stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [doctorId]);

    const items = [
        {
            title: "Pacientes Totales",
            value: stats.patients,
            label: "En el último mes",
            icon: Users,
            color: "text-blue-500",
        },
        {
            title: "Citas Promedio",
            value: stats.appointments,
            label: "Por día",
            icon: Calendar,
            color: "text-emerald-500",
        },
        {
            title: "Tasa de Finalización",
            value: `${stats.completion}%`,
            label: "Rendimiento mensual",
            icon: Activity,
            color: "text-amber-500",
        },
        {
            title: "Retención",
            value: `${stats.growth}%`,
            label: "Últimos 30 días",
            icon: TrendingUp,
            color: "text-purple-500",
        },
    ];

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="glass-premium p-6 h-32 animate-pulse bg-white/5" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {items.map((item, index) => (
                <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -4 }}
                    className="relative group"
                >
                    <Card className="relative glass-premium p-6 overflow-hidden border-white/10 dark:border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    {item.title}
                                </p>
                                <h3 className="text-3xl font-bold tracking-tight">
                                    {item.value}
                                </h3>
                                <p className="text-[10px] text-muted-foreground">
                                    {item.label}
                                </p>
                            </div>
                            <div className="p-2 rounded-lg bg-muted/10 border border-white/5">
                                <item.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                        </div>

                        {/* Minimal Abstract background */}
                        <div className="absolute -right-2 -bottom-2 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none">
                            <item.icon className="h-20 w-20" />
                        </div>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
}
