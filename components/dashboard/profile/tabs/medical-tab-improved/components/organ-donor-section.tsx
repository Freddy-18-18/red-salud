import { Label } from "@/components/ui/label";
import type { MedicalFormData } from "../types";

interface OrganDonorSectionProps {
  localData: MedicalFormData;
  setLocalData: (data: MedicalFormData) => void;
  isEditing: boolean;
}

export function OrganDonorSection({
  localData,
  setLocalData,
  isEditing,
}: OrganDonorSectionProps) {
  return (
    <div>
      <Label htmlFor="donanteOrganos">¿Donante de Órganos?</Label>
      {isEditing ? (
        <div className="grid grid-cols-3 gap-2 mt-2">
          <button
            type="button"
            onClick={() =>
              setLocalData({ ...localData, donanteOrganos: "si" })
            }
            className={`px-3 py-2 rounded-md border-2 transition-all text-sm font-medium ${
              localData.donanteOrganos === "si"
                ? "border-green-600 bg-green-50 text-green-900"
                : "border-gray-300 hover:border-gray-400 text-gray-700"
            }`}
          >
            Sí
          </button>
          <button
            type="button"
            onClick={() =>
              setLocalData({ ...localData, donanteOrganos: "no" })
            }
            className={`px-3 py-2 rounded-md border-2 transition-all text-sm font-medium ${
              localData.donanteOrganos === "no"
                ? "border-gray-600 bg-gray-50 text-gray-900"
                : "border-gray-300 hover:border-gray-400 text-gray-700"
            }`}
          >
            No
          </button>
          <button
            type="button"
            onClick={() =>
              setLocalData({ ...localData, donanteOrganos: "no_especificado" })
            }
            className={`px-3 py-2 rounded-md border-2 transition-all text-sm font-medium ${
              localData.donanteOrganos === "no_especificado"
                ? "border-gray-600 bg-gray-50 text-gray-900"
                : "border-gray-300 hover:border-gray-400 text-gray-700"
            }`}
          >
            No especificar
          </button>
        </div>
      ) : (
        <p className="text-base font-medium text-gray-900 mt-1">
          {localData.donanteOrganos === "si"
            ? "Sí"
            : localData.donanteOrganos === "no"
            ? "No"
            : "No especificado"}
        </p>
      )}
    </div>
  );
}
