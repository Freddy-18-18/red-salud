import { useMemo } from "react";
import type { Medication } from "../../../components/medication-input-improved";
import type { MedicalFormData } from "../types";

export function useMedicalDataParser(formData: MedicalFormData) {
  return useMemo(() => {
    const alergiasMedicamentos = formData.alergias 
      ? formData.alergias.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
    
    const alergiasAlimentarias = formData.alergiasAlimentarias
      ? formData.alergiasAlimentarias.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
    
    const otrasAlergias = formData.otrasAlergias
      ? formData.otrasAlergias.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
    
    const condicionesCronicas = formData.condicionesCronicas
      ? formData.condicionesCronicas.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
    
    let medicamentosActuales: Medication[] = [];
    if (formData.medicamentosActuales) {
      try {
        const parsed = JSON.parse(formData.medicamentosActuales);
        if (Array.isArray(parsed)) {
          medicamentosActuales = parsed;
        }
      } catch {
        medicamentosActuales = [];
      }
    }

    return {
      alergiasMedicamentos,
      alergiasAlimentarias,
      otrasAlergias,
      condicionesCronicas,
      medicamentosActuales,
    };
  }, [formData]);
}
