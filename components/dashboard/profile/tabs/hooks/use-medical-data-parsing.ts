import { useState, useEffect } from "react";
import type { Medication } from "../../components/medication-input-improved";

interface MedicalDataState {
  alergiasMedicamentos: string[];
  alergiasAlimentarias: string[];
  otrasAlergias: string[];
  condicionesCronicas: string[];
  medicamentosActuales: Medication[];
}

/**
 * Hook para parsear y gestionar datos médicos estructurados
 */
export function useMedicalDataParsing(formData: any): MedicalDataState {
  const [medicalData, setMedicalData] = useState<MedicalDataState>({
    alergiasMedicamentos: [],
    alergiasAlimentarias: [],
    otrasAlergias: [],
    condicionesCronicas: [],
    medicamentosActuales: [],
  });

  useEffect(() => {
    const parsed: MedicalDataState = {
      alergiasMedicamentos: [],
      alergiasAlimentarias: [],
      otrasAlergias: [],
      condicionesCronicas: [],
      medicamentosActuales: [],
    };

    // Parsear alergias a medicamentos
    if (formData.alergias) {
      parsed.alergiasMedicamentos = formData.alergias
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);
    }

    // Parsear alergias alimentarias
    if (formData.alergiasAlimentarias) {
      parsed.alergiasAlimentarias = formData.alergiasAlimentarias
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);
    }

    // Parsear otras alergias
    if (formData.otrasAlergias) {
      parsed.otrasAlergias = formData.otrasAlergias
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);
    }

    // Parsear condiciones crónicas
    if (formData.condicionesCronicas) {
      parsed.condicionesCronicas = formData.condicionesCronicas
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);
    }

    // Parsear medicamentos (intentar JSON, si falla usar texto plano)
    if (formData.medicamentosActuales) {
      try {
        const medicamentos = JSON.parse(formData.medicamentosActuales);
        if (Array.isArray(medicamentos)) {
          parsed.medicamentosActuales = medicamentos;
        }
      } catch {
        // Si no es JSON válido, mantener vacío
        parsed.medicamentosActuales = [];
      }
    }

    setMedicalData(parsed);
  }, [formData]);

  return medicalData;
}
