"use client";

import { Heart } from "lucide-react";
import { Label } from "@/components/ui/label";
import { MedicalChipInput } from "../../components/medical-chip-input";
import { MedicationInputImproved as MedicationInput, type Medication } from "../../components/medication-input-improved";
import {
  ALERGIAS_MEDICAMENTOS,
  ALERGIAS_ALIMENTARIAS,
  OTRAS_ALERGIAS,
  CONDICIONES_CRONICAS,
} from "../../constants/medical-suggestions";

interface ClinicalInfoProps {
  isEditing: boolean;
  alergiasMedicamentos: string[];
  setAlergiasMedicamentos: (value: string[]) => void;
  alergiasAlimentarias: string[];
  setAlergiasAlimentarias: (value: string[]) => void;
  otrasAlergias: string[];
  setOtrasAlergias: (value: string[]) => void;
  condicionesCronicas: string[];
  setCondicionesCronicas: (value: string[]) => void;
  medicamentosActuales: Medication[];
  setMedicamentosActuales: (value: Medication[]) => void;
}

export function ClinicalInfoSection({
  isEditing,
  alergiasMedicamentos,
  setAlergiasMedicamentos,
  alergiasAlimentarias,
  setAlergiasAlimentarias,
  otrasAlergias,
  setOtrasAlergias,
  condicionesCronicas,
  setCondicionesCronicas,
  medicamentosActuales,
  setMedicamentosActuales,
}: ClinicalInfoProps) {
  return (
    <fieldset className="space-y-5">
      <legend className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <Heart className="h-5 w-5 text-red-600" />
        Información Clínica
      </legend>

      {/* Alergias a Medicamentos */}
      <div>
        <Label>Alergias a Medicamentos</Label>
        <p className="text-xs text-gray-500 mb-2">
          Selecciona o escribe medicamentos a los que eres alérgico
        </p>
        <MedicalChipInput
          value={alergiasMedicamentos}
          onChange={setAlergiasMedicamentos}
          suggestions={ALERGIAS_MEDICAMENTOS}
          placeholder="Ej: Penicilina"
          disabled={!isEditing}
          template="Nombre del medicamento"
        />
      </div>

      {/* Alergias Alimentarias */}
      <div>
        <Label>Alergias Alimentarias</Label>
        <p className="text-xs text-gray-500 mb-2">
          Alimentos que te causan reacciones alérgicas
        </p>
        <MedicalChipInput
          value={alergiasAlimentarias}
          onChange={setAlergiasAlimentarias}
          suggestions={ALERGIAS_ALIMENTARIAS}
          placeholder="Ej: Mariscos"
          disabled={!isEditing}
          template="Nombre del alimento"
        />
      </div>

      {/* Otras Alergias */}
      <div>
        <Label>Otras Alergias</Label>
        <p className="text-xs text-gray-500 mb-2">
          Polen, ácaros, látex, etc.
        </p>
        <MedicalChipInput
          value={otrasAlergias}
          onChange={setOtrasAlergias}
          suggestions={OTRAS_ALERGIAS}
          placeholder="Ej: Polen"
          disabled={!isEditing}
          template="Tipo de alergia"
        />
      </div>

      {/* Condiciones Crónicas */}
      <div>
        <Label>Condiciones Crónicas</Label>
        <p className="text-xs text-gray-500 mb-2">
          Enfermedades o condiciones de salud permanentes
        </p>
        <MedicalChipInput
          value={condicionesCronicas}
          onChange={setCondicionesCronicas}
          suggestions={CONDICIONES_CRONICAS}
          placeholder="Ej: Diabetes tipo 2"
          disabled={!isEditing}
          template="Nombre de la condición"
        />
      </div>

      {/* Medicamentos Actuales */}
      <div>
        <Label>Medicamentos Actuales</Label>
        <p className="text-xs text-gray-500 mb-2">
          Medicamentos que tomas regularmente
        </p>
        <MedicationInput
          value={medicamentosActuales}
          onChange={setMedicamentosActuales}
          disabled={!isEditing}
        />
      </div>
    </fieldset>
  );
}
