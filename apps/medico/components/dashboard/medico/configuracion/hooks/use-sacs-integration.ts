/**
 * @file use-sacs-integration.ts
 * @description Hook para integración con SACS y verificación automática
 */

import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Certification, SacsDataResult } from "../types/professional-types";

export function useSacsIntegration() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Obtiene certificaciones verificadas desde SACS
   */
  const fetchSacsCertifications = useCallback(async (): Promise<SacsDataResult> => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuario no autenticado");
      }

      // Obtener datos de verificación SACS del perfil
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("sacs_matricula, sacs_verificado, sacs_response_data")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      if (!profile?.sacs_verificado) {
        return {
          success: false,
          error: "Perfil no verificado por SACS",
        };
      }

      // Parsear datos de respuesta SACS si existen
      const sacsData = profile.sacs_response_data as any;
      const certificaciones: Certification[] = [];

      // Extraer certificaciones del response SACS
      if (sacsData?.educacion) {
        sacsData.educacion.forEach((edu: any, index: number) => {
          certificaciones.push({
            id: `sacs-${index}`,
            name: edu.titulo || edu.nombre || "Certificación SACS",
            institution: edu.institucion || "Institución verificada por SACS",
            year: edu.anio || new Date().getFullYear(),
            verified_by_sacs: true,
            created_at: new Date().toISOString(),
          });
        });
      }

      // Si no hay datos estructurados, crear una certificación genérica
      if (certificaciones.length === 0 && profile.sacs_matricula) {
        certificaciones.push({
          id: "sacs-main",
          name: "Médico Cirujano Verificado",
          institution: "Verificado por SACS (MPPS)",
          year: new Date().getFullYear(),
          verified_by_sacs: true,
          created_at: new Date().toISOString(),
        });
      }

      return {
        success: true,
        data: {
          certificaciones,
          matricula: profile.sacs_matricula || "",
          universidad: sacsData?.universidad,
        },
      };
    } catch (err) {
      console.error("Error fetching SACS data:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Error al obtener datos de SACS";
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Sincroniza certificaciones SACS con el perfil del médico
   */
  const syncSacsCertifications = useCallback(
    async (existingCertifications: Certification[]): Promise<Certification[]> => {
      const result = await fetchSacsCertifications();

      if (!result.success || !result.data) {
        return existingCertifications;
      }

      // Filtrar certificaciones existentes que no son de SACS
      const nonSacsCerts = existingCertifications.filter(
        (cert) => !cert.verified_by_sacs
      );

      // Combinar con las nuevas de SACS
      return [...result.data.certificaciones, ...nonSacsCerts];
    },
    [fetchSacsCertifications]
  );

  return {
    fetchSacsCertifications,
    syncSacsCertifications,
    loading,
    error,
  };
}
