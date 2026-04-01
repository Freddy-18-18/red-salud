import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase/client";

// TODO: Import from shared services once @red-salud/api-client is available
// For now, inline the core patient profile logic

export interface PatientProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  national_id?: string;
  date_of_birth?: string;
  address?: string;
  city?: string;
  state?: string;
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
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["patient-profile", userId],
    queryFn: async () => {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId!)
        .maybeSingle();

      if (profileError) throw profileError;

      let medicalData = null;
      try {
        const { data, error } = await supabase
          .from("patient_details")
          .select("*")
          .eq("profile_id", userId!)
          .maybeSingle();
        if (!error) medicalData = data;
      } catch {
        // patient_details table may not exist yet — skip silently
      }

      return {
        ...profileData,
        ...medicalData,
      } as PatientProfile;
    },
    enabled: !!userId,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<PatientProfile>) => {
      if (!userId) throw new Error("No user ID");

      const { error } = await supabase
        .from("profiles")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        ["patient-profile", userId],
        (old: PatientProfile | undefined) =>
          old ? { ...old, ...data } : old
      );
    },
  });

  const updateMedicalMutation = useMutation({
    mutationFn: async (data: Partial<PatientProfile>) => {
      if (!userId) throw new Error("No user ID");

      const { error } = await supabase
        .from("patient_details")
        .upsert(
          {
            profile_id: userId,
            ...data,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "profile_id" }
        );

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        ["patient-profile", userId],
        (old: PatientProfile | undefined) =>
          old ? { ...old, ...data } : old
      );
    },
  });

  const updateAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!userId) throw new Error("No user ID");

      const fileExt = file.name.split(".").pop();
      const filePath = `avatars/${userId}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      await supabase
        .from("profiles")
        .update({
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      return publicUrl;
    },
    onSuccess: (publicUrl) => {
      queryClient.setQueryData(
        ["patient-profile", userId],
        (old: PatientProfile | undefined) =>
          old ? { ...old, avatar_url: publicUrl } : old
      );
    },
  });

  const updateProfile = async (data: Partial<PatientProfile>) => {
    try {
      await updateProfileMutation.mutateAsync(data);
      return { success: true };
    } catch {
      return { success: false };
    }
  };

  const updateMedical = async (data: Partial<PatientProfile>) => {
    try {
      await updateMedicalMutation.mutateAsync(data);
      return { success: true };
    } catch {
      return { success: false };
    }
  };

  const updateAvatar = async (file: File) => {
    try {
      const url = await updateAvatarMutation.mutateAsync(file);
      return { success: true, url };
    } catch {
      return { success: false };
    }
  };

  return {
    profile: query.data ?? null,
    loading: query.isLoading,
    error: query.error?.message ?? null,
    updateProfile,
    updateMedical,
    updateAvatar,
  };
}
