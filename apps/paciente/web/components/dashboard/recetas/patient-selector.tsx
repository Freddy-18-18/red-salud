"use client";

import { useState, useMemo } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Button,
    Command,
    CommandInput,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    Popover,
    PopoverTrigger,
    PopoverContent,
    Avatar,
    AvatarFallback,
    Label,
} from "@red-salud/design-system";
import { Search, Check, Loader2, User } from "lucide-react";
import { cn } from "@red-salud/core/utils";

interface Patient {
    id: string;
    nombre_completo: string;
    cedula?: string;
    email?: string;
    type?: string;
}

interface PatientSelectorProps {
    patients: Patient[];
    loadingPatients?: boolean;
    selectedPatientId?: string;
    onPatientSelect: (patientId: string) => void;
}

export function PatientSelector({
    patients,
    loadingPatients = false,
    selectedPatientId,
    onPatientSelect,
}: PatientSelectorProps) {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const selectedPatient = useMemo(
        () => patients.find((p) => p.id === selectedPatientId),
        [patients, selectedPatientId]
    );

    const filteredPatients = useMemo(() => {
        if (!searchQuery) return patients;
        const query = searchQuery.toLowerCase();
        return patients.filter(
            (p) =>
                p.nombre_completo?.toLowerCase().includes(query) ||
                p.cedula?.toLowerCase().includes(query) ||
                p.email?.toLowerCase().includes(query)
        );
    }, [patients, searchQuery]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-5 w-5" />
                    Seleccionar Paciente
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="patient-select">Paciente</Label>
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                id="patient-select"
                                variant="outline"
                                role="combobox"
                                aria-expanded={open}
                                className="w-full justify-between"
                                disabled={loadingPatients}
                            >
                                {loadingPatients ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Cargando pacientes...
                                    </>
                                ) : selectedPatient ? (
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6">
                                            <AvatarFallback className="text-xs bg-emerald-100 text-emerald-700">
                                                {selectedPatient.nombre_completo?.charAt(0)?.toUpperCase() || "P"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="truncate">{selectedPatient.nombre_completo}</span>
                                        {selectedPatient.cedula && (
                                            <span className="text-xs text-muted-foreground">
                                                ({selectedPatient.cedula})
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        <Search className="mr-2 h-4 w-4" />
                                        Buscar paciente...
                                    </>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0" align="start">
                            <Command>
                                <CommandInput
                                    placeholder="Buscar por nombre, cédula o email..."
                                    value={searchQuery}
                                    onValueChange={setSearchQuery}
                                />
                                <CommandEmpty>No se encontraron pacientes.</CommandEmpty>
                                <CommandGroup className="max-h-64 overflow-auto">
                                    {filteredPatients.map((patient) => (
                                        <CommandItem
                                            key={patient.id}
                                            value={patient.id}
                                            onSelect={() => {
                                                onPatientSelect(patient.id);
                                                setOpen(false);
                                                setSearchQuery("");
                                            }}
                                            className="flex items-center gap-2 cursor-pointer"
                                        >
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback className="bg-emerald-100 text-emerald-700">
                                                    {patient.nombre_completo?.charAt(0)?.toUpperCase() || "P"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium truncate">
                                                    {patient.nombre_completo}
                                                </div>
                                                <div className="text-xs text-muted-foreground truncate">
                                                    {patient.cedula && `CI: ${patient.cedula}`}
                                                    {patient.email && ` • ${patient.email}`}
                                                </div>
                                            </div>
                                            <Check
                                                className={cn(
                                                    "h-4 w-4 flex-shrink-0",
                                                    selectedPatientId === patient.id
                                                        ? "opacity-100"
                                                        : "opacity-0"
                                                )}
                                            />
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </Command>
                        </PopoverContent>
                    </Popover>
                    {selectedPatient && (
                        <p className="text-xs text-muted-foreground">
                            Paciente seleccionado: <strong>{selectedPatient.nombre_completo}</strong>
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
