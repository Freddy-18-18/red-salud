"use client";

import { Label } from "@/components/ui/label";

const OPCIONES_FUMA = [
  { value: "no", label: "No fumo" },
  { value: "si", label: "Sí, fumo actualmente" },
  { value: "ex-fumador", label: "Ex-fumador" },
];

const OPCIONES_ALCOHOL = [
  { value: "no", label: "No consumo" },
  { value: "ocasional", label: "Ocasional" },
  { value: "regular", label: "Regular" },
  { value: "frecuente", label: "Frecuente" },
];

const OPCIONES_ACTIVIDAD = [
  { value: "sedentario", label: "Sedentario" },
  { value: "ligera", label: "Ligera" },
  { value: "moderada", label: "Moderada" },
  { value: "intensa", label: "Intensa" },
];

interface LifestyleHabitsProps {
  isEditing: boolean;
  localData: any;
  setLocalData: (data: any) => void;
  formData: any;
}

export function LifestyleHabitsSection({
  isEditing,
  localData,
  setLocalData,
  formData,
}: LifestyleHabitsProps) {
  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-3">
      <h4 className="font-semibold text-orange-900 text-sm">
        Hábitos de Vida
      </h4>

      {/* Tabaquismo */}
      <div>
        <Label htmlFor="fuma" className="text-xs">
          Tabaquismo
        </Label>
        {isEditing ? (
          <div className="grid grid-cols-3 gap-2 mt-1">
            {OPCIONES_FUMA.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() =>
                  setLocalData({ ...localData, fuma: opt.value })
                }
                className={`px-2 py-1.5 rounded-md border-2 transition-all text-xs font-medium ${
                  localData.fuma === opt.value
                    ? "border-orange-600 bg-orange-100 text-orange-900"
                    : "border-gray-300 hover:border-gray-400 text-gray-700"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm font-medium text-gray-900 mt-1">
            {OPCIONES_FUMA.find((o) => o.value === formData.fuma)?.label ||
              "No registrado"}
          </p>
        )}
      </div>

      {/* Alcohol */}
      <div>
        <Label htmlFor="consumeAlcohol" className="text-xs">
          Alcohol
        </Label>
        {isEditing ? (
          <div className="grid grid-cols-2 gap-2 mt-1">
            {OPCIONES_ALCOHOL.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() =>
                  setLocalData({
                    ...localData,
                    consumeAlcohol: opt.value,
                  })
                }
                className={`px-2 py-1.5 rounded-md border-2 transition-all text-xs font-medium ${
                  localData.consumeAlcohol === opt.value
                    ? "border-orange-600 bg-orange-100 text-orange-900"
                    : "border-gray-300 hover:border-gray-400 text-gray-700"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm font-medium text-gray-900 mt-1">
            {OPCIONES_ALCOHOL.find(
              (o) => o.value === formData.consumeAlcohol
            )?.label || "No registrado"}
          </p>
        )}
      </div>

      {/* Actividad Física */}
      <div>
        <Label htmlFor="actividadFisica" className="text-xs">
          Actividad Física
        </Label>
        {isEditing ? (
          <div className="grid grid-cols-2 gap-2 mt-1">
            {OPCIONES_ACTIVIDAD.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() =>
                  setLocalData({
                    ...localData,
                    actividadFisica: opt.value,
                  })
                }
                className={`px-2 py-1.5 rounded-md border-2 transition-all text-xs font-medium ${
                  localData.actividadFisica === opt.value
                    ? "border-orange-600 bg-orange-100 text-orange-900"
                    : "border-gray-300 hover:border-gray-400 text-gray-700"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm font-medium text-gray-900 mt-1">
            {OPCIONES_ACTIVIDAD.find(
              (o) => o.value === formData.actividadFisica
            )?.label || "No registrado"}
          </p>
        )}
      </div>
    </div>
  );
}
