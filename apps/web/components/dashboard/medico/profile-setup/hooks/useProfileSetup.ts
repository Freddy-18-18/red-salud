"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export interface Specialty {
  id: string;
  name: string;
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
  const [yearsExperience, setYearsExperience] = useState("");

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
      if (error) throw error instanceof Error ? error : new Error(String(error));
      setVerificationResult(data as VerificationResult);
    } catch (err) {
      setVerificationResult({
        success: false,
        verified: false,
        error: err instanceof Error ? err.message : "Error al verificar con SACS",
        message: "No se pudo conectar con el servicio de verificación. Por favor intenta más tarde.",
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleCompleteSetup = async () => {
    if (!verificationResult?.verified) return;
    if (!yearsExperience) return;
    
    setLoading(true);
    try {
      // Buscar especialidad automáticamente basado en SACS
      const especialidadSACS = verificationResult.data?.especialidad_display || "";
      const match = specialties.find(
        (s: Specialty) => 
          s.name.toUpperCase().includes(especialidadSACS.toUpperCase()) ||
          especialidadSACS.toUpperCase().includes(s.name.toUpperCase())
      );
      
      const especialidadId = match ? match.id : null;
      
      if (!especialidadId) {
        throw new Error("No se pudo encontrar la especialidad en el sistema");
      }

      const { error: profileError } = await supabase
        .from("doctor_details")
        .insert({
          profile_id: userId,
          especialidad_id: especialidadId,
          licencia_medica: verificationResult?.data?.matricula_principal,
          anos_experiencia: parseInt(yearsExperience),
          verified: true,
          sacs_verified: true,
          sacs_data: verificationResult?.data,
        })
        .select()
        .single();
      if (profileError) throw new Error(profileError.message || "Error al crear perfil de médico");

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
    anos_experiencia: number;
  }) => {
    setLoading(true);
    try {
      const { error: profileError } = await supabase
        .from("doctor_details")
        .insert({
          profile_id: userId,
          especialidad_id: data.especialidad_id,
          licencia_medica: null, // No tiene matrícula SACS
          anos_experiencia: data.anos_experiencia,
          verified: false, // Pendiente de verificación manual
          sacs_verified: false,
          sacs_data: null,
        })
        .select()
        .single();
      if (profileError) throw new Error(profileError.message || "Error al crear perfil de médico");

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
            anos_experiencia: data.anos_experiencia,
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
      yearsExperience,
    },
    actions: {
      setCedula,
      setTipoDocumento,
      setYearsExperience,
      handleVerifySACS,
      handleCompleteSetup,
      handleCompleteManual,
    },
  };
}

