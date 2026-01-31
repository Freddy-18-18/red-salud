"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@red-salud/ui";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { AppointmentFormValues } from "@red-salud/core/validations";

interface AppointmentConfirmationModalProps {
    open: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    isLoading: boolean;
    formData: AppointmentFormValues;
    selectedPatientName?: string;
}

export function AppointmentConfirmationModal({
    open,
    onConfirm,
    onCancel,
    isLoading,
    formData,
    selectedPatientName,
}: AppointmentConfirmationModalProps) {
    if (!formData || !open) return null;

    return (
        <AlertDialog open={open} onOpenChange={onCancel}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar Cita</AlertDialogTitle>
                    <AlertDialogDescription>
                        Por favor verifica los detalles de la cita antes de confirmar.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="py-4 space-y-3 text-sm">
                    <div className="grid grid-cols-3 gap-2">
                        <span className="font-semibold text-muted-foreground">Paciente:</span>
                        <span className="col-span-2 font-medium">{selectedPatientName || "No seleccionado"}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <span className="font-semibold text-muted-foreground">Fecha:</span>
                        <span className="col-span-2">
                            {formData.fecha ? format(new Date(formData.fecha + "T00:00:00"), "PPP", { locale: es }) : "-"}
                        </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <span className="font-semibold text-muted-foreground">Hora:</span>
                        <span className="col-span-2">
                            {formData.hora || "-"} ({formData.duracion_minutos} min)
                        </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <span className="font-semibold text-muted-foreground">Tipo:</span>
                        <span className="col-span-2 capitalize">
                            {formData.tipo_cita?.replace("_", " ") || "-"}
                        </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <span className="font-semibold text-muted-foreground">Motivo:</span>
                        <span className="col-span-2">
                            {formData.motivo || "Sin especificar"}
                        </span>
                    </div>
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={(e) => {
                        e.preventDefault();
                        onConfirm();
                    }} disabled={isLoading}>
                        {isLoading ? "Confirmando..." : "Confirmar Cita"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
