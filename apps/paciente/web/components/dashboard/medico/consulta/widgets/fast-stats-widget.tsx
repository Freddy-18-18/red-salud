"use client";

import { Card } from "@red-salud/design-system";
import { Activity, Clock, Users, CalendarCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export function FastStatsWidget() {
    const [stats, setStats] = useState({
        todayTotal: 0,
        pending: 0,
        completed: 0,
        avgTime: "15m" // Placeholder for now as we don't have duration data easily available
    });

    useEffect(() => {
        const fetchStats = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const today = new Date().toISOString().split('T')[0];

            // Get today's appointments breakdown
            const { data: appointmentsData } = await supabase
                .from("appointments")
                .select("status")
                .eq("medico_id", user.id)
                .gte("fecha_hora", `${today}T00:00:00`)
                .lte("fecha_hora", `${today}T23:59:59`);

            // Fetch average duration from view
            const { data: metricsData } = await supabase
                .from("v_medico_metricas_consulta_tiempo_real")
                .select("promedio_minutos")
                .eq("medico_id", user.id)
                .single();

            if (appointmentsData) {
                const total = appointmentsData.length;
                const completed = appointmentsData.filter(a => a.status === 'completada' || a.status === 'completed').length;
                const pending = appointmentsData.filter(a => a.status === 'confirmada' || a.status === 'confirmed' || a.status === 'pendiente').length;

                setStats({
                    todayTotal: total,
                    pending: pending,
                    completed: completed,
                    avgTime: metricsData ? `${metricsData.promedio_minutos}m` : "0m"
                });
            }
        };

        fetchStats();

        // Suscribirse a cambios en las citas para actualizar métricas en tiempo real
        const channel = supabase
            .channel('appointments_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'appointments'
                },
                () => {
                    fetchStats();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 h-full">
            <Card className="bg-primary/5 border-primary/10 shadow-sm flex items-center justify-between p-4 h-full">
                <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Citas Hoy</p>
                    <h3 className="text-2xl font-bold text-primary">{stats.todayTotal}</h3>
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <CalendarCheck className="h-5 w-5" />
                </div>
            </Card>

            <Card className="bg-orange-500/5 border-orange-500/10 shadow-sm flex items-center justify-between p-4 h-full">
                <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Pendientes</p>
                    <h3 className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.pending}</h3>
                </div>
                <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400">
                    <Clock className="h-5 w-5" />
                </div>
            </Card>

            <Card className="bg-blue-500/5 border-blue-500/10 shadow-sm flex items-center justify-between p-4 h-full">
                <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Atendidos</p>
                    <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.completed}</h3>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Users className="h-5 w-5" />
                </div>
            </Card>

            <Card className="bg-green-500/5 border-green-500/10 shadow-sm flex items-center justify-between p-4 h-full">
                <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Tiempo Prom.</p>
                    <h3 className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.avgTime}</h3>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 dark:text-green-400">
                    <Activity className="h-5 w-5" />
                </div>
            </Card>
        </div>
    );
}
