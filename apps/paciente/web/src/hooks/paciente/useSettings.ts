"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { supabase } from "@/lib/supabase/client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  phone_verified?: boolean;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  municipality?: string;
  parish?: string;
  national_id?: string;
  national_id_verified?: boolean;
  avatar_url?: string;
}

export interface PatientDetails {
  grupo_sanguineo?: string;
  altura_cm?: number;
  peso_kg?: number;
  alergias?: string[];
  condiciones_cronicas?: string[];
  medicamentos_actuales?: { nombre: string; dosis: string; frecuencia: string }[];
  cirugias_previas?: { nombre: string; fecha_aproximada: string }[];
  discapacidad?: string;
  contacto_emergencia_nombre?: string;
  contacto_emergencia_telefono?: string;
  contacto_emergencia_relacion?: string;
  notas_medicas?: string;
}

export interface NotificationSettings {
  citas_email: boolean;
  citas_push: boolean;
  mensajes_doctores_email: boolean;
  mensajes_doctores_push: boolean;
  resultados_lab_email: boolean;
  resultados_lab_push: boolean;
  recordatorios_medicamentos_push: boolean;
  novedades_email: boolean;
  // Legacy aliases used by NotificationsCard
  appointment_reminders: boolean;
  lab_results: boolean;
}

export interface PrivacySettings {
  historial_visibilidad: "solo_yo" | "mis_doctores" | "cualquier_doctor";
  compartir_datos_auto: boolean;
  encontrar_por_nombre: boolean;
  // Legacy aliases used by PrivacyCard
  profile_public: boolean;
  share_medical_history: boolean;
}

export interface SecuritySettings {
  two_factor_enabled: boolean;
  phone_verified: boolean;
  cedula_verified: boolean;
}

export interface UserPreferences {
  dark_mode: boolean;
  desktop_notifications: boolean;
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  citas_email: true,
  citas_push: true,
  mensajes_doctores_email: true,
  mensajes_doctores_push: true,
  resultados_lab_email: true,
  resultados_lab_push: true,
  recordatorios_medicamentos_push: true,
  novedades_email: false,
  appointment_reminders: true,
  lab_results: true,
};

const DEFAULT_PRIVACY: PrivacySettings = {
  historial_visibilidad: "mis_doctores",
  compartir_datos_auto: false,
  encontrar_por_nombre: true,
  profile_public: false,
  share_medical_history: false,
};

