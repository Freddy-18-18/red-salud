import { Label } from "@/components/ui/label";
import type { MedicalFormData } from "../types";

interface FemaleSpecificSectionProps {
  localData: MedicalFormData;
  setLocalData: (data: MedicalFormData) => void;
  formData: MedicalFormData;
  isEditing: boolean;
}

export function FemaleSpecificSection({
  localData,
  setLocalData,
  formData,
  isEditing,
}: FemaleSpecificSectionProps) {
  return (
    <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 space-y-3">
      <h4 className="font-semibold text-pink-900 text-sm">
        Información Específica
      </h4>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="embarazada" className="text-xs">¿Embarazada?</Label>
          {isEditing ? (
            <select
              id="embarazada"
              value={localData.embarazada ? "si" : "no"}
              onChange={(e) =>
                setLocalData({
                  ...localData,
                  embarazada: e.target.value === "si",
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="no">No</option>
              <option value="si">Sí</option>
            </select>
          ) : (
            <p className="text-sm font-medium text-gray-900 mt-1">
              {formData.embarazada ? "Sí" : "No"}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="lactancia" className="text-xs">¿Lactancia?</Label>
          {isEditing ? (
            <select
              id="lactancia"
              value={localData.lactancia ? "si" : "no"}
              onChange={(e) =>
                setLocalData({
                  ...localData,
                  lactancia: e.target.value === "si",
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="no">No</option>
              <option value="si">Sí</option>
            </select>
          ) : (
            <p className="text-sm font-medium text-gray-900 mt-1">
              {formData.lactancia ? "Sí" : "No"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
