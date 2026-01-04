"use client";

import { useRouter } from "next/navigation";
import { Calendar, Loader2, Video, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useFormContext } from "react-hook-form";
import { AppointmentFormValues } from "@/lib/validations/appointment";

interface SummaryViewProps {
    loading: boolean;
}

export function SummaryView({ loading }: SummaryViewProps) {
    const router = useRouter();
    const { watch } = useFormContext<AppointmentFormValues>();
    const formData = watch();

    // Helper function to display payment method
    const getPaymentMethodLabel = (method: string) => {
        const labels: Record<string, string> = {
            efectivo: "Efectivo",
            transferencia: "Transferencia",
            tarjeta: "Tarjeta",
            seguro: "Seguro Médico",
        };
        return labels[method] || method.replace("_", " ");
    };

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold">Resumen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="space-y-1">
                        <p className="text-xs text-gray-500">Fecha</p>
                        <p className="text-sm font-medium">
                            {formData.fecha
                                ? format(new Date(formData.fecha), "EEEE, d 'de' MMMM 'de' yyyy", {
                                    locale: es,
                                })
                                : "-"}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-gray-500">Hora</p>
                        <p className="text-sm font-medium">{formData.hora || "-"}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-gray-500">Duración</p>
                        <p className="text-sm font-medium">{formData.duracion_minutos} minutos</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-gray-500">Tipo</p>
                        <p className="text-sm font-medium capitalize flex items-center gap-2">
                            {formData.tipo_cita === "telemedicina" && <Video className="h-4 w-4 text-green-600" />}
                            {formData.tipo_cita === "presencial" && <MapPin className="h-4 w-4 text-blue-600" />}
                            {formData.tipo_cita.replace("_", " ")}
                        </p>
                    </div>
                    {formData.precio && (
                        <div className="space-y-1">
                            <p className="text-xs text-gray-500">Precio</p>
                            <p className="text-sm font-medium">${formData.precio}</p>
                        </div>
                    )}
                    <div className="space-y-1">
                        <p className="text-xs text-gray-500">Método de Pago</p>
                        <p className="text-sm font-medium capitalize">
                            {getPaymentMethodLabel(formData.metodo_pago)}
                        </p>
                    </div>
                    {formData.enviar_recordatorio && (
                        <div className="space-y-1">
                            <p className="text-xs text-gray-500">Recordatorios</p>
                            <p className="text-sm font-medium text-green-600">✓ Activados</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="space-y-2">
                <Button type="submit" className="w-full h-11" disabled={loading}>
                    {loading ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Creando...
                        </>
                    ) : (
                        <>
                            <Calendar className="h-4 w-4 mr-2" />
                            Crear Cita
                        </>
                    )}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11"
                    onClick={() => router.back()}
                    disabled={loading}
                >
                    Cancelar
                </Button>
            </div>
        </div>
    );
}
