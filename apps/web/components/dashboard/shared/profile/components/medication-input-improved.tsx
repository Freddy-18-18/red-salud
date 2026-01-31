"use client";

import { useState, useEffect, useRef } from "react";
import { X, Pill } from "lucide-react";
import { Input } from "@red-salud/ui";
import { Label } from "@red-salud/ui";
import {
  MEDICAMENTOS_COMUNES,
  FRECUENCIAS_COMUNES,
  buscarMedicamento,
  obtenerDosisComunes,
  obtenerFrecuenciasComunes,
} from "../constants/medication-database";

export interface Medication {
  nombre: string;
  dosis: string;
  frecuencia: string;
}

interface MedicationInputImprovedProps {
  value: Medication[];
  onChange: (value: Medication[]) => void;
  disabled?: boolean;
}

export function MedicationInputImproved({
  value,
  onChange,
  disabled = false,
}: MedicationInputImprovedProps) {
  const [step, setStep] = useState<"nombre" | "dosis" | "frecuencia" | "lista">("lista");
  const [nombreInput, setNombreInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredMeds, setFilteredMeds] = useState(MEDICAMENTOS_COMUNES);
  const [selectedMed, setSelectedMed] = useState<string>("");
  const [selectedDosis, setSelectedDosis] = useState<string>("");
  const [dosisDisponibles, setDosisDisponibles] = useState<string[]>([]);
  const [frecuenciasDisponibles, setFrecuenciasDisponibles] = useState<string[]>(FRECUENCIAS_COMUNES);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (nombreInput.trim()) {
      const filtered = buscarMedicamento(nombreInput);
      setFilteredMeds(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setFilteredMeds([]);
      setShowSuggestions(false);
    }
  }, [nombreInput]);

  const handleSelectNombre = (nombre: string) => {
    setSelectedMed(nombre);
    setNombreInput("");
    setShowSuggestions(false);
    
    // Obtener dosis y frecuencias para este medicamento
    const dosis = obtenerDosisComunes(nombre);
    const frecuencias = obtenerFrecuenciasComunes(nombre);
    
    setDosisDisponibles(dosis);
    setFrecuenciasDisponibles(frecuencias);
    setStep("dosis");
  };

  const handleSelectDosis = (dosis: string) => {
    setSelectedDosis(dosis);
    setStep("frecuencia");
  };

  const handleSelectFrecuencia = (frecuencia: string) => {
    // Agregar medicamento completo
    const newMed: Medication = {
      nombre: selectedMed,
      dosis: selectedDosis,
      frecuencia: frecuencia,
    };
    
    onChange([...value, newMed]);
    
    // Reset
    setStep("lista");
    setSelectedMed("");
    setSelectedDosis("");
    setNombreInput("");
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleCancel = () => {
    setStep("lista");
    setSelectedMed("");
    setSelectedDosis("");
    setNombreInput("");
    setShowSuggestions(false);
  };

  const handleCustomNombre = () => {
    if (nombreInput.trim()) {
      setSelectedMed(nombreInput.trim());
      setNombreInput("");
      setShowSuggestions(false);
      setDosisDisponibles([]);
      setFrecuenciasDisponibles(FRECUENCIAS_COMUNES);
      setStep("dosis");
    }
  };

  return (
    <div className="space-y-3">
      {/* Lista de medicamentos */}
      {step === "lista" && (
        <>
          {value.length > 0 && (
            <div className="space-y-2 mb-3">
              {value.map((med, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-2.5 bg-purple-50 border border-purple-200 rounded-lg"
                >
                  <Pill className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900">{med.nombre}</p>
                    <p className="text-xs text-gray-600">
                      {med.dosis} • {med.frecuencia}
                    </p>
                  </div>
                  {!disabled && (
                    <button
                      type="button"
                      onClick={() => handleRemove(idx)}
                      className="text-red-600 hover:text-red-800 flex-shrink-0"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {!disabled && (
            <button
              type="button"
              onClick={() => setStep("nombre")}
              className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-purple-400 hover:text-purple-600 transition-colors"
            >
              + Agregar Medicamento
            </button>
          )}

          {value.length === 0 && disabled && (
            <p className="text-sm text-gray-500 italic">
              No hay medicamentos registrados
            </p>
          )}
        </>
      )}

      {/* Paso 1: Seleccionar Nombre */}
      {step === "nombre" && (
        <div className="border-2 border-purple-300 rounded-lg p-4 bg-purple-50/50">
          <div className="flex items-center justify-between mb-3">
            <Label className="text-sm font-semibold text-purple-900">
              1. Nombre del Medicamento
            </Label>
            <button
              type="button"
              onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="relative">
            <Input
              ref={inputRef}
              value={nombreInput}
              onChange={(e) => setNombreInput(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Escribe el nombre del medicamento..."
              className="mb-2"
              autoFocus
            />

            {showSuggestions && filteredMeds.length > 0 && (
              <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                {filteredMeds.slice(0, 10).map((med, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectNombre(med.nombre)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-purple-50 focus:bg-purple-50 focus:outline-none"
                  >
                    {med.nombre}
                  </button>
                ))}
              </div>
            )}

            {nombreInput.trim() && (
              <button
                type="button"
                onClick={handleCustomNombre}
                className="text-xs text-purple-600 hover:text-purple-800 underline"
              >
                Usar "{nombreInput}" (no está en la lista)
              </button>
            )}
          </div>

          <p className="text-xs text-gray-500 mt-2">
            Escribe para buscar o selecciona de la lista
          </p>
        </div>
      )}

      {/* Paso 2: Seleccionar Dosis */}
      {step === "dosis" && (
        <div className="border-2 border-purple-300 rounded-lg p-4 bg-purple-50/50">
          <div className="flex items-center justify-between mb-3">
            <div>
              <Label className="text-sm font-semibold text-purple-900">
                2. Dosis de {selectedMed}
              </Label>
              <p className="text-xs text-gray-600 mt-0.5">
                Selecciona la dosis o escribe una personalizada
              </p>
            </div>
            <button
              type="button"
              onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {dosisDisponibles.length > 0 ? (
            <div className="grid grid-cols-4 gap-2 mb-3">
              {dosisDisponibles.map((dosis, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectDosis(dosis)}
                  className="px-3 py-2 text-sm border-2 border-purple-300 rounded-md hover:border-purple-600 hover:bg-purple-100 transition-all font-medium text-gray-700 hover:text-purple-900"
                >
                  {dosis}
                </button>
              ))}
            </div>
          ) : null}

          <div className="relative">
            <Input
              placeholder="O escribe la dosis (ej: 50mg)"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.currentTarget.value.trim()) {
                  handleSelectDosis(e.currentTarget.value.trim());
                }
              }}
              className="text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Presiona Enter para continuar
            </p>
          </div>
        </div>
      )}

      {/* Paso 3: Seleccionar Frecuencia */}
      {step === "frecuencia" && (
        <div className="border-2 border-purple-300 rounded-lg p-4 bg-purple-50/50">
          <div className="flex items-center justify-between mb-3">
            <div>
              <Label className="text-sm font-semibold text-purple-900">
                3. Frecuencia
              </Label>
              <p className="text-xs text-gray-600 mt-0.5">
                {selectedMed} {selectedDosis}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {frecuenciasDisponibles.map((freq, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectFrecuencia(freq)}
                className="px-3 py-2 text-sm border-2 border-purple-300 rounded-md hover:border-purple-600 hover:bg-purple-100 transition-all font-medium text-gray-700 hover:text-purple-900 text-left"
              >
                {freq}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
