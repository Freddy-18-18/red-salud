"use client";

import { useState, useEffect, useRef } from "react";
import {
    Input,
    Button,
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
    Label,
    Textarea,
} from "@red-salud/design-system";
import { cn } from "@red-salud/core/utils";
import { Trash2, Pill, Loader2, Check, ChevronDown } from "lucide-react";
import { useMedicationSearch, useMedicationDetails } from "@/hooks/use-medication-search";
import { FRECUENCIAS_ESTANDAR, VIAS_ADMINISTRACION } from "@/lib/data/medications/types";

export interface MedicationItemData {
    id?: string;
    medicamentoId?: string;
    medicamento: string;
    nombreComercial?: string;
    presentacion: string;
    dosis: string;
    frecuencia: string;
    duracion: string;
    viaAdministracion: string;
    instrucciones: string;
}

interface MedicationInputProps {
    index: number;
    data: MedicationItemData;
    onChange: (index: number, field: keyof MedicationItemData, value: string) => void;
    onRemove: (index: number) => void;
    canRemove: boolean;
}

export function MedicationInput({
    index,
    data,
    onChange,
    onRemove,
    canRemove,
}: MedicationInputProps) {
    const [isOpen, setIsOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const {
        query,
        setQuery,
        results,
        isSearching,
        selectedMedication,
        selectMedication,
        clearSelection,
    } = useMedicationSearch({ maxResults: 10 });

    const { dosisComunes, presentaciones, frecuenciasComunes } =
        useMedicationDetails(selectedMedication?.id ?? null);

    // Handle medication selection
    const handleSelectMedication = (med: typeof results[0]) => {
        selectMedication(med);
        onChange(index, "medicamento", med.nombre);
        onChange(index, "medicamentoId", med.id);
        if (med.nombreComercial[0]) {
            onChange(index, "nombreComercial", med.nombreComercial[0]);
        }
        setIsOpen(false);
    };

    // Auto-fill presentation, dosage, and frequency when medication is selected
    useEffect(() => {
        if (selectedMedication && presentaciones.length > 0 && !data.presentacion) {
            onChange(index, "presentacion", presentaciones[0] || "");
        }
    }, [selectedMedication, presentaciones, data.presentacion, index, onChange]);

    useEffect(() => {
        if (selectedMedication && dosisComunes.length > 0 && !data.dosis) {
            onChange(index, "dosis", dosisComunes[0] || "");
        }
    }, [selectedMedication, dosisComunes, data.dosis, index, onChange]);

    useEffect(() => {
        if (selectedMedication && frecuenciasComunes.length > 0 && !data.frecuencia) {
            onChange(index, "frecuencia", frecuenciasComunes[0] || "");
        }
    }, [selectedMedication, frecuenciasComunes, data.frecuencia, index, onChange]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900 relative border-l-4 border-l-emerald-500">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Pill className="h-4 w-4 text-emerald-600" />
                    Medicamento {index + 1}
                    {selectedMedication && (
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                            ✓ Verificado
                        </span>
                    )}
                </span>
                {canRemove && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemove(index)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Medication Name - Searchable */}
                <div className="space-y-2 relative">
                    <Label>
                        Medicamento <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                        <Input
                            ref={inputRef}
                            placeholder="Escriba para buscar medicamento..."
                            value={query || data.medicamento}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                onChange(index, "medicamento", e.target.value);
                                setIsOpen(true);
                                if (!e.target.value) {
                                    clearSelection();
                                }
                            }}
                            onFocus={() => query.length >= 2 && setIsOpen(true)}
                            className={cn(
                                "pr-10",
                                selectedMedication && "border-emerald-500 bg-emerald-50/50"
                            )}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {isSearching ? (
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            ) : selectedMedication ? (
                                <Check className="h-4 w-4 text-emerald-600" />
                            ) : (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            )}
                        </div>
                    </div>

                    {/* Dropdown Results */}
                    {isOpen && results.length > 0 && (
                        <div
                            ref={dropdownRef}
                            className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border rounded-lg shadow-lg max-h-[300px] overflow-auto"
                        >
                            {results.map((med) => (
                                <button
                                    key={med.id}
                                    type="button"
                                    onClick={() => handleSelectMedication(med)}
                                    className={cn(
                                        "w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-start gap-2",
                                        selectedMedication?.id === med.id && "bg-emerald-50 dark:bg-emerald-900/20"
                                    )}
                                >
                                    <Check
                                        className={cn(
                                            "h-4 w-4 mt-0.5 shrink-0",
                                            selectedMedication?.id === med.id
                                                ? "opacity-100 text-emerald-600"
                                                : "opacity-0"
                                        )}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">{med.nombre}</p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {med.nombreComercial.slice(0, 3).join(", ")}
                                        </p>
                                    </div>
                                    <span className="text-xs text-muted-foreground shrink-0">
                                        {med.categoria}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}

                    {isOpen && query.length >= 2 && results.length === 0 && !isSearching && (
                        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border rounded-lg shadow-lg p-3 text-sm text-muted-foreground text-center">
                            No se encontraron medicamentos
                        </div>
                    )}
                </div>

                {/* Presentation */}
                <div className="space-y-2">
                    <Label>
                        Presentación <span className="text-red-500">*</span>
                    </Label>
                    <Select
                        value={data.presentacion}
                        onValueChange={(value) => onChange(index, "presentacion", value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                            {(presentaciones.length > 0
                                ? presentaciones
                                : ["Tabletas", "Cápsulas", "Jarabe", "Suspensión", "Gotas", "Ampolla", "Crema", "Gel"]
                            ).map((p) => (
                                <SelectItem key={p} value={p}>
                                    {p}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Dosage */}
                <div className="space-y-2">
                    <Label>
                        Dosis <span className="text-red-500">*</span>
                    </Label>
                    <Select
                        value={data.dosis}
                        onValueChange={(value) => onChange(index, "dosis", value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                            {(dosisComunes.length > 0
                                ? dosisComunes
                                : ["5ml", "10ml", "1 tableta", "2 tabletas", "1 cápsula", "2 cápsulas", "1 ampolla"]
                            ).map((d) => (
                                <SelectItem key={d} value={d}>
                                    {d}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Frequency */}
                <div className="space-y-2">
                    <Label>
                        Frecuencia <span className="text-red-500">*</span>
                    </Label>
                    <Select
                        value={data.frecuencia}
                        onValueChange={(value) => onChange(index, "frecuencia", value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                            {FRECUENCIAS_ESTANDAR.map((f) => (
                                <SelectItem key={f} value={f}>
                                    {f}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Duration */}
                <div className="space-y-2">
                    <Label>
                        Duración <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        placeholder="Ej: 7 días"
                        value={data.duracion}
                        onChange={(e) => onChange(index, "duracion", e.target.value)}
                    />
                </div>

                {/* Administration Route */}
                <div className="space-y-2">
                    <Label>Vía de Administración</Label>
                    <Select
                        value={data.viaAdministracion || "Oral"}
                        onValueChange={(value) => onChange(index, "viaAdministracion", value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Oral" />
                        </SelectTrigger>
                        <SelectContent>
                            {VIAS_ADMINISTRACION.map((v) => (
                                <SelectItem key={v} value={v}>
                                    {v}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Additional Instructions */}
                <div className="col-span-1 md:col-span-2 space-y-2">
                    <Label>Indicaciones Adicionales</Label>
                    <Textarea
                        placeholder="Tomar con alimentos, evitar el sol, no consumir alcohol..."
                        value={data.instrucciones}
                        onChange={(e) => onChange(index, "instrucciones", e.target.value)}
                        rows={2}
                        className="resize-none"
                    />
                </div>
            </div>
        </div>
    );
}
