"use client";

import { motion } from "framer-motion";
import { Edit2, Save, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TabComponentProps } from "../types";
import { useState, useEffect } from "react";
import type { Medication } from "../components/medication-input-improved";
import { useImcCalculation } from "./hooks/use-imc-calculation";
import { useMedicalDataParsing } from "./hooks/use-medical-data-parsing";
import { VitalDataSection } from "./components/vital-data-section";
import { LifestyleHabitsSection } from "./components/lifestyle-habits-section";
import { WomenHealthSection } from "./components/women-health-section";
import { ClinicalInfoSection } from "./components/clinical-info-section";

export function MedicalTabImproved({
  formData,
  setFormData,
  isEditing,
  setIsEditing,
  handleSave,
}: TabComponentProps) {
  const [localData, setLocalData] = useState(formData);
  const [isSaving, setIsSaving] = useState(false);

  // Datos médicos parseados
  const medicalData = useMedicalDataParsing(formData);
  const [alergiasMedicamentos, setAlergiasMedicamentos] = useState(
    medicalData.alergiasMedicamentos
  );
  const [alergiasAlimentarias, setAlergiasAlimentarias] = useState(
    medicalData.alergiasAlimentarias
  );
  const [otrasAlergias, setOtrasAlergias] = useState(medicalData.otrasAlergias);
  const [condicionesCronicas, setCondicionesCronicas] = useState(
    medicalData.condicionesCronicas
  );
  const [medicamentosActuales, setMedicamentosActuales] = useState<Medication[]>(
    medicalData.medicamentosActuales
  );

  useEffect(() => {
    setLocalData(formData);
  }, [formData]);

  useEffect(() => {
    setAlergiasMedicamentos(medicalData.alergiasMedicamentos);
    setAlergiasAlimentarias(medicalData.alergiasAlimentarias);
    setOtrasAlergias(medicalData.otrasAlergias);
    setCondicionesCronicas(medicalData.condicionesCronicas);
    setMedicamentosActuales(medicalData.medicamentosActuales);
  }, [medicalData]);

  const handleLocalSave = async () => {
    setIsSaving(true);
    try {
      // Preparar datos para guardar
      const dataToSave = {
        ...localData,
        alergias: alergiasMedicamentos.join(", "),
        alergiasAlimentarias: alergiasAlimentarias.join(", "),
        otrasAlergias: otrasAlergias.join(", "),
        condicionesCronicas: condicionesCronicas.join(", "),
        medicamentosActuales: JSON.stringify(medicamentosActuales),
      };

      const result = await handleSave(dataToSave);
      if (result.success) {
        setFormData(dataToSave);
      } else {
        throw new Error(result.error || "Error al guardar");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setLocalData(formData);
    setIsEditing(false);
  };

  const esMujer = localData.sexoBiologico === "femenino";

  return (
    <motion.article
      key="medical"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      <header className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Información Médica
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Información confidencial visible solo para profesionales autorizados
          </p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
            <Edit2 className="h-4 w-4 mr-2" />
            Editar
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleCancel} variant="outline" size="sm" disabled={isSaving}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleLocalSave} size="sm" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </>
              )}
            </Button>
          </div>
        )}
      </header>

      <form className="grid grid-cols-2 gap-6">
        {/* Columna Izquierda */}
        <VitalDataSection
          isEditing={isEditing}
          localData={localData}
          setLocalData={setLocalData}
          formData={formData}
        />

        {/* Hábitos */}
        <LifestyleHabitsSection
          isEditing={isEditing}
          localData={localData}
          setLocalData={setLocalData}
          formData={formData}
        />

        {/* Información específica para mujeres */}
        {esMujer && (
          <WomenHealthSection
            isEditing={isEditing}
            localData={localData}
            setLocalData={setLocalData}
            formData={formData}
          />
        )}

        {/* Columna Derecha */}
        <ClinicalInfoSection
          isEditing={isEditing}
          alergiasMedicamentos={alergiasMedicamentos}
          setAlergiasMedicamentos={setAlergiasMedicamentos}
          alergiasAlimentarias={alergiasAlimentarias}
          setAlergiasAlimentarias={setAlergiasAlimentarias}
          otrasAlergias={otrasAlergias}
          setOtrasAlergias={setOtrasAlergias}
          condicionesCronicas={condicionesCronicas}
          setCondicionesCronicas={setCondicionesCronicas}
          medicamentosActuales={medicamentosActuales}
          setMedicamentosActuales={setMedicamentosActuales}
        />
      </form>
    </motion.article>
  );
}
