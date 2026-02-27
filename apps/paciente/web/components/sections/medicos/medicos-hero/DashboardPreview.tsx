"use client";

import { motion } from "framer-motion";
import { Zap, Shield } from "lucide-react";
import { dashboardStats, upcomingAppointments } from "./medicos-hero-data";

export function DashboardPreview() {
    return (
        <div className="relative">
            {/* Glow Effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-3xl blur-2xl opacity-60" />

            {/* Main Dashboard Preview */}
            <div className="relative bg-card/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl overflow-hidden">
                {/* Browser Header */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-muted/30">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-400" />
                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                        <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <div className="flex-1 flex justify-center">
                        <div className="px-4 py-1 rounded-md bg-muted/50 text-xs text-muted-foreground">
                            dashboard.red-salud.com
                        </div>
                    </div>
                </div>

                {/* Dashboard Content Preview */}
                <div className="p-6 space-y-4">
                    {/* Top Stats */}
                    <div className="grid grid-cols-3 gap-3">
                        {dashboardStats.map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 + i * 0.1 }}
                                className="p-3 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/30"
                            >
                                <div className={`text-lg font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                                    {stat.value}
                                </div>
                                <div className="text-xs text-muted-foreground">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Calendar Preview */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="p-4 rounded-xl bg-muted/30 border border-border/30"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium">Próximas Citas</span>
                            <span className="text-xs text-muted-foreground">Hoy</span>
                        </div>
                        <div className="space-y-2">
                            {upcomingAppointments.map((apt, i) => (
                                <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-background/50">
                                    <div className="text-xs font-mono text-muted-foreground w-12">{apt.time}</div>
                                    <div className="flex-1">
                                        <div className="text-sm font-medium">{apt.name}</div>
                                        <div className="text-xs text-muted-foreground">{apt.type}</div>
                                    </div>
                                    <div className={`w-2 h-2 rounded-full ${i === 2 ? 'bg-secondary' : 'bg-primary'}`} />
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Floating Elements */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1, type: "spring" }}
                className="absolute -right-4 top-1/4 p-3 rounded-xl bg-card/90 backdrop-blur-lg border border-border/50 shadow-xl"
            >
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
                        <Zap className="h-4 w-4 text-secondary" />
                    </div>
                    <div>
                        <div className="text-xs font-medium">Receta enviada</div>
                        <div className="text-[10px] text-muted-foreground">Hace 2 min</div>
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2, type: "spring" }}
                className="absolute -left-4 bottom-1/4 p-3 rounded-xl bg-card/90 backdrop-blur-lg border border-border/50 shadow-xl"
            >
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <Shield className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <div className="text-xs font-medium">SACS Verificado</div>
                        <div className="text-[10px] text-muted-foreground">Automático</div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
