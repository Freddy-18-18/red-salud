"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export interface Profile {
  id: string;
  email: string;
  nombre_completo: string;
  telefono?: string;
  fecha_nacimiento?: string;
  direccion?: string;
  ciudad?: string;
  estado?: string;
  codigo_postal?: string;
  cedula?: string;
  avatar_url?: string;
}

export interface PatientDetails {
  grupo_sanguineo?: string;
  alergias?: string[];
  peso_kg?: number;
  altura_cm?: number;
  enfermedades_cronicas?: string[];
  medicamentos_actuales?: string;
  cirugias_previas?: string;
  contacto_emergencia_nombre?: string;
  contacto_emergencia_telefono?: string;
  contacto_emergencia_relacion?: string;
}

export interface UserPreferences {
  language: string;
  timezone: string;
  dark_mode: boolean;
  desktop_notifications: boolean;
  sound_notifications: boolean;
  preferred_contact_method: string;
  newsletter_subscribed: boolean;
  promotions_subscribed: boolean;
  surveys_subscribed: boolean;
}

export interface NotificationSettings {
  login_alerts: boolean;
  account_changes: boolean;
  appointment_reminders: boolean;
  lab_results: boolean;
  doctor_messages: boolean;
}

export interface PrivacySettings {
  profile_public: boolean;
  share_medical_history: boolean;
  show_profile_photo: boolean;
  share_location: boolean;
  anonymous_data_research: boolean;
  analytics_cookies: boolean;
}

export function useConfiguracion() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [patientDetails, setPatientDetails] = useState<PatientDetails>({});
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [notifications, setNotifications] = useState<NotificationSettings | null>(null);
  const [privacy, setPrivacy] = useState<PrivacySettings | null>(null);

  useEffect(() => {
    loadUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const loadUserData = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUserId(user.id);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileData) setProfile(profileData as Profile);

      const { data: detailsData } = await supabase
        .from("patient_details")
        .select("*")
        .eq("profile_id", user.id)
        .single();

      if (detailsData) setPatientDetails(detailsData as PatientDetails);

      const { data: prefsData } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (prefsData) setPreferences(prefsData as UserPreferences);

      const { data: notifsData } = await supabase
        .from("notification_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (notifsData) setNotifications(notifsData as NotificationSettings);

      const { data: privacyData } = await supabase
        .from("privacy_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (privacyData) setPrivacy(privacyData as PrivacySettings);
    } catch (error) {
      console.error("Error loading user data:", error);
      showMessage("error", "Error al cargar la configuración");
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!userId || !profile) return;
    try {
      setSaving(true);
      const { error } = await supabase
        .from("profiles")
        .update({
          nombre_completo: profile.nombre_completo,
          telefono: profile.telefono,
          fecha_nacimiento: profile.fecha_nacimiento,
          direccion: profile.direccion,
          ciudad: profile.ciudad,
          estado: profile.estado,
          codigo_postal: profile.codigo_postal,
          cedula: profile.cedula,
        })
        .eq("id", userId);

      if (error) throw error;

      await supabase.from("user_activity_log").insert({
        user_id: userId,
        activity_type: "profile_updated",
        description: "Perfil actualizado",
        status: "success",
      });

      showMessage("success", "Perfil actualizado correctamente");
    } catch (error) {
      console.error("Error saving profile:", error);
      showMessage("error", "Error al guardar el perfil");
    } finally {
      setSaving(false);
    }
  };

  const savePatientDetails = async () => {
    if (!userId) return;
    try {
      setSaving(true);
      const { error } = await supabase.from("patient_details").upsert({
        profile_id: userId,
        ...patientDetails,
      });
      if (error) throw error;
      showMessage("success", "Información médica actualizada");
    } catch (error) {
      console.error("Error saving patient details:", error);
      showMessage("error", "Error al guardar información médica");
    } finally {
      setSaving(false);
    }
  };

  const savePreferences = async () => {
    if (!userId || !preferences) return;
    try {
      setSaving(true);
      const { error } = await supabase.from("user_preferences").upsert({
        user_id: userId,
        ...preferences,
      });
      if (error) throw error;
      showMessage("success", "Preferencias actualizadas");
    } catch (error) {
      console.error("Error saving preferences:", error);
      showMessage("error", "Error al guardar preferencias");
    } finally {
      setSaving(false);
    }
  };

  const saveNotifications = async () => {
    if (!userId || !notifications) return;
    try {
      setSaving(true);
      const { error } = await supabase.from("notification_settings").upsert({
        user_id: userId,
        ...notifications,
      });
      if (error) throw error;
      showMessage("success", "Notificaciones actualizadas");
    } catch (error) {
      console.error("Error saving notifications:", error);
      showMessage("error", "Error al guardar notificaciones");
    } finally {
      setSaving(false);
    }
  };

  const savePrivacy = async () => {
    if (!userId || !privacy) return;
    try {
      setSaving(true);
      const { error } = await supabase.from("privacy_settings").upsert({
        user_id: userId,
        ...privacy,
      });
      if (error) throw error;
      showMessage("success", "Configuración de privacidad actualizada");
    } catch (error) {
      console.error("Error saving privacy:", error);
      showMessage("error", "Error al guardar privacidad");
    } finally {
      setSaving(false);
    }
  };

  return {
    // meta
    loading,
    saving,
    message,
    setMessage,
    // state
    profile,
    setProfile,
    patientDetails,
    setPatientDetails,
    preferences,
    setPreferences,
    notifications,
    setNotifications,
    privacy,
    setPrivacy,
    // actions
    saveProfile,
    savePatientDetails,
    savePreferences,
    saveNotifications,
    savePrivacy,
  };
}
