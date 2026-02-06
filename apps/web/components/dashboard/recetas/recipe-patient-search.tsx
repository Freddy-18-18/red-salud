"use client";

import * as React from "react";
import { Loader2, Search, User, Check, X } from "lucide-react";
import { cn } from "@red-salud/core/utils";
import { Input } from "@red-salud/ui";
import { Button } from "@red-salud/ui";
import { validateCedulaWithCNE } from "@/lib/services/cedula-validation";
import { toast } from "sonner";

export interface PatientOption {
    id: string;
    nombre_completo: string;
    cedula: string | null;
    type: "registered" | "offline";
    email: string | null;
    fecha_nacimiento?: string;
    genero?: string;
    peso?: number;
    edad?: number; // Optional pre-calculated age
}

interface RecipePatientSearchProps {
    patients: PatientOption[];
    onPatientFound: (patient: PatientOption) => void;
    onCnePatientFound: (cedula: string, nombre: string) => void;
    className?: string;
}

export function RecipePatientSearch({
    patients,
    onPatientFound,
    onCnePatientFound,
    className,
}: RecipePatientSearchProps) {
    const [cedulaInput, setCedulaInput] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [notFound, setNotFound] = React.useState(false);
    const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    // Limpiar búsqueda
    const handleClear = () => {
        setCedulaInput("");
        setNotFound(false);
        setLoading(false);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };

    // Manejar cambio en input
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, ""); // Solo números
        setCedulaInput(val);
        setNotFound(false);
        setLoading(false); // Reset loading on change

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };

    const performSearch = React.useCallback(async () => {
        if (cedulaInput.length < 5) return; // Permitir buscar con menos dígitos si es necesario, pero 5 es razonable

        setLoading(true);
        setNotFound(false);

        try {
            // 1. Buscar localmente (Normalizando la cédula para comparar solo números)
            const localPatient = patients.find(p => {
                if (!p.cedula) return false;
                const pCedula = p.cedula.toString().replace(/\D/g, "");
                return pCedula === cedulaInput;
            });

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
            // toast.error("Error al buscar paciente"); // Opcional, puede ser molesto
        } finally {
            setLoading(false);
        }
    }, [cedulaInput, patients, onPatientFound, onCnePatientFound]);

    // Efecto de búsqueda automática (Debounce)
    React.useEffect(() => {
        if (cedulaInput.length < 6) return;

        // Limpiar timeout anterior
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        // Nuevo timeout
        timeoutRef.current = setTimeout(performSearch, 1000); // 1s delay para no saturar

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };

    }, [cedulaInput, performSearch]);

    const handleManualSearch = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        performSearch();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleManualSearch();
        }
    };

    return (
        <div className={cn("space-y-3", className)}>
            <div className="relative flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Ingrese cédula del paciente..."
                        value={cedulaInput}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        className="pl-10 h-14 text-lg shadow-sm border-2 focus-visible:ring-offset-0 focus-visible:border-primary"
                        maxLength={9}
                        autoFocus
                    />
                    {loading && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-background p-1 rounded-full">
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        </div>
                    )}
                    {!loading && cedulaInput.length > 0 && !notFound && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 hover:bg-transparent"
                            onClick={handleClear}
                        >
                            <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                        </Button>
                    )}
                </div>
                <Button
                    size="lg"
                    className="h-14 px-6"
                    onClick={handleManualSearch}
                    disabled={loading || cedulaInput.length < 5}
                >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Buscar"}
                </Button>
            </div>

            {notFound && !loading && (
                <div className="mt-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-200 dark:border-red-900 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                    <X className="h-4 w-4" />
                    No se encontró ningún paciente con la cédula V-{cedulaInput}
                </div>
            )}

        </div>
    );
}
