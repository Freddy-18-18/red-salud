/**
 * @file use-professional-data.ts
 * @description Hook para gestionar datos profesionales del médico
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import type { ProfessionalData } from "../types/professional-types";

const INITIAL_DATA: ProfessionalData = {
  universidad: "",
  numero_colegio: "",
  matricula: "",
  anio_graduacion: null,
  anios_experiencia: 0,
  certificaciones: [],
  subespecialidades: "",
  premios: [],
  publicaciones: [],
  asociaciones: [],
  condiciones_tratadas: [],
  idiomas: ["Español"],
  grupos_edad: [],
  experiencia_laboral: [],
  seguros_aceptados: [],
  redes_sociales: {},
  website: "",
};

export function useProfessionalData() {
  const [data, setData] = useState<ProfessionalData>(INITIAL_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Carga datos del perfil profesional
   */
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuario no autenticado");
      }

      // Query a doctor_details (tabla correcta en la base de datos)
      const { data: profile, error: profileError } = await supabase
        .from("doctor_details")
        .select("*")
        .eq("profile_id", user.id)
        .maybeSingle();

      if (profileError && profileError.code !== "PGRST116") {
        console.error("Supabase error:", profileError);
        throw new Error(`Error al cargar perfil: ${profileError.message}`);
      }

      if (!profile) {
        console.warn("No se encontró perfil de doctor para el usuario:", user.id);
        // Mantener datos iniciales si no hay perfil
        return;
      }

      // Obtener matrícula del perfil de usuario
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("sacs_matricula, licencia_medica")
        .eq("id", user.id)
        .maybeSingle();

      const matriculaSacs =
        userProfile?.sacs_matricula ||
        userProfile?.licencia_medica ||
        profile.licencia_medica ||
        "";

      // Mapeo seguro de campos con retrocompatibilidad
      setData({
        universidad: profile.university || "",
        numero_colegio: profile.college_number || "",
        matricula: matriculaSacs,
        anio_graduacion: profile.graduation_year || null,
        anios_experiencia: profile.anos_experiencia || 0,
        
        // Certificaciones
        certificaciones: Array.isArray(profile.certificaciones)
          ? profile.certificaciones
          : [],
        
        // Subespecialidades
        subespecialidades: Array.isArray(profile.subespecialidades)
          ? profile.subespecialidades.join(", ")
          : Array.isArray(profile.specialization_areas)
          ? profile.specialization_areas.join(", ")
          : "",
        
        // Campos nuevos (pueden no existir hasta ejecutar migración)
        premios: Array.isArray(profile.awards) ? profile.awards : [],
        publicaciones: Array.isArray(profile.publications)
          ? profile.publications
          : [],
        asociaciones: Array.isArray(profile.associations)
          ? profile.associations
          : [],
        condiciones_tratadas: Array.isArray(profile.conditions_treated)
          ? profile.conditions_treated
          : [],
        grupos_edad: Array.isArray(profile.age_groups)
          ? profile.age_groups
          : [],
        experiencia_laboral: Array.isArray(profile.work_experience)
          ? profile.work_experience
          : [],
        
        // Idiomas - puede venir como array
        idiomas: Array.isArray(profile.languages)
          ? profile.languages.map((lang: string) => {
              // Mapear códigos ISO a nombres completos si es necesario
              const langMap: Record<string, string> = {
                es: "Español", en: "Inglés", pt: "Portugués", fr: "Francés",
              };
              return langMap[lang] || lang;
            })
          : Array.isArray(profile.idiomas)
          ? profile.idiomas
          : ["Español"],
        
        // Seguros - mapear desde insurance_providers o accepted_insurances
        seguros_aceptados: Array.isArray(profile.accepted_insurances)
          ? profile.accepted_insurances
          : Array.isArray(profile.insurance_providers)
          ? profile.insurance_providers.map((name: string) => ({
              name,
              plans: [],
              copay_info: "",
            }))
          : [],
        
        // Redes sociales
        redes_sociales: (profile.social_media as Record<string, string>) || {},
        website: profile.website || "",
      });

      console.log("✅ Datos profesionales cargados correctamente");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      console.error("❌ Error loading professional data:", errorMessage, err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Guarda cambios en la base de datos
   */
  const saveData = useCallback(async (updatedData: ProfessionalData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuario no autenticado");
      }

      // Mapear idiomas a códigos ISO si es necesario
      const languageCodes = updatedData.idiomas.map((lang) => {
        const reverseMap: Record<string, string> = {
          Español: "es",
          Inglés: "en",
          Portugués: "pt",
          Francés: "fr",
        };
        return reverseMap[lang] || lang.toLowerCase().slice(0, 2);
      });

      // Construir objeto de actualización solo con campos que existen
      const updatePayload: any = {
        anos_experiencia: updatedData.anios_experiencia,
        certificaciones: updatedData.certificaciones,
        updated_at: new Date().toISOString(),
      };

      // Agregar campos opcionales
      if (updatedData.universidad) updatePayload.university = updatedData.universidad;
      if (updatedData.numero_colegio) updatePayload.college_number = updatedData.numero_colegio;
      if (updatedData.anio_graduacion) updatePayload.graduation_year = updatedData.anio_graduacion;
      if (updatedData.matricula) updatePayload.licencia_medica = updatedData.matricula;
      
      // Campos nuevos (recién agregados)
      updatePayload.awards = updatedData.premios;
      updatePayload.publications = updatedData.publicaciones;
      updatePayload.associations = updatedData.asociaciones;
      updatePayload.conditions_treated = updatedData.condiciones_tratadas;
      updatePayload.age_groups = updatedData.grupos_edad;
      updatePayload.work_experience = updatedData.experiencia_laboral;
      updatePayload.accepted_insurances = updatedData.seguros_aceptados;
      updatePayload.social_media = updatedData.redes_sociales;
      updatePayload.website = updatedData.website;
      
      // Idiomas
      updatePayload.languages = updatedData.idiomas;
      updatePayload.idiomas = updatedData.idiomas;
      
      // Subespecialidades
      if (updatedData.subespecialidades) {
        updatePayload.subespecialidades = updatedData.subespecialidades
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }

      console.log("💾 Guardando datos profesionales...", updatePayload);

      const { error: saveError } = await supabase
        .from("doctor_details")
        .update(updatePayload)
        .eq("profile_id", user.id)
        .select();

      if (saveError) {
        console.error("❌ Error al guardar:", saveError);
        throw new Error(`Error al guardar: ${saveError.message}`);
      }

      setData(updatedData);
      console.log("✅ Datos guardados exitosamente");
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al guardar";
      console.error("❌ Error saving professional data:", errorMessage, err);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }, []);

  /**
   * Actualiza datos localmente (sin guardar en DB)
   */
  const updateData = useCallback((updates: Partial<ProfessionalData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    updateData,
    saveData,
    reloadData: loadData,
  };
}
