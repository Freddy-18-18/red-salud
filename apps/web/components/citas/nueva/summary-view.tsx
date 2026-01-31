"use client";

import { useFormContext } from "react-hook-form";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, Clock, User, CreditCard, Video, MapPin, Activity } from "lucide-react";
import { Button } from "@red-salud/ui";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@red-salud/ui";

interface SummaryViewProps {
    loading: boolean;
    patients: any[];
    isMobile?: boolean;
}

export function SummaryView({ loading, patients, isMobile = false }: SummaryViewProps) {
    const { watch } = useFormContext();

    const values = watch();
    const fecha = values.fecha;
    const hora = values.hora;
    const tipoCita = values.tipo_cita;
    const pacienteId = values.paciente_id;
    const newPatientData = values.new_patient_data;

    // Get patient name
    let patientName = "No seleccionado";
    if (pacienteId === "NEW") {
        patientName = newPatientData?.nombre_completo || "Nuevo Paciente";
    } else if (pacienteId) {
        const selected = patients.find(p => p.id === pacienteId);
        patientName = selected?.nombre_completo || "Paciente no encontrado";
    }

    let formattedDate = "Por definir";
    if (fecha) {
        try {
            // Asumiendo formato YYYY-MM-DD
            const [year, month, day] = fecha.split('-').map(Number);
            const dateObj = new Date(year, month - 1, day);
            formattedDate = format(dateObj, "PPPP", { locale: es });
        } catch (e) {
            formattedDate = fecha;
        }
    }

    if (isMobile) {
        return (
            <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total</p>
                    <div className="flex items-baseline gap-2">
                        {values.precio ? (
                            <p className="text-lg font-bold text-green-700">${values.precio}</p>
                        ) : (
                            <p className="text-sm font-medium text-muted-foreground italic">Por definir</p>
                        )}
                        <span className="text-xs text-muted-foreground truncate hidden sm:inline">
                            {format(new Date(fecha || new Date()), "d MMM", { locale: es })} - {hora || "--:--"}
                        </span>
                    </div>
                </div>
                <Button className="w-fit shadow-lg" type="submit" disabled={loading}>
                    {loading ? "..." : "Confirmar"}
                </Button>
            </div>
        );
    }

    return (
        <Card className="h-fit sticky top-6">
            <CardHeader>
                <CardTitle>Resumen de la Cita</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
                <div className="flex items-start space-x-3 group">
                    <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                        <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Paciente</p>
                        <p className="text-sm font-medium text-foreground">{patientName}</p>
                    </div>
                </div>

                <div className="h-px bg-border/50" />

                <div className="flex items-start space-x-3 group">
                    <div className="p-2 bg-violet-50 rounded-lg group-hover:bg-violet-100 transition-colors">
                        <Calendar className="h-4 w-4 text-violet-600" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Fecha</p>
                        <p className="text-sm font-medium text-foreground capitalize">{formattedDate}</p>
                    </div>
                </div>

                <div className="flex items-start space-x-3 group">
                    <div className="p-2 bg-amber-50 rounded-lg group-hover:bg-amber-100 transition-colors">
                        <Clock className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Hora</p>
                        <p className="text-sm font-medium text-foreground">
                            {hora || "--:--"} <span className="text-muted-foreground font-normal">({values.duracion_minutos || 30} min)</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-start space-x-3 group">
                    <div className="p-2 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition-colors">
                        {tipoCita === 'telemedicina' ? (
                            <Video className="h-4 w-4 text-emerald-600" />
                        ) : tipoCita === 'urgencia' ? (
                            <Activity className="h-4 w-4 text-red-600" />
                        ) : (
                            <MapPin className="h-4 w-4 text-emerald-600" />
                        )}
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Modalidad</p>
                        <p className="text-sm font-medium text-foreground capitalize">{tipoCita?.replace('_', ' ') || "Presencial"}</p>
                    </div>
                </div>

                {values.precio && (
                    <>
                        <div className="h-px bg-border/50" />
                        <div className="flex items-start space-x-3 group">
                            <div className="p-2 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
                                <CreditCard className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Costo Total</p>
                                <p className="text-lg font-bold text-green-700">${values.precio}</p>
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
            <CardFooter className="pt-2 pb-6 px-6">
                <Button className="w-full h-11 text-base shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all" type="submit" disabled={loading}>
                    {loading ? "Agendando..." : "Confirmar Cita"}
                </Button>
            </CardFooter>
        </Card>
    );
}
