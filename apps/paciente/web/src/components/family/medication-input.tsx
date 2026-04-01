"use client";

import { X, Plus, Pill } from "lucide-react";
import { useState } from "react";

import type { Medication } from "@/lib/services/family-service";

interface MedicationInputProps {
  medications: Medication[];
  onChange: (medications: Medication[]) => void;
}

export function MedicationInput({ medications, onChange }: MedicationInputProps) {
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");

  const addMedication = () => {
    if (!name.trim() || !dosage.trim()) return;

    const newMed: Medication = {
      name: name.trim(),
      dosage: dosage.trim(),
      frequency: frequency.trim() || undefined,
    };

    onChange([...medications, newMed]);
    setName("");
    setDosage("");
    setFrequency("");
  };

  const removeMedication = (index: number) => {
    onChange(medications.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addMedication();
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        Medicamentos actuales
      </label>

      {/* Current medications list */}
      {medications.length > 0 && (
        <div className="space-y-2 mb-3">
          {medications.map((med, i) => (
            <div
              key={`${med.name}-${i}`}
              className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg"
            >
              <Pill className="h-4 w-4 text-amber-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{med.name}</p>
                <p className="text-xs text-gray-500">
                  {med.dosage}
                  {med.frequency ? ` - ${med.frequency}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeMedication(i)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add medication form */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nombre del medicamento"
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
        <input
          type="text"
          value={dosage}
          onChange={(e) => setDosage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Dosis (ej: 500mg)"
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
        <div className="flex gap-2">
          <input
            type="text"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Frecuencia (opcional)"
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={addMedication}
            disabled={!name.trim() || !dosage.trim()}
            className="px-3 py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