const DEFAULT_SECURITY: SecuritySettings = {
  two_factor_enabled: false,
  phone_verified: false,
  cedula_verified: false,
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useSettings() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const showMessage = useCallback(
    (type: "success" | "error", text: string) => {
      setMessage({ type, text });
      setTimeout(() => setMessage(null), 5000);
    },
    []
  );

  // ---- Queries ------------------------------------------------------------

  const { data: userId } = useQuery({
    queryKey: ["settings-user"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return null;
      }
      return user.id;
    },
  });

  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ["settings-profile", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId!)
        .single();
      return (data as unknown as Profile) ?? null;
    },
    enabled: !!userId,
  });

  const { data: patientDetails, isLoading: loadingDetails } = useQuery({
    queryKey: ["settings-details", userId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("patient_details")
          .select("*")
          .eq("profile_id", userId!)
          .maybeSingle();
        if (error) return {} as PatientDetails;
        return (data as unknown as PatientDetails) ?? ({} as PatientDetails);
      } catch {
        return {} as PatientDetails;
      }
    },
    enabled: !!userId,
  });

  const { data: notifications, isLoading: loadingNotifs } = useQuery({
    queryKey: ["settings-notifications", userId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("notification_settings")
          .select("*")
          .eq("user_id", userId!)
          .maybeSingle();
        if (error) return DEFAULT_NOTIFICATIONS;
        return {
          ...DEFAULT_NOTIFICATIONS,
          ...(data as unknown as NotificationSettings),
        };
      } catch {
        return DEFAULT_NOTIFICATIONS;
      }
    },
    enabled: !!userId,
  });

  const { data: privacy, isLoading: loadingPrivacy } = useQuery({
    queryKey: ["settings-privacy", userId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("privacy_settings")
          .select("*")
          .eq("user_id", userId!)
          .maybeSingle();
        if (error) return DEFAULT_PRIVACY;
        return {
          ...DEFAULT_PRIVACY,
          ...(data as unknown as PrivacySettings),
        };
      } catch {
        return DEFAULT_PRIVACY;
      }
    },
    enabled: !!userId,
  });

  const loading =
    !userId ||
    loadingProfile ||
    loadingDetails ||
    loadingNotifs ||
    loadingPrivacy;

  // Local state mirrors that stay in sync with query cache
  const [localProfile, setLocalProfile] = useState<Profile | null>(null);
  const [localDetails, setLocalDetails] = useState<PatientDetails>({});
  const [localNotifs, setLocalNotifs] =
    useState<NotificationSettings>(DEFAULT_NOTIFICATIONS);
  const [localPrivacy, setLocalPrivacy] =
    useState<PrivacySettings>(DEFAULT_PRIVACY);
  const [localSecurity] = useState<SecuritySettings>(DEFAULT_SECURITY);

  // Sync query data → local state (initial load only)
  const profileState = profile ?? localProfile;
  const detailsState = patientDetails ?? localDetails;
  const notifsState = notifications ?? localNotifs;
  const privacyState = privacy ?? localPrivacy;

  // Setters that also update query cache for mutation access
  const setProfile = useCallback(
    (updater: React.SetStateAction<Profile | null>) => {
      setLocalProfile(updater);
      queryClient.setQueryData(
        ["settings-profile", userId],
        typeof updater === "function"
          ? (updater as (prev: Profile | null) => Profile | null)
          : updater
      );
    },
    [queryClient, userId]
  );

  const setPatientDetails = useCallback(
    (updater: React.SetStateAction<PatientDetails>) => {
      setLocalDetails(updater);
      queryClient.setQueryData(
        ["settings-details", userId],
        typeof updater === "function"
          ? (updater as (prev: PatientDetails) => PatientDetails)
          : updater
      );
    },
    [queryClient, userId]
  );

  const setNotifications = useCallback(
    (updater: React.SetStateAction<NotificationSettings>) => {
      setLocalNotifs(updater);
      queryClient.setQueryData(
        ["settings-notifications", userId],
        typeof updater === "function"
          ? (updater as (prev: NotificationSettings) => NotificationSettings)
          : updater
      );
    },
    [queryClient, userId]
  );

  const setPrivacy = useCallback(
    (updater: React.SetStateAction<PrivacySettings>) => {
      setLocalPrivacy(updater);
      queryClient.setQueryData(
        ["settings-privacy", userId],
        typeof updater === "function"
          ? (updater as (prev: PrivacySettings) => PrivacySettings)
          : updater
      );
    },
    [queryClient, userId]
  );

  const setSecurity = useCallback(
    (_updater: React.SetStateAction<SecuritySettings>) => {
      // Security is read-only from server, no-op
    },
    []
  );

  // ---- Mutations ----------------------------------------------------------

  const saveProfileMutation = useMutation({
    mutationFn: async () => {
      const current = queryClient.getQueryData<Profile>([
        "settings-profile",
        userId,
      ]);
      if (!current) throw new Error("No profile");

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: current.full_name,
          phone: current.phone,
          date_of_birth: current.date_of_birth,
          gender: current.gender,
          address: current.address,
          city: current.city,
          state: current.state,
          municipality: current.municipality,
          parish: current.parish,
          national_id: current.national_id,
          avatar_url: current.avatar_url,
        })
        .eq("id", userId!);

      if (error) throw error;

      await supabase.from("user_activity_log").insert({
        user_id: userId!,
        activity_type: "profile_updated",
        description: "Perfil actualizado",
        status: "success",
      });
    },
    onSuccess: () => {
      showMessage("success", "Datos personales guardados correctamente");
      queryClient.invalidateQueries({
        queryKey: ["settings-profile", userId],
      });
    },
    onError: () => {
      showMessage("error", "Error al guardar los datos personales");
    },
  });

  const saveDetailsMutation = useMutation({
    mutationFn: async () => {
      const current = queryClient.getQueryData<PatientDetails>([
        "settings-details",
        userId,
      ]);
      try {
        const { error } = await supabase.from("patient_details").upsert({
          profile_id: userId!,
          ...current,
        });
        if (error) throw error;
      } catch {
        // patient_details table may not exist yet
      }
    },
    onSuccess: () => {
      showMessage("success", "Informacion medica actualizada correctamente");
    },
    onError: () => {
      showMessage("error", "Error al guardar informacion medica");
    },
  });

  const saveNotifsMutation = useMutation({
    mutationFn: async () => {
      const current = queryClient.getQueryData<NotificationSettings>([
        "settings-notifications",
        userId,
      ]);
      try {
        const { error } = await supabase.from("notification_settings").upsert({
          user_id: userId!,
          ...current,
        });
        if (error) throw error;
      } catch {
        // notification_settings table may not exist yet
      }
    },
    onSuccess: () => {
      showMessage(
        "success",
        "Preferencias de notificaciones actualizadas"
      );
    },
    onError: () => {
      showMessage("error", "Error al guardar notificaciones");
    },
  });

  const savePrivacyMutation = useMutation({
    mutationFn: async () => {
      const current = queryClient.getQueryData<PrivacySettings>([
        "settings-privacy",
        userId,
      ]);
      try {
        const { error } = await supabase.from("privacy_settings").upsert({
          user_id: userId!,
          ...current,
        });
        if (error) throw error;
      } catch {
        // privacy_settings table may not exist yet
      }
    },
    onSuccess: () => {
      showMessage("success", "Configuracion de privacidad actualizada");
    },
    onError: () => {
      showMessage("error", "Error al guardar privacidad");
    },
  });

  // ---- Actions ------------------------------------------------------------

  const saveProfile = useCallback(async () => {
    if (!userId || !profileState) return;
    setSaving(true);
    try {
      await saveProfileMutation.mutateAsync();
    } finally {
      setSaving(false);
    }
  }, [userId, profileState, saveProfileMutation]);

  const savePatientDetails = useCallback(async () => {
    if (!userId) return;
    setSaving(true);
    try {
      await saveDetailsMutation.mutateAsync();
    } finally {
      setSaving(false);
    }
  }, [userId, saveDetailsMutation]);

  const saveNotifications = useCallback(async () => {
    if (!userId) return;
    setSaving(true);
    try {
      await saveNotifsMutation.mutateAsync();
    } finally {
      setSaving(false);
    }
  }, [userId, saveNotifsMutation]);

  const savePrivacy = useCallback(async () => {
    if (!userId) return;
    setSaving(true);
    try {
      await savePrivacyMutation.mutateAsync();
    } finally {
      setSaving(false);
    }
  }, [userId, savePrivacyMutation]);

  const changePassword = useCallback(
    async (newPassword: string) => {
      try {
        setSaving(true);
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });
        if (error) throw error;
        showMessage("success", "Contrasena actualizada correctamente");
      } catch {
        showMessage("error", "Error al cambiar la contrasena");
      } finally {
        setSaving(false);
      }
    },
    [showMessage]
  );

  const exportData = useCallback(async () => {
    if (!userId) return;
    try {
      const exportPayload = {
        profile: profileState,
        patientDetails: detailsState,
        notifications: notifsState,
        privacy: privacyState,
        exportedAt: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `red-salud-datos-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showMessage("success", "Datos exportados correctamente");
    } catch {
      showMessage("error", "Error al exportar los datos");
    }
  }, [userId, profileState, detailsState, notifsState, privacyState, showMessage]);

  const deleteAccount = useCallback(async () => {
    if (!userId) return;
    try {
      setSaving(true);
      const { error } = await supabase
        .from("profiles")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", userId);
      if (error) throw error;
      await supabase.auth.signOut();
      router.push("/auth/login");
    } catch {
      showMessage("error", "Error al eliminar la cuenta. Contacta soporte.");
    } finally {
      setSaving(false);
    }
  }, [userId, router, showMessage]);

  return {
    // meta
    loading,
    saving,
    message,
    setMessage,
    // state
    profile: profileState,
    setProfile,
    patientDetails: detailsState,
    setPatientDetails,
    notifications: notifsState,
    setNotifications,
    privacy: privacyState,
    setPrivacy,
    security: localSecurity,
    setSecurity,
    // actions
    saveProfile,
    savePatientDetails,
    saveNotifications,
    savePrivacy,
    changePassword,
    exportData,
    deleteAccount,
  };
}
