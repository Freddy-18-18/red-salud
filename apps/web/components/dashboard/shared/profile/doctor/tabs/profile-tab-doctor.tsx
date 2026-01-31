"use client";

import { motion } from "framer-motion";
import { Pen, Save, X } from "lucide-react";
import { Button } from "@red-salud/ui";
import { Label } from "@red-salud/ui";
import { Input } from "@red-salud/ui";
import type { DoctorProfileData } from "../../types";
import { useState } from "react";

interface ProfileTabDoctorProps {
  formData: DoctorProfileData;
  setFormData: (data: DoctorProfileData) => void;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  handleSave: () => Promise<{ success: boolean; error?: string }>;
}

export function ProfileTabDoctor({
  formData,
  setFormData,
  isEditing,
  setIsEditing,
  handleSave,
}: ProfileTabDoctorProps) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación de teléfono
    if (!formData.telefono || formData.telefono.trim() === "") {
      alert("Por favor ingresa tu número de teléfono");
      return;
    }

    setIsSaving(true);
    const result = await handleSave();
    setIsSaving(false);
    
    if (!result.success && result.error) {
      alert(`Error: ${result.error}`);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Revertir cambios si es necesario
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <header className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Información Profesional
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Mantén actualizada tu información de contacto y credenciales
          </p>
        </div>
        {!isEditing && (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <Pen className="h-4 w-4 mr-2" />
            Editar
          </Button>
        )}
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
        <fieldset className="space-y-5">
          <legend className="sr-only">Información básica</legend>

          <div>
            <Label htmlFor="nombre">Nombre Completo *</Label>
            {isEditing ? (
              <Input
                id="nombre"
                value={formData.nombre_completo || ""}
                onChange={(e) =>
                  setFormData({ ...formData, nombre_completo: e.target.value })
                }
                required
              />
            ) : (
              <p className="text-base font-medium text-gray-900 mt-1">
                {formData.nombre_completo || "No especificado"}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Correo Electrónico</Label>
            <p className="text-base font-medium text-gray-900 mt-1">
              {formData.email || "No especificado"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Modifica tu email en la sección de Seguridad
            </p>
          </div>

          <div>
            <Label htmlFor="telefono">Teléfono *</Label>
            {isEditing ? (
              <Input
                id="telefono"
                type="tel"
                placeholder="Ej: +58 412-1234567"
                value={formData.telefono || ""}
                onChange={(e) =>
                  setFormData({ ...formData, telefono: e.target.value })
                }
                required
              />
            ) : (
              <p className="text-base font-medium text-gray-900 mt-1">
                {formData.telefono || "No especificado"}
              </p>
            )}
            {!formData.telefono && !isEditing && (
              <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                <span>⚠</span> Por favor agrega tu teléfono de contacto
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="cedula">Cédula de Identidad *</Label>
            <p className="text-base font-medium text-gray-900 mt-1">
              {formData.cedula || "No especificado"}
            </p>
          </div>
        </fieldset>

        <fieldset className="space-y-5">
          <legend className="sr-only">Información profesional</legend>

          <div>
            <Label htmlFor="mpps">Matrícula Profesional (MPPS) *</Label>
            <p className="text-base font-medium text-gray-900 mt-1">
              {formData.mpps || "No especificado"}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Verificado por SACS
              </span>
            </div>
          </div>

          <div>
            <Label htmlFor="especialidad">Especialidad *</Label>
            <p className="text-base font-medium text-gray-900 mt-1">
              {formData.especialidad || "No especificado"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Para cambiar tu especialidad, contacta a soporte
            </p>
          </div>

          <div>
            <Label htmlFor="universidad">Universidad</Label>
            {isEditing ? (
              <Input
                id="universidad"
                value={formData.universidad || ""}
                onChange={(e) =>
                  setFormData({ ...formData, universidad: e.target.value })
                }
                placeholder="Ej: Universidad Central de Venezuela"
              />
            ) : (
              <p className="text-base font-medium text-gray-900 mt-1">
                {formData.universidad || "No especificado"}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="anos_experiencia">Años de Experiencia *</Label>
            {isEditing ? (
              <Input
                id="anos_experiencia"
                type="number"
                min="0"
                max="60"
                value={formData.anos_experiencia || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    anos_experiencia: parseInt(e.target.value) || 0,
                  })
                }
              />
            ) : (
              <p className="text-base font-medium text-gray-900 mt-1">
                {formData.anos_experiencia || "0"} años
              </p>
            )}
          </div>
        </fieldset>

        {isEditing && (
          <div className="col-span-2 flex gap-3 justify-end pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        )}
      </form>


    </motion.article>
  );
}
