"use client";

import * as React from "react";
import { Loader2, Search, X, CheckCircle2, User } from "lucide-react";
import { cn } from "@red-salud/core/utils";
import { Input } from "@red-salud/design-system";
import { Button } from "@red-salud/design-system";
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
    onClear?: () => void;
    className?: string;
}

export function RecipePatientSearch({
    patients,
    onPatientFound,
    onCnePatientFound,
    onClear,
    className,
}: RecipePatientSearchProps) {
    const [cedulaInput, setCedulaInput] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [notFound, setNotFound] = React.useState(false);
    // foundName: cuando se encuentra un paciente, el input muestra el nombre
    const [foundName, setFoundName] = React.useState<string | null>(null);
    const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    const isFound = foundName !== null;

    // Limpiar búsqueda completa
    const handleClear = () => {
        setCedulaInput("");
        setFoundName(null);
        setNotFound(false);
        setLoading(false);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        onClear?.();
    };

    // Manejar cambio en input (solo cuando no hay resultado todavía)
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isFound) return; // Si ya se encontró, el input es de solo lectura
        const val = e.target.value.replace(/\D/g, ""); // Solo números
        setCedulaInput(val);
        setNotFound(false);
        setLoading(false);

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };

    const performSearch = React.useCallback(async () => {
        if (cedulaInput.length < 5) return;

        setLoading(true);
        setNotFound(false);

        try {
            // 1. Buscar localmente
            const localPatient = patients.find(p => {
                if (!p.cedula) return false;
                const pCedula = p.cedula.toString().replace(/\D/g, "");
                return pCedula === cedulaInput;
            });

            if (localPatient) {
                setFoundName(localPatient.nombre_completo);
                onPatientFound(localPatient);
                setLoading(false);
                return;
            }

            // 2. Buscar en CNE (Remoto)
            const result = await validateCedulaWithCNE(cedulaInput);

            if (result.found && result.nombre_completo) {
                toast.success("Paciente encontrado en CNE");
                setFoundName(result.nombre_completo);
                onCnePatientFound(cedulaInput, result.nombre_completo);
            } else {
                setNotFound(true);
            }

        } catch (error) {
            console.error("Error buscando paciente:", error);
        } finally {
            setLoading(false);
        }
    }, [cedulaInput, patients, onPatientFound, onCnePatientFound]);

    // Búsqueda automática con debounce
    React.useEffect(() => {
        if (isFound || cedulaInput.length < 6) return;

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(performSearch, 800);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [cedulaInput, isFound, performSearch]);

    return (
        <div className={cn("space-y-3", className)}>
            <div className="relative">
                {/* Ícono izquierdo: lupa en búsqueda, usuario cuando encontrado */}
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    {isFound
                        ? <User className="h-5 w-5 text-green-600" />
                        : <Search className="h-5 w-5 text-muted-foreground" />
                    }
                </div>

                <Input
                    placeholder="Ingrese cédula del paciente..."
                    value={isFound ? foundName : cedulaInput}
                    onChange={handleInputChange}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !isFound) {
                            e.preventDefault();
                            if (timeoutRef.current) clearTimeout(timeoutRef.current);
                            performSearch();
                        }
                    }}
                    readOnly={isFound}
                    className={cn(
                        "pl-10 pr-10 h-14 text-lg shadow-sm border-2 focus-visible:ring-offset-0",
                        isFound
                            ? "border-green-400 bg-green-50 dark:bg-green-950/20 text-green-900 dark:text-green-100 cursor-default select-none focus-visible:border-green-400"
                            : "focus-visible:border-primary"
                    )}
                    maxLength={isFound ? undefined : 9}
                    autoFocus={!isFound}
                />

                {/* Indicadores lado derecho */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {loading && (
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    )}
                    {isFound && !loading && (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                    )}
                    {(cedulaInput.length > 0 || isFound) && !loading && (
                        <Button
                            variant="ghost"
                            size="icon"
                            type="button"
                            className="h-7 w-7 hover:bg-transparent p-0"
                            onClick={handleClear}
                            title="Limpiar"
                        >
                            <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Subtítulo cuando está en modo búsqueda */}
            {!isFound && !loading && cedulaInput.length > 0 && !notFound && (
                <p className="text-xs text-muted-foreground pl-1">
                    Buscando V-{cedulaInput}...
                </p>
            )}

            {/* Subtítulo cuando encontrado: muestra la cédula como referencia */}
            {isFound && (
                <p className="text-xs text-green-700 dark:text-green-400 pl-1 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    V-{cedulaInput} · Verificado
                </p>
            )}

            {notFound && !loading && (
                <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-200 dark:border-red-900 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                    <X className="h-4 w-4 flex-shrink-0" />
                    No se encontró ningún paciente con la cédula V-{cedulaInput}
                </div>
            )}
        </div>
    );
}
