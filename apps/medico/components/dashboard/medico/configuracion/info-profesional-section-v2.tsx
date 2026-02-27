/**
 * @file info-profesional-section-v2.tsx
 * @description Sección de información profesional con tabs modulares
 */

"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, Loader2, Check, X, Edit2, AlertCircle } from "lucide-react";
import { Button, Tabs, TabsContent, TabsList, TabsTrigger } from "@red-salud/design-system";
import { useProfessionalData } from "./hooks/use-professional-data";

// Importar tabs individuales
import { FormacionTab } from "./tabs/formacion-tab";
import { CertificacionesTab } from "./tabs/certificaciones-tab";
import { AtencionMedicaTab } from "./tabs/atencion-medica-tab";
import { ExperienciaTab } from "./tabs/experiencia-tab";
import { SegurosTab } from "./tabs/seguros-tab";
import { PresenciaDigitalTab } from "./tabs/presencia-digital-tab";

const TABS = [
  { value: "formacion", label: "Formación" },
  { value: "certificaciones", label: "Certificaciones" },
  { value: "atencion", label: "Áreas de Atención" },
  { value: "experiencia", label: "Experiencia" },
  { value: "seguros", label: "Seguros" },
  { value: "digital", label: "Presencia Digital" },
];

export function InfoProfesionalSectionV2() {
  const { data, loading, error, updateData, saveData } = useProfessionalData();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("formacion");

  /**
   * Guarda los cambios en la base de datos
   */
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    const result = await saveData(data);

    if (result.success) {
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      setSaveError(result.error || "Error al guardar");
      setTimeout(() => setSaveError(null), 5000);
    }

    setIsSaving(false);
  }, [data, saveData]);

  /**
   * Cancela la edición
   */
  const handleCancel = () => {
    setIsEditing(false);
    setSaveError(null);
    // Recargar datos originales
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
        <span className="ml-3 text-gray-600 dark:text-gray-400">
          Cargando información profesional...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900 dark:text-red-100">
              Error al cargar datos
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header con controles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Información Profesional
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Gestiona tu perfil profesional y credenciales
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <Button
                onClick={handleCancel}
                variant="outline"
                disabled={isSaving}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
            >
              <Edit2 className="h-4 w-4" />
              Editar
            </Button>
          )}
        </div>
      </div>

      {/* Mensajes de estado */}
      <AnimatePresence>
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl"
          >
            <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
              <Check className="h-5 w-5" />
              <span className="font-medium">Cambios guardados exitosamente</span>
            </div>
          </motion.div>
        )}

        {saveError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl"
          >
            <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">{saveError}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs de contenido */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-xl">
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-200"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="min-h-[400px]">
          <TabsContent value="formacion" className="mt-0">
            <FormacionTab
              data={data}
              isEditing={isEditing}
              onUpdate={updateData}
            />
          </TabsContent>

          <TabsContent value="certificaciones" className="mt-0">
            <CertificacionesTab
              data={data}
              isEditing={isEditing}
              onUpdate={updateData}
            />
           </TabsContent>

          <TabsContent value="atencion" className="mt-0">
            <AtencionMedicaTab
              data={data}
              isEditing={isEditing}
              onUpdate={updateData}
            />
          </TabsContent>

          <TabsContent value="experiencia" className="mt-0">
            <ExperienciaTab
              data={data}
              isEditing={isEditing}
              onUpdate={updateData}
            />
          </TabsContent>

          <TabsContent value="seguros" className="mt-0">
            <SegurosTab data={data} isEditing={isEditing} onUpdate={updateData} />
          </TabsContent>

          <TabsContent value="digital" className="mt-0">
            <PresenciaDigitalTab
              data={data}
              isEditing={isEditing}
              onUpdate={updateData}
            />
          </TabsContent>
        </div>
      </Tabs>
    </motion.div>
  );
}
