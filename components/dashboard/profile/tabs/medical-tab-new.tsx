"use client";

import { motion } from "framer-motion";
import { Edit2, Save, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TabComponentProps } from "../types";
import { useMedicalForm } from "@/hooks/useMedicalForm";
import { MedicalFormSection } from "./MedicalFormSection";
import { MedicalClinicalSection } from "./MedicalClinicalSection";

export function MedicalTabNew({
  formData,
  setFormData,
  isEditing,
  setIsEditing,
  handleSave,
}: TabComponentProps) {
  const {
    localData,
    isSaving,
    handleLocalSave,
    handleCancel,
    updateField,
  } = useMedicalForm(formData, setFormData);

  const handleSaveClick = async () => {
    const success = await handleLocalSave(handleSave);
    if (success) {
      setIsEditing(false);
    }
  };

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
            <Button 
              onClick={() => {
                handleCancel();
                setIsEditing(false);
              }} 
              variant="outline" 
              size="sm" 
              disabled={isSaving}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSaveClick} size="sm" disabled={isSaving}>
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
        <MedicalFormSection
          localData={localData as unknown as Record<string, unknown>}
          formData={formData as unknown as Record<string, unknown>}
          isEditing={isEditing}
          updateField={updateField}
        />
        <MedicalClinicalSection
          localData={localData as unknown as Record<string, unknown>}
          formData={formData as unknown as Record<string, unknown>}
          isEditing={isEditing}
          updateField={updateField}
        />
      </form>
    </motion.article>
  );
}
