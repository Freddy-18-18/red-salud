"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarClock, Clock, Play, CheckCircle2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface TodayAppointment {
    id: string;
    paciente_id: string | null;
    offline_patient_id: string | null;
    paciente_nombre: string;
    paciente_avatar: string | null;
    fecha_hora: string;
    duracion_minutos: number;
    motivo: string;
    status: string;
    tipo_cita: string;
    started_at: string | null;
    completed_at: string | null;
    patient_arrived_at: string | null;
}

interface TodayAppointmentsProps {
    appointments: TodayAppointment[];
    loading: boolean;
    actionLoading: string | null;
    onStartConsultation: (appointment: TodayAppointment) => void;
}

export function TodayAppointments({
    appointments,
    loading,
    actionLoading,
    onStartConsultation,
}: TodayAppointmentsProps) {
    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pendiente: "bg-yellow-100 text-yellow-800",
            confirmada: "bg-blue-100 text-blue-800",
            en_espera: "bg-purple-100 text-purple-800",
            en_consulta: "bg-indigo-100 text-indigo-800",
            completada: "bg-green-100 text-green-800",
        };
        return colors[status] || "bg-gray-100 text-gray-800";
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            pendiente: "Pendiente",
            confirmada: "Confirmada",
            en_espera: "En Espera",
            en_consulta: "En Consulta",
            completada: "Completada",
        };
        return labels[status] || status;
    };

    const getActionButton = (appointment: TodayAppointment) => {
        const isLoading = actionLoading === appointment.id;

        if (appointment.status === "completada") {
            return (
                <Badge className="bg-green-100 text-green-800">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Completada
                </Badge>
            );
        }

        if (appointment.status === "en_consulta") {
            return (
                <Button
                    size="sm"
                    onClick={() => onStartConsultation(appointment)}
                    disabled={isLoading}
                    className="bg-indigo-600 hover:bg-indigo-700"
                >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continuar Consulta"}
                </Button>
            );
        }

        return (
            <Button
                size="sm"
                onClick={() => onStartConsultation(appointment)}
                disabled={isLoading}
                className="bg-indigo-600 hover:bg-indigo-700"
            >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                    <>
                        <Play className="h-4 w-4 mr-1" />
                        Empezar Consulta
                    </>
                )}
            </Button>
        );
    };

    const getInitials = (name: string) => {
        return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    };

    return (
        <Card>
            <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Pacientes de Hoy</h3>
                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                ) : appointments.length === 0 ? (
                    <div className="text-center py-8">
                        <CalendarClock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No hay pacientes programados para hoy</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {appointments.map((apt) => (
                            <div
                                key={apt.id}
                                className={`
                  flex items-center justify-between p-4 border rounded-lg 
                  transition-all hover:shadow-md
                  ${apt.status === "en_consulta" ? "bg-indigo-50 border-indigo-200" : ""}
                  ${apt.status === "en_espera" ? "bg-purple-50 border-purple-200" : ""}
                `}
                            >
                                <div className="flex items-center gap-3 flex-1">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={apt.paciente_avatar || undefined} />
                                        <AvatarFallback>{getInitials(apt.paciente_nombre)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-medium">{apt.paciente_nombre}</p>
                                            <Badge className={getStatusColor(apt.status)}>
                                                {getStatusLabel(apt.status)}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-gray-600">
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {format(new Date(apt.fecha_hora), "HH:mm", { locale: es })}
                                            </span>
                                            <span>{apt.motivo}</span>
                                        </div>
                                    </div>
                                </div>
                                <div>{getActionButton(apt)}</div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
