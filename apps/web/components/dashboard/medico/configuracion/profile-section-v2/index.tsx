/**
 * @file index.tsx
 * @description Versión 2.0 de la sección de perfil médico con diseño profesional
 * Layout de dos columnas con vista previa en vivo y gamificación
 * @module Dashboard/Medico/Configuracion/ProfileV2
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, Loader2, Sparkles, Eye, EyeOff } from "lucide-react";
import { Button } from "@red-salud/ui";
import { supabase } from "@/lib/supabase/client";
import { cn } from "@red-salud/core/utils";

// Componentes especializados
import { ProfileCompletionRing } from "./ProfileCompletionRing";
import { LiveProfilePreview } from "./LiveProfilePreview";
import { ProfessionalAvatarUpload } from "./ProfessionalAvatarUpload";
import { EnhancedBioEditor } from "./EnhancedBioEditor";
import { FieldWithContext } from "./FieldWithContext";
import { ProfileImpactMetrics } from "./ProfileImpactMetrics";
import { ProfileLevelBadge } from "./ProfileLevelBadge";

import type { ProfileData, ProfileCompleteness } from "./types";

/**
 * Sección de Perfil Médico V2 - Experiencia Profesional Premium
 */
export function ProfileSectionV2() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [profile, setProfile] = useState<ProfileData>({
    nombre_completo: "",
    email: "",
    telefono: "+58 ",
    cedula: "",
    especialidad: "",
    especialidades_adicionales: [],
    biografia: "",
    avatar_url: null,
    is_verified: false,
    especialidades_permitidas: [],
  });

  const [completeness, setCompleteness] = useState<ProfileCompleteness>({
    percentage: 0,
    level: "basic",
    missingFields: [],
    nextLevelRequirements: [],
  });

  /**
   * Calcula la completitud del perfil
   * Nota: Especialidades adicionales son opcionales y no afectan el 100%
   */
  const calculateCompleteness = useCallback((data: ProfileData): ProfileCompleteness => {
    const fields = {
      avatar_url: { weight: 20, label: "Foto profesional", required: true },
      nombre_completo: { weight: 10, label: "Nombre completo", required: true },
      email: { weight: 5, label: "Correo electrónico", required: true },
      telefono: { weight: 15, label: "Teléfono", required: true },
      cedula: { weight: 10, label: "Cédula", required: true },
      biografia: { weight: 40, label: "Biografía profesional", required: true },
      // Especialidades adicionales son opcionales (no requeridas para 100%)
      especialidades_adicionales: { weight: 0, label: "Especialidades adicionales", required: false },
    };

    let totalWeight = 0;
    const missing: string[] = [];

    Object.entries(fields).forEach(([key, config]) => {
      const value = data[key as keyof ProfileData];

      if (key === "biografia") {
        if (value && typeof value === "string" && value.length >= 150) {
          totalWeight += config.weight;
        } else if (config.required) {
          missing.push(config.label);
        }
      } else if (key === "especialidades_adicionales") {
        // Opcional: no suma al peso total ni se marca como faltante
        return;
      } else if (value) {
        totalWeight += config.weight;
      } else if (config.required) {
        missing.push(config.label);
      }
    });

    // Determinar nivel
    let level: "basic" | "complete" | "professional" | "elite" = "basic";
    if (totalWeight >= 95) level = "elite";
    else if (totalWeight >= 80) level = "professional";
    else if (totalWeight >= 60) level = "complete";

    // Requisitos para siguiente nivel
    const nextRequirements: string[] = [];
    if (level === "basic") {
      nextRequirements.push("Completa tu biografía (mín. 150 caracteres)");
      nextRequirements.push("Agrega una foto profesional");
    } else if (level === "complete") {
      nextRequirements.push("Agrega especialidades adicionales (opcional)");
      nextRequirements.push("Mejora tu biografía");
    } else if (level === "professional") {
      nextRequirements.push("Agrega especialidades adicionales (opcional)");
      nextRequirements.push("Mantén tu perfil actualizado");
    }

    return {
      percentage: totalWeight,
      level,
      missingFields: missing,
      nextLevelRequirements: nextRequirements,
    };
  }, []);

  /**
   * Carga el perfil del médico
   */
  const loadProfile = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      const { data: doctorData } = await supabase
        .from("doctor_details")
        .select(`
          *,
          especialidad:specialties!fk_doctor_specialty(id, name)
        `)
        .eq("profile_id", user.id)
        .single();

      // Extraer especialidades adicionales del SACS
      const sacsPostgrados = doctorData?.sacs_data?.postgrados || [];
      const especialidadesAdicionales = sacsPostgrados
        .map((pg: any) => pg.postgrado)
        .filter((pg: string) => pg !== doctorData?.sacs_data?.especialidad_display);

      const profileState: ProfileData = {
        nombre_completo: profileData?.nombre_completo || "",
        email: user.email || "",
        telefono: profileData?.telefono || "+58 ",
        cedula: profileData?.cedula || "",
        especialidad: doctorData?.especialidad?.name || "",
        especialidades_adicionales: especialidadesAdicionales,
        biografia: doctorData?.biografia || "",
        avatar_url: profileData?.avatar_url || null,
        is_verified: doctorData?.verified || false,
        especialidades_permitidas: [
          doctorData?.sacs_data?.especialidad_display,
          ...(doctorData?.sacs_data?.postgrados?.map((pg: any) => pg.postgrado) || [])
        ].filter(Boolean) || [],
      };

      setProfile(profileState);
      setCompleteness(calculateCompleteness(profileState));
    } catch (error) {
      console.error("[ProfileSectionV2] Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  }, [calculateCompleteness]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  /**
   * Actualiza el perfil y recalcula completitud
   */
  const updateProfile = (updates: Partial<ProfileData>) => {
    const newProfile = { ...profile, ...updates };
    setProfile(newProfile);
    setCompleteness(calculateCompleteness(newProfile));
  };

  /**
   * Guarda los cambios
   */
  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No hay usuario autenticado");

      // Actualizar perfil básico
      const profileUpdate: Record<string, any> = {
        telefono: profile.telefono,
      };

      if (!profile.is_verified) {
        profileUpdate.nombre_completo = profile.nombre_completo;
      }

      await supabase
        .from("profiles")
        .update(profileUpdate)
        .eq("id", user.id);

      // Preparar actualización de doctor_details
      const doctorUpdate: Record<string, any> = {
        biografia: profile.biografia,
      };

      // Solo actualizar especialidades si el médico NO está verificado con SACS
      if (!profile.is_verified) {
        // Buscar el ID de la especialidad principal
        if (profile.especialidad) {
          const { data: specialtyData } = await supabase
            .from("specialties")
            .select("id")
            .eq("name", profile.especialidad)
            .maybeSingle();

          if (specialtyData) {
            doctorUpdate.specialty_id = specialtyData.id;
          }
        }

        // Guardar especialidades adicionales
        if (profile.especialidades_adicionales?.length > 0) {
          doctorUpdate.subespecialidades = profile.especialidades_adicionales;
        } else {
          doctorUpdate.subespecialidades = [];
        }
      }

      // Actualizar detalles del médico
      await supabase
        .from("doctor_details")
        .update(doctorUpdate)
        .eq("profile_id", user.id);

      // Mostrar éxito
      // TODO: Agregar toast de éxito
    } catch (error) {
      console.error("[ProfileSectionV2] Error saving:", error);
      // TODO: Agregar toast de error
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950">
      <div className="container mx-auto px-4 py-8 max-w-[1600px]">
        {/* Header con Progress Ring */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 bg-white dark:bg-gray-900 rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-800">
            <div className="flex items-start sm:items-center gap-3 sm:gap-6 w-full lg:w-auto">
              <div className="flex-shrink-0">
                <ProfileCompletionRing
                  percentage={completeness.percentage}
                  level={completeness.level}
                  size="md"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1 truncate">
                  Configuración de Perfil Profesional
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  {completeness.missingFields.length === 0
                    ? "¡Tu perfil está completo! 🎉"
                    : `Completa ${completeness.missingFields.length} ${completeness.missingFields.length === 1 ? 'campo' : 'campos'} para mejorar tu visibilidad`}
                </p>
                {/* Mostrar campos faltantes */}
                {completeness.missingFields.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {completeness.missingFields.slice(0, 3).map((field, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                      >
                        {field}
                      </span>
                    ))}
                    {completeness.missingFields.length > 3 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                        +{completeness.missingFields.length - 3} más
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
              <ProfileLevelBadge level={completeness.level} />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="lg:hidden"
              >
                {showPreview ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Ocultar Preview
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Preview
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Layout de Dos Columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Columna Izquierda: Formulario */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-7 space-y-6"
          >
            {/* Avatar Upload */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-800">
              <ProfessionalAvatarUpload
                currentUrl={profile.avatar_url}
                onUpload={(url) => updateProfile({ avatar_url: url })}
                userName={profile.nombre_completo}
              />
            </div>

            {/* Información Básica */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
                Información Básica
              </h3>
              <div className="space-y-4">
                <FieldWithContext
                  label="Nombre Completo"
                  value={profile.nombre_completo}
                  onChange={(value) => updateProfile({ nombre_completo: value })}
                  locked={profile.is_verified}
                  verified={profile.is_verified}
                  contextInfo={
                    profile.is_verified
                      ? "Este campo está vinculado a tu verificación SACS y no puede ser modificado para mantener la integridad de tu identidad profesional."
                      : "Tu nombre completo tal como aparece en tus documentos oficiales."
                  }
                  impact="Los pacientes verán este nombre en tu perfil público"
                />

                <FieldWithContext
                  label="Correo Electrónico"
                  value={profile.email}
                  type="email"
                  locked
                  contextInfo="El correo electrónico no puede modificarse por razones de seguridad. Es tu identificador único en la plataforma."
                />

                <FieldWithContext
                  label="Teléfono"
                  value={profile.telefono}
                  onChange={(value) => updateProfile({ telefono: value })}
                  type="phone"
                  contextInfo="Número de contacto para que los pacientes puedan comunicarse contigo."
                  impact="Los pacientes podrán contactarte directamente (+40% de conversión)"
                />

                <FieldWithContext
                  label="Cédula"
                  value={profile.cedula}
                  locked
                  verified={profile.is_verified}
                  contextInfo={
                    profile.is_verified
                      ? "Tu cédula fue verificada exitosamente mediante el sistema SACS. Este campo no puede ser modificado."
                      : "Tu número de cédula de identidad."
                  }
                />
              </div>
            </div>

            {/* Especialidades */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
                Especialidades Médicas
              </h3>
              <div className="space-y-4">
                <FieldWithContext
                  label="Especialidad Principal"
                  value={profile.especialidad}
                  onChange={(value) => updateProfile({ especialidad: value })}
                  type="specialty"
                  locked={profile.is_verified}
                  verified={profile.is_verified}
                  allowedValues={profile.especialidades_permitidas}
                  contextInfo={
                    profile.is_verified
                      ? "Esta especialidad fue verificada automáticamente mediante el sistema SACS (Sistema de Acreditación de Colegios de Salud). Las especialidades verificadas no pueden ser modificadas manualmente para garantizar la autenticidad de tu perfil profesional."
                      : "Selecciona tu especialidad médica principal. Una vez verificada mediante SACS, este campo quedará bloqueado."
                  }
                  impact="Define tu área principal de práctica y mejora tu visibilidad en búsquedas específicas"
                />

                <FieldWithContext
                  label="Especialidades Adicionales"
                  value={profile.especialidades_adicionales}
                  onChange={(value) => updateProfile({ especialidades_adicionales: value })}
                  type="multi-specialty"
                  locked={profile.is_verified && profile.especialidades_adicionales.length > 0}
                  verified={profile.is_verified && profile.especialidades_adicionales.length > 0}
                  contextInfo={
                    profile.is_verified && profile.especialidades_adicionales.length > 0
                      ? "Estas especialidades fueron verificadas automáticamente mediante el sistema SACS. Corresponden a los postgrados registrados en tu perfil profesional."
                      : "Puedes agregar especialidades adicionales para ampliar tu alcance. Si tienes postgrados verificados en SACS, aparecerán automáticamente aquí."
                  }
                  impact="Aumenta tu visibilidad en más búsquedas (+30% de alcance) - Campo opcional"
                />
              </div>
            </div>

            {/* Biografía */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-800">
              <EnhancedBioEditor
                value={profile.biografia}
                onChange={(value) => updateProfile({ biografia: value })}
                specialty={profile.especialidad}
                doctorName={profile.nombre_completo}
              />
            </div>

            {/* Botón Guardar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6"
            >
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">
                    {saving ? "Guardando cambios..." : "Cambios sin guardar"}
                  </p>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    size="lg"
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
              </div>
            </motion.div>
          </motion.div>

          {/* Columna Derecha: Vista Previa */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className={cn(
              "lg:col-span-5 space-y-6",
              !showPreview && "hidden lg:block"
            )}
          >
            <div className="lg:sticky lg:top-6 space-y-6">
              {/* Vista Previa en Vivo */}
              <LiveProfilePreview profile={profile} />

              {/* Métricas de Impacto */}
              <ProfileImpactMetrics
                completeness={completeness}
                profile={profile}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
