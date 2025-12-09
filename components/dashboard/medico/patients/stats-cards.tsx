import { Card, CardContent } from "@/components/ui/card";
import {
    Users,
    CalendarClock,
    TrendingUp,
    ChevronDown,
    ChevronUp,
    UserPlus
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Pacientes de Hoy */}
            <Card
                className="border-l-4 border-l-green-500 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => onToggleSection("today")}
            >
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium text-gray-600">Pacientes de Hoy</p>
                                {expandedSection === "today" ? (
                                    <ChevronUp className="h-4 w-4 text-gray-400" />
                                ) : (
                                    <ChevronDown className="h-4 w-4 text-gray-400" />
                                )}
                            </div>
                            {loading ? (
                                <Skeleton className="h-9 w-16 mb-2" />
                            ) : (
                                <p className="text-3xl font-bold text-gray-900">{todayCount}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                                {loading ? (
                                    <Skeleton className="h-4 w-32" />
                                ) : (
                                    `${completedToday} completadas • ${waiting} esperando`
                                )}
                            </p>
                        </div>
                        <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
                            <CalendarClock className="h-7 w-7 text-green-600" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Total de Pacientes */}
            <Card
                className="border-l-4 border-l-blue-500 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => onToggleSection("all")}
            >
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium text-gray-600">Total de Pacientes</p>
                                {expandedSection === "all" ? (
                                    <ChevronUp className="h-4 w-4 text-gray-400" />
                                ) : (
                                    <ChevronDown className="h-4 w-4 text-gray-400" />
                                )}
                            </div>
                            {loading ? (
                                <Skeleton className="h-9 w-16 mb-2" />
                            ) : (
                                <p className="text-3xl font-bold text-gray-900">
                                    {totalPatients}
                                </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                                {loading ? (
                                    <Skeleton className="h-4 w-32" />
                                ) : (
                                    "Pacientes activos"
                                )}
                            </p>
                        </div>
                        <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center">
                            <Users className="h-7 w-7 text-blue-600" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Nuevos este Mes */}
            <Card className="border-l-4 border-l-indigo-500">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Nuevos este Mes</p>
                            {loading ? (
                                <Skeleton className="h-9 w-16 mt-2 mb-2" />
                            ) : (
                                <p className="text-3xl font-bold text-gray-900 mt-2">{newPatientsThisMonth}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">Crecimiento mensual</p>
                        </div>
                        <div className="h-14 w-14 rounded-full bg-indigo-100 flex items-center justify-center">
                            <UserPlus className="h-7 w-7 text-indigo-600" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Promedio Tiempo */}
            <Card
                className="border-l-4 border-l-purple-500 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={onShowMetrics}
            >
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium text-gray-600">Tiempo Promedio</p>
                                <ChevronDown className="h-4 w-4 text-gray-400" />
                            </div>
                            {loading ? (
                                <Skeleton className="h-9 w-24 mb-2" />
                            ) : (
                                <p className="text-3xl font-bold text-gray-900">
                                    {avgConsultationTime > 0 ? `${avgConsultationTime}min` : "--"}
                                </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                                Click para ver detalles por motivo
                            </p>
                        </div>
                        <div className="h-14 w-14 rounded-full bg-purple-100 flex items-center justify-center">
                            <TrendingUp className="h-7 w-7 text-purple-600" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
