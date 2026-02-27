"use client";

import { Card, CardContent } from "@red-salud/design-system";
import {
    Users,
    CalendarClock,
    TrendingUp,
    ChevronDown,
    ChevronUp,
    UserPlus,
    Activity
} from "lucide-react";
import { Skeleton } from "@red-salud/design-system";

interface StatsCardsProps {
    todayCount: number;
    completedToday: number;
    waiting: number;
    totalPatients: number;
    registeredCount: number;
    offlineCount: number;
    newPatientsThisMonth: number;
    avgConsultationTime: number;
    expandedSection: string | null;
    onToggleSection: (section: string) => void;
    onShowMetrics: () => void;
    loading?: boolean;
}

export function StatsCards({
    todayCount,
    completedToday,
    waiting,
    totalPatients,
    registeredCount,
    offlineCount,
    newPatientsThisMonth,
    avgConsultationTime,
    expandedSection,
    onToggleSection,
    onShowMetrics,
    loading = false,
}: StatsCardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Pacientes de Hoy */}
            <Card
                className="group relative overflow-hidden bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20 border-emerald-200/50 dark:border-emerald-800/30 cursor-pointer hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-0.5"
                onClick={() => onToggleSection("today")}
            >
                {/* Decorative gradient */}
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-400 to-emerald-600" />
                <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-emerald-400/10 blur-2xl group-hover:bg-emerald-400/20 transition-colors" />

                <CardContent className="p-5 relative">
                    <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                                    Pacientes de Hoy
                                </span>
                                <div className="text-emerald-500 transition-transform group-hover:scale-110">
                                    {expandedSection === "today" ? (
                                        <ChevronUp className="h-4 w-4" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4" />
                                    )}
                                </div>
                            </div>

                            {loading ? (
                                <Skeleton className="h-10 w-20" />
                            ) : (
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
                                        {todayCount}
                                    </span>
                                    {todayCount > 0 && (
                                        <span className="text-xs font-medium text-emerald-600/70 dark:text-emerald-400/70">
                                            citas
                                        </span>
                                    )}
                                </div>
                            )}

                            <div className="flex items-center gap-3">
                                {loading ? (
                                    <Skeleton className="h-4 w-36" />
                                ) : (
                                    <>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
                                            <Activity className="h-3 w-3 mr-1" />
                                            {completedToday} completadas
                                        </span>
                                        {waiting > 0 && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
                                                {waiting} esperando
                                            </span>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                            <CalendarClock className="h-6 w-6 text-white" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Total de Pacientes */}
            <Card
                className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200/50 dark:border-blue-800/30 cursor-pointer hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-0.5"
                onClick={() => onToggleSection("all")}
            >
                {/* Decorative gradient */}
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-blue-600" />
                <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-blue-400/10 blur-2xl group-hover:bg-blue-400/20 transition-colors" />

                <CardContent className="p-5 relative">
                    <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                                    Total de Pacientes
                                </span>
                                <div className="text-blue-500 transition-transform group-hover:scale-110">
                                    {expandedSection === "all" ? (
                                        <ChevronUp className="h-4 w-4" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4" />
                                    )}
                                </div>
                            </div>

                            {loading ? (
                                <Skeleton className="h-10 w-20" />
                            ) : (
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                                        {totalPatients}
                                    </span>
                                    <span className="text-xs font-medium text-blue-600/70 dark:text-blue-400/70">
                                        activos
                                    </span>
                                </div>
                            )}

                            <div className="flex items-center gap-3">
                                {loading ? (
                                    <Skeleton className="h-4 w-32" />
                                ) : (
                                    <>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                                            {registeredCount} registrados
                                        </span>
                                        {offlineCount > 0 && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                                {offlineCount} offline
                                            </span>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                            <Users className="h-6 w-6 text-white" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Nuevos este Mes */}
            <Card className="group relative overflow-hidden bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-950/30 dark:to-indigo-900/20 border-indigo-200/50 dark:border-indigo-800/30 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-0.5">
                {/* Decorative gradient */}
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-400 to-indigo-600" />
                <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-indigo-400/10 blur-2xl group-hover:bg-indigo-400/20 transition-colors" />

                <CardContent className="p-5 relative">
                    <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                            <span className="text-sm font-medium text-indigo-700 dark:text-indigo-400">
                                Nuevos este Mes
                            </span>

                            {loading ? (
                                <Skeleton className="h-10 w-16" />
                            ) : (
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent">
                                        {newPatientsThisMonth}
                                    </span>
                                    {newPatientsThisMonth > 0 && (
                                        <div className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                                            <TrendingUp className="h-3 w-3" />
                                            crecimiento
                                        </div>
                                    )}
                                </div>
                            )}

                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                                <UserPlus className="h-3 w-3 mr-1" />
                                Este período
                            </span>
                        </div>

                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                            <UserPlus className="h-6 w-6 text-white" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Promedio Tiempo */}
            <Card
                className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 border-purple-200/50 dark:border-purple-800/30 cursor-pointer hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-0.5"
                onClick={onShowMetrics}
            >
                {/* Decorative gradient */}
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-400 to-purple-600" />
                <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-purple-400/10 blur-2xl group-hover:bg-purple-400/20 transition-colors" />

                <CardContent className="p-5 relative">
                    <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-purple-700 dark:text-purple-400">
                                    Tiempo Promedio
                                </span>
                                <div className="text-purple-500 transition-transform group-hover:scale-110">
                                    <ChevronDown className="h-4 w-4" />
                                </div>
                            </div>

                            {loading ? (
                                <Skeleton className="h-10 w-24" />
                            ) : (
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
                                        {avgConsultationTime > 0 ? avgConsultationTime : "--"}
                                    </span>
                                    {avgConsultationTime > 0 && (
                                        <span className="text-sm font-medium text-purple-600/70 dark:text-purple-400/70">
                                            min
                                        </span>
                                    )}
                                </div>
                            )}

                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                Ver detalles
                            </span>
                        </div>

                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
                            <TrendingUp className="h-6 w-6 text-white" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
