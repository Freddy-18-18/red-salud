"use client";

import { Card } from "@red-salud/design-system";
import { TrendingUp, Star, Users, MessageSquare, Bell, ArrowRight } from "lucide-react";
import { Button } from "@red-salud/design-system";
import { Progress } from "@red-salud/design-system";
import { cn } from "@red-salud/core/utils";

export function PracticeGrowthWidget() {
    const stats = [
        { label: "Nuevas Reseñas", value: "+12", trend: "up", icon: Star, color: "text-amber-500" },
        { label: "Pacientes Recobrados", value: "8", trend: "up", icon: Users, color: "text-primary" },
    ];

    const pendingRecall = [
        { name: "Ana Martínez", lastVisit: "Hace 7 meses", reason: "Limpieza" },
        { name: "Carlos Ruiz", lastVisit: "Hace 8 meses", reason: "Control" },
    ];

    return (
        <Card className="p-6 h-full flex flex-col space-y-4 bg-gradient-to-br from-emerald-500/5 to-primary/5 border-emerald-500/20">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="w-5 h-5" />
                    <h3 className="font-bold text-lg">Crecimiento de Práctica</h3>
                </div>
                <div className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                    Practice Growth
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {stats.map((stat, i) => (
                    <div key={i} className="p-3 rounded-xl bg-card border border-border/50 space-y-1">
                        <div className="flex items-center justify-between">
                            <stat.icon className={cn("w-4 h-4", stat.color)} />
                            <div className="text-[10px] text-emerald-500 font-bold flex items-center gap-0.5">
                                <TrendingUp className="w-2 h-2" /> {stat.trend === 'up' ? '↑' : '↓'}
                            </div>
                        </div>
                        <p className="text-xl font-bold">{stat.value}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">{stat.label}</p>
                    </div>
                ))}
            </div>

            <div className="space-y-3 flex-1">
                <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                        <Bell className="w-3 h-3" /> Patient Recall (Pendientes)
                    </p>
                    <span className="text-[10px] text-primary font-medium hover:underline cursor-pointer">Ver todos</span>
                </div>

                <div className="space-y-2">
                    {pendingRecall.map((patient, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors group">
                            <div className="space-y-0.5">
                                <p className="text-sm font-medium">{patient.name}</p>
                                <p className="text-[10px] text-muted-foreground">{patient.lastVisit} • {patient.reason}</p>
                            </div>
                            <Button size="icon" variant="ghost" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MessageSquare className="w-3.5 h-3.5 text-primary" />
                            </Button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-border/50">
                <div className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground uppercase font-medium">Reputación (Google/RedSalud)</span>
                    <span className="font-bold text-emerald-600">4.9 / 5.0</span>
                </div>
                <Progress value={98} className="h-1 bg-emerald-500/10" />
            </div>

            <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2 h-9 text-xs">
                Lanzar Campaña de SMS <ArrowRight className="w-3.5 h-3.5" />
            </Button>
        </Card>
    );
}
