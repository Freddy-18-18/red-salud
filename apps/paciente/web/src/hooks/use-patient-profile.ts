import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

// TODO: Import from shared services once @red-salud/api-client is available
// For now, inline the core patient profile logic

export interface PatientProfile {
  id: string;
  email: string;
  nombre_completo: string;
  telefono?: string;
  cedula?: string;
  fecha_nacimiento?: string;
  direccion?: string;
  ciudad?: string;
  estado?: string;
  codigo_postal?: string;
  avatar_url?: string;
  grupo_sanguineo?: string;
  alergias?: string[];
  contacto_emergencia_nombre?: string;
  contacto_emergencia_telefono?: string;
  contacto_emergencia_relacion?: string;
  enfermedades_cronicas?: string[];
  medicamentos_actuales?: string;
  cirugias_previas?: string;
  peso_kg?: number;
  altura_cm?: number;
}

export function usePatientProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle();

        if (profileError) throw profileError;

        const { data: medicalData } = await supabase
          .from("patient_details")
          .select("*")
          .eq("profile_id", userId)
          .maybeSingle();

        setProfile({
          ...profileData,
          ...medicalData,
        } as PatientProfile);
      } catch {
        setError('Error loading profile data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId]);

  const updateProfile = async (data: Partial<PatientProfile>) => {
    if (!userId) return { success: false };
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) throw error;

      if (profile) {
        setProfile({ ...profile, ...data });
      }
      return { success: true };
    } catch (err) {
      console.error("Error updating profile:", err);
      return { success: false };
    }
  };

  const updateMedical = async (data: Partial<PatientProfile>) => {
    if (!userId) return { success: false };
    try {
      const { error } = await supabase
        .from("patient_details")
        .upsert({
          profile_id: userId,
          ...data,
          updated_at: new Date().toISOString(),
        }, { onConflict: "profile_id" });

      if (error) throw error;

      if (profile) {
        setProfile({ ...profile, ...data });
      }
      return { success: true };
    } catch (err) {
      console.error("Error updating medical info:", err);
      return { success: false };
    }
  };

  const updateAvatar = async (file: File) => {
    if (!userId) return { success: false };
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `avatars/${userId}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
        .eq("id", userId);

      if (profile) {
        setProfile({ ...profile, avatar_url: publicUrl });
      }
      return { success: true, url: publicUrl };
    } catch (err) {
      console.error("Error uploading avatar:", err);
      return { success: false };
    }
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
    updateMedical,
    updateAvatar,
  };
}
