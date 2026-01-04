import { useState, useEffect } from "react";
import type { Medication } from "../../../components/medication-input-improved";
import type { MedicalFormData } from "../types";

interface ParsedMedicalData {
  alergiasMedicamentos: string[];
  alergiasAlimentarias: string[];
  otrasAlergias: string[];
  condicionesCronicas: string[];
  medicamentosActuales: Medication[];
}

export function useMedicalDataParser(formData: MedicalFormData) {
  const [alergiasMedicamentos, setAlergiasMedicamentos] = useState<string[]>([]);
  const [alergiasAlimentarias, setAlergiasAlimentarias] = useState<string[]>([]);
  const [otrasAlergias, setOtrasAlergias] = useState<string[]>([]);
  const [condicionesCronicas, setCondicionesCronicas] = useState<string[]>([]);
  const [medicamentosActuales, setMedicamentosActuales] = useState<Medication[]>([]);

  useEffect(() => {
    if (formData.alergias) {
      setAlergiasMedicamentos(
        formData.alergias.split(",").map((s) => s.trim()).filter(Boolean)
      );
    }
    if (formData.alergiasAlimentarias) {
      setAlergiasAlimentarias(
        formData.alergiasAlimentarias.split(",").map((s) => s.trim()).filter(Boolean)
      );
    }
    if (formData.otrasAlergias) {
      setOtrasAlergias(
        formData.otrasAlergias.split(",").map((s) => s.trim()).filter(Boolean)
      );
    }
    if (formData.condicionesCronicas) {
      setCondicionesCronicas(
        formData.condicionesCronicas.split(",").map((s) => s.trim()).filter(Boolean)
      );
    }
    
    if (formData.medicamentosActuales) {
      try {
        const parsed = JSON.parse(formData.medicamentosActuales);
        if (Array.isArray(parsed)) {
          setMedicamentosActuales(parsed);
        }
      } catch {
        setMedicamentosActuales([]);
      }
    }
  }, [formData]);

  return {
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
  };
}
