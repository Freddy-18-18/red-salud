import { Activity, Droplet } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { TIPOS_SANGRE } from "../../../constants";
import type { MedicalFormData, IMCData } from "../types";

interface VitalSignsSectionProps {
  localData: MedicalFormData;
  setLocalData: (data: MedicalFormData) => void;
  formData: MedicalFormData;
  isEditing: boolean;
  imc: IMCData;
}

export function VitalSignsSection({
  localData,
  setLocalData,
  formData,
  isEditing,
  imc,
}: VitalSignsSectionProps) {
  return (
    <fieldset className="space-y-5">
      <legend className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <Activity className="h-5 w-5 text-blue-600" />
        Datos Vitales y Físicos
      </legend>

      {/* Sexo Biológico */}
      <div>
        <Label htmlFor="sexoBiologico">Sexo Biológico *</Label>
        {isEditing ? (
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={() =>
                setLocalData({ ...localData, sexoBiologico: "masculino" })
              }
              className={`flex-1 px-3 py-2 rounded-md border-2 transition-all text-sm font-medium ${
                localData.sexoBiologico === "masculino"
                  ? "border-blue-600 bg-blue-50 text-blue-900"
                  : "border-gray-300 hover:border-gray-400 text-gray-700"
              }`}
            >
              Masculino
            </button>
            <button
              type="button"
              onClick={() =>
                setLocalData({ ...localData, sexoBiologico: "femenino" })
              }
              className={`flex-1 px-3 py-2 rounded-md border-2 transition-all text-sm font-medium ${
                localData.sexoBiologico === "femenino"
                  ? "border-pink-600 bg-pink-50 text-pink-900"
                  : "border-gray-300 hover:border-gray-400 text-gray-700"
              }`}
            >
              Femenino
            </button>
          </div>
        ) : (
          <p className="text-base font-medium text-gray-900 mt-1">
            {localData.sexoBiologico
              ? localData.sexoBiologico.charAt(0).toUpperCase() +
                localData.sexoBiologico.slice(1)
              : "No registrado"}
          </p>
        )}
      </div>

      {/* Tipo de Sangre */}
      <div>
        <Label className="flex items-center gap-2">
          <Droplet className="h-4 w-4 text-red-600" />
          Tipo de Sangre *
        </Label>
        {isEditing ? (
          <div className="grid grid-cols-4 gap-2 mt-2">
            {TIPOS_SANGRE.map((tipo) => (
              <button
                key={tipo}
                type="button"
                onClick={() =>
                  setLocalData({ ...localData, tipoSangre: tipo })
                }
                className={`px-2 py-1.5 rounded-md border-2 font-semibold text-sm transition-all ${
                  localData.tipoSangre === tipo
                    ? "border-red-600 bg-red-50 text-red-900"
                    : "border-gray-300 hover:border-gray-400 text-gray-700"
                }`}
              >
                {tipo}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-base font-medium text-gray-900 mt-1">
            {formData.tipoSangre || "No registrado"}
          </p>
        )}
      </div>

      {/* Donante de Sangre */}
      <div>
        <Label htmlFor="donanteSangre">¿Donante de Sangre?</Label>
        {isEditing ? (
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={() =>
                setLocalData({ ...localData, donanteSangre: "si" })
              }
              className={`flex-1 px-3 py-2 rounded-md border-2 transition-all text-sm font-medium ${
                localData.donanteSangre === "si"
                  ? "border-green-600 bg-green-50 text-green-900"
                  : "border-gray-300 hover:border-gray-400 text-gray-700"
              }`}
            >
              Sí
            </button>
            <button
              type="button"
              onClick={() =>
                setLocalData({ ...localData, donanteSangre: "no" })
              }
              className={`flex-1 px-3 py-2 rounded-md border-2 transition-all text-sm font-medium ${
                localData.donanteSangre === "no"
                  ? "border-gray-600 bg-gray-50 text-gray-900"
                  : "border-gray-300 hover:border-gray-400 text-gray-700"
              }`}
            >
              No
            </button>
          </div>
        ) : (
          <p className="text-base font-medium text-gray-900 mt-1">
            {localData.donanteSangre === "si"
              ? "Sí"
              : localData.donanteSangre === "no"
              ? "No"
              : "No especificado"}
          </p>
        )}
      </div>

      {/* Peso y Altura */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="peso">Peso (kg) *</Label>
          {isEditing ? (
            <Input
              id="peso"
              type="number"
              step="0.1"
              placeholder="70.5"
              value={localData.peso || ""}
              onChange={(e) =>
                setLocalData({ ...localData, peso: e.target.value })
              }
              required
            />
          ) : (
            <p className="text-base font-medium text-gray-900 mt-1">
              {formData.peso ? `${formData.peso} kg` : "No registrado"}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="altura">Altura (cm) *</Label>
          {isEditing ? (
            <Input
              id="altura"
              type="number"
              placeholder="170"
              value={localData.altura || ""}
              onChange={(e) =>
                setLocalData({ ...localData, altura: e.target.value })
              }
              required
            />
          ) : (
            <p className="text-base font-medium text-gray-900 mt-1">
              {formData.altura ? `${formData.altura} cm` : "No registrado"}
            </p>
          )}
        </div>
      </div>

      {/* IMC */}
      {imc.value && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-700 font-medium">IMC</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                {imc.value.toFixed(1)}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                imc.categoria === "Normal"
                  ? "bg-green-100 text-green-800"
                  : imc.categoria === "Bajo peso"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-orange-100 text-orange-800"
              }`}
            >
              {imc.categoria}
            </span>
          </div>
        </div>
      )}

      {/* Presión Arterial */}
      <div>
        <Label>Presión Arterial (mmHg)</Label>
        <div className="grid grid-cols-2 gap-3 mt-1">
          <div>
            {isEditing ? (
              <Input
                type="number"
                placeholder="120"
                value={localData.presionSistolica || ""}
                onChange={(e) =>
                  setLocalData({
                    ...localData,
                    presionSistolica: e.target.value,
                  })
                }
              />
            ) : (
              <p className="text-base font-medium text-gray-900">
                {formData.presionSistolica || "--"}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">Sistólica</p>
          </div>
          <div>
            {isEditing ? (
              <Input
                type="number"
                placeholder="80"
                value={localData.presionDiastolica || ""}
                onChange={(e) =>
                  setLocalData({
                    ...localData,
                    presionDiastolica: e.target.value,
                  })
                }
              />
            ) : (
              <p className="text-base font-medium text-gray-900">
                {formData.presionDiastolica || "--"}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">Diastólica</p>
          </div>
        </div>
      </div>
    </fieldset>
  );
}
