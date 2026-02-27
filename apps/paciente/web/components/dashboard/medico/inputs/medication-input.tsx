"use client";

import { useState, useRef, useCallback } from "react";
import { Input } from "@red-salud/design-system";
import { Button } from "@red-salud/design-system";
import { Badge } from "@red-salud/design-system";
import { X, Plus, Pill, Clock, Droplet, Search, Loader2 } from "lucide-react";
import { useMedicationSearch } from "@/hooks/use-medication-search";
import { MedicationFull, CATEGORIAS_MEDICAMENTOS } from "@/lib/data/medications";

interface Medication {
  id: string;
  name: string;
  dose: string;
  frequency: string;
  duration: string;
}

interface MedicationInputProps {
  medications: string[];
  onChange: (medications: string[]) => void;
}

export function MedicationInput({ medications, onChange }: MedicationInputProps) {
  const [currentMed, setCurrentMed] = useState<Partial<Medication>>({
    name: "",
    dose: "",
    frequency: "",
    duration: "",
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedMedication, setSelectedMedicationState] = useState<MedicationFull | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const doseRef = useRef<HTMLInputElement>(null);

  // Usar el hook de búsqueda optimizado
  const {
    query,
    setQuery,
    results,
    isSearching,
    totalMedications,
  } = useMedicationSearch({ maxResults: 15 });

  // Manejar selección de medicamento
  const handleSelectMedication = useCallback((med: MedicationFull) => {
    setCurrentMed(prev => ({
      ...prev,
      name: med.nombre,
    }));
    setSelectedMedicationState(med);
    setShowSuggestions(false);
    setQuery(med.nombre);
    // Focus al campo de dosis
    setTimeout(() => doseRef.current?.focus(), 50);
  }, [setQuery]);

  // Agregar medicamento
  const handleAddMedication = useCallback(() => {
    if (!currentMed.name || !currentMed.dose || !currentMed.frequency) {
      return;
    }

    const medString = `${currentMed.name} ${currentMed.dose} ${currentMed.frequency}${currentMed.duration ? ` por ${currentMed.duration}` : ""
      }`;

    onChange([...medications, medString]);

    // Reset
    setCurrentMed({
      name: "",
      dose: "",
      frequency: "",
      duration: "",
    });
    setSelectedMedicationState(null);
    setQuery("");
    inputRef.current?.focus();
  }, [currentMed, medications, onChange, setQuery]);

  // Remover medicamento
  const handleRemoveMedication = useCallback((index: number) => {
    onChange(medications.filter((_, i) => i !== index));
  }, [medications, onChange]);

  // Manejar teclas
  const handleKeyPress = useCallback((e: React.KeyboardEvent, field: string) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (field === "name" && showSuggestions && results.length > 0) {
        const firstResult = results[0];
        if (firstResult) {
          handleSelectMedication(firstResult);
        }
      } else if (field === "duration" || (field === "frequency" && !currentMed.duration)) {
        handleAddMedication();
      }
    }
  }, [showSuggestions, results, currentMed.duration, handleSelectMedication, handleAddMedication]);

  // Manejar cambio de nombre
  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCurrentMed(prev => ({ ...prev, name: val }));
    setQuery(val);
    setShowSuggestions(val.length > 1);
    if (val.length < 2) {
      setSelectedMedicationState(null);
    }
  }, [setQuery]);

  // Obtener nombre de categoría
  const getCategoryLabel = (categoria: string): string => {
    const cat = CATEGORIAS_MEDICAMENTOS.find(c => c.id === categoria);
    return cat?.nombre ?? categoria;
  };

  // Agrupar resultados por categoría
  const groupedResults = results.reduce<Record<string, MedicationFull[]>>((acc, med) => {
    const cat = med.categoria;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(med);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {/* Lista de medicamentos agregados */}
      {medications.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">Medicamentos Prescritos:</p>
          {medications.map((med, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg group hover:bg-blue-100 transition-colors"
            >
              <div className="flex items-center gap-2 flex-1">
                <Pill className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <span className="text-sm text-gray-900">{med}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveMedication(index)}
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Formulario de agregar medicamento */}
      <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg space-y-3">
        <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Agregar Medicamento
          <span className="text-xs font-normal text-gray-400 ml-auto">
            {totalMedications} medicamentos disponibles
          </span>
        </p>

        {/* Nombre del medicamento */}
        <div className="relative">
          <Input
            ref={inputRef}
            value={currentMed.name || ""}
            onChange={handleNameChange}
            onKeyPress={(e) => handleKeyPress(e, "name")}
            onFocus={() => query.length > 1 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Buscar medicamento..."
            className="pr-10"
          />
          {isSearching ? (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
          ) : (
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          )}

          {/* Sugerencias agrupadas por categoría */}
          {showSuggestions && results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-20 max-h-64 overflow-y-auto">
              {Object.entries(groupedResults).map(([categoria, meds]) => (
                <div key={categoria}>
                  <div className="px-3 py-1.5 bg-gray-50 border-b text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {getCategoryLabel(categoria)}
                  </div>
                  {meds.map((med) => (
                    <button
                      key={med.id}
                      onClick={() => handleSelectMedication(med)}
                      className="w-full text-left px-4 py-2.5 hover:bg-blue-50 flex items-center gap-2 text-sm border-b border-gray-100 last:border-b-0"
                    >
                      <Pill className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="font-medium block">{med.nombre}</span>
                        {med.nombreComercial.length > 0 && (
                          <span className="text-xs text-gray-500 truncate block">
                            {med.nombreComercial.slice(0, 3).join(", ")}
                          </span>
                        )}
                      </div>
                      <Badge variant="secondary" className="text-xs flex-shrink-0">
                        {med.dosisComunes[0]}
                      </Badge>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Sin resultados */}
          {showSuggestions && query.length > 2 && results.length === 0 && !isSearching && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-20 p-4 text-center text-sm text-gray-500">
              No se encontraron medicamentos para &quot;{query}&quot;
            </div>
          )}
        </div>

        {/* Dosis, Frecuencia, Duración */}
        {currentMed.name && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative">
              <Input
                ref={doseRef}
                value={currentMed.dose || ""}
                onChange={(e) => setCurrentMed({ ...currentMed, dose: e.target.value })}
                onKeyPress={(e) => handleKeyPress(e, "dose")}
                placeholder="Dosis (ej: 500mg)"
                className="pr-10"
              />
              <Droplet className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />

              {/* Sugerencias de dosis */}
              {selectedMedication && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedMedication.dosisComunes.map((dose, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="text-xs cursor-pointer hover:bg-blue-50"
                      onClick={() => setCurrentMed({ ...currentMed, dose })}
                    >
                      {dose}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Frecuencia */}
            <div className="relative">
              <Input
                value={currentMed.frequency || ""}
                onChange={(e) => setCurrentMed({ ...currentMed, frequency: e.target.value })}
                onKeyPress={(e) => handleKeyPress(e, "frequency")}
                placeholder="Frecuencia"
                className="pr-10"
              />
              <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />

              {/* Sugerencias de frecuencia */}
              {selectedMedication && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedMedication.frecuenciasComunes.map((freq, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="text-xs cursor-pointer hover:bg-blue-50"
                      onClick={() => setCurrentMed({ ...currentMed, frequency: freq })}
                    >
                      {freq}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Duración */}
            <Input
              value={currentMed.duration || ""}
              onChange={(e) => setCurrentMed({ ...currentMed, duration: e.target.value })}
              onKeyPress={(e) => handleKeyPress(e, "duration")}
              placeholder="Duración (ej: 7 días)"
            />
          </div>
        )}

        {/* Botón agregar */}
        {currentMed.name && currentMed.dose && currentMed.frequency && (
          <Button
            onClick={handleAddMedication}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Medicamento
          </Button>
        )}
      </div>

      {/* Ayuda */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>💡 <strong>Tip:</strong> Escribe el nombre del medicamento y selecciona de las sugerencias</p>
        <p>⌨️ Presiona <kbd className="px-1 py-0.5 bg-gray-100 border rounded text-xs">Enter</kbd> para avanzar entre campos</p>
      </div>
    </div>
  );
}
