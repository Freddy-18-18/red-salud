"use client";

import { useState } from "react";
import { X, Plus, Pill } from "lucide-react";
import { Button } from "@red-salud/ui";
import { Input } from "@red-salud/ui";
import { Label } from "@red-salud/ui";

export interface Medication {
  nombre: string;
  dosis: string;
  frecuencia: string;
}

interface MedicationInputProps {
  value: Medication[];
  onChange: (value: Medication[]) => void;
  disabled?: boolean;
}

const FRECUENCIAS_COMUNES = [
  "Cada 8 horas",
  "Cada 12 horas",
  "Cada 24 horas",
  "1 vez al día",
  "2 veces al día",
  "3 veces al día",
  "Según necesidad",
];

export function MedicationInput({
  value,
  onChange,
  disabled = false,
}: MedicationInputProps) {
  const [showForm, setShowForm] = useState(false);
  const [newMed, setNewMed] = useState<Medication>({
    nombre: "",
    dosis: "",
    frecuencia: "",
  });

  const handleAdd = () => {
    if (newMed.nombre.trim() && newMed.dosis.trim() && newMed.frecuencia.trim()) {
      onChange([...value, newMed]);
      setNewMed({ nombre: "", dosis: "", frecuencia: "" });
      setShowForm(false);
    }
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {/* Lista de medicamentos */}
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((med, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg"
            >
              <Pill className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">{med.nombre}</p>
                <p className="text-sm text-gray-600">
                  {med.dosis} • {med.frecuencia}
                </p>
              </div>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="text-red-600 hover:text-red-800 flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Botón agregar / Formulario */}
      {!disabled && (
        <>
          {!showForm ? (
            <Button
              type="button"
              onClick={() => setShowForm(true)}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Medicamento
            </Button>
          ) : (
            <div className="border border-gray-300 rounded-lg p-4 space-y-3 bg-gray-50">
              <div>
                <Label htmlFor="med-nombre">Nombre del Medicamento *</Label>
                <Input
                  id="med-nombre"
                  value={newMed.nombre}
                  onChange={(e) =>
                    setNewMed({ ...newMed, nombre: e.target.value })
                  }
                  placeholder="Ej: Losartán"
                  maxLength={100}
                />
              </div>

              <div>
                <Label htmlFor="med-dosis">Dosis *</Label>
                <Input
                  id="med-dosis"
                  value={newMed.dosis}
                  onChange={(e) =>
                    setNewMed({ ...newMed, dosis: e.target.value })
                  }
                  placeholder="Ej: 50mg"
                  maxLength={50}
                />
              </div>

              <div>
                <Label htmlFor="med-frecuencia">Frecuencia *</Label>
                <select
                  id="med-frecuencia"
                  value={newMed.frecuencia}
                  onChange={(e) =>
                    setNewMed({ ...newMed, frecuencia: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar frecuencia</option>
                  {FRECUENCIAS_COMUNES.map((freq) => (
                    <option key={freq} value={freq}>
                      {freq}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={handleAdd}
                  size="sm"
                  disabled={
                    !newMed.nombre.trim() ||
                    !newMed.dosis.trim() ||
                    !newMed.frecuencia.trim()
                  }
                >
                  Agregar
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setNewMed({ nombre: "", dosis: "", frecuencia: "" });
                  }}
                  variant="outline"
                  size="sm"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {value.length === 0 && disabled && (
        <p className="text-sm text-gray-500 italic">
          No hay medicamentos registrados
        </p>
      )}
    </div>
  );
}
