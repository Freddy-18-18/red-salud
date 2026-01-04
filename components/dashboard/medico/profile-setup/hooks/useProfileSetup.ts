"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

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
    profesiones: any[];
    postgrados: any[];
  };
  message: string;
  razon_rechazo?: string;
  error?: string;
}

export function useProfileSetup() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [cedula, setCedula] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState<"V" | "E">("V");
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [verifying, setVerifying] = useState(false);

  const [specialtyId, setSpecialtyId] = useState("");
  const [specialties, setSpecialties] = useState<any[]>([]);
  const [filteredSpecialties, setFilteredSpecialties] = useState<any[]>([]);
  const [specialtySearch, setSpecialtySearch] = useState("");
  const [recommendedSpecialty, setRecommendedSpecialty] = useState<any>(null);
  const [licenseNumber, setLicenseNumber] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    checkAuth();
    loadSpecialties();
  }, []);

  useEffect(() => {
    if (!specialtySearch.trim()) {
      setFilteredSpecialties(specialties);
      return;
    }
    const query = specialtySearch.toLowerCase();
    const filtered = specialties.filter((specialty: any) =>
      specialty.name.toLowerCase().includes(query) ||
      specialty.description?.toLowerCase().includes(query)
    );
    setFilteredSpecialties(filtered);
  }, [specialtySearch, specialties]);

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
      setFilteredSpecialties(data);
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
      if (error) throw error as any;
      setVerificationResult(data as VerificationResult);
      if ((data as VerificationResult).verified && (data as VerificationResult).data) {
        setLicenseNumber((data as VerificationResult).data!.matricula_principal);
        const match = specialties.find(
          (s: any) => s.name.toUpperCase().includes((data as VerificationResult).data!.especialidad_display.toUpperCase()) ||
            (data as VerificationResult).data!.especialidad_display.toUpperCase().includes(s.name.toUpperCase())
        );
        if (match) {
          setRecommendedSpecialty(match);
          setSpecialtyId(match.id);
        }
      }
    } catch (err: any) {
      setVerificationResult({
        success: false,
        verified: false,
        error: err?.message || "Error al verificar con SACS",
        message: "No se pudo conectar con el servicio de verificación. Por favor intenta más tarde.",
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleCompleteSetup = async () => {
    if (!verificationResult?.verified) return;
    if (!specialtyId || !licenseNumber || !yearsExperience) return;
    setLoading(true);
    try {
      const { error: profileError } = await supabase
        .from("doctor_details")
        .insert({
          profile_id: userId,
          especialidad_id: specialtyId,
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

  return {
    state: {
      step,
      loading,
      userId,
      cedula,
      tipoDocumento,
      verificationResult,
      verifying,
      specialtyId,
      specialties,
      filteredSpecialties,
      specialtySearch,
      recommendedSpecialty,
      licenseNumber,
      yearsExperience,
      bio,
    },
    actions: {
      setStep,
      setCedula,
      setTipoDocumento,
      setSpecialtyId,
      setSpecialtySearch,
      setYearsExperience,
      setBio,
      handleVerifySACS,
      handleCompleteSetup,
    },
  };
}

