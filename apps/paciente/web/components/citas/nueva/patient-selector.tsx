"use client";

import { useFormContext } from "react-hook-form";
import { Search, Loader2, CheckCircle, User, AlertCircle } from "lucide-react";
import { Button, Input, Card, CardContent, CardHeader, CardTitle, CardDescription, Alert, AlertDescription, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@red-salud/design-system";
import { useState } from "react";

interface Patient {
    id: string;
    nombre_completo: string;
    email: string | null;
    cedula: string | null;
    type: "registered" | "offline";
}

interface PatientSelectorProps {
    patients: Patient[];
    loadingPatients?: boolean;
    selectedPatientId?: string;
    onPatientSelect?: (id: string) => void;
}

export function PatientSelector({ patients, selectedPatientId, onPatientSelect }: PatientSelectorProps) {
    const formContext = useFormContext();
    const pacienteId = selectedPatientId ?? (formContext ? formContext.watch("paciente_id") : "");
    const setValue = (name: string, value: unknown) => {
        if (formContext) formContext.setValue(name, value);
        if (name === "paciente_id" && onPatientSelect) onPatientSelect(String(value));
    };
    const [cedulaInput, setCedulaInput] = useState("");
    const [nacionalidad, setNacionalidad] = useState("V");
    const [loading, setLoading] = useState(false);
    const [searchResult, setSearchResult] = useState<{ nombre_completo: string; cedula: string; nacionalidad: string; isLocal?: boolean } | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Initialize/Update searchResult if pacienteId matches a known patient
    const selectedPatient = patients.find(p => p.id === pacienteId);

    // If we have a selected patient from the list but no search result yet, we should probably show it.
    // However, our UI relies on searchResult structure. Let's adapt.
    const displayPatient = searchResult || (selectedPatient ? {
        nombre_completo: selectedPatient.nombre_completo,
        cedula: selectedPatient.cedula || "", // Display might be empty if no cedula, but requirement says "purement avec cedula"
        nacionalidad: "", // We might not have this in our local DB easily, but we can display what we have
        isLocal: true
    } : null);

    const handleSearch = async () => {
        if (!cedulaInput) return;
        setLoading(true);
        setError(null);
        setSearchResult(null);
        setValue("paciente_id", ""); // Reset
        setValue("new_patient_data", undefined); // Reset

        try {
            const res = await fetch(`/api/cne/validate?cedula=${cedulaInput}&nacionalidad=${nacionalidad}`);
            const data = await res.json();

            if (!res.ok) {
                if (res.status === 404) throw new Error("Cédula no encontrada");
                throw new Error(data.error || "Error al buscar cédula");
            }

            setSearchResult(data);

            // Check if patient exists in our list
            const existingPatient = patients.find(p => p.cedula === data.cedula);

            if (existingPatient) {
                setValue("paciente_id", existingPatient.id);
            } else {
                // New patient
                setValue("paciente_id", "NEW");
                setValue("new_patient_data", {
                    nombre_completo: data.nombre_completo,
                    cedula: data.cedula,
                    email: null
                });
            }

        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Error desconocido");
        } finally {
            setLoading(false);
        }
    };

    const clearSelection = () => {
        setValue("paciente_id", "");
        setValue("new_patient_data", undefined);
        setSearchResult(null);
        setCedulaInput("");
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Selección de Paciente</CardTitle>
                <CardDescription>Ingrese la cédula para buscar al paciente.</CardDescription>
            </CardHeader>
            <CardContent>
                {!displayPatient ? (
                    <div className="flex flex-col sm:flex-row gap-2 mb-4">
                        <div className="flex gap-2 w-full sm:w-auto">
                            <Select value={nacionalidad} onValueChange={setNacionalidad}>
                                <SelectTrigger className="w-[70px]">
                                    <SelectValue placeholder="V" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="V">V</SelectItem>
                                    <SelectItem value="E">E</SelectItem>
                                </SelectContent>
                            </Select>
                            <Input
                                placeholder="Número de cédula"
                                value={cedulaInput}
                                onChange={(e) => setCedulaInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
                                className="flex-1 sm:w-auto"
                            />
                        </div>
                        <Button onClick={handleSearch} disabled={loading} type="button" className="w-full sm:w-auto">
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2 sm:mr-0" />
                                    <span className="sm:hidden">Buscando...</span>
                                </>
                            ) : (
                                <>
                                    <Search className="h-4 w-4 mr-2 sm:mr-0" />
                                    <span className="sm:hidden">Buscar</span>
                                </>
                            )}
                        </Button>
                    </div>
                ) : null}

                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {displayPatient && (
                    <div className="bg-muted/50 p-4 rounded-lg border border-border relative group">
                        {/* Allow clearing selection */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6 opacity-70 hover:opacity-100"
                            onClick={clearSelection}
                            title="Cambiar paciente"
                        >
                            <span className="sr-only">Cambiar</span>
                            <Search className="h-3 w-3" />
                        </Button>

                        <div className="flex items-start justify-between pr-8">
                            <div>
                                <h4 className="font-semibold text-lg text-foreground">{displayPatient.nombre_completo}</h4>
                                <div className="text-sm text-muted-foreground mt-1 flex flex-col gap-1">
                                    <span>C.I: {displayPatient.cedula ? `${displayPatient.nacionalidad || ''}-${displayPatient.cedula}` : 'Sin Cédula'}</span>
                                </div>
                            </div>

                            {(displayPatient.isLocal || patients.find(p => p.cedula === displayPatient.cedula)) ? (
                                <div className="flex items-center gap-2 text-green-700 bg-green-100 px-3 py-1.5 rounded-full text-xs font-medium border border-green-200">
                                    <CheckCircle className="h-3.5 w-3.5" />
                                    <span>Registrado</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-blue-700 bg-blue-100 px-3 py-1.5 rounded-full text-xs font-medium border border-blue-200">
                                    <User className="h-3.5 w-3.5" />
                                    <span>Nuevo (Se registrará)</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
