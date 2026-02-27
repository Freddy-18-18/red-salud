"use client";

import * as React from "react";
import { Loader2, Search, X, Stethoscope } from "lucide-react";
import { cn } from "@red-salud/core/utils";
import { Input } from "@red-salud/design-system";
import { validateCedulaWithCNE } from "@/lib/services/cedula-validation";
import { toast } from "sonner";

export interface PatientOption {
    id: string;
    nombre_completo: string;
    cedula: string | null;
    type: "registered" | "offline";
    email: string | null;
}

interface ConsultationPatientSearchProps {
    patients: PatientOption[];
    onPatientFound: (patient: PatientOption) => void;
    onCnePatientFound: (cedula: string, nombre: string) => void;
    className?: string;
}

export function ConsultationPatientSearch({
    patients,
    onPatientFound,
    onCnePatientFound,
    className,
}: ConsultationPatientSearchProps) {
    const [cedulaInput, setCedulaInput] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [notFound, setNotFound] = React.useState(false);

    // Manejar cambio en input
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, ""); // Solo números
        setCedulaInput(val);
        setNotFound(false);
    };

    // Efecto de búsqueda
    React.useEffect(() => {
        // Si el input está vacío o es muy corto, no buscar
        if (cedulaInput.length < 6) return;

        const search = async () => {
            setLoading(true);
            setNotFound(false);

            try {
                // 1. Buscar localmente
                const localPatient = patients.find(p => p.cedula === cedulaInput);

                if (localPatient) {
                    onPatientFound(localPatient);
                    setLoading(false);
                    return;
                }

                // 2. Buscar en CNE (Remoto)
                const result = await validateCedulaWithCNE(cedulaInput);

                if (result.found && result.nombre_completo) {
                    toast.success("Paciente encontrado en CNE");
                    onCnePatientFound(cedulaInput, result.nombre_completo);
                } else {
                    setNotFound(true);
                }

            } catch (error) {
                console.error("Error buscando paciente:", error);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(search, 800);
        return () => clearTimeout(timer);

    }, [cedulaInput, patients, onPatientFound, onCnePatientFound]);


    return (
        <div className={cn("space-y-3", className)}>
            <div className="relative">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Ingrese cédula para iniciar consulta..."
                        value={cedulaInput}
                        onChange={handleInputChange}
                        className="pl-10 h-14 text-lg shadow-sm border-2 focus-visible:ring-offset-0 focus-visible:border-primary"
                        maxLength={9}
                        autoFocus
                    />
                    {loading && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-background p-1 rounded-full">
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        </div>
                    )}
                </div>

                {notFound && !loading && cedulaInput.length >= 6 && (
                    <div className="mt-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-200 dark:border-red-900 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                        <X className="h-4 w-4" />
                        No se encontró ningún paciente con la cédula V-{cedulaInput}
                    </div>
                )}
                <div className="mt-2 px-1 text-xs text-muted-foreground flex items-center gap-1.5">
                    <Stethoscope className="h-3.5 w-3.5" />
                    <span>Ingrese cédula para acceder directamente a la consulta</span>
                </div>
            </div>
        </div>
    );
}
