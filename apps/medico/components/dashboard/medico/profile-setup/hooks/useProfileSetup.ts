"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { resolveSacsToSlug } from "@/lib/supabase/services/sacs-mapping-service";

export interface Specialty {
  id: string;
  name: string;
  slug?: string | null;
  description: string | undefined;
  active: boolean;
}

export interface VerificationResult {
  success: boolean;
  verified: boolean;
  data?: {
    cedula: string;
    tipo_documento: string;
    nombre_completo: string;
    profesion_principal: string;
    matricula_principal: string;
    especialidad_display: string;
    es_medico_humano: boolean;
    es_veterinario: boolean;
    tiene_postgrados: boolean;
    profesiones: Array<{
      profesion: string;
      matricula: string;
      especialidad?: string;
    }>;
    postgrados: Array<{
      titulo: string;
      institucion: string;
      fecha: string;
    }>;
  };
  message: string;
  razon_rechazo?: string;
  error?: string;
}

export function useProfileSetup() {
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [cedula, setCedula] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState<"V" | "E">("V");
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [verifying, setVerifying] = useState(false);

  const [specialties, setSpecialties] = useState<Specialty[]>([]);

  useEffect(() => {
    checkAuth();
    loadSpecialties();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setUserId(user.id);
  };

  const loadSpecialties = async () => {
    const { data, error } = await supabase
      .from("specialties")
      .select("*")
      .eq("active", true)
      .order("name");
    if (!error && data) {
      setSpecialties(data);
    }
  };

  const handleVerifySACS = async () => {
    if (!cedula || cedula.length < 6) return;
    setVerifying(true);
    setVerificationResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("verify-doctor-sacs", {
        body: { cedula, tipo_documento: tipoDocumento, user_id: userId },
      });

      if (error) {
        const status = (error as { context?: { status?: number } } | null)?.context?.status;
        const maybeMessage =
          (data as { message?: string; error?: string } | null)?.message ||
          (data as { message?: string; error?: string } | null)?.error ||
          (error as { message?: string } | null)?.message ||
          "Error al verificar con SACS";

        throw new Error(status ? `[${status}] ${maybeMessage}` : maybeMessage);
      }

      if (!data) {
        throw new Error("Respuesta vacía del servicio de verificación");
      }

      setVerificationResult(data as VerificationResult);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al verificar con SACS";
      setVerificationResult({
        success: false,
        verified: false,
        error: errorMessage,
        message: errorMessage,
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleCompleteSetup = async () => {
    if (!verificationResult?.verified) return;

    setLoading(true);
    try {
      console.log("[ProfileSetup] Starting setup for user:", userId);
      console.log("[ProfileSetup] Verification result:", verificationResult);

      // Resolver especialidad automáticamente basado en SACS (FUENTE DE VERDAD)
      // 1) Usar mapeo SACS → slug (tabla sacs_specialty_mapping)
      // 2) Convertir slug → specialty.id (tabla specialties)
      // 3) Fallback: match por nombre (legacy) para no romper si falta un mapping
      const especialidadSACS = verificationResult.data?.especialidad_display || "";
      console.log("[ProfileSetup] SACS Specialty:", especialidadSACS);

      let especialidadId: string | null = null;
      let resolvedSlug: string | null = null;

      if (especialidadSACS.trim()) {
        const resolution = await resolveSacsToSlug(especialidadSACS);
        resolvedSlug = resolution.slug;
        console.log("[ProfileSetup] Resolved slug:", resolvedSlug);

        if (resolvedSlug) {
          // Try from preloaded specialties first
          const bySlug = specialties.find((s) => s.slug === resolvedSlug);
          if (bySlug) {
            especialidadId = bySlug.id;
          } else {
            // Fallback query (in case specialties list isn't loaded / active filter excluded it)
            const { data: specialtyRow, error: specialtyErr } = await supabase
              .from("specialties")
              .select("id")
              .eq("slug", resolvedSlug)
              .maybeSingle();

            if (!specialtyErr && specialtyRow?.id) {
              especialidadId = specialtyRow.id as string;
            }
          }
        }
      }

      console.log("[ProfileSetup] Especialidad ID from Slug:", especialidadId);

      if (!especialidadId) {
        // Legacy fallback: attempt to match by display name
        const match = specialties.find((s: Specialty) => {
          const left = (s.name || "").toUpperCase();
          const right = (especialidadSACS || "").toUpperCase();
          return left.includes(right) || right.includes(left);
        });

        especialidadId = match ? match.id : null;
        console.log("[ProfileSetup] Especialidad ID from Fallback:", especialidadId);
      }

      if (!especialidadId) {
        const extra = resolvedSlug ? ` (slug resuelto: ${resolvedSlug})` : "";
        throw new Error(
          `No se pudo mapear la especialidad de SACS: "${especialidadSACS}"${extra}. ` +
          "Por favor usa la verificación manual o contacta soporte para agregar el mapping."
        );
      }

      console.log("[ProfileSetup] Upserting doctor details:", {
        profile_id: userId,
        especialidad_id: especialidadId,
        licencia: verificationResult?.data?.matricula_principal
      });

      const { error: profileError } = await supabase
        .from("doctor_details")
        .upsert({
          profile_id: userId,
          especialidad_id: especialidadId,
          licencia_medica: verificationResult?.data?.matricula_principal,
          // Si valida por SACS, se aprueba inmediatamente.
          verified: true,
          sacs_verified: true,
          sacs_data: verificationResult?.data,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'profile_id' });

      if (profileError) {
        console.error("Error creating/updating doctor profile:", profileError);
        throw new Error(profileError.message || "Error al crear perfil de médico");
      }

      // Verify the save worked
      const { data: verifySave } = await supabase
        .from("doctor_details")
        .select("especialidad_id")
        .eq("profile_id", userId)
        .single();

      if (!verifySave?.especialidad_id) {
        console.error("[ProfileSetup] CRITICAL: Especialidad ID wasn't saved!", verifySave);
        // Try one more time with explicit update if upsert failed to set it (rare edge case)
        await supabase
          .from("doctor_details")
          .update({ especialidad_id: especialidadId })
          .eq("profile_id", userId);
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          nombre_completo: verificationResult?.data?.nombre_completo,
          cedula: verificationResult?.data?.cedula,
          cedula_verificada: true,
          sacs_verificado: true,
          sacs_nombre: verificationResult?.data?.nombre_completo,
          sacs_matricula: verificationResult?.data?.matricula_principal,
          sacs_especialidad: verificationResult?.data?.especialidad_display,
          sacs_fecha_verificacion: new Date().toISOString(),
        })
        .eq("id", userId);
      if (updateError) throw new Error(updateError.message || "Error al actualizar perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteManual = async (data: {
    nombre_completo: string;
    cedula: string;
    tipo_documento: string;
    especialidad_id: string;
  }) => {
    setLoading(true);
    try {
      const { error: profileError } = await supabase
        .from("doctor_details")
        .upsert({
          profile_id: userId,
          especialidad_id: data.especialidad_id,
          licencia_medica: null, // No tiene matrícula SACS
          verified: false, // Pendiente de verificación manual
          sacs_verified: false,
          sacs_data: null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'profile_id' });

      if (profileError) {
        console.error("Error creating/updating manual doctor profile:", profileError);
        throw new Error(profileError.message || "Error al crear perfil de médico");
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          nombre_completo: data.nombre_completo,
          cedula: data.cedula,
          cedula_verificada: false, // Pendiente de verificación
          sacs_verificado: false,
        })
        .eq("id", userId);
      if (updateError) throw new Error(updateError.message || "Error al actualizar perfil");

      // Obtener el email del perfil para incluirlo en el ticket
      const { data: profileData } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", userId)
        .single();

      // Obtener el nombre de la especialidad
      const selectedSpecialty = specialties.find(s => s.id === data.especialidad_id);

      // Crear ticket de verificación para la app corporativa
      const { error: ticketError } = await supabase
        .from("support_tickets")
        .insert({
          name: data.nombre_completo,
          email: profileData?.email || "sin-email@registro-manual.com",
          phone: null,
          subject: "Verificación de profesional de salud",
          ticket_type: "verification_medico",
          priority: "alta",
          status: "NUEVO",
          created_by: userId,
          message: `Solicitud de verificación manual de profesional de salud.\n\nNo se encuentra registrado en el sistema SACS.`,
          metadata: {
            tipo_solicitud: "verificacion_manual",
            tipo_profesional: "medico",
            cedula: `${data.tipo_documento}-${data.cedula}`,
            especialidad: selectedSpecialty?.name || "No especificada",
            especialidad_id: data.especialidad_id,
            profile_id: userId,
            fecha_solicitud: new Date().toISOString(),
            requiere_documentos: true,
            documentos_pendientes: [
              "Cédula de identidad (ambas caras)",
              "Título profesional",
              "Certificado de registro profesional",
              "Constancia de experiencia laboral"
            ]
          }
        });

      if (ticketError) {
        console.error("Error creando ticket de verificación:", ticketError);
        // No lanzamos error para no bloquear el flujo principal
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    state: {
      loading,
      userId,
      cedula,
      tipoDocumento,
      verificationResult,
      verifying,
      specialties,
    },
    actions: {
      setCedula,
      setTipoDocumento,
      handleVerifySACS,
      handleCompleteSetup,
      handleCompleteManual,
    },
  };
}

