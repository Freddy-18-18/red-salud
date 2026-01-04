"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Pill, Clock, Droplet } from "lucide-react";

interface Medication {
  id: string;
  name: string;
  dose: string;
  frequency: string;
  duration: string;
}

interface MedicationSuggestion {
  name: string;
  commonDoses: string[];
  commonFrequencies: string[];
}

const COMMON_MEDICATIONS: MedicationSuggestion[] = [
  {
    name: "Paracetamol",
    commonDoses: ["500mg", "1g"],
    commonFrequencies: ["cada 8 horas", "cada 6 horas"],
  },
  {
    name: "Ibuprofeno",
    commonDoses: ["400mg", "600mg"],
    commonFrequencies: ["cada 8 horas", "cada 12 horas"],
  },
  {
    name: "Amoxicilina",
    commonDoses: ["500mg", "875mg"],
    commonFrequencies: ["cada 8 horas", "cada 12 horas"],
  },
  {
    name: "Omeprazol",
    commonDoses: ["20mg", "40mg"],
    commonFrequencies: ["cada 24 horas", "cada 12 horas"],
  },
  {
    name: "Losartán",
    commonDoses: ["50mg", "100mg"],
    commonFrequencies: ["cada 24 horas"],
  },
  {
    name: "Metformina",
    commonDoses: ["500mg", "850mg", "1000mg"],
    commonFrequencies: ["cada 12 horas", "cada 8 horas"],
  },
  {
    name: "Atorvastatina",
    commonDoses: ["10mg", "20mg", "40mg"],
    commonFrequencies: ["cada 24 horas"],
  },
  {
    name: "Enalapril",
    commonDoses: ["5mg", "10mg", "20mg"],
    commonFrequencies: ["cada 12 horas", "cada 24 horas"],
  },
  {
    name: "Salbutamol",
    commonDoses: ["100mcg", "2 puff"],
    commonFrequencies: ["cada 6 horas", "SOS"],
  },
  {
    name: "Loratadina",
    commonDoses: ["10mg"],
    commonFrequencies: ["cada 24 horas"],
  },
];

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
  const [suggestions, setSuggestions] = useState<MedicationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<MedicationSuggestion | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentMed.name && currentMed.name.length > 1) {
      const filtered = COMMON_MEDICATIONS.filter((med) =>
        med.name.toLowerCase().includes(currentMed.name!.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [currentMed.name]);

  const handleSelectMedication = (med: MedicationSuggestion) => {
    setCurrentMed({
      ...currentMed,
      name: med.name,
    });
    setSelectedSuggestion(med);
    setShowSuggestions(false);
  };

  const handleAddMedication = () => {
    if (!currentMed.name || !currentMed.dose || !currentMed.frequency) {
      return;
    }

    const medString = `${currentMed.name} ${currentMed.dose} ${currentMed.frequency}${
      currentMed.duration ? ` por ${currentMed.duration}` : ""
    }`;

    onChange([...medications, medString]);
    
    // Reset
    setCurrentMed({
      name: "",
      dose: "",
      frequency: "",
      duration: "",
    });
    setSelectedSuggestion(null);
    inputRef.current?.focus();
  };

  const handleRemoveMedication = (index: number) => {
    onChange(medications.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent, field: string) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (field === "name" && showSuggestions && suggestions.length > 0) {
        handleSelectMedication(suggestions[0]);
      } else if (field === "duration" || (field === "frequency" && !currentMed.duration)) {
        handleAddMedication();
      }
    }
  };

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
        </p>

        {/* Nombre del medicamento */}
        <div className="relative">
          <Input
            ref={inputRef}
            value={currentMed.name || ""}
            onChange={(e) => setCurrentMed({ ...currentMed, name: e.target.value })}
            onKeyPress={(e) => handleKeyPress(e, "name")}
            placeholder="Nombre del medicamento..."
            className="pr-10"
          />
          <Pill className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />

          {/* Sugerencias */}
          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
              {suggestions.map((med, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectMedication(med)}
                  className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center gap-2 text-sm"
                >
                  <Pill className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">{med.name}</span>
                  <Badge variant="secondary" className="text-xs ml-auto">
                    {med.commonDoses[0]}
                  </Badge>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dosis */}
        {currentMed.name && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative">
              <Input
                value={currentMed.dose || ""}
                onChange={(e) => setCurrentMed({ ...currentMed, dose: e.target.value })}
                onKeyPress={(e) => handleKeyPress(e, "dose")}
                placeholder="Dosis (ej: 500mg)"
                className="pr-10"
              />
              <Droplet className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              
              {/* Sugerencias de dosis */}
              {selectedSuggestion && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedSuggestion.commonDoses.map((dose, i) => (
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
              {selectedSuggestion && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedSuggestion.commonFrequencies.map((freq, i) => (
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
